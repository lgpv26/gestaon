const _ = require('lodash')
const sequelize = require('sequelize')
import moment from 'moment'
import EventResponse from '~server/models/EventResponse'

module.exports = (server) => { 

    //PRIVATES
    let _requestId = null
    let _companyId = null
    let _userId = null

    let _request = {}

    return {
    name: "draft/request/recoverance",
    actions: {
        start(ctx){

            //SET PRIVATES
            this._requestId = ctx.params.requestId
            this._companyId = ctx.params.companyId
            this._userId = ctx.params.userId
            this._request = {}

            return ctx.call('draft.get', {
                where: {
                    companyId: this._companyId,
                    "data.request.id": parseInt(this._requestId)
                }
            }).then((draft) => {
                if(draft) return new EventResponse(new Error ('Só é possivel gerar editar 1 rascunho. Favor concluir o rascunho deste pedido para gerar um novo.'))
                return ctx.call('draft/request/recoverance.consultRequest').then((request) => {
                    let promises = []
                    
                    promises.push(ctx.call("draft/request/recoverance.setRequest", {
                        request: request
                    }).then((request) => {
                        this._request = request
                    }).catch((err) => {
                        console.log("Erro em: draft/request/recoverance.setRequest")
                        throw new Error(err)
                    }))
                    
                    if(_.has(request, "client")){
                        promises.push(ctx.call("draft/request/recoverance.setClient", {
                            client: request.client
                        }).then((client) => {
                            _.set(this._request, 'client', client)
                        }).catch((err) => {
                            console.log("Erro em: draft/request/recoverance.setClient")
                            throw new Error(err)
                        }))
                    }

                    if(_.has(request, "requestOrder")){
                        promises.push(ctx.call("draft/request/recoverance.setOrder", {
                            order: request.requestOrder
                        }).then((order) => {
                            _.set(this._request, 'order', order)
                        }).catch((err) => {
                            console.log("Erro em: draft/request/recoverance.setClient")
                            throw new Error(err)
                        }))
                    }

                    if(_.has(request, "requestPayments")){
                        promises.push(ctx.call("draft/request/recoverance.setRequestAccountId", {
                            requestPayments: request.requestPayments
                        }).then((accountId) => {
                            if(accountId) _.set(this._request, 'accountId', accountId)
                        }))
                        promises.push(ctx.call("draft/request/recoverance.setRequestPayments", {
                            requestPayments: request.requestPayments
                        }).then((requestPayments) => {
                            _.set(this._request, 'requestPayments', requestPayments)
                        }).catch((err) => {
                            console.log("Erro em: draft/request/recoverance.setClient")
                            throw new Error(err)
                        }))
                    }

                    return Promise.all(promises).then(() => {
                        return ctx.call("draft.create", {
                            data: {
                                createdBy: this._userId,
                                companyId: this._companyId,
                                data: { 
                                    request: this._request 
                                }
                            }
                        }).then(() => {
                            return new EventResponse('Success')
                        }).catch((err) => {
                            console.log("Erro em: draft/request/recoverance.consultRequest")
                            return new EventResponse(err)
                        })
                    })
                }).catch((err) => {
                    console.log("Erro em: draft/request/recoverance.consultRequest")
                    throw new Error(err)
                })
            })
        
        },

        consultRequest(ctx) {
            return ctx.call("data/request.getOne", {
                where: {
                    id: this._requestId,
                    companyId: this._companyId
                },
                include: [
                    {
                        model: server.mysql.RequestTimeline,
                        as: "requestTimeline"
                    },
                    {
                        model: server.mysql.RequestClientPhone,
                        as: "requestClientPhones"
                    },{
                        model: server.mysql.RequestClientAddress,
                        as: "requestClientAddresses"
                    },{
                        model: server.mysql.Client,
                        as: "client",
                        include: [{
                            model: server.mysql.ClientPhone,
                            as: 'clientPhones'
                        }, {
                            model: server.mysql.ClientAddress,
                            as: 'clientAddresses',
                            include: [{
                                model: server.mysql.Address,
                                as: 'address'
                            }]
                        }, {
                            model: server.mysql.ClientCustomField,
                            as: 'clientCustomFields',
                            include: [{
                                model: server.mysql.CustomField,
                                as: 'customField'
                            }]
                        }, {
                            model: server.mysql.ClientGroup,
                            as: 'clientGroup'
                        }]
                    },{
                        model: server.mysql.RequestPayment,
                        as: "requestPayments",
                        include: [{
                            model: server.mysql.PaymentMethod,
                            as: 'paymentMethod'
                        },
                        {
                            model: server.mysql.RequestPaymentTransaction,
                            as: 'requestPaymentTransactions',
                            include: [{
                                model: server.mysql.Transaction,
                                as: 'transaction'
                            }]
                        }]
                    },{
                        model: server.mysql.RequestOrder,
                        as: "requestOrder",
                        include: [{
                            model: server.mysql.RequestOrderProduct,
                            as: 'requestOrderProducts',
                            include: [{
                                model: server.mysql.Product,
                                as: 'product'
                            }]
                        }]
                    }
                ]
            }).then((request) => {
                return request
            }).catch((err) => {
                console.log(err, "Erro em: draft/request/recoverance.consultRequest")
                throw new Error(err)
            })
        },
        setRequest(ctx){
            let request = {}

            _.set(request, 'id', ctx.params.request.id)

            _.set(request, 'activeStep', (ctx.params.request.requestOrder) ? 'order' : 'client' )
            _.set(request, 'obs', ctx.params.request.obs)
            _.set(request, 'phoneLine', ctx.params.request.phoneLine)
            if(_.has(ctx.params.request, "phoneLine")){
                _.set(request, 'phoneLine', ctx.params.request.phoneLine)
            }

            if(_.has(ctx.params.request, "deliveryDate")){
                _.set(request, 'deliveryDate', ctx.params.request.deliveryDate)
                _.set(request, 'useSuggestedDeliveryDate', !ctx.params.request.isScheduled)
            }

            if(_.has(ctx.params.request, "requestClientPhones")){
                _.set(request, 'clientPhoneId', _.get(_.first(ctx.params.request.requestClientPhones), 'clientPhoneId'))
            }

            if(_.has(ctx.params.request, "requestClientAddresses")){
                _.set(request, 'clientAddressId', _.get(_.first(ctx.params.request.requestClientAddresses), 'clientAddressId'))
            }

            if(_.has(ctx.params.request, "requestTimeline")){
                _.set(request, 'responsibleUserId', _.get(_.last(ctx.params.request.requestTimeline), 'userId'))
            }

            _.set(request, 'status', ctx.params.request.status)

            return request

        },
        setClient(ctx){
            const client = ctx.params.client
            let omit = ['companyId', 'dateUpdated', 'dateRemoved']

            if(_.has(client, "clientPhones")){
                client.clientPhones.forEach((clientPhone, index) => {
                    omit.push('clientPhones[' + index + '].dateUpdated', 'clientPhones[' + index + '].dateCreated', 'clientPhones[' + index + '].dateRemoved')
                })
            }
            if(_.has(client, "clientAddresses")){
                client.clientAddresses.forEach((clientAddress, index) => {
                    omit.push('clientAddresses[' + index + '].dateUpdated', 'clientAddresses[' + index + '].dateCreated', 'clientAddresses[' + index + '].dateRemoved')
                })
            }
            if(_.has(client, "clientCustomFields")){
                client.clientCustomFields.forEach((clientCustomField, index) => {
                    omit.push('clientCustomFields[' + index + '].dateUpdated', 'clientCustomFields[' + index + '].dateCreated', 'clientCustomFields[' + index + '].dateRemoved')
                })
            }
            if(_.has(client, "clientGroup")){
                omit.push('clientGroup')
            }
            _.set(client, 'clientAddressForm', {
                "id" : null,
                    "show" : false,
                    "complement" : "",
                    "number" : "",
                    "address" : {
                        "id" : null,
                        "name" : "",
                        "cep" : "",
                        "neighborhood" : "",
                        "city" : "",
                        "state" : ""
                    }
            })

            return _.omit(client, omit)            
        },
        setOrder(ctx){
            let order = ctx.params.order

            let omit = ['status', 'dateUpdated', 'dateCreated', 'dateRemoved', 'obs', 'requestOrderProducts']

            if(_.has(order, "requestOrderProducts")){
                _.set(order, 'orderProducts', _.map(order.requestOrderProducts, (requestOrderProduct) => {
                        _.unset(requestOrderProduct, 'requestOrderId')
                        _.unset(requestOrderProduct, 'productId')
                        _.unset(requestOrderProduct, 'dateUpdated')
                        _.unset(requestOrderProduct, 'dateCreated')
                        _.unset(requestOrderProduct, 'dateRemoved')
                        return requestOrderProduct
                    })
                )
            }
            return _.omit(order, omit)
        },
        setRequestPayments(ctx){
            return _.map(ctx.params.requestPayments, (requestPayment) => {
                if(requestPayment.requestPaymentBills) _.set(requestPayment, 'deadlineDatetime', requestPayment.requestPaymentBills.deadlineDatetime)
                _.unset(requestPayment, 'requestPaymentTransactions')
                _.unset(requestPayment, 'paymentMethodId')
                _.unset(requestPayment, 'requestId')
                _.unset(requestPayment, 'dateUpdated')
                _.unset(requestPayment, 'dateCreated')
                _.unset(requestPayment, 'dateRemoved')                
                return requestPayment
            })
        },
        setRequestAccountId(ctx) {
            let accountId = null
            ctx.params.requestPayments.forEach((requestPayment) => {
                if(requestPayment.paid && _.has(requestPayment, 'requestPaymentTransactions')){
                    accountId = _.last(requestPayment.requestPaymentTransactions).transaction.accountId
                }
            })
            return accountId
        }    
    }
}}