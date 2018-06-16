import _ from 'lodash'
import moment from 'moment'
const Op = require('sequelize').Op
const EventResponse = require('~server/models/EventResponse')

module.exports = (server) => {
    //PRIVATES
    let _request = null
    let _transaction = null
    
    let _userId = null
    let _userAccountId = null

    let _companyId = null
    let _oldRequest = null

    return {
        name: "data/mobile",
        actions: {

            createRequest(ctx){
                this._request = ctx.params.data
                this._companyId = ctx.params.companyId
                this._userId = ctx.params.userId
                this._userAccountId = ctx.params.userAccountId

                return ctx.call("data/mobile.checkTempIds").then(() => {
                    return ctx.call("data/mobile.setTransaction").then(() => {
                        const promises = []

                        if(_.has(this._request, "client")){
                            promises.push(ctx.call("data/mobile.setClient")
                            .then((client) => {
                                _.set(this._request, 'client', client)
                                return {client}
                            }))
                        }


                        if(_.has(this._request, "requestOrder")){
                            promises.push(ctx.call("data/mobile.setOrder")
                            .then((order) => {
                                return {order}
                            }))
                        }

                        return Promise.all(promises).then((result) => {
                            // SET RESULT'S PROMISES
                            const client = _.find(result, 'client')
                            const order = _.find(result, 'order')
                            const task = _.find(result, 'task')

                            // SET REQUEST'S DATA
                            return ctx.call("data/mobile.setRequest", {
                                data: {
                                    companyId: this._companyId,
                                    userId: this._userId,
                                    clientId: (client) ? _.get(client, 'client.id') : null,
                                    requestOrderId: (order) ? _.get(order, 'order.id') : null,
                                    taskId: (task) ? _.get(task, 'task.id') : null,
                                    deadlineDatetime: moment(),
                                    isScheduled: false,
                                    obs: (this._request.obs) ? this._request.obs : null,
                                    status: this._request.status
                                },
                                transaction: this._transaction
                            }).then((request) => {
                                return ctx.call("data/mobile.commit")
                                .then(() => {
                                    if(request.clientId) {
                                        return ctx.call("data/mobile.saveES", {
                                            requestOrderId: request.requestOrderId,
                                        }).then(() => {
                                            return new EventResponse(request) 
                                        })
                                    }
                                    return new EventResponse(request) 
                                })
                            }).catch((err) => {
                                return ctx.call("data/mobile.rollback", {
                                    err: err
                                })
                            })
                        }).catch((err) => {
                            return ctx.call("data/mobile.rollback", {
                                err: err
                            })
                        })
                    })
                })

            },

            setClient(ctx){
                if(this._request.client.name){
                    return ctx.call("draft/client/persistence.start", {
                        client: this._request.client,
                        companyId: this._companyId,
                        transaction: this._transaction
                    })
                }
                else{
                    return this._request.client
                }
            },

            setRequest(ctx){
                return ctx.call("data/mobile.saveRequest",{
                    data: ctx.params.data
                }).then((request) => {
                    let promises = []
                    promises.push(ctx.call("data/request.createTimeline", {
                            data: {
                                requestId: request.id,
                                triggeredBy: this._userId,
                                companyId: this._companyId,
                                action: 'create',
                                userId: this._userId,
                                status: this._request.status
                            },
                            transaction: this._transaction
                        })
                    )

                    
                    if(_.has(this._request, "requestPayments")){
                        promises.push(ctx.call("data/mobile.setRequestPayments"))
                    }

    
                    if(_.has(this._request, "selectedClientAddress")){
                        promises.push(ctx.call("data/request.setRequestClientAddresses", {
                                data: [_.assign({clientAddressId: this._request.selectedClientAddress,
                                    requestId: request.id
                                })],
                                requestId: request.id,
                                transaction: this._transaction
                            })
                        )
                    }
    
                    return Promise.all(promises).then(() => {
                        return request
                    }).catch((err) => {
                        console.log(err, "Erro em: data/request.setRequest - PROMISE ALL")
                        throw Error(err)
                    })         
                }).catch((err) => {
                    console.log(err, "Erro em: data/request.saveRequest")
                    throw Error(err)
                })  
            },

            saveRequest(ctx){
                return ctx.call("data/request.create", {
                    data: ctx.params.data,
                    transaction: this._transaction
                }).then((request) => {
                    _.set(this._request, 'id', parseInt(request.id))
                    return request
                }).catch((err) => {
                    console.log("Erro em: data/request.create")
                    throw new Error(err)
                })  
            },

            changeStatus(ctx) {
                return server.broker.call('data/request.getList', {
                    where: {
                        status: 'in-displacement',
                        userId: ctx.params.userId
                    },
                    include: [
                        {
                            model: server.mysql.RequestTimeline,
                            as: "requestTimeline"
                        }
                    ]
                }).then((checkRequest) => {
                    if(checkRequest.length && ctx.params.data.status === 'in-displacement') throw new Error('Só é possivel ter um pedido em deslocamento!')
                    return server.broker.call('data/request.getOne', {
                        where: {
                            id: parseInt(ctx.params.requestId),
                            companyId: parseInt(ctx.params.companyId)
                        },
                        include: [
                            {
                                model: server.mysql.RequestTimeline,
                                as: "requestTimeline"
                            }
                        ]
                    }).then((request) => {
                        request.requestTimeline.sort((a,b) => {
                            return b.id - a.id
                        })
                        return server.sequelize.transaction().then((transaction) => {
                            return server.broker.call('data/request.update', {
                                data: {
                                    status: ctx.params.data.status
                                },
                                where: {
                                    id: request.id
                                },
                                transaction: transaction
                            }).then(() => {
                                return server.broker.call('data/request.createTimeline', {
                                    data: {
                                        requestId: request.id,
                                        triggeredBy: ctx.params.userId,
                                        companyId: ctx.params.companyId,
                                        action: 'status_change',
                                        userId: _.first(request.requestTimeline).userId,
                                        status: ctx.params.data.status
                                    },
                                    transaction: transaction
                                }).then((requestTimelineItem) => {
                                    return transaction.commit().then(() => {
                                        return server.mongodb.Card.findOne({"requestId": parseInt(ctx.params.requestId)}, {}, { sort: { position: 1 } }, function (err, card) {
                                            return card
                                        }).then((card) => {
                                            server.io.in('company/' + ctx.params.companyId + '/request-board').emit('requestBoardRequestTimelineChangeStatus', new EventResponse({
                                                cardId: card._id,
                                                requestTimelineItem
                                            }))
                                            if(ctx.params.data.status == 'finished' || ctx.params.data.status == 'canceled'){
                                                server.broker.call('request-board.removeCard', {
                                                    data: {
                                                        cardId: card._id
                                                    }
                                                })
                                            }
                                            return  requestTimelineItem
                                        })
                                    })                                
                                }).catch(() => {
                                    return  transaction.rollback()
                                })
                            }).catch(() => {
                                return  transaction.rollback()
                            })
                        })
                    })
                })
            },

            requestFinish(ctx) {
                this._request = ctx.params.data
                this._companyId = ctx.params.companyId
                this._userId = ctx.params.userId
                this._userAccountId = ctx.params.userAccountId

                return ctx.call("data/mobile.checkTempIds").then(() => {
                    return ctx.call("data/mobile.consultRequest").then(() => {
                        return ctx.call("data/mobile.setTransaction").then(() => {
                            const promises = []

                            if(_.has(this._request, "requestOrder")){
                                promises.push(ctx.call("data/mobile.setOrder"))
                            }

                            if(_.has(this._request, "requestPayments")){
                                promises.push(ctx.call("data/mobile.setRequestPayments"))
                            }

                            return Promise.all(promises).then((result) => {                                  
                                return ctx.call("data/request.update", {
                                    data: {
                                        id: this._request.id,
                                        status: this._request.status
                                    },
                                    where: {
                                        id: this._request.id,
                                        companyId: this._companyId
                                    },
                                    transaction: this._transaction
                                }).then((request) => {
                                    return ctx.call("data/mobile.commit").then(() => {
                                        return server.mongodb.Card.findOne({"requestId": parseInt(request.id)}, {}, { sort: { position: 1 } }, function (err, card) {
                                                return card
                                            }).then((card) => {
                                            server.broker.call('request-board.removeCard', {
                                                data: {
                                                    cardId: card._id
                                                }
                                            })
                                            return request
                                        })
                                    })
                                }).catch((err) => {
                                    console.log(err, "Erro em: data/request.update")
                                    return ctx.call("data/mobile.rollback", {
                                        err: err
                                    })
                                })
                            }).catch((err) => {
                                console.log(err, "Erro em: promise all")
                                return ctx.call("data/mobile.rollback", {
                                    err: err
                                })
                            })
                        })
                    })
                })
            },

            consultRequest(ctx){
                return ctx.call("data/request.getOne", {
                    where: {
                        id: this._request.id
                    },
                    include: [{
                        model: server.mysql.RequestTimeline,
                        as: "requestTimeline",
                        include: [{
                            model: server.mysql.User,
                            as: "triggeredByUser",
                        },{
                            model: server.mysql.User,
                            as: "user",
                        }]
                    },
                    {
                        model: server.mysql.RequestClientPhone,
                        as: "requestClientPhones",
                        include: [{
                            model: server.mysql.ClientPhone,
                            as: "clientPhone",
                        }]
                    },{
                        model: server.mysql.RequestClientAddress,
                        as: "requestClientAddresses",
                        include: [{
                            model: server.mysql.ClientAddress,
                            as: "clientAddress",
                            include:[{
                                model: server.mysql.Address,
                                as: "address"
                            }]
                        }]
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
                    },{
                        model: server.mysql.RequestPayment,
                        as: "requestPayments",
                        include: [{
                            model: server.mysql.PaymentMethod,
                            as: 'paymentMethod'
                        },{
                            model: server.mysql.RequestPaymentTransaction,
                            as: 'requestPaymentTransactions',
                            include: [{
                                model: server.mysql.Transaction,
                                as: 'transaction'
                            }]
                        }]
                    }]
                }).then((request) => {
                    return this._oldRequest = request
                }).catch((err) => {
                    console.log(err)
                })
            },

            setOrder(ctx) {
                return ctx.call("data/mobile.saveOrder").then((order) => {
                    let promises = []

                    if(_.has(this._request.requestOrder, "orderProducts")){
                        promises.push(ctx.call("data/mobile.setOrderProducts", {
                            data: {
                                requestOrderId: order.id
                            }
                        }).catch((err) => {
                            console.log("Erro em: data/mobile.setOrderProducts")
                            throw new Error(err)
                        }))
                    }

                    return Promise.all(promises).then(() => {
                        return order
                    })
                })
            },

            saveOrder(ctx){
                if(this._request.requestOrder.id){
                    return ctx.call("data/request.requestOrderUpdate", {
                        data: this._request.requestOrder,
                        where: {
                            id: this._request.requestOrder.id
                        },
                        transaction: this._transaction
                    }).then((requestOrder) => {
                        return requestOrder
                    })
                }
                else{
                    return ctx.call("data/request.requestOrderCreate", {
                        data: this._request.requestOrder,
                        transaction: this._transaction
                    }).then((requestOrder) => {
                        return requestOrder
                    }).catch((err) => {
                        console.log("Erro em: data/request.requestOrderCreate")
                        throw new Error(err)
                    })   
                }
            },

            setOrderProducts(ctx){
                return ctx.call("data/request.setRequestOrderProducts", {
                    data: _.map(this._request.requestOrder.orderProducts, orderProduct => {
                        return _.assign(orderProduct, {
                            requestOrderId: ctx.params.data.requestOrderId,
                        })
                    }),
                    companyId: this._companyId, 
                    requestOrderId: ctx.params.data.requestOrderId,
                    transaction: this._transaction
                }).then((orderProducts) => {
                    return orderProducts
                }).catch((err) => {
                    console.log("Erro em: data/request.setRequestOrderProducts")
                    throw new Error(err)
                })
            },
            setRequestPayments(ctx) {
                return ctx.call("data/mobile.checkLimit").then(() => {
                    let removeRequestPayments = []
                    let alreadyPaid = []
                    let changePaid = []
                    return new Promise((resolve,reject) => {
                        if(_.has(this._oldRequest, 'requestPayments')){                        
                            alreadyPaid = _.map(_.filter(this._oldRequest.requestPayments, (requestPayment) => {
                                return requestPayment.paid
                            }), (requestPayment) => {
                                return requestPayment
                            })
                            const promises = []
                            
                            this._request.requestPayments.forEach((payment, index) => {
                                promises.push(new Promise((resolve, reject) => {
                                        const indexOldPayment = _.findIndex(this._oldRequest.requestPayments, (oldPayment) => {
                                            return oldPayment.id == payment.id
                                        })
                                        if(indexOldPayment !== -1 && parseFloat(payment.amount) !== parseFloat(this._oldRequest.requestPayments[indexOldPayment].amount)){
                                            _.set(payment, 'changed', true)
                                            _.set(this._request.requestPayments[index], 'settled', false)
                                            _.set(this._request.requestPayments[index], 'settledDatetime', null)
                                            changePaid.push(_.assign(payment, {requestPaymentTransactions: this._oldRequest.requestPayments[indexOldPayment].requestPaymentTransactions}))
                                        }
                
                                        if(indexOldPayment !== -1 && payment.paid !== this._oldRequest.requestPayments[indexOldPayment].paid){
                                            _.set(payment, 'changed', true)
                                            _.set(this._request.requestPayments[index], 'settled', false)
                                            _.set(this._request.requestPayments[index], 'settledDatetime', null)
                                            changePaid.push(_.assign(payment, {requestPaymentTransactions: this._oldRequest.requestPayments[indexOldPayment].requestPaymentTransactions}))
                                        }
                                        
                                        return ctx.call("data/payment-method.getOne", {
                                            data: {
                                                id: payment.paymentMethodId,
                                                companyId: this._companyId
                                            }
                                        }).then((paymentMethod) => {
                                            if(!paymentMethod.autoPay && payment.changed && this._oldRequest.requestPayments[indexOldPayment].settled && this._oldRequest.requestPayments[indexOldPayment].paid) reject('Não é possivel excluir Notinha já paga!')
                                            _.set(this._request.requestPayments[index], 'paymentMethod', paymentMethod)
                                            resolve()              
                                        })
                                    })
                                )
                            })
                            return Promise.all(promises).then(() => {                     
                                alreadyPaid = _.pullAllBy(alreadyPaid, changePaid, 'id')
                                removeRequestPayments = _.pullAllBy(this._oldRequest.requestPayments, this._request.requestPayments, 'id')
                                removeRequestPayments.forEach((removeRequestPayment) => {
                                    if(!removeRequestPayment.paymentMethod.autoPay && removeRequestPayment.settled && removeRequestPayment.paid) reject('Não é possivel excluir Notinha já paga!')
                                })
                                resolve() 
                            }) 
                        }
                        else{
                            const promises = []
                            this._request.requestPayments.forEach((payment, index) => {
                                promises.push(ctx.call("data/payment-method.getOne", {
                                        data: {
                                            id: payment.paymentMethodId,
                                            companyId: this._companyId
                                        }
                                    }).then((paymentMethod) => {
                                        return _.set(this._request.requestPayments[index], 'paymentMethod', paymentMethod)
                                    })
                                )
                            })
                            return Promise.all(promises).then(() => {
                                resolve()
                            })
                        }
                    }).then(() => {
                            return ctx.call("data/request.setPaymentMethods", {
                                data: this._request.requestPayments,
                                removeRequestPayments: (removeRequestPayments) ? removeRequestPayments : [],
                                alreadyPaid: _.map(alreadyPaid, (paid) => {
                                    return paid.id
                                }),
                                changePaid: changePaid,
                                requestId: this._request.id,
                                companyId: this._companyId,
                                clientId: (_.has(this._oldRequest, 'client.id')) ? this._oldRequest.client.id : null ,
                                createdById: this._userId,
                                accountId: this._userAccountId,
                                transaction: this._transaction
                            }).catch((err) => {
                                return new Error (err)
                            })    
                        }).catch((err) => {
                            console.log('aqui', err)
                        })
                        
                }).catch((err) => {
                    throw Error(err)
                })
            },

            checkLimit(ctx) { 
                if(!_.has(this._oldRequest, 'client.id')) return true
                const promises = []
                   
                promises.push(ctx.call("data/client.get", {
                    where: {
                        id: this._oldRequest.client.id
                    },
                    transaction: this._transaction
                }))
    
                promises.push(new Promise((resolve, reject) => {
                    let valuesCredit = 0
                    let paymentPromises = []
                    this._request.requestPayments.forEach((requestPayment) => {
                        paymentPromises.push(ctx.call("data/payment-method.getOne", {
                                data: {
                                    id: requestPayment.paymentMethodId,
                                    companyId: this._companyId
                                },
                                transaction: this._transaction
                            }).then((paymentMethod) => {
                                if(!paymentMethod.autoPay) return valuesCredit += requestPayment.amount
                            })
                        )
                    })
                    return Promise.all(paymentPromises).then(() => {
                        resolve(valuesCredit)
                    })
                }))
                
                return Promise.all(promises).then((response) => {
                    if(response && (parseFloat(response[0].creditLimit) >= (parseFloat(response[0].limitInUse) + parseFloat(response[1])))){
                        return true
                    }
                    else{
                        throw new Error('Sem limite de credito')
                    }
                })
            },

            checkTempIds(ctx){
                let removeTemps = []
                
                if(_.has(this._request, "requestOrder")){
                    if(_.has(this._request, "requestOrder.orderProducts")){
                        removeTemps.push(ctx.call("data/mobile.removeTempIds", {
                                path: 'requestOrder.orderProducts'
                            })
                        )
                    }
                }
                if(_.has(this._request, "requestPayments")){
                    removeTemps.push(ctx.call("data/mobile.removeTempIds", {
                            path: 'requestPayments'
                        })
                    )
                }
                return Promise.all(removeTemps).then(() => {
                    return true
                }).catch((err) => {
                    console.log("Erro em: data/mobile.checkTempIds")
                    throw new Error(err)
                })
            },
    
            removeTempIds(ctx){
                let newValue = []
                _.map(_.get(this._request, ctx.params.path), (obj) => {
                    if(ctx.params.select && _.has(this._request, ctx.params.select)){
                        if(obj.id === _.get(this._request, ctx.params.select)){
                            obj.select = true
                        }
                        else{
                            obj.select = false
                        }                        
                    }
                    if(_.get(obj, 'id', false) && !_.isNumber(obj.id) && obj.id.substring(0,4) === "tmp/"){
                        obj.id = null              
                    }
                    newValue.push(obj)
                })
                return _.set(this._request, ctx.params.path, newValue)
            },

            setTransaction(ctx){
                return server.sequelize.transaction().then((transaction) => {
                    this._transaction = transaction
                })
            },

            saveES(ctx) {
                return ctx.call("draft/client/persistence.setES", {
                    clientId: this._request.client.id,
                }).then((client) => {
                    return server.elasticSearch.bulk({
                        body: client                   
                    }, function (esErr, esRes, esStatus) {
                        if (esErr) {
                            console.log(esErr, "Erro em: data/mobile.saveES")
                            console.log('Erro ao salvar dados no ElasticSearch!')
                            return new Error('Erro ao salvar dados no ElasticSearch!')
                        }
                        return true
                    })
                }) 
            },

            /**
             * Commit persistence
             */
            commit(ctx) {
                console.log("Commiting...") 
                this._transaction.commit().then(() => {
                   return   console.log("Commit everything!")                
                }) 
            },

            /**
             * Rollback persistence
             */
            rollback(ctx) {
                console.log("Oh God, just rollback!")
                this._transaction.rollback()
                throw new Error(ctx.params.err)
            }
        }
    }
}