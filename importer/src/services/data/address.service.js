const _ = require('lodash')
const Op = require('sequelize').Op
const { MoleculerError } = require('moleculer').Errors

module.exports = (server) => { return {
    name: "data/address",
    actions: {
        search(){

        },
        /**
         * @param {Object} id, companyId
         * @returns {Promise.<Array>} requests
         */
        get(ctx) {
            return server.mysql.Address.findOne({
                where: {
                    id: ctx.params.data.id,
                    companyId: {
                        [Op.in]: [0, ctx.params.data.companyId]
                    } 
                }
            }).then((address) => {
                  return JSON.parse(JSON.stringify(address))
            })
        },
        /**
         * @param {Object} where, {Array} include, {Object} transaction
         * @returns {Promise.<Array>} addresses
         */
        list(ctx){
            return server.mysql.Address.findAll({
                where: ctx.params.where || {},
                include: ctx.params.include || [],
                transaction: ctx.params.transaction || null
            }).then((addresses) => {
                return JSON.parse(JSON.stringify(addresses))
            })
        },
        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} address
         */
        create(ctx){
            return server.mysql.Address.create(ctx.params.data, {
                transaction: ctx.params.transaction
            }).then((address) => {
                if(!address){
                    console.log("Nenhum registro encontrado. Create.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(address))
            })
        },
        /**
         * @param {Object} where, {Object} transaction
         * @returns {Promise.<Object>} addresses
         */
        update(ctx){
            return server.mysql.Address.update(ctx.params.data, {
                where: ctx.params.where || {},
                transaction: ctx.params.transaction
            }).then((addressUpdate) => {
                if(parseInt(_.toString(addressUpdate)) < 1 ){
                    console.log("Nenhum registro encontrado. Update.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return server.mysql.Address.findById(ctx.params.data.id, {
                    transaction: ctx.params.transaction
                }).then((address) => {
                    return JSON.parse(JSON.stringify(address))
                })
            })
        },
        remove(ctx){

        },
        /**
         * @param {Object} data, {Object} companyId, {Object} transaction
         * @returns {Promise.<Array>} addresseses 
         */
        saveAddresses(ctx) {
            let addressCantChange = []
            return new Promise((resolve, reject) => {
                /*
                * Get addresses and verify if address can or cant change (companyId = 0)
                */  
                return new Promise((resolve, reject) => {
                    let data = ctx.params.data

                    let addressesIds = []
                    data.forEach((forEachAddress, index) => {
                        if (forEachAddress.address.id) {
                            addressesIds.push(forEachAddress.address.id)
                        }
                        else {
                            data[index].address.companyId = parseInt(ctx.params.data.companyId)
                        }
                    })

                    ctx.call("data/address.list", {
                        where: {
                            id: {
                                [Op.in]: addressesIds
                            }
                        },
                        transaction: ctx.params.transaction
                    }).then((addressesConsult) => {
                        addressesConsult.forEach((result) => {
                            const index = _.findIndex(data, (addressesFind) => {
                                return addressesFind.address.id === result.id
                            })
                            if (result.companyId === 0) {
                                addressCantChange.push(_.assign(data[index], { address: JSON.parse(JSON.stringify(result)) }))
                                data.splice(index, 1)
                            }
                        })
                        resolve(data)
                    })
                }).then((data) => {
                /*
                * Create or Update the allow Address
                */
                    let addressChangePromises = []
                    data.forEach((clientAddress) => {
                        if (clientAddress.address.id) {
                            addressChangePromises.push(ctx.call("data/address.update", {
                                data: clientAddress.address,
                                where: {
                                    id: clientAddress.address.id
                                },
                                transaction: ctx.params.transaction
                            }).then((address) => {
                                return _.assign(clientAddress, { address: address })
                            })
                            )
                        }
                        else {
                            addressChangePromises.push(ctx.call("data/address.create", {
                                data: _.assign(clientAddress.address, {
                                    companyId: ctx.params.companyId
                                }),
                                transaction: ctx.params.transaction
                            }).then((address) => {
                                return _.assign(clientAddress, { address: address })
                            })
                            )
                        }
                    })

                    return Promise.all(addressChangePromises).then((addresses) => {
                        resolve(addresses)
                    }).catch((err) => {
                        reject(err)    
                    })
                })                   
            })
            .then((response) => {                
                return _.concat((response) ? response : [], (addressCantChange) ? addressCantChange : [])
            }).catch((err) => {
                console.log("Erro em: data/address.saveAddresses")
                throw new Error(err)
            })
        }
    }
}}