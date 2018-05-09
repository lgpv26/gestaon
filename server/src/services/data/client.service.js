const _ = require('lodash')
const Op = require('sequelize').Op
const { MoleculerError } = require('moleculer').Errors

module.exports = (server) => {
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
                            transaction: ctx.params.transaction
                    }).then((client) => {
                        return JSON.parse(JSON.stringify(client))
                    })
                })
            },
            remove(ctx) {

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
                            clientId: parseInt(ctx.params.data.clientId),
                            addressId: parseInt(result.address.id),
                            name: (result.name) ? result.name : null,
                            number: (result.number) ? result.number : null,
                            complement: (result.complement) ? result.complement : null
                        })
                    })

                    return ctx.call("data/client.saveClientAddresses", {
                        data: clientAddresses,
                        clientId: parseInt(ctx.params.data.clientId),
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
             * @param {Object} data, {Int} clientId, {Object} transaction
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
                    transaction: ctx.params.transaction
                }).then(() => {
                    return server.mysql.ClientAddress.bulkCreate(ctx.params.data, {
                        updateOnDuplicate: ['clientId', 'addressId', 'name', 'number', 'complement', 'dateUpdate', 'dateRemoved', 'status'],
                        returning: true,
                        transaction: ctx.params.transaction
                    }).then((response) => {
                        if (!response) {
                            console.log('Registro não encontrado. data/client.saveClientAddresses')
                            throw new Error("Nenhum registro encontrado.")
                        }
                       return response
                    }).catch((err) => {
                        console.log(err)
                    })
                })
            },

             /**
             * @param {Object} data, {Int} clientId, {Object} transaction
             * @returns {Promise.<Array>} clientPhones
             */            
            saveClientPhones(ctx) {
                /*
                * Delete all client's clientPhones
                */ 
                return server.mysql.ClientPhone.destroy({
                    where: {
                        clientId: ctx.params.clientId
                    },
                    transaction: ctx.params.transaction
                }).then(() => {
                    return server.mysql.ClientPhone.bulkCreate(ctx.params.data, {
                        updateOnDuplicate: ['clientId', 'name', 'number', 'dateUpdated', 'dateRemoved', 'status'],
                        returning: true,
                        transaction: ctx.params.transaction
                    }).then((response) => {
                        if (!response) {
                            console.log('Registro não encontrado. data/client.saveClientPhones')
                            throw new Error("Nenhum registro encontrado.")
                        }
                        return response
                    }).catch((err) => {
                        console.log(err)
                    })
                })
            },
            /**
             * @param {Object} data, {Int} clientId, {Object} transaction
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
                    transaction: ctx.params.transaction
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
            }
        }
    }
}