import _ from 'lodash'
import moment from 'moment'
const Op = require('sequelize').Op

module.exports = (server) => { return {
    name: "data/request",
    actions: {
        getOne(ctx) {
            return server.mysql.Request.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || [],
                transaction: ctx.params.transaction || null
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
            return server.mysql.Request.create(ctx.params.data, {
                transaction: ctx.params.transaction
            }).then((request) => {
                return JSON.parse(JSON.stringify(request))
            }).catch(() => {
                console.log("Nenhum registro encontrado. Create.")
                throw new Error("Nenhum registro encontrado.")
            })
        },
        /**
         * @param {Object} data, {Object} where, {Object} transaction
         * @returns {Promise.<Object>} request 
         */
        update(ctx) {
            return server.mysql.Request.update(ctx.params.data, {
                where: ctx.params.where || {},
                transaction: ctx.params.transaction || null
            }).then((updated) => {
                if (parseInt(_.toString(updated)) < 1 ) {
                    console.log("Nenhum registro encontrado. Update.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return server.mysql.Request.findById(ctx.params.data.id, {
                        transaction: ctx.params.transaction
                }).then((request) => {
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
                include: ctx.params.include || [],
                transaction: ctx.params.transaction || null
            }).then((requestOrder) => {
                return JSON.parse(JSON.stringify(requestOrder))
            })
        },
        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} requestOrder 
         */
        requestOrderCreate(ctx) {
            return server.mysql.RequestOrder.create(ctx.params.data, {
                transaction: ctx.params.transaction
            }).then((client) => {
                return JSON.parse(JSON.stringify(client))
            }).catch(() => {
                console.log("Nenhum registro encontrado. Create.")
                throw new Error("Nenhum registro encontrado.")
            })
        },
        /**
         * @param {Object} data, {Object} where, {Object} transaction
         * @returns {Promise.<Object>} requestOrder 
         */
        requestOrderUpdate(ctx) {
            return server.mysql.RequestOrder.update(ctx.params.data, {
                where: ctx.params.where || {},
                transaction: ctx.params.transaction || null
            }).then((updated) => {
                if (parseInt(_.toString(updated)) < 1 ) {
                    console.log("Nenhum registro encontrado. Update.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return server.mysql.RequestOrder.findById(ctx.params.data.id, {
                        transaction: ctx.params.transaction
                }).then((requestOrder) => {
                    return JSON.parse(JSON.stringify(requestOrder))
                })
            })
        },

        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Array>} RequestOrderProducts
         */
        setRequestOrderProducts(ctx) {
            return ctx.call("data/product.saveProducts", {
                data: ctx.params.data,
                companyId: ctx.params.companyId, 
                transaction: ctx.params.transaction
            }).then((orderProductWithProduct) => {
                 let orderProducts = _.map(orderProductWithProduct, orderProduct => {
                    return _.assign(orderProduct, {
                        productId: parseInt(orderProduct.product.id),
                    })
                })

                
                return ctx.call("data/request.saveRequestOrderProducts", {
                    data: orderProducts,
                    requestOrderId: parseInt(ctx.params.requestOrderId),
                    transaction: ctx.params.transaction
                }).then((orderProducts) => {
                    return orderProducts
                }).catch((err) => {
                    throw new Error("Nenhum registro encontrado.")
                }) 
            }).catch((err) => {
                //console.log('AQUI')  COMENTAR
                throw new Error(err)                    
            })
        },
        /**
         * @param {Object} data, {Int} requestOrderId, {Object} transaction
         * @returns {Promise.<Array>} RequestOrderProducts
         */            
        saveRequestOrderProducts(ctx) {
            /*
            * Delete all
            */ 
            return server.mysql.RequestOrderProduct.destroy({
                where: {
                    requestOrderId: ctx.params.requestOrderId
                },
                transaction: ctx.params.transaction
            }).then(() => {
                return server.mysql.RequestOrderProduct.bulkCreate(ctx.params.data, {
                    updateOnDuplicate: ['requestOrderId', 'productId', 'price', 'quantity', 'dateUpdate', 'dateRemoved'],
                    returning: true,
                    transaction: ctx.params.transaction
                }).then((response) => {
                    if (!response) {
                        console.log('Registro não encontrado. data/request.saveRequestOrderProducts')
                        throw new Error("Nenhum registro encontrado.")
                    }                  
                    return response
                }).catch((err) => {
                    console.log(err)
                })
            }).catch((err) => {
                console.log(err)
            })
        },
        requestMethodGetOne(ctx){
            return server.mysql.RequestPayment.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || [],
                transaction: ctx.params.transaction || null
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
                },
                transaction: ctx.params.transaction || null
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
                                },
                                transaction: ctx.params.transaction 
                            }).then((paymentMethodReturn) => {
                                if(paymentMethodReturn.paid) paymentsPaids.push(paymentMethodReturn.id)
                                return paymentMethodReturn
                                
                            }).catch((err) =>{
                                //console.log(err) //comentar
                                throw new Error(err)
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
                                createdById: ctx.params.createdById,
                                transaction: ctx.params.transaction || null
                            }).then((paymentMethodReturn) => {
                                if(paymentMethodReturn.paid) paymentsPaids.push(paymentMethodReturn.id)
                                return paymentMethodReturn
                            }).catch((err) =>{
                                //console.log(err) // COMENTAR
                                throw new Error(err)
                            })
                            )
                        }
                    })
                    return Promise.all(paymentMethodsPromises).then((paymentMethods) => {
                        
                        const updateLimitInUsePromise = []
                        _.forEach(_.keys(limitInUseChange),(clientId) => {
                            updateLimitInUsePromise.push(server.mysql.Client.update({
                                limitInUse: limitInUseChange[clientId]
                                }, {
                                where: {
                                    id: parseInt(clientId)
                                },
                                transaction: ctx.params.transaction
                            }))
                        })
                        
                        return Promise.all(paymentMethodsPromises).then(() => {
                        if(paymentsPaids.length){
                            return ctx.call("cashier-balancing.markAsPaid", {
                                data: {
                                    requestPaymentIds: _.pullAll(paymentsPaids, ctx.params.alreadyPaid),
                                    companyId: ctx.params.companyId,
                                    createdById: ctx.params.createdById,
                                    accountId: ctx.params.accountId
                                },
                                persistence: true,
                                transaction: ctx.params.transaction || null
                            }).then(() => {
                                return paymentMethods
                            })
                        }
                        else {
                            return paymentMethods
                        }
                        })
                    }).catch((err) => {
                        console.log('Erro payment methods em request service', err)
                        throw new Error(err)
                    })
                })
            }).catch((err) => {
                console.log('ERRO: revertTransaction do setPaymentMethods', err)
                return new Error("ERRO: revertTransaction do setPaymentMethods")
            })
        },

        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} paymentMethod
         */
        paymentMethodCreate(ctx){
            return server.mysql.RequestPayment.create(ctx.params.data, {
                transaction: ctx.params.transaction || null
            }).then((paymentMethod) => {
                if(!paymentMethod){
                    console.log("Nenhum registro encontrado. Create.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(paymentMethod))
            }).catch((err) => {
                throw new Error(err) // COMENTAR
            })
        },
        /**
         * @param {Object} where, {Object} transaction
         * @returns {Promise.<Object>} paymentMethod
         */
        paymentMethodUpdate(ctx){
            return server.mysql.RequestPayment.update(ctx.params.data, {
                where: ctx.params.where || {},
                paranoid: false,
                transaction: ctx.params.transaction || null
            }).then((paymentMethodUpdate) => {
                if(parseInt(_.toString(paymentMethodUpdate)) < 1 ){
                    console.log(ctx.params, "Nenhum registro encontrado. Update.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return server.mysql.RequestPayment.findById(ctx.params.data.id, {
                    transaction: ctx.params.transaction
                }).then((paymentMethod) => {
                    return JSON.parse(JSON.stringify(paymentMethod))
                })
            }).catch((err) => {
                throw new Error(err) // COMENTAR
            })
        },

        setPaymentBill(ctx){
            return ctx.call("data/request.getOneBill", {
                where: ctx.params.where || {},
                transaction: ctx.params.transaction 
            }).then((bill) => {
                console.log(bill)
                if(bill){
                    return ctx.call("data/request.paymentBillUpdate", {
                        data: {
                            deadlineDatetime: ctx.params.data.deadlineDatetime
                        },
                        where: {
                            requestPaymentId: ctx.params.requestPaymentId
                        },
                        transaction: ctx.params.transaction 
                    })
                }
                else{
                    return ctx.call("data/request.paymentBillCreate", {
                        data: {
                            requestPaymentId: ctx.params.requestPaymentId,
                            deadlineDatetime: ctx.params.data.deadlineDatetime
                        },
                        transaction: ctx.params.transaction 
                    })
                }
            })
        },

        getOneBill(ctx){
            return server.mysql.RequestPaymentBill.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || [],
                transaction: ctx.params.transaction || null
            }).then((requestPaymentBill) => {
                return JSON.parse(JSON.stringify(requestPaymentBill))
            })
        },

        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} paymentMethod
         */
        paymentBillCreate(ctx){
            return server.mysql.RequestPaymentBill.create(ctx.params.data, {
                transaction: ctx.params.transaction || null
            }).then((paymentMethod) => {
                if(!paymentMethod){
                    console.log("Nenhum registro encontrado. Create.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(paymentMethod))
            }).catch((err) => {
                throw new Error(err) // COMENTAR
            })
        },
        /**
         * @param {Object} where, {Object} transaction
         * @returns {Promise.<Object>} paymentMethod
         */
        paymentBillUpdate(ctx){
            return server.mysql.RequestPaymentBill.update(ctx.params.data, {
                where: ctx.params.where || {},
                paranoid: false,
                transaction: ctx.params.transaction || null
            }).then((paymentMethodUpdate) => {
                if(parseInt(_.toString(paymentMethodUpdate)) < 1 ){
                    console.log("Nenhum registro encontrado. Update.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return server.mysql.RequestPaymentBill.findById(ctx.params.data.id, {
                    transaction: ctx.params.transaction
                }).then((paymentMethod) => {
                    return JSON.parse(JSON.stringify(paymentMethod))
                })
            }).catch((err) => {
                throw new Error(err) // COMENTAR
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
                        throw new Error(err) // COMENTAR
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
                                throw new Error(err) // COMENTAR
                            })
                            )

                        })
                    }
                }
            })

            return Promise.all(promises).then(() => {
                const updateAccountBalancesPromise = []
                _.forEach(_.keys(accountBalances), (accountId) => {
                    updateAccountBalancesPromise.push(server.mysql.Account.update({
                        balance: accountBalances[accountId]
                    }, {
                            where: {
                                id: parseInt(accountId)
                            },
                            transaction: ctx.params.transaction
                        }))
                })
                return Promise.all(updateAccountBalancesPromise)
                /*
                .then(() => {
                    const updateClientLimitPromise = []
                    
                    _.forEach(_.keys(limitInUseChange), (clientId) => {
                        updateClientLimitPromise.push(server.mysql.Client.update({
                            limitInUse: limitInUseChange[clientId]
                        }, {
                                where: {
                                    id: parseInt(clientId)
                                },
                                transaction: ctx.params.transaction
                            }))
                    })
                    return Promise.all(updateClientLimitPromise)
                    
                })*/
            }).catch((err) => {
                console.log('error: ', err)
            })
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
                        clientAddressId: clientAddress.clientAddressId,
                        transaction: ctx.params.transaction
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
                    },
                    transaction: ctx.params.transaction
                }).then(() => {
                    return server.mysql.RequestClientAddress.bulkCreate(ctx.params.data, {
                        updateOnDuplicate: ['requestId', 'clientAddressId', 'type', 'lat', 'lng', 'dateUpdated', 'dateRemoved', 'status'],
                        transaction: ctx.params.transaction
                    }).then((response) => {
                        return response
                    }).catch((error) => {
                        return error
                    })
                })
            })
        },

        getGeo(ctx){
            return server.mysql.ClientAddress.findById(parseInt(ctx.params.clientAddressId), {
                include: [{
                    model: server.mysql.Address,
                    as: 'address'
                }],
                transaction: ctx.params.transaction
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
                        .catch((err) => {
                            console.log(err);
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
                },
                transaction: ctx.params.transaction
            }).then(() => {
                return server.mysql.RequestClientPhone.bulkCreate(ctx.params.data, {
                    updateOnDuplicate: ['requestId', 'clientPhoneId', 'type', 'dateUpdated', 'dateRemoved', 'status'],
                    transaction: ctx.params.transaction
                }).then((response) => {
                    return response
                }).catch((error) => {
                    return error
                })
            })
        },
        // request-timeline

        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        createTimeline(ctx){
             return server.mysql.RequestTimeline.create(ctx.params.data, {
                transaction: ctx.params.transaction || null
            }).then((response) => {
                return response
            }).catch((err) => {
                throw new Error("Erro timeline.")
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
    }
}
}