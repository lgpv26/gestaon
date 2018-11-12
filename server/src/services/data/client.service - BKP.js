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
                    include: ctx.params.include || []
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
                return server.mysql.Client.create(ctx.params.data)
                .then((client) => {
                    return JSON.parse(JSON.stringify(client))
                }).catch(() => {
                    console.log("Nenhum registro encontrado. Create.")
                    return Promise.reject('Erro ao cadastrar o cliente.')
                })
            },
            /**
             * @param {Object} data, {Object} where, {Object} transaction
             * @returns {Promise.<Object>} client 
             */
            update(ctx) {
                return server.mysql.Client.update(ctx.params.data, {
                    where: ctx.params.where || {}
                }).then((updated) => {
                    if (parseInt(_.toString(updated)) < 1 ) {
                        console.log("Nenhum registro encontrado. Update.")
                        return Promise.reject('Erro ao atualizar o cliente.')
                    }
                    return server.mysql.Client.findById(ctx.params.data.id)
                    .then((client) => {
                        return JSON.parse(JSON.stringify(client))
                    }).catch((err) => {
                        console.log('erro consult by id - client service update')
                        return Promise.reject("Erro ao recuperar os dados do cliente.")
                    })
                }).catch((err) => {
                    console.log("Nenhum registro encontrado. Update.")
                    return Promise.reject("Erro ao atualizar o cliente.")
                })
            },
            remove(ctx) {

            },

            createAddressAndPhone(ctx){
                let promises = []
                promises.push(server.mysql.ClientAddress.create(ctx.params.data))
                promises.push(server.mysql.ClientPhone.create(ctx.params.data))

                return Promise.all(promises)
            },

            getRequestHistory(ctx){
                return server.mysql.Request.findAll({
                    where: {
                        clientId: ctx.params.data.id,
                        status: 'finished',

                    },
                    order: [
                        ['deliveryDate', 'DESC']
                    ],
                    include: [
                        {
                            model: server.mysql.RequestOrder,
                            as: 'requestOrder',
                            include: [
                                {
                                    model: server.mysql.RequestOrderProduct,
                                    as: 'requestOrderProducts',
                                    include: [
                                        {
                                            model: server.mysql.Product,
                                            attributes: ['name'],
                                            as: 'product'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: server.mysql.RequestPayment,
                            as: 'requestPayments',
                            include: [
                                {
                                    model: server.mysql.PaymentMethod,
                                    as: 'paymentMethod'
                                }
                            ]
                        }
                    ]
                }).then((requestHistory) => {
                    let lastDeliveryDate = null
                    const daysAverage = _.meanBy(requestHistory, (requestHistoryItem) => {
                        if(lastDeliveryDate){
                            const diffBetweenLastDateInIteration = moment(requestHistoryItem.deliveryDate).diff(lastDeliveryDate, 'days')
                            lastDeliveryDate = requestHistoryItem.deliveryDate
                            return diffBetweenLastDateInIteration
                        }
                    })
                    return {
                        daysAverage,
                        requestHistory
                    }
                })
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
                        }).then(() => {
                            return ctx.call("data/client.update", {
                                data: {
                                    creditLimit: ctx.params.data.creditLimit,
                                    id: ctx.params.data.clientId
                                },
                                where: {
                                    id: ctx.params.data.clientId,
                                    companyId: ctx.params.data.companyId
                                }
                            }).then((client) => {
                                return ctx.call("data/client.commit")
                                .then(() => {
                                    return {creditLimit: client.creditLimit}
                                })                                
                            }).catch((err) => {
                                return ctx.call("data/client.rollback", {
                                    err: 'Não foi possivel alterar o limite de credito! Update'
                                })
                            })
                        }).catch((err) => {
                            console.log(err)
                            return ctx.call("data/client.rollback", {
                                err: 'Não foi possivel alterar o limite de credito! CreditLog'
                            })
                        })
                    })
                })
            },

            getCreditInfo(ctx){
                return Promise.all([
                    server.mysql.Client.findOne({
                        where: {
                            companyId: ctx.params.companyId,
                            id: ctx.params.clientId
                        },
                        attributes: ['creditLimit','limitInUse']
                    }).then((client) => {
                        return JSON.parse(JSON.stringify(client))
                    }),
                    ctx.call('data/client.getBills', {
                        companyId: ctx.params.companyId,
                        clientId: ctx.params.clientId
                    })
                ]).then(([client, bills]) => {
                    return {
                        creditLimit: client.creditLimit,
                        limitInUse: client.limitInUse,
                        bills
                    }
                })
            },

            /**
             * @param {Object} id, companyId
             * @returns {Promise.<Array>} requests
             */
            getBills(ctx) {
                return server.mysql.RequestPayment.findAll({
                    where: {
                        billPaymentDate: null
                    },
                    order: [['dateCreated', 'DESC']],
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
                    }]
                }).then((bills) => {
                    return JSON.parse(JSON.stringify(bills))
                })
            },

            /**
             * @param {Object} where, {Array} include, {Object} transaction
             * @returns {Promise.<Array>} clientAddresses
             */
            clientAddressList(ctx) {
                return server.mysql.ClientAddress.findAll({
                    where: ctx.params.where || {},
                    include: ctx.params.include || []
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
                    companyId: ctx.params.data.companyId
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
                        clientId: (ctx.params.data.clientId) ? parseInt(ctx.params.data.clientId) : null
                    }).then((clientAddresses) => {
                        return clientAddresses
                    }).catch((err) => {
                        console.log("Nenhum registro encontrado. ClientAddress")
                        return Promise.reject("Erro ao salvar endereços do cliente.")
                    }) 
                }).catch((err) => {
                    console.log("Nenhum registro encontrado. Address")
                    return Promise.reject("Erro ao salvar os endereços.")                
                })
            },
            /**
             * @param {Object} data, {Object} transaction
             * @returns {Promise.<Object>} address
             */
            clientAddressCreate(ctx){
                return server.mysql.ClientAddress.create(ctx.params.data)
                .then((clientAddress) => {
                    if(!clientAddress){
                        console.log("Nenhum registro encontrado. Create.")
                        return Promise.reject("Erro ao cadastrar endereço do cliente.")
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
                    paranoid: false
                }).then((clientAddressUpdate) => {
                    if(parseInt(_.toString(clientAddressUpdate)) < 1 ){
                        console.log("Nenhum registro encontrado. Update. clientAddressUpdate")
                        return Promise.reject("Erro ao atualizar endereço do cliente.")
                    }
                    return server.mysql.ClientAddress.findById(ctx.params.data.id, {
                        include: ctx.params.include || []
                    })
                    .then((ClientAddress) => {
                        return JSON.parse(JSON.stringify(ClientAddress))
                    })
                })
            },

            clientAddressRemove(ctx){
                return server.mysql.ClientAddress.destroy({
                    where: ctx.params.where
                }).then((clientAddress) => {
                    return clientAddress
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
                }
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
                                }
                            }).then((clientAddressUpdate) => {
                                return _.assign(clientAddressUpdate, { type: clientAddress.type, select: clientAddress.select })
                            })
                            )
                        }
                        else {
                            clientAddressesPromises.push(ctx.call("data/client.clientAddressCreate", {
                                data: clientAddress
                            }).then((clientAddressCreate) => {
                                return _.assign(clientAddressCreate, { type: clientAddress.type, select: clientAddress.select })
                            })
                            )
                        }
                    })

                    return Promise.all(clientAddressesPromises).then((clientAddresses) => {
                        return clientAddresses
                    }).catch((err) => {
                        return Promise.reject("Erro ao atualizar endereços do cliente.")
                    })
                })
            },
            /**
             * @param {Object} data, {Object} transaction
             * @returns {Promise.<Object>} clientPhone
             */
            clientPhoneCreate(ctx){
                return server.mysql.ClientPhone.create(ctx.params.data)
                .then((clientPhone) => {
                    if(!clientPhone){
                        console.log("Nenhum registro encontrado. Create clientPhone.")
                        return Promise.reject("Erro ao cadastrar telefone do cliente.")
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
                    paranoid: false
                }).then((clientPhoneUpdate) => {
                    if(parseInt(_.toString(clientPhoneUpdate)) < 1 ){
                        console.log("Nenhum registro encontrado. Update. clientPhone")
                        return Promise.reject("Erro ao atualizar telefone do cliente.")
                    }
                    return server.mysql.ClientPhone.findById(ctx.params.data.id)
                    .then((clientPhone) => {
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
                    }
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
                                }
                            }).then((clientPhoneUpdate) => {
                                return _.assign(clientPhoneUpdate, { select: clientPhone.select })
                            })
                            )
                        }
                        else {
                            clientPhonesPromises.push(ctx.call("data/client.clientPhoneCreate", {
                                data: clientPhone
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
                        return Promise.reject("Erro ao atualizar telefones do cliente.")
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
                    }
                }).then(() => {
                    return server.mysql.ClientCustomField.bulkCreate(ctx.params.data, {
                        updateOnDuplicate:['clientId', 'customFieldId', 'value', 'dateUpdate', 'dateRemoved'],
                        returning: true
                    }).then((response) => {
                        if (!response) {
                            console.log('Registro não encontrado. data/client.saveClientCustomFields')
                            return Promise.reject("Erro ao atualizar dados do cliente.")
                        }
                        return response
                    }).catch((err) => {
                        console.log("Erro no bulkCreate do clientCustomField, data/client.saveClientCustomFields")
                        return Promise.reject("Erro ao atualizar telefones do cliente.")
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
        rollback(ctx) {
            console.log("Oh God, just rollback do data/client!")
            this._transaction.rollback()
            throw new Error(ctx.params.err)
        }
        }
    }
}