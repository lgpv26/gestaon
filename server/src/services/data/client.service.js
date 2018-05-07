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
                    throw new MoleculerError
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
                        throw new MoleculerError
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
            setClientAddress(ctx) {
                return ctx.call("data/address.saveAddresses", {
                    data: ctx.params.data,
                    companyId: 1, //HARD CODED
                    transaction: ctx.params.transaction
                }).then((clientAddressWithAddress) => {
                    let clientAddressData = []
                    clientAddressWithAddress.forEach((result) => {
                        clientAddressData.push({
                            id: (result.id) ? result.id : null,
                            status: (result.selected) ? 'selected' : 'activated',
                            clientId: parseInt(ctx.params.data.clientId),
                            addressId: parseInt(result.address.id),
                            name: (result.name) ? result.name : null,
                            number: (result.number) ? result.number : null,
                            complement: (result.complement) ? result.complement : null
                        })
                    })

                    return ctx.call("data/client.saveClientAddresses", {
                        data: clientAddressData,
                        clientId: parseInt(ctx.params.data.clientId),
                        transaction: ctx.params.transaction
                    }).then((clientAddresses) => {
                        return clientAddresses
                    }).catch((err) => {
                        console.log("Erro em: data/client.saveClientAddresses")
                        throw new MoleculerError
                    }) 
                }).catch((err) => {
                    console.log("Erro em: data/address.saveAddresses")
                    throw new MoleculerError
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
                            throw new MoleculerError
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
                        updateOnDuplicate: ['clientId', 'name', 'ddd', 'number', 'dateUpdated', 'dateRemoved', 'status'],
                        returning: true,
                        transaction: ctx.params.transaction
                    }).then((response) => {
                        if (!response) {
                            console.log('Registro não encontrado. data/client.saveClientPhones')
                            throw new MoleculerError
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