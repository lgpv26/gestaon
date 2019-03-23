const _ = require('lodash')
const sequelize = require('sequelize')
import moment from 'moment'
import EventResponse from '~server/models/EventResponse'

module.exports = (server) => { 
    //PRIVATES
    let _request = null

    let _companyId = null
    let _userId = null
    let _userAccountId = null

    let _draftId = null

    let _oldRequest = null

    return {
    name: "draft/request/persistence",
    actions: {
        /**
         * @param {Object} request, {Int} companyId, {Int} userId, {Int} draftId
         * @returns {Promise.<object>} request
         */
            start(ctx) {
                //SET PRIVATES
                this._request = ctx.params.request
                this._companyId = ctx.params.companyId
                this._userId = ctx.params.userId
                this._userAccountId = ctx.params.userAccountId
                this._draftId = ctx.params.draftId

                return ctx.call("draft/request/persistence.checkTempIds").then(() => {
                    //START

                    return ctx.call("draft/request/persistence.consultRequest").then(() => {

                        return server.sequelize.transaction((t) => {
                            let promises = []

                            //SAVE INITIAL CLIENT 
                            if (_.has(this._request, "client")) {
                                promises.push(ctx.call("draft/client/persistence.start", {
                                    client: this._request.client,
                                    companyId: this._companyId,
                                }).then((client) => {
                                    _.set(this._request, 'client', client)
                                    return { client }
                                }).catch((err) => {
                                    console.log("Erro em: draft/client/persistence.start")
                                    return Promise.reject(err)
                                }))
                            }

                            //SAVE INITIAL REQUEST ORDER 
                            if (_.has(this._request, "order")) {
                                promises.push(ctx.call("draft/request/persistence.setOrder")
                                    .then((order) => {
                                        return { order }
                                    }).catch((err) => {
                                        console.log("Erro em: draft/request/persistence.setOrder")
                                        return Promise.reject(err)
                                    }))
                            }

                            return Promise.all(promises).then((result) => {
                                //console.log(result)
                                // SET RESULT'S PROMISES
                                const client = _.find(result, 'client')
                                const order = _.find(result, 'order')
                                const task = _.find(result, 'task')
                                // SET REQUEST'S DATA
                                return ctx.call("draft/request/persistence.setRequest", {
                                    data: {
                                        companyId: this._companyId,
                                        userId: (this._request.responsibleUserId) ? this._request.responsibleUserId : this._userId,
                                        clientId: (client) ? _.get(client, 'client.id') : null,
                                        requestOrderId: (order) ? _.get(order, 'order.id') : null,
                                        taskId: (task) ? _.get(task, 'task.id') : null,
                                        deliveryDate: (this._request.deliveryDate) ? moment(this._request.deliveryDate) : (!this._request.id) ? moment().add(20, 'm') : (!this._oldRequest.isScheduled) ? this._oldRequest.deliveryDate : moment().add(20, 'm'),
                                        isScheduled: !!this._request.deliveryDate,
                                        phoneLine: (this._request.phoneLine) ? this._request.phoneLine : null,
                                        obs: (this._request.obs) ? this._request.obs : null,
                                        status: (this._request.status) ? (this._request.client.id) ? this._request.status : (this._request.status === 'finished' || this._request.status === 'canceled') ? this._request.status : 'finished' : (this._request.client.id) ? 'pending' : 'finished'
                                    }
                                }).then((request) => {
                                    //ALL OK - COMMIT
                                    return request
                                }).catch((err) => {
                                    console.log("Erro em: draft/request/persistence.setRequest")
                                    return Promise.reject(err)
                                })
                            }).catch((err) => {
                                console.log("Erro em: draft/request/persistence.setRequest promise all")
                                return Promise.reject(err)
                            })
                        }).then((request) => {
                            console.log("Commit everything!")
                            console.log("Removing draft...")
                            return ctx.call("draft.remove", {
                                data: {
                                    draftId: this._draftId,
                                    companyId: this._companyId,
                                    emittedBy: this._userId
                                }
                            }).then(() => {
                                console.log("Remove draft!")
                                return ctx.call("draft/request/persistence.removeRoom")
                                .then(() => {
                                    return ctx.call("draft/request/persistence.dashboard", {
                                        data: request
                                    }).then(() => {
                                        return ctx.call("draft/request/persistence.saveES", {
                                            requestOrderId: request.requestOrderId,
                                        }).then(() => {
                                            if (request.status === 'pending' && request.userId) {
                                                return ctx.call("push-notification.push", {
                                                    data: {
                                                        userId: request.userId,
                                                        title: 'Novo pedido #' + request.id,
                                                        message: 'Abra a notificação para ver mais detalhes',
                                                        payload: {
                                                            type: 'request.create',
                                                            id: '' + request.id
                                                        }
                                                    },
                                                    notRejectNotLogged: true
                                                }).then(() => {
                                                    return new EventResponse(request)
                                                }).catch((err) => {
                                                    return new EventResponse(new Error("Erro ao enviar o pedido ao entregador!"))
                                                })
                                            }
                                            return new EventResponse(request)
                                        }).catch((err) => {
                                            console.log("Erro em: draft/request/persistence.saveES")
                                            return new EventResponse(new Error(err))
                                        })
                                    }).catch((err) => {
                                        console.log("Erro em: draft/request/persistence.dashboard")
                                        return new EventResponse(new Error(err))
                                    })
                                })
                            }).catch((err) => {
                                return new EventResponse(new Error(err))
                            })
                        }).catch((err) => {
                            console.log(err)
                            return new EventResponse(new Error(err))
                        })
                    }).catch((err) => {
                        console.log("Erro em: draft/request/persistence.removeTempIds")
                        return new EventResponse(new Error("Erro ao consultar."))
                    })
                }).catch((err) => {
                    console.log("Erro em: draft/request/persistence.removeTempIds")
                    return new EventResponse(err)
                })
        },
       
        consultRequest(ctx){
            if(!this._request.id) return true
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
        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<object>} request
         */
        dashboard(ctx) {
            if(!this._request.client.id || (this._request.status === 'finished' || this._request.status === 'canceled')){
                if(ctx.params.data.id && (this._oldRequest.status !== 'finished' && this._oldRequest.status !== 'canceled')){
                    return ctx.call('request-board.getCard', {
                        where: {
                            requestId: parseInt(ctx.params.data.id)
                        }
                    }).then((card) => {                 
                        return ctx.call('request-board.removeCard', {
                            data: {
                                cardId: card.id,
                                companyId: this._companyId
                            }
                        }).then(() => {
                            return ctx.call("push-notification.push", {
                                data: {
                                    userId: this._request.userId,
                                    title: 'O pedido #' + ctx.params.data.id + ' foi encerrado.',
                                    sound: 'deny1',
                                    message: 'Abra a notificação para ver mais detalhes',
                                    payload: {
                                        type: 'request.removed',
                                        id: '' + ctx.params.data.id
                                    }
                                },
                                notRejectNotLogged: true
                            })
                        })
                    })
                }
                else{
                    return true
                }                
            }
            else {
                return ctx.call("data/request.getOne", {
                    where: {
                        id: ctx.params.data.id
                    },
                    include: [{
                        model: server.mysql.RequestTimeline,
                        as: "requestTimeline",
                        include: [{
                            model: server.mysql.User,
                            as: "triggeredByUser",
                            attributes: ['id', 'name', 'email', 'activeCompanyUserId']
                        },{
                            model: server.mysql.User,
                            as: "user",
                            attributes: ['id', 'name', 'email', 'activeCompanyUserId']
                        }]
                    },
                    {
                        model: server.mysql.RequestCard,
                        as: "requestCard"
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
                        }]
                    }]
                }).then((request) => {
                    if(this._request.id && (this._oldRequest.status !== 'finished' && this._oldRequest.status !== 'canceled')) {
                        if(request.deliveryDate === this._oldRequest.deliveryDate){
                            return ctx.call("request-board.reloadCard", {
                                request: request,
                                companyId: this._companyId,
                            })
                        }
                        else {
                            return ctx.call("request-board.updateCard", {
                                where: {
                                    requestId: request.id
                                },
                                data: {
                                    deliveryDate: request.deliveryDate
                                },
                                cardId: request.requestCard.id,
                                companyId: this._companyId
                            })
                        }
                    }
                    else{
                        return ctx.call("request-board.consultSectionOne", {
                            where: {
                                companyId: request.companyId
                            },
                            companyId: request.companyId
                        }).then((section) => {
                            let maxCard = _.maxBy(section.cards, (card) => {
                                return card.position
                            })
                            let maxCardPosition = 65535
                            if (maxCard) maxCardPosition += maxCard.position
                            return ctx.call("request-board.createCard", {
                                section: section,
                                data: {
                                    requestId: request.id,
                                    position: maxCardPosition,
                                    section: section.id,
                                    deliveryDate: request.deliveryDate,
                                    createdBy: _.first(request.requestTimeline).triggeredBy,
                                    companyId: request.companyId
                                },
                                request: request
                            }).then((card) => {
                                return card
                            }).catch((err) => {
                                console.log("Erro em: draft/request/persistence.dashboard createCard")
                                return Promise.reject(err)
                            })
                        })
                    }
                }).catch((err) => {
                    console.log(err, "Erro em: draft/request/persistence.dashboard consult do request")
                    return Promise.reject("Erro ao consultar o pedido para criar o card.")
                })
            }
        },

        removeRoom(ctx){
            return ctx.call('socket.checkSocketId', {
                userId: this._userId
            }).then((socketId) => {
                if(!socketId) return Promise.resolve()
                server.io.sockets.sockets[socketId].leave('company/' + this._companyId + '/draft/' + this._draftId)
                return ctx.call('socket.control', {
                    userId: this._userId,
                    socketId: socketId,
                    companyId: this._companyId,
                    ignore: (socketId) ? false : true
                }).then(() => {
                    return Promise.resolve()
                })
            })
        },

        setRequest(ctx){
            return ctx.call("draft/request/persistence.saveRequest", {
                data: ctx.params.data
            }).then((request) => {
                let promises = []
                promises.push(ctx.call("data/request.createTimeline", {
                        data: {
                            requestId: request.id,
                            triggeredBy: this._userId,
                            companyId: this._companyId,
                            action: (this._request.id) ? 'recoverance_save' : 'create',
                            userId: (this._request.responsibleUserId) ? this._request.responsibleUserId : this._userId,
                            status: (this._request.status) ? (this._request.client.id) ? this._request.status : this._request.status : (this._request.client.id) ? 'pending' : 'finished'
                        }
                    })
                )

                if(this._request.requestPayments){
                    promises.push(ctx.call("draft/request/persistence.setPaymentMethods", {
                            data: this._request.requestPayments,
                            requestId: request.id
                        })
                    )
                }

                if(this._request.clientAddressId){
                    const clientAddressSelect = _.find(this._request.client.clientAddresses, 'select')
                    promises.push(ctx.call("data/request.setRequestClientAddresses", {
                            data: [_.assign({clientAddressId: clientAddressSelect.id,
                                requestId: request.id
                            })],
                            requestId: request.id
                        })
                    )
                }

                if(this._request.clientPhoneId){
                    const clientPhoneSelect = _.find(this._request.client.clientPhones, 'select')
                    promises.push(ctx.call("data/request.setRequestClientPhones", {
                            data: [_.assign({clientPhoneId: clientPhoneSelect.id,
                                requestId: request.id
                            })],
                            requestId: request.id
                        })
                    )
                }

                return Promise.all(promises).then(() => {
                    return request
                }).catch((error) => {
                    console.log("Erro em: data/request.setRequest - PROMISE ALL")
                    return Promise.reject(error)
                })         
            }).catch((error) => {
                console.log("Erro em: data/request.saveRequest")
                return Promise.reject(error)
            }) 
        },

        setPaymentMethods(ctx){
                let removeRequestPayments = []
                let alreadyPaid = []
                let changePaid = []
                return new Promise((resolve,reject) => {
                    if(this._request.id && _.has(this._oldRequest, 'requestPayments')){
                        alreadyPaid = _.map(_.filter(this._oldRequest.requestPayments, (requestPayment) => {
                            return requestPayment.paid
                        }), (requestPayment) => {
                            return requestPayment
                        })
                        const promises = []
                        
                        ctx.params.data.forEach((payment, index) => {
                            promises.push(new Promise((resolve, reject) => {
                                    const indexOldPayment = _.findIndex(this._oldRequest.requestPayments, (oldPayment) => {
                                        return oldPayment.id === payment.id
                                    })
            
                                    if(indexOldPayment !== -1 && parseFloat(payment.amount) !== parseFloat(this._oldRequest.requestPayments[indexOldPayment].amount)){
                                        _.set(payment, 'changed', true)
                                        _.set(payment, 'oldAmount', parseFloat(this._oldRequest.requestPayments[indexOldPayment].amount))
                                        _.set(ctx.params.data[index], 'settled', false)
                                        _.set(ctx.params.data[index], 'settledDatetime', null)
                                        changePaid.push(_.assign(payment, {requestPaymentTransactions: this._oldRequest.requestPayments[indexOldPayment].requestPaymentTransactions}))
                                    }
            
                                    if(indexOldPayment !== -1 && payment.paid !== this._oldRequest.requestPayments[indexOldPayment].paid){
                                        _.set(payment, 'changed', true)
                                        _.set(payment, 'oldAmount', parseFloat(this._oldRequest.requestPayments[indexOldPayment].amount))
                                        _.set(ctx.params.data[index], 'settled', false)
                                        _.set(ctx.params.data[index], 'settledDatetime', null)
                                        changePaid.push(_.assign(payment, {requestPaymentTransactions: this._oldRequest.requestPayments[indexOldPayment].requestPaymentTransactions}))
                                    }

                                    if(indexOldPayment !== -1 && payment.paymentMethodId !== this._oldRequest.requestPayments[indexOldPayment].paymentMethodId){
                                        _.set(payment, 'changed', true)
                                        _.set(payment, 'oldAmount', parseFloat(this._oldRequest.requestPayments[indexOldPayment].amount))
                                        _.set(ctx.params.data[index], 'settled', false)
                                        _.set(ctx.params.data[index], 'settledDatetime', null)
                                        changePaid.push(_.assign(payment, {requestPaymentTransactions: this._oldRequest.requestPayments[indexOldPayment].requestPaymentTransactions}))
                                    }
                                    
                                    return ctx.call("data/payment-method.getOne", {
                                        data: {
                                            id: payment.paymentMethodId,
                                            companyId: this._companyId
                                        }
                                    }).then((paymentMethod) => {
                                        if(!paymentMethod.autoPay && payment.changed && this._oldRequest.requestPayments[indexOldPayment].settled && this._oldRequest.requestPayments[indexOldPayment].paid) reject('Não é possivel excluir Notinha já paga!')
                                        _.set(ctx.params.data[index], 'paymentMethod', paymentMethod)
                                        resolve()              
                                    })
                                })
                            )
                        })
                        return Promise.all(promises).then(() => {                          
                            alreadyPaid = _.pullAllBy(alreadyPaid, changePaid, 'id')
                            removeRequestPayments = _.pullAllBy(this._oldRequest.requestPayments, ctx.params.data, 'id')
                            removeRequestPayments.forEach((removeRequestPayment) => {
                                if(!removeRequestPayment.paymentMethod.autoPay && removeRequestPayment.settled && removeRequestPayment.paid) reject('Não é possivel excluir Notinha já paga!')
                            })
                            resolve() 
                        })
                    }
                    else{
                        const promises = []
                        ctx.params.data.forEach((payment, index) => {
                            promises.push(ctx.call("data/payment-method.getOne", {
                                    data: {
                                        id: payment.paymentMethodId,
                                        companyId: this._companyId
                                    }
                                }).then((paymentMethod) => {
                                    return _.set(ctx.params.data[index], 'paymentMethod', paymentMethod)
                                })
                            )
                        })
                        return Promise.all(promises).then(() => {
                            resolve()
                        })
                    }
                }).then(() => {
                    return ctx.call("data/request.setPaymentMethods", {
                        data: ctx.params.data,
                        removeRequestPayments: (removeRequestPayments) ? removeRequestPayments : [],
                        alreadyPaid: _.map(alreadyPaid, (paid) => {
                            return paid.id
                        }),
                        changePaid: changePaid,
                        requestId: ctx.params.requestId,
                        companyId: this._companyId,
                        clientId: this._request.client.id,
                        createdById: this._userId,
                        userId: this._request.responsibleUserId,
                        createdByAccountId: this._userAccountId,
                        accountId: (this._request.accountId) ? this._request.accountId : null
                    })  
                })
        },

        saveRequest(ctx){
            if (this._request.id) { // update request         
                return ctx.call("data/request.update", {
                    data: _.assign(ctx.params.data, {
                        id: this._request.id
                    }),
                    where: {
                        id: this._request.id,
                        companyId: this._companyId
                    }
                }).then((request) => {
                    return request
                }).catch((err) => {
                    console.log("Erro em: data/request.update")
                    return Promise.reject(err)
                })   
            }
            else { // create request
                return ctx.call("data/request.create", {
                    data: ctx.params.data
                }).then((request) => {
                    return request
                }).catch((err) => {
                    console.log("Erro em: data/request.create")
                    return Promise.reject(err)
                })   
            }
        },

        setOrder(ctx){
            return ctx.call("draft/request/persistence.saveOrder")
            .then((order) => {
                return new Promise((resolve,reject) => {
                    if(!_.has(this._request.order, "orderProducts")){
                        return resolve()
                    }
                    
                    return ctx.call("draft/request/persistence.setOrderProducts", {
                        data: {
                            requestOrderId: order.id
                        }
                    }).then((orderProducts) => {
                        _.set(order, "orderProducts", orderProducts)
                        resolve()
                    }).catch((err) => {
                        console.log("Erro em: draft/request/persistence.setOrderProducts")
                        return reject(err)
                    })
                })
                .then(() => {
                    return order
                }).catch((err) => {
                    console.log("Erro em: draft/request/persistence.setOrderProducts")
                    return Promise.reject(err)
                })
            }).catch((err) => {
                console.log("Erro em: draft/request/persistence.setOrder")
                return Promise.reject(err)
            })
        },

        checkTempIds(ctx){
            let removeTemps = []
            if(_.has(this._request, "client")){
                if(_.has(this._request, "client.clientAddresses")){
                    removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                            path: 'client.clientAddresses',
                            select: 'clientAddressId'
                        })
                    )
                }
                if(_.has(this._request, "client.clientPhones")){
                    removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                            path: 'client.clientPhones',
                            select: 'clientPhoneId'
                        })
                    )
                }
                if(_.has(this._request, "client.clientCustomFields")){
                    removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                            path: 'client.clientCustomFields'
                        })
                    )
                }
            }
            if(_.has(this._request, "order")){
                if(_.has(this._request, "order.orderProducts")){
                    removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                            path: 'order.orderProducts'
                        })
                    )
                }
            }
            if(_.has(this._request, "requestPayments")){
                removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                        path: 'requestPayments'
                    })
                )
            }
            return Promise.all(removeTemps).then(() => {
                return true
            }).catch((err) => {
                console.log("Erro em: draft/request/persistence.checkTempIds")
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

        setOrderProducts(ctx){
            return ctx.call("data/request.setRequestOrderProducts", {
                data: _.map(this._request.order.orderProducts, orderProduct => {
                    return _.assign(orderProduct, {
                        requestOrderId: ctx.params.data.requestOrderId,
                    })
                }),
                companyId: this._companyId, 
                requestOrderId: ctx.params.data.requestOrderId
            }).then((orderProducts) => {
                return orderProducts
            }).catch((err) => {
                console.log("Erro em: data/request.setRequestOrderProducts")
                return Promise.reject(err)
            })
        },
        checkLimit(ctx){
            if(!this._request.client.id) return true
            return ctx.call("data/client.get", {
                where: {
                    id: this._request.client.id
                }
            }).then((client) => {
                return true
                /*
                if(client && (parseFloat(client.creditLimit) >= parseFloat(client.limitInUse))){
                    return true
                }
                else{
                    throw new Error('Sem limite de credito')
                }*/
            })
        },

        saveOrder(ctx){
            if (this._request.order.id) { // update order
                return ctx.call("data/request.requestOrderUpdate", {
                    data: this._request.order,
                    where: {
                        id: this._request.order.id
                    }
                }).then((requestOrder) => {
                    
                    return requestOrder
                }).catch((err) => {
                    console.log("Erro em: draft/request/persistence.saveOrder")
                    return Promise.reject(err)
                })   
            }
            else { // create order
                return ctx.call("data/request.requestOrderCreate", {
                    data: this._request.order
                }).then((requestOrder) => {
                    return requestOrder
                }).catch((err) => {
                    console.log("Erro em: draft/request/persistence.saveOrder")
                    return Promise.reject(err)
                })   
            }
        },

        saveES(ctx) {
            let promises = []
            let productsES = []
            let clientES = []

            if (ctx.params.requestOrderId) {
                promises.push(ctx.call("draft/request/persistence.setProductES", {
                    requestOrderId: ctx.params.requestOrderId
                }).then((products) => {
                    productsES = products
                }))
            }
            if (this._request.client.saveInRequest && this._request.client.id) {
                promises.push(ctx.call("draft/client/persistence.setES", {
                    clientId: this._request.client.id,
                }).then((client) => {
                    clientES = client
                }))
            }
            return Promise.all(promises).then(() => {
                return server.elasticSearch.bulk({
                    body: _.concat(productsES, clientES)                    
                }, function (esErr, esRes, esStatus) {
                    if (esErr) {
                        console.log(esErr, "Erro em: draft/request/persistence.saveES")
                        console.log('Erro ao salvar dados no ElasticSearch!')
                        return Promise.reject('Erro ao salvar dados no ElasticSearch!')
                    }
                    return true
                })
            })
        },

        setProductES(ctx){
             return ctx.call("data/request.getRequestOrder", {
                where: {
                    id: parseInt(ctx.params.requestOrderId)
                },
                include: [{
                    model: server.mysql.RequestOrderProduct,
                    as: 'requestOrderProducts',
                    include: [{
                        model: server.mysql.Product,
                        as: 'product'
                    }]
                }]
            }).then((requestOrder) => {
                let products = []

                if(_.has(requestOrder, "requestOrderProducts")){
                    requestOrder.requestOrderProducts.forEach((requestOrderProduct) => {
                        products.push({
                            index: {
                                _index: 'main',
                                _type: 'product',
                                _id: requestOrderProduct.product.id,
                                }
                            },{
                            companyId: requestOrderProduct.product.companyId,
                            name: requestOrderProduct.product.name,
                            suppliers: [{
                                supplierProductId: null,
                                supplierId: null,
                                name: 'SEM FORNECEDOR CADASTRADO',
                                obs: null,
                                quantity: null,
                                price: null
                            }],
                            dateUpdated: requestOrderProduct.product.dateUpdated,
                            dateCreated: requestOrderProduct.dateCreated
                        })
                    })
                }
                return products
            }).catch((err) => {
                console.log("Erro em: data/request.getRequestOrder")
                return Promise.reject("Erro ao preparar elasticsearch")
            })  
        }

    }
}}