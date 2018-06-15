const _ = require('lodash')
const Op = require('sequelize').Op
import moment from 'moment'
import { runInContext } from 'vm';

module.exports = (server) => {
    //PRIVATES
    let _transaction = null

    return {
        name: "data/client",
        actions: {
            search() {

            },
            /**
             * @param {Object} id, companyId
             * @returns {Promise.<Array>} requests
             */
            get(ctx) {
                return server.mysql.Client.findOne({
                    where: ctx.params.where || {},
                    attributes: ctx.params.attributes || null,
                    include: ctx.params.include || [],
                    transaction: ctx.params.transaction || null
                }).then((client) => {
                    return JSON.parse(JSON.stringify(client))
                })
            },
            list(ctx) {

            },
            /**
             * @param {Object} data, {Object} transaction
             * @returns {Promise.<Object>} client 
             */
            create(ctx) {
                return server.mysql.Client.create(ctx.params.data, {
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
             * @returns {Promise.<Object>} client 
             */
            update(ctx) {
                return server.mysql.Client.update(ctx.params.data, {
                    where: ctx.params.where || {},
                    transaction: ctx.params.transaction || null
                }).then((updated) => {
                    if (parseInt(_.toString(updated)) < 1 ) {
                        console.log("Nenhum registro encontrado. Update.")
                        throw new Error("Nenhum registro encontrado.")
                    }
                    return server.mysql.Client.findById(ctx.params.data.id, {
                            transaction: ctx.params.transaction || null
                    }).then((client) => {
                        return JSON.parse(JSON.stringify(client))
                    }).catch((err) => {
                        console.log('erro consult by id - client service update')
                    })
                }).catch((err) => {
                })
            },
            remove(ctx) {

            },
            changeCreditLimit(ctx) {
                return ctx.call("data/client.get", {
                    where: {
                        id: ctx.params.data.clientId
                    },
                    attributes: ['id','creditLimit','limitInUse']
                }).then((client) => {
                    if(parseFloat(client.limitInUse) > parseFloat(ctx.params.data.creditLimit)) throw new Error('Limite de crédito não pode ser inferior ao crédito em uso!')
                    return ctx.call("data/client.setTransaction").then(() => {
                        return server.mysql.CreditLog.create({
                            clientId: client.id,
                            newCreditLimit: ctx.params.data.creditLimit,
                            oldCreditLimit: client.creditLimit,
                            userId: ctx.params.userId
                        }, {
                            transaction: this._transaction
                        }).then(() => {
                            return ctx.call("data/client.update", {
                                data: {
                                    creditLimit: ctx.params.data.creditLimit,
                                    id: ctx.params.data.clientId
                                },
                                where: {
                                    id: ctx.params.data.clientId,
                                    companyId: ctx.params.data.companyId
                                },
                                transaction: this._transaction
                            }).then((client) => {
                                return ctx.call("data/client.commit")
                                .then(() => {
                                    return {creditLimit: client.creditLimit}
                                })                                
                            })
                        })
                    })
                })
            },
            /**
             * @param {Object} id, companyId
             * @returns {Promise.<Array>} requests
             */
            getBills(ctx) {
                return server.mysql.RequestPaymentBill.findAll({
                    include: [{
                        model: server.mysql.RequestPaymentBillPayment,
                        as: 'requestPaymentBillPayments'
                        }, {
                        model: server.mysql.RequestPayment,
                        as: 'requestPayments',
                        where: {
                            paid: false,
                            settled: true
                        },
                        include: [{
                                model: server.mysql.PaymentMethod,
                                as: 'paymentMethod',
                                where: {
                                    autoPay: 0
                                }
                            },
                            {
                                model: server.mysql.Request,
                                as: 'request',
                                required: true,
                                include: [{
                                    model: server.mysql.Client,
                                    as: 'client',
                                    where:{
                                        companyId: ctx.params.companyId,
                                        id: ctx.params.clientId
                                    },
                                    required: true
                                }]
                            }
                        ]
                    }]
                }).then((bills) => {
                    return JSON.parse(JSON.stringify(bills))
                })
            },
            /**
             * @param {Object} id, companyId
             * @returns {Promise.<Array>} requests    
             */
            markBillsAsPaid(ctx){
                return ctx.call("data/client.setTransaction").then(() => {
                    return server.mysql.RequestPaymentBill.findAll({
                        where: {
                            id: {
                                [Op.in]: ctx.params.data.requestPaymentBills
                            },
                        },
                        include: [{
                            model: server.mysql.RequestPaymentBillPayment,
                            as: 'requestPaymentBillPayments'
                        }, {
                            model: server.mysql.RequestPayment,
                            as: 'requestPayments',
                            where: {
                                paid: false,
                                settled: true
                            },
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
                            },
                            {
                                model: server.mysql.Request,
                                as: 'request',
                                required: true,
                                include: [{
                                    model: server.mysql.Client,
                                    as: 'client',
                                    where: {
                                        companyId: ctx.params.data.companyId,
                                        id: ctx.params.data.clientId
                                    },
                                    required: true
                                }]
                            }]
                        }],
                        transaction: this._transaction
                    }).then((requestPaymentBills) => {
                        if (!requestPaymentBills) return new Error("Erro na consulta")
                        const limitinUse = {}
                        const promises = _.map(requestPaymentBills, (requestPaymentBill, index) => {
                            if (!requestPaymentBill.requestPayments) return new Error("Erro na consulta")
                            return ctx.call("data/request.paymentMethodUpdate", {
                                data: {
                                    paid: true,
                                    paidDatetime: moment()
                                },
                                where: {
                                    id: requestPaymentBill.requestPayments.id
                                },
                                transaction: ctx.params.transaction 
                            }).then(() => {
                                return ctx.call("data/client.get", {
                                    where: {
                                        id: requestPaymentBill.requestPayments.request.client.id
                                    },
                                    transaction: ctx.params.transaction 
                                }).then((client) => {
                                    if(!limitinUse[client.id]) limitinUse[client.id] = client.limitInUse
                                    limitinUse[client.id] = parseFloat(limitinUse[client.id]) - parseFloat(requestPaymentBill.requestPayments.amount)
                                })
                            })
                        })
                        return Promise.all(promises).then(() => {
                            const updateLimitInUsePromise = []
                            _.forEach(_.keys(limitinUse), (clientId) => {
                                updateLimitInUsePromise.push(server.mysql.Client.update({
                                    limitInUse: limitinUse[clientId]
                                }, {
                                        where: {
                                            id: parseInt(clientId)
                                        },
                                        transaction: ctx.params.transaction 
                                    }))
                            })
                            return Promise.all(updateLimitInUsePromise).then(() => {
                                return ctx.call("data/client.commit")
                            }).catch(() => {
                                console.log("Erro em: data/client.markAsPaidBill")
                                return ctx.call("data/client.rollback")
                            })
                        })
                    })
                }) 
            },
            billsPaymentMethod(ctx) {
                    return ctx.call("data/client.setTransaction").then(() => {
                        return server.mysql.RequestPaymentBill.findAll({
                            where: {
                                id: {
                                    [Op.in]: _.map(ctx.params.data.requestPaymentBills, (requestPaymentBill) => {
                                        return requestPaymentBill.id
                                    })
                                },
                            },
                            include: [{
                                model: server.mysql.RequestPaymentBillPayment,
                                as: 'requestPaymentBillPayments'
                                }, {
                                model: server.mysql.RequestPayment,
                                as: 'requestPayments',
                                where: {
                                    paid: false,
                                    settled: true
                                },
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
                                    },
                                    {
                                        model: server.mysql.Request,
                                        as: 'request',
                                        required: true,
                                        include: [{
                                            model: server.mysql.Client,
                                            as: 'client',
                                            where:{
                                                companyId: ctx.params.data.companyId,
                                                id: ctx.params.data.clientId
                                            },
                                            required: true
                                        }]
                                    }
                                ]
                            }],
                            transaction: this._transaction
                        }).then((requestPaymentBills) => {                  
                            const accountBalances = {}
                            const promises = _.map(requestPaymentBills, (requestPaymentBill, index) => {
                                if(!requestPaymentBill.requestPayments) return new Error("Erro na consulta")
                                return new Promise((resolve, reject) => {
                                    resolve(_.assign(requestPaymentBill, ctx.params.data.requestPaymentBills[index]))
                                }).then((paymentBill) => {                        
                                if(!paymentBill) return new Error("Error in markAsPaid, bill can not be null")
                                const requestTransaction = _.last(_.filter(paymentBill.requestPayments.requestPaymentTransactions, (requestTransaction) => {
                                    return requestTransaction.action == 'settle' && requestTransaction.operation == 'add' && !requestTransaction.revert
                                }))
                                return ctx.call('data/transaction.create', {
                                    data: {
                                        amount: Math.abs(paymentBill.amount),
                                        createdById: ctx.params.data.createdById,
                                        accountId: requestTransaction.transaction.accountId,
                                        companyId: ctx.params.data.companyId,
                                        description: 'Adição do valor do pagamento da notinha #' + requestPaymentBill.id + ' do pedido #' + requestPaymentBill.requestPayments.request.id + ' na conta de destino',
                                    },
                                    transaction: this._transaction
                                }).then((transaction) => {
                                    return server.mysql.Account.findById(transaction.accountId, {
                                        transaction: this._transaction
                                    }).then((account) => {
                                        if(!accountBalances[account.id]) accountBalances[account.id] = account.balance
                                        accountBalances[account.id] = parseFloat(accountBalances[account.id]) + parseFloat(transaction.amount)
                                        return server.mysql.RequestPaymentBillPayment.create({                
                                            requestPaymentBillId: requestPaymentBill.id,
                                            paymentMethodId: paymentBill.paymentMethodId,
                                            amount: transaction.amount
                                            }, {
                                            transaction: this._transaction
                                        }).then((requestPaymentBillPayment) => {
                                            return server.mysql.RequestPaymentTransaction.create({
                                                requestPaymentBillPaymentId: requestPaymentBillPayment.id,
                                                transactionId: transaction.id,
                                                action: 'payment',
                                                revert: false
                                            }, {
                                            transaction: this._transaction
                                            }).then(() => {
                                                return ctx.call("data/client.get", {
                                                    where: {
                                                        id: requestPaymentBill.requestPayments.request.client.id
                                                    },
                                                    transaction: this._transaction
                                                }).then((client) => {
                                                    if(!limitInUseChange[client.id]) limitInUseChange[client.id] = client.limitInUse
                                                    limitInUseChange[client.id] = parseFloat(limitInUseChange[client.id]) - parseFloat(transaction.amount) 
                                                })
                                            })
                                        })
                                    })  
                                })
                            })
                        })
                        return Promise.all(promises).then(() => {
                            const updateAccountBalancesPromise = []
                            _.forEach(_.keys(accountBalances),(accountId) => {
                                updateAccountBalancesPromise.push(server.mysql.Account.update({
                                    balance: accountBalances[accountId]
                                    }, {
                                    where: {
                                        id: parseInt(accountId)
                                    },
                                    transaction: this._transaction
                                }))
                            })
                            return Promise.all(updateAccountBalancesPromise).then(() => {
                                return ctx.call("data/client.commit")
                            }).catch(() => {
                                console.log("Erro em: data/client.markAsPaidBill")
                                return ctx.call("data/client.rollback")
                            })
                        })
                    })
                }) 
            },
            /**
             * @param {Object} where, {Array} include, {Object} transaction
             * @returns {Promise.<Array>} clientAddresses
             */
            clientAddressList(ctx) {
                return server.mysql.ClientAddress.findAll({
                    where: ctx.params.where || {},
                    include: ctx.params.include || [],
                    transaction: ctx.params.transaction || null
                }).then((clientAddresses) => {
                    return JSON.parse(JSON.stringify(clientAddresses))
                })
            },
            /**
             * @param {Object} data, {Object} transaction
             * @returns {Promise.<Array>} clientAddresses
             */
            setClientAddresses(ctx) {
                return ctx.call("data/address.saveAddresses", {
                    data: ctx.params.data,
                    companyId: ctx.params.data.companyId, 
                    transaction: ctx.params.transaction
                }).then((clientAddressWithAddress) => {
                    let clientAddresses = []
                    clientAddressWithAddress.forEach((result) => {
                        clientAddresses.push({
                            id: (result.id) ? result.id : null,
                            status: 'activated',
                            clientId: (ctx.params.data.clientId) ? parseInt(ctx.params.data.clientId) : null,
                            addressId: parseInt(result.address.id),
                            name: (result.name) ? result.name : null,
                            number: (result.number) ? result.number : null,
                            complement: (result.complement) ? result.complement : null,
                            type: [1,3,5],
                            select: result.select
                        })
                    })

                    return ctx.call("data/client.saveClientAddresses", {
                        data: clientAddresses,
                        clientId: (ctx.params.data.clientId) ? parseInt(ctx.params.data.clientId) : null,
                        transaction: ctx.params.transaction
                    }).then((clientAddresses) => {
                        return clientAddresses
                    }).catch((err) => {
                        throw new Error("Nenhum registro encontrado.")
                    }) 
                }).catch((err) => {
                    throw new Error(err)                    
                })
            },
            /**
             * @param {Object} data, {Object} transaction
             * @returns {Promise.<Object>} address
             */
            clientAddressCreate(ctx){
                return server.mysql.ClientAddress.create(ctx.params.data, {
                    transaction: ctx.params.transaction
                }).then((clientAddress) => {
                    if(!clientAddress){
                        console.log("Nenhum registro encontrado. Create.")
                        throw new Error("Nenhum registro encontrado.")
                    }
                    return JSON.parse(JSON.stringify(clientAddress))
                })
            },
            /**
             * @param {Object} where, {Object} transaction
             * @returns {Promise.<Object>} addresses
             */
            clientAddressUpdate(ctx){
                return server.mysql.ClientAddress.update(ctx.params.data, {
                    where: ctx.params.where || {},
                    paranoid: false,
                    transaction: ctx.params.transaction
                }).then((clientAddressUpdate) => {
                    if(parseInt(_.toString(clientAddressUpdate)) < 1 ){
                        console.log("Nenhum registro encontrado. Update. clientAddressUpdate")
                        throw new Error("Nenhum registro encontrado.")
                    }
                    return server.mysql.ClientAddress.findById(ctx.params.data.id, {
                        transaction: ctx.params.transaction
                    }).then((ClientAddress) => {
                        return JSON.parse(JSON.stringify(ClientAddress))
                    })
                })
            },
            /**
             * @param {Object} data, {Int} clientId, {Object} transaction (optional)
             * @returns {Promise.<Array>} clientAddresses
             */            
            saveClientAddresses(ctx) {
                /*
                * Delete all client's clientAddress
                */ 
               return server.mysql.ClientAddress.destroy({
                where: {
                    clientId: ctx.params.clientId
                },
                transaction: ctx.params.transaction || null
                }).then(() => {
                    let clientAddressesPromises = []
                    ctx.params.data.forEach((clientAddress) => {
                        if (clientAddress.id) {
                            clientAddressesPromises.push(ctx.call("data/client.clientAddressUpdate", {
                                data: _.assign(clientAddress, {
                                    dateRemoved: null
                                }),
                                where: {
                                    id: clientAddress.id
                                },
                                transaction: ctx.params.transaction
                            }).then((clientAddressUpdate) => {
                                return _.assign(clientAddressUpdate, { type: clientAddress.type, select: clientAddress.select })
                            })
                            )
                        }
                        else {
                            clientAddressesPromises.push(ctx.call("data/client.clientAddressCreate", {
                                data: clientAddress,
                                transaction: ctx.params.transaction
                            }).then((clientAddressCreate) => {
                                return _.assign(clientAddressCreate, { type: clientAddress.type, select: clientAddress.select })
                            })
                            )
                        }
                    })

                    return Promise.all(clientAddressesPromises).then((clientAddresses) => {
                        return clientAddresses
                    }).catch((err) => {
                        console.log(err)  
                    })
                })
            },
            /**
             * @param {Object} data, {Object} transaction
             * @returns {Promise.<Object>} clientPhone
             */
            clientPhoneCreate(ctx){
                return server.mysql.ClientPhone.create(ctx.params.data, {
                    transaction: ctx.params.transaction
                }).then((clientPhone) => {
                    if(!clientPhone){
                        console.log("Nenhum registro encontrado. Create clientPhone.")
                        throw new Error("Nenhum registro encontrado.")
                    }
                    return JSON.parse(JSON.stringify(clientPhone))
                })
            },
            /**
             * @param {Object} where, {Object} transaction
             * @returns {Promise.<Object>} clientPhone
             */
            clientPhoneUpdate(ctx){
                return server.mysql.ClientPhone.update(ctx.params.data, {
                    where: ctx.params.where || {},
                    paranoid: false,
                    transaction: ctx.params.transaction
                }).then((clientPhoneUpdate) => {
                    if(parseInt(_.toString(clientPhoneUpdate)) < 1 ){
                        console.log("Nenhum registro encontrado. Update. clientPhone")
                        throw new Error("Nenhum registro encontrado.")
                    }
                    return server.mysql.ClientPhone.findById(ctx.params.data.id, {
                        transaction: ctx.params.transaction
                    }).then((clientPhone) => {
                        return JSON.parse(JSON.stringify(clientPhone))
                    })
                })
            },
            /**
             * @param {Object} data, {Int} clientId, {Object} transaction (optional)
             * @returns {Promise.<Array>} clientPhones
             */            
            saveClientPhones(ctx) {
                /*
                * Delete all client's clientPhone
                */ 
               return server.mysql.ClientPhone.destroy({
                where: {
                    clientId: ctx.params.clientId
                },
                transaction: ctx.params.transaction || null
                }).then(() => {
                    let clientPhonesPromises = []
                    ctx.params.data.forEach((clientPhone) => {
                        if (clientPhone.id) {
                            clientPhonesPromises.push(ctx.call("data/client.clientPhoneUpdate", {
                                data: _.assign(clientPhone, {
                                    dateRemoved: null
                                }),
                                where: {
                                    id: clientPhone.id
                                },
                                transaction: ctx.params.transaction
                            }).then((clientPhoneUpdate) => {
                                return _.assign(clientPhoneUpdate, { select: clientPhone.select })
                            })
                            )
                        }
                        else {
                            clientPhonesPromises.push(ctx.call("data/client.clientPhoneCreate", {
                                data: clientPhone,
                                transaction: ctx.params.transaction
                            }).then((clientPhoneCreate) => {
                                return _.assign(clientPhoneCreate, { select: clientPhone.select })
                            })
                            )
                        }
                    })

                    return Promise.all(clientPhonesPromises).then((clientPhones) => {
                        return clientPhones
                    }).catch((err) => {
                        console.log("Erro em: data/client.saveClientPhones - Promise ALL")
                        throw new Error(err)
                    })
                })
            },
            /**
             * @param {Object} data, {Int} clientId, {Object} transaction (optional)
             * @returns {Promise.<Array>} clientCustomFields
             */            
            saveClientCustomFields(ctx) {
                /*
                * Delete all client's clientCustomFields
                */ 
                return server.mysql.ClientCustomField.destroy({
                    where: {
                        clientId: ctx.params.clientId
                    },
                    transaction: ctx.params.transaction || null
                }).then(() => {
                    return server.mysql.ClientCustomField.bulkCreate(ctx.params.data, {
                        updateOnDuplicate:['clientId', 'customFieldId', 'value', 'dateUpdate', 'dateRemoved'],
                        returning: true,
                        transaction: ctx.params.transaction
                    }).then((response) => {
                        if (!response) {
                            console.log('Registro não encontrado. data/client.saveClientCustomFields')
                            throw new Error("Nenhum registro encontrado.")
                        }
                        return response
                    }).catch((err) => {
                        console.log(err)
                    })
                })
            },
        /**
         * @returns {Promise} set transaction
         */ 
        setTransaction() {
            return server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
            })
        },

        /**
         * Commit persistence
         */
        commit() {
            console.log("Commit do data/client!")
            this._transaction.commit()
        },

        /**
         * Rollback persistence
         */
        rollback() {
            console.log("Oh God, just rollback do data/client!")
            this._transaction.rollback()
            throw new Error()
        }
        }
    }
}