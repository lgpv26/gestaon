const _ = require('lodash')
const Op = require('sequelize').Op

module.exports = (server) => { return {
    name: "data/address",
    actions: {
        search(){

        },
        /**
         * @param {Object} id, companyId
         * @returns {Promise.<Array>} requests
         */
        getOne(ctx) {
            return server.mysql.Address.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || [],
                attributes: ctx.params.attributes || null
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
                transaction: ctx.params.transaction || null
             })
            .then((address) => {
                if(!address){
                    console.log("Nenhum registro encontrado. Create.")
                    return Promise.reject("Erro ao salvar o endereço.")
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
                transaction: ctx.params.transaction || null
            }).then((addressUpdate) => {
                /*
                if(parseInt(_.toString(addressUpdate)) < 1 ){
                    console.log("Nenhum registro encontrado. Update.")
                    return Promise.reject("Erro ao atualizar o endereço.")
                }
                */
                return server.mysql.Address.findByPk(ctx.params.data.id, {
                transaction: ctx.params.transaction})
                .then((address) => {
                    return JSON.parse(JSON.stringify(address))
                })
            })
        },
        remove(ctx){

        },
        checkCanBeUpdate(ctx){
            return ctx.call('data/address.getOne', {
                where: {
                    id: ctx.params.addressId,
                    companyId: {
                        [Op.not]: 0,
                        [Op.eq]: ctx.params.companyId
                    }
                }
            })
            .then((address) => {
                if(!address) return null
                return address
            })
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
                        if (_.has(forEachAddress.address, "id") && forEachAddress.address.id) {
                            addressesIds.push(forEachAddress.address.id)
                        }
                        else if (!forEachAddress.address && data[index].addressId) {
                            return ctx
                                .call("data/address.getOne", {
                                    where: {
                                        id: data[index].addressId,
                                        companyId: {
                                            [Op.in]: [0, ctx.params.companyId]
                                        }
                                    }
                                })
                                .then(address => {
                                    if (!address) return;
                                    _.set(data[index], "address", address);
                                    addressesIds.push(data[index].addressId);
                                })
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
                        if(!clientAddress.address.name && !clientAddress.address.neighborhood) return addressChangePromises.push(Promise.resolve(clientAddress))
                        if (clientAddress.address.id) {
                            addressChangePromises.push(ctx.call("data/address.update", {
                                data: clientAddress.address,
                                where: {
                                    id: clientAddress.address.id
                                },
                                transaction: ctx.params.transaction || null
                            }).then((address) => {
                                return _.assign(clientAddress, { address: address })
                            }))
                        }
                        else {
                            addressChangePromises.push(ctx.call("data/address.create", {
                                data: _.assign(clientAddress.address, {
                                    companyId: ctx.params.companyId
                                }),
                                transaction: ctx.params.transaction || null
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
                return Promise.reject("Erro ao atualizar os endereços.")
            })
        }
    }
}}