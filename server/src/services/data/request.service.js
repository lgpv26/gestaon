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
        paymentMethodGetOne(ctx){
            return server.mysql.RequestPaymentMethod.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || [],
                transaction: ctx.params.transaction || null
            }).then((requestPaymentMethod) => {
                return JSON.parse(JSON.stringify(requestPaymentMethod))
            })
        },
        /**
         * @param {Object} data, {Object} requestId, {Object} transaction (optional)
         * @returns {Promise.<Array>} paymentMethods 
         */
        setPaymentMethods(ctx) {
            let revertTransactions = []
            return server.mysql.RequestPaymentMethod.destroy({
                where: {
                    id: {
                        [Op.in]: _.map(ctx.params.removeRequestPaymentMethods, (removeRequestPayment) => {
                            if(removeRequestPayment.paid || removeRequestPayment.settled) revertTransactions.push(removeRequestPayment)
                            return removeRequestPayment.id
                        })
                    }
                },
                transaction: ctx.params.transaction || null
            }).then(() => {
                return ctx.call("data/request.revertTransaction", {
                    data: revertTransactions,
                    changePaid: ctx.params.changePaid,
                    alreadyPaid: ctx.params.alreadyPaid,
                    createdById: ctx.params.createdById,
                    requestId: ctx.params.requestId,
                    transaction: ctx.params.transaction 
                }).then(() => {
                    let paymentMethodsPromises = []
                    let paymentsPaids = []
                    ctx.params.data.forEach((paymentMethod) => {
                        if (paymentMethod.id) {
                            paymentMethodsPromises.push(ctx.call("data/request.paymentMethodUpdate", {
                                data: _.assign(paymentMethod, {
                                    requestId: ctx.params.requestId,
                                    paidDatetime: (paymentMethod.paid) ? moment() : null,
                                    dateRemoved: null
                                }),
                                createdById: ctx.params.createdById,
                                where: {
                                    id: paymentMethod.id
                                },
                                transaction: ctx.params.transaction 
                            }).then((paymentMethod) => {
                                if(paymentMethod.paid) paymentsPaids.push(paymentMethod.id)
                                return paymentMethod
                            }).catch((err) =>{
                                //console.log(err) //comentar
                                throw new Error(err)
                            })
                            )
                        }
                        else {
                            paymentMethodsPromises.push(ctx.call("data/request.paymentMethodCreate", {
                                data: _.assign(paymentMethod, {
                                    requestId: ctx.params.requestId,
                                    paidDatetime: (paymentMethod.paid) ? moment() : null
                                }),
                                createdById: ctx.params.createdById,
                                transaction: ctx.params.transaction || null
                            }).then((paymentMethod) => {
                                if(paymentMethod.paid) paymentsPaids.push(paymentMethod.id)
                                return paymentMethod
                            }).catch((err) =>{
                                //console.log(err) // COMENTAR
                                throw new Error(err)
                            })
                            )
                        }
                    })
                    return Promise.all(paymentMethodsPromises).then((paymentMethods) => {
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
            return server.mysql.RequestPaymentMethod.create(ctx.params.data, {
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
            return server.mysql.RequestPaymentMethod.update(ctx.params.data, {
                where: ctx.params.where || {},
                paranoid: false,
                transaction: ctx.params.transaction || null
            }).then((paymentMethodUpdate) => {
                if(parseInt(_.toString(paymentMethodUpdate)) < 1 ){
                    console.log("Nenhum registro encontrado. Update.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return server.mysql.RequestPaymentMethod.findById(ctx.params.data.id, {
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

            ctx.params.data.forEach((requestPaymentMethod) => {
                requestPaymentMethod.requestPaymentTransactions.sort((a, b) => { return new Date(a.dateCreated) - new Date(b.dateCreated) })

                let paymentsRevert = _.filter(requestPaymentMethod.requestPaymentTransactions, (requestPaymentTransaction) => {
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
                            description: 'Redução do valor do pagamento #' + requestPaymentMethod.id + ' do pedido #' + ctx.params.requestId + ' na conta de destino (Recoverance)',
                        },
                        type: 'paid',
                        paymentMethodId: requestPaymentMethod.id,
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


                let settledsRevert = _.filter(requestPaymentMethod.requestPaymentTransactions, (requestPaymentTransaction) => {
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
                                    description: typeOperation + ' do valor do acerto de contas #' + requestPaymentMethod.id + ' do pedido #' + ctx.params.requestId + ' na conta de '
                                    + typeAccount + '. (Recoverance)',
                                },
                                type: 'settled',
                                paymentMethodId: requestPaymentMethod.id,
                                operation: (requestTransaction.operation == 'add') ? 'remove' : 'add',
                                transaction: ctx.params.transaction
                            }).then((response) => {
                                if (!accountBalances[response.account.id]) accountBalances[response.account.id] = response.account.balance
                                return accountBalances[response.account.id] = parseFloat(accountBalances[response.account.id]) + parseFloat(response.transaction.amount)
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
            return server.mysql.RequestClientAddress.destroy({
                where: {
                    requestId: ctx.params.requestId
                },
                transaction: ctx.params.transaction
            }).then(() => {
                return server.mysql.RequestClientAddress.bulkCreate(ctx.params.data, {
                    updateOnDuplicate: ['requestId', 'clientAddressId', 'type', 'dateUpdated', 'dateRemoved', 'status'],
                    transaction: ctx.params.transaction
                }).then((response) => {
                    return response
                }).catch((error) => {
                    return error
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

        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        changeStatus(ctx){
            new Promise((resolve, reject) => {
                let transaction = _.get(ctx, 'transaction', false)
                if(!transaction){
                    server.sequelize.transaction().then((transaction) => {
                        this._transaction = transaction
                        resolve(transaction)
                    })
                }
                else {
                    resolve(transaction)
                }
            }).then((transaction) => {
                ctx.call('data/request.createTimeline', {
                    where: {
                        id: controller.request.id
                    },

                })
            })
            return server.mysql.Request.update(controller.request.data, {
                where: {
                    id: controller.request.id
                },
                transaction: controller.transaction
            })

        },
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        changeUser(ctx){

        }
    }
}
}