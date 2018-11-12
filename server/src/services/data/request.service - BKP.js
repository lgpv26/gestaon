import _ from 'lodash'
import moment from 'moment'
const Op = require('sequelize').Op
import EventResponse from '~models/EventResponse'

module.exports = (server) => { return {
    name: "data/request",
    actions: {
        getOne(ctx) {
            return server.mysql.Request.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || []
            }).then((request) => {
                return JSON.parse(JSON.stringify(request))
            })
        },
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        getList(ctx){
            return server.mysql.Request.findAll({
                where: ctx.params.where || {},
                include: ctx.params.include || []
            })
        },
        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} request
         */
        create(ctx) {
            return server.mysql.Request.create(ctx.params.data)
            .then((request) => {
                if(!request) return Promise.reject('Erro ao cadastrar o Request!')
                server.io.to(`company/${ctx.params.data.companyId}`).emit('request.create', new EventResponse(request))

                return ctx.call('request-board.updateCard', {
                    data: {
                        requestId: request.id
                    },
                    where: {
                        id: ctx.params.data.cardId
                    },
                    cardId: ctx.params.data.cardId
                })
                .then(() => {
                    return JSON.parse(JSON.stringify(request))
                })
                .catch(() => {
                    return Promise.reject('Erro ao salvar o pedido no Card.')
                })
            }).catch((err) => {
                console.log(err, "Erro em: data/request.create")
                return Promise.reject('Erro ao criar o pedido.')
            })
        },
        /**
         * @param {Object} data, {Object} where, {Object} transaction
         * @returns {Promise.<Object>} request
         */
        update(ctx) {
            return server.mysql.Request.update(ctx.params.data, {
                where: ctx.params.where || {}
            }).then((updated) => {
                if (parseInt(_.toString(updated)) < 1 ) {
                    console.log("Nenhum registro encontrado. Update.")
                    return Promise.reject('Erro ao atualizar o pedido.')
                }
                return server.mysql.Request.findById(ctx.params.data.id)
                .then((request) => {
                    return JSON.parse(JSON.stringify(request))
                })
            })
        },

        remove(ctx){

        },

        ////////////////////
        // REQUEST ORDER //
        ///////////////////
        getRequestOrder(ctx){
            return server.mysql.RequestOrder.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || []
            }).then((requestOrder) => {
                return JSON.parse(JSON.stringify(requestOrder))
            })
        },
        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} requestOrder
         */
        requestOrderCreate(ctx) {
            return server.mysql.RequestOrder.create(ctx.params.data)
            .then((requestOrder) => {
                return JSON.parse(JSON.stringify(requestOrder))
            }).catch(() => {
                console.log('Erro no requestOrderCreate em request service') //comentar
                return Promise.reject('Erro ao criar a lista de produtos do pedido.')
            })
        },
        /**
         * @param {Object} data, {Object} where, {Object} transaction
         * @returns {Promise.<Object>} requestOrder
         */
        requestOrderUpdate(ctx) {
            return server.mysql.RequestOrder.update(ctx.params.data, {
                where: ctx.params.where || {}
            }).then((updated) => {
                if (parseInt(_.toString(updated)) < 1 ) {
                    console.log('Erro no requestOrderCreate em request service') //comentar
                    return Promise.reject('Erro ao atualizar a lista de produtos do pedido.')
                }
                return server.mysql.RequestOrder.findById(ctx.params.data.id)
                .then((requestOrder) => {
                    return JSON.parse(JSON.stringify(requestOrder))
                })
            })
        },

        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Array>} RequestOrderProducts
         */
        setRequestOrderProducts(ctx) {
            /*
            * Delete all
            */
            return server.mysql.RequestOrderProduct.destroy({
                where: {
                    requestOrderId: ctx.params.requestOrderId
                }
            }).then(() => {
                return server.mysql.RequestOrderProduct.bulkCreate(_.map(ctx.params.data, (requestOrder) => {
                    requestOrder.productId = requestOrder.product.id
                    return requestOrder
                }), {
                    updateOnDuplicate: ['requestOrderId', 'productId', 'price', 'quantity', 'dateUpdate', 'dateRemoved'],
                    returning: true
                }).then((response) => {
                    return response
                }).catch((error) => {
                    console.log("Erro: no bulkCreate do data/request.setRequestOrderProducts")
                    return Promise.reject("Erro ao salvar os produtos do pedido")
                })
            }).catch((err) => {
                console.log('Erro no saveRequestOrderProducts em request service ao destroy order products') //comentar
                return Promise.reject(err)
            })
        },
    
        requestMethodGetOne(ctx){
            return server.mysql.RequestPayment.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || []
            }).then((requestPayment) => {
                return JSON.parse(JSON.stringify(requestPayment))
            })
        },
        /**
         * @param {Object} data, {Object} requestId, {Object} transaction (optional)
         * @returns {Promise.<Array>} paymentMethods
         */
        setPaymentMethods(ctx) {
            let revertTransactions = []
            return server.mysql.RequestPayment.destroy({
                where: {
                    id: {
                        [Op.in]: _.map(ctx.params.removeRequestPayments, (removeRequestPayment) => {
                            revertTransactions.push(removeRequestPayment)
                            return removeRequestPayment.id
                        })
                    }
                }
            }).then(() => {
                return ctx.call("data/request.revertTransaction", {
                    data: revertTransactions,
                    clientId: ctx.params.clientId,
                    changePaid: ctx.params.changePaid,
                    alreadyPaid: ctx.params.alreadyPaid,
                    createdById: ctx.params.createdById,
                    requestId: ctx.params.requestId,
                    transaction: ctx.params.transaction
                }).then(() => {
                    const limitInUseChange = {}
                    let paymentMethodsPromises = []
                    let paymentsPaids = []

                    ctx.params.data.forEach((requestPayment) => {
                        if (requestPayment.id) {
                            paymentMethodsPromises.push(ctx.call("data/request.paymentMethodUpdate", {
                                data: _.assign(requestPayment, {
                                    lastTriggeredUserId: ctx.params.createdById,
                                    lastReceivedFromUserId: (requestPayment.received) ? ctx.params.createdById : null,
                                    receivedDate: (requestPayment.received) ? (requestPayment.receivedDate) ? requestPayment.receivedDate : moment() : null,
                                    received: (requestPayment.received) ? requestPayment.received : false,
                                    deadlineDatetime: (requestPayment.deadlineDatetime) ? requestPayment.deadlineDatetime : null,
                                    requestId: ctx.params.requestId,
                                    dateRemoved: null
                                }),
                                createdById: ctx.params.createdById,
                                where: {
                                    id: requestPayment.id
                                }
                            }).then((paymentMethodReturn) => {
                                if(paymentMethodReturn.paid) paymentsPaids.push(paymentMethodReturn.id)
                                return paymentMethodReturn
                                
                            }).catch((err) => {
                                console.log("Erro em: data/request.paymentMethodUpdate")
                                return Promise.reject(err)
                            })
                            )
                        }
                        else {
                            paymentMethodsPromises.push(ctx.call("data/request.paymentMethodCreate", {
                                data: _.assign(requestPayment, {
                                    lastTriggeredUserId: ctx.params.createdById,
                                    lastReceivedFromUserId: (requestPayment.received) ? ctx.params.createdById : ctx.params.userId,
                                    receivedDate: (requestPayment.received) ? (requestPayment.receivedDate) ? requestPayment.receivedDate : moment() : null,
                                    received: (requestPayment.received) ? requestPayment.received : false,
                                    deadlineDatetime: (requestPayment.deadlineDatetime) ? requestPayment.deadlineDatetime : null,
                                    requestId: ctx.params.requestId,
                                }),
                                createdById: ctx.params.createdById
                            }).then((paymentMethodReturn) => {
                                if(paymentMethodReturn.paid) paymentsPaids.push(paymentMethodReturn.id)
                                return paymentMethodReturn
                            }).catch((err) => {
                                console.log("Erro em: data/request.paymentMethodCreate")
                                return Promise.reject(err)
                            }) 
                            )
                        }
                    })

                    return Promise.all(paymentMethodsPromises).then((paymentMethods) => {
                        if(paymentsPaids.length){
                            return ctx.call("cashier-balancing.markAsReceived", {
                                data: {
                                    requestPaymentIds: _.pullAll(paymentsPaids, ctx.params.alreadyPaid),
                                    companyId: ctx.params.companyId,
                                    createdById: ctx.params.createdById,
                                    accountId: ctx.params.accountId,
                                    received: true
                                },
                                persistence: true
                            }).then(() => {
                                return paymentMethods
                            })
                        }
                        else {
                            return paymentMethods
                        }
                    })
                }).catch((err) => {
                    console.log('Erro payment methods em request service')
                    return Promise.reject(err)
                })
            }).catch((err) => {
                console.log('ERRO: revertTransaction do setPaymentMethods')
                return Promise.reject(err)
            })
        },

        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} paymentMethod
         */
        paymentMethodCreate(ctx){
            return server.mysql.RequestPayment.create(ctx.params.data)
            .then((paymentMethod) => {
                if(!paymentMethod){
                    console.log("Nenhum registro encontrado. Create.")
                    return Promise.reject('Erro ao criar a forma de pagamento.')
                }
                return JSON.parse(JSON.stringify(paymentMethod))
            }).catch((err) => {
                console.log('ERRO: data.request.paymentMethodCreate')
                return Promise.reject(err)
            })
        },
        /**
         * @param {Object} where, {Object} transaction
         * @returns {Promise.<Object>} paymentMethod
         */
        paymentMethodUpdate(ctx){
            return server.mysql.RequestPayment.update(ctx.params.data, {
                where: ctx.params.where || {},
                paranoid: false
            }).then((paymentMethodUpdate) => {
                if(parseInt(_.toString(paymentMethodUpdate)) < 1 ){
                    console.log("Nenhum registro encontrado. Update.")
                    return Promise.reject("Erro ao atualizar a forma de pagamento")
                }
                return server.mysql.RequestPayment.findById(ctx.params.data.id)
                .then((paymentMethod) => {
                    return JSON.parse(JSON.stringify(paymentMethod))
                })
            }).catch((err) => {
                console.log('ERRO: data.request.paymentMethodUpdate')
                return Promise.reject(err)
            })
        },

        revertTransaction(ctx){
            if (ctx.params.changePaid.length) {
                ctx.params.data = _.concat(ctx.params.data, ctx.params.changePaid)
            }
            if (!ctx.params.data.length) return true
            const promises = []
            const accountBalances = {}
            const limitInUseChange = {}

            ctx.params.data.forEach((requestPayment) => {
                /*
                if(!requestPayment.paymentMethod.autoPay){
                    promises.push(new Promise((resolve, reject) => {
                            if(!limitInUseChange[ctx.params.clientId]){
                                ctx.call("data/client.get", {
                                    where: {
                                        id: ctx.params.clientId
                                    },
                                    transaction: ctx.params.transaction 
                                }).then((client) => {
                                    const value = (requestPayment.oldAmount) ? requestPayment.oldAmount : requestPayment.amount
                                    console.log(client.limitInUse, value, parseFloat(client.limitInUse), parseFloat(value))
                                    limitInUseChange[client.id] = (parseFloat(client.limitInUse) - parseFloat(value))
                                    resolve()
                                })
                            }
                            else{
                                limitInUseChange[ctx.params.clientId] = parseFloat(limitInUseChange[ctx.params.clientId].limitInUse + value)
                                resolve()
                            }
                        })
                    )
                }
                */

                requestPayment.requestPaymentTransactions.sort((a, b) => { return new Date(a.dateCreated) - new Date(b.dateCreated) })

                let paymentsRevert = _.filter(requestPayment.requestPaymentTransactions, (requestPaymentTransaction) => {
                    return requestPaymentTransaction.action == 'payment'
                })

                if (paymentsRevert.length && !_.last(paymentsRevert).revert) {
                    const requestTransaction = _.last(paymentsRevert)

                    promises.push(ctx.call("cashier-balancing.revertTransaction", {
                        data: {
                            amount: -Math.abs(requestTransaction.transaction.amount),
                            createdById: ctx.params.createdById,
                            accountId: requestTransaction.transaction.accountId,
                            companyId: requestTransaction.transaction.companyId,
                            description: 'Redução do valor do pagamento #' + requestPayment.id + ' do pedido #' + ctx.params.requestId + ' na conta de destino (Recoverance)',
                        },
                        type: 'paid',
                        paymentMethodId: requestPayment.id,
                        transaction: ctx.params.transaction
                    }).then((response) => {
                        if (!accountBalances[response.account.id]) accountBalances[response.account.id] = response.account.balance
                        return accountBalances[response.account.id] = parseFloat(accountBalances[response.account.id]) + parseFloat(response.transaction.amount)
                    }).catch((err) => {
                        console.log("Erro: revertTransaction in if paid", err)
                        return Promise.reject(err)
                    })
                    )
                }


                let settledsRevert = _.filter(requestPayment.requestPaymentTransactions, (requestPaymentTransaction) => {
                    return requestPaymentTransaction.action === 'settle'
                })


                if (settledsRevert.length) {
                    const settledTransaction = _.takeRight(settledsRevert, 2)

                    if ((settledTransaction.length == 2) && !settledTransaction[0].revert && !settledTransaction[1].revert) {

                        settledTransaction.forEach((requestTransaction, index) => {

                        const typeOperation = (requestTransaction.operation == 'add') ? 'Redução' : 'Adição'
                        const typeAccount = (requestTransaction.operation == 'add') ? 'destino' : 'origem'
                            promises.push(ctx.call("cashier-balancing.revertTransaction", {
                                data: {
                                    amount: (requestTransaction.operation == 'add') ? -Math.abs(requestTransaction.transaction.amount) : Math.abs(requestTransaction.transaction.amount),
                                    createdById: ctx.params.createdById,
                                    accountId: requestTransaction.transaction.accountId,
                                    companyId: requestTransaction.transaction.companyId,
                                    description: typeOperation + ' do valor do acerto de contas #' + requestPayment.id + ' do pedido #' + ctx.params.requestId + ' na conta de '
                                    + typeAccount + '. (Recoverance)',
                                },
                                type: 'settled',
                                paymentMethodId: requestPayment.id,
                                operation: (requestTransaction.operation == 'add') ? 'remove' : 'add',
                                transaction: ctx.params.transaction
                            }).then((response) => {
                                if(requestPayment.paid){
                                    if (!accountBalances[response.account.id]) accountBalances[response.account.id] = response.account.balance
                                    return accountBalances[response.account.id] = parseFloat(accountBalances[response.account.id]) + parseFloat(response.transaction.amount)
                                }
                            }).catch((err) => {
                                console.log("Erro: revertTransaction in if paid", err)
                                return Promise.reject(err)
                            })
                            )

                        })
                    }
                }
            })

            return Promise.all(promises)
        },
        // request-client-address
        /**
         * @param {Object} data, {Int} requestId, {Object} transaction
         * @returns {Promise.<Array>} requests
         */
        setRequestClientAddresses(ctx){
            const promises = []
            ctx.params.data.forEach((clientAddress, index) => {
                promises.push(ctx.call("data/request.getGeo", {
                        clientAddressId: clientAddress.clientAddressId
                    }).then((geo) => {
                        if (!_.isEmpty(geo)) {
                            _.set(ctx.params.data[index], 'lat', geo.lat)
                            _.set(ctx.params.data[index], 'lng', geo.lng)
                        }
                    })
                )
            })

            return Promise.all(promises).then(() => {
                return server.mysql.RequestClientAddress.destroy({
                    where: {
                        requestId: ctx.params.requestId
                    }
                }).then(() => {
                    return server.mysql.RequestClientAddress.bulkCreate(ctx.params.data, {
                        updateOnDuplicate: ['requestId', 'clientAddressId', 'type', 'lat', 'lng', 'dateUpdated', 'dateRemoved', 'status']
                    }).then((response) => {
                        return response
                    }).catch((error) => {
                        console.log("Erro: no bulkCreate do data/request.setRequestClientAddresses")
                        return Promise.reject("Erro ao salvar o endereço do cliente no pedido")
                    })
                })
            })
        },

        getGeo(ctx){
            return server.mysql.ClientAddress.findById(parseInt(ctx.params.clientAddressId), {
                include: [{
                    model: server.mysql.Address,
                    as: 'address'
                }]
            })
                .then((clientAddress) => {
                    const name = (clientAddress.address.name) ? clientAddress.address.name : ''
                    const number = (clientAddress.number) ? ', ' + clientAddress.number : ''
                    const complement = (clientAddress.complement) ? ' ' + clientAddress.complement : ''
                    const city = (clientAddress.address.city) ? ' ' + clientAddress.address.city : ''
                    const state = (clientAddress.address.state) ? '/' + clientAddress.address.state : ''
                    const cep = (clientAddress.address.cep) ? clientAddress.address.cep : ''

                    return server.googleMaps.geocode({ address: name + number + complement + city + state + ' - ' + cep })
                        .asPromise()
                        .then((response) => {
                            if (response.length) return {}
                            const geo = _.first(response.json.results)
                            return { lat: geo.geometry.location.lat, lng: geo.geometry.location.lng }
                        })
                        .catch((error) => {
                            console.log("Erro: no geo code, Erro ao salvar o endereço do cliente no pedido, service request.getGeo" + new Date())
                            return Promise.resolve()
                        })
                })
        },
        // request-client-phone
        /**
         * @param {Object} data, {Int} requestId, {Object} transaction
         * @returns {Promise.<Array>} requestClientPhones
         */
        setRequestClientPhones(ctx){
            return server.mysql.RequestClientPhone.destroy({
                where: {
                    requestId: ctx.params.requestId
                }
            }).then(() => {
                return server.mysql.RequestClientPhone.bulkCreate(ctx.params.data, {
                    updateOnDuplicate: ['requestId', 'clientPhoneId', 'type', 'dateUpdated', 'dateRemoved', 'status'],
                    transaction: ctx.params.transaction
                }).then((response) => {
                    return response
                }).catch((error) => {
                    console.log("Erro: no bulkCreate do data/request.setRequestClientPhones")
                    return Promise.reject("Erro ao salvar o telefone do cliente no pedido")
                })
            })
        },
        // request-timeline

        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        createTimeline(ctx){
             return server.mysql.RequestTimeline.create(ctx.params.data)
             .then((response) => {
                return response
            }).catch((err) => {
                console.log("Erro em: data/request.createTimeline")
                return Promise.reject('Erro ao salvar a timeline.')
            }) 
        },

        sendChatItem(ctx){
            return server.mysql.RequestChatItem.create(ctx.params.data)
            .then((createChat) => {
                const createdRequestChatItem = JSON.parse(JSON.stringify(createChat))
                return server.mysql.RequestChatItem.findById(createChat.id, {
                    include: [{
                        model: server.mysql.User,
                        as: "user",
                        attributes: ['id', 'name','email','type']
                    }]
                })
           }).catch((err) => {
               throw new Error("Erro send chat.")
           })
       },

        importPayment(ctx){
            ctx.call('data/request.getList', {
                include: [{
                    model: server.mysql.RequestPayment,
                    as: "requestPayments",
                    include: [{
                        model: server.mysql.RequestPaymentTransaction,
                        as: 'requestPaymentTransactions',
                        order: [['id', 'ASC']],
                        include: [{
                            model: server.mysql.Transaction,
                            as: 'transaction',
                            include: [{
                                model: server.mysql.Account,
                                as: 'account',
                                include: [{
                                    model: server.mysql.User,
                                    as: 'user',
                                }]
                            }]
                        }]
                    }]
                }]
            }).then((requests) => {
                requests = JSON.parse(JSON.stringify(requests))

                let promises = []

                requests.forEach((request, index) => {
                    if(_.has(request, 'requestPayments') && request.requestPayments.length){
                        request.requestPayments.forEach((requestPayment) => {
                            const data = {}

                            if(_.first(requestPayment.requestPaymentTransactions)){
                                data.lastTriggeredUserId = _.first(requestPayment.requestPaymentTransactions).transaction.createdById,
                                data.lastReceivedFromUserId = _.first(requestPayment.requestPaymentTransactions).transaction.account.user.id,
                                data.received = (requestPayment.settledDatetime) ? true : (requestPayment.paidDatetime) ? true : false
                                data.receivedDate = (requestPayment.settledDatetime) ? requestPayment.settledDatetime : (requestPayment.paidDatetime) ? requestPayment.paidDatetime : null
                            }

                            console.log('Convertendo: #', (index + 1))
                            promises.push(ctx.call('data/request.paymentMethodUpdate', {
                                where: {
                                    id: requestPayment.id
                                },
                                data
                            }))

                        })
                    }

                })

                return Promise.all(promises).then(() => {
                    return true
                })

            })

        }

    }
}
}