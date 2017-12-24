const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const addressesController = require('./../controllers/addresses.controller')(server)

    return {
        getClientAddresses(req) {
            return server.mysql.ClientAddress.findAll({
                where: {
                    clientId: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.mysql.Address,
                    as: 'address'
                }]
            }).then((clientAddresses) => {
                if (!clientAddresses) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                return clientAddresses
            });
        },

        getOneAddress(req) {
            return server.mysql.ClientAddress.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.mysql.Address,
                    as: 'address'
                }]
            }).then((clientAddresses) => {
                if (!clientAddresses) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                return clientAddresses
            });
        },

        setClientAddresses: (controller) => {
            return new Promise((resolve, reject) => {
                let addressesResolverPromisses = []

                let setData = _.cloneDeep(controller.request.data)

                const addressesControllerObj = new Controller({
                    request: {
                        companyId: controller.request.companyId,
                        clientId: controller.request.clientId,
                        data: setData
                    },
                    transaction: controller.transaction
                })

                addressesResolverPromisses.push(addressesController.saveAddresses(addressesControllerObj).then((response) => {
                    return response
                }))

                return Promise.all(addressesResolverPromisses).then((resolvedAddressPromisses) => {
                    
                    let clientAddressData = []
                    _.first(resolvedAddressPromisses).forEach((result) => {
                        clientAddressData.push({
                            id: (result.id) ? result.id : null,
                            clientId: parseInt(controller.request.clientId),
                            addressId: parseInt(result.address.id),
                            name: (result.name) ? result.name : null,
                            number: (result.number) ? result.number : null,
                            complement: (result.complement) ? result.complement : null,
                            addressES: (result.addressES) ? result.addressES : null
                        })
                    })                    

                    let clientAddressesPromisses = []

                    const clientAddressControllerObj = new Controller({
                        request: {
                            companyId: controller.request.companyId,
                            clientId: controller.request.clientId,
                            data: clientAddressData
                        },
                        transaction: controller.transaction
                    })
                    clientAddressesPromisses.push(saveInClientAddresses(clientAddressControllerObj).then((response) => {
                        return response
                    }))

                    return Promise.all(clientAddressesPromisses).then((resultAddressPromises) => {
                        let clientAddressesES = []
                        _.map(resultAddressPromises, (result) => {
                            clientAddressesES.push(result.clientAddressesES) 
                        })

                        let addressesES = []
                        _.map(resultAddressPromises, (result) => {
                            addressesES.push(result.addressesES) 
                        })

                        resolve({clientAddressesES: _.first(clientAddressesES), addressesES: _.first(addressesES)})

                    }).catch((err) => {
                        //console.log(err)
                        reject(err)
                    })
                }).catch((err) => {
                    reject(err)
                })
            })
        },

        removeClientAddress(req) {
            return server.sequelize.transaction(function (t) {
                return server.mysql.ClientAddress.destroy({
                    where: {
                        id: req.params.clientAddressId
                    },
                    transaction: t
                }).then((clientAddress) => {
                    if (!clientAddress) {
                        return new restify.ResourceNotFoundError("Registro não encontrado.");
                    }
                    return server.elasticSearch.update({
                        index: 'main',
                        type: 'client',
                        id: req.params.id,
                        body: {
                            script: {
                                lang: "groovy",
                                inline: "item_to_remove = null; ctx._source.addresses.each { elem -> if (elem.clientAddressId == clientAddressId) { item_to_remove=elem; } }; if (item_to_remove != null) ctx._source.addresses.remove(item_to_remove);",
                                params: { "clientAddressId": parseInt(req.params.clientAddressId) }
                            }
                        }
                    }, function (esErr, esRes) {
                        if (esErr) {
                            throw esErr;
                        }
                        return clientAddress;
                    });
                });
            }).then(function (clientAddress) {
                // Transaction has been committed
                return clientAddress
            }).catch(function (err) {
                return err
            });
        }
    }

    function saveInClientAddresses(controller) {
        return new Promise((resolve, reject) => {
            return server.mysql.ClientAddress.destroy({
                where: {
                    clientId: parseInt(controller.request.clientId)
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.ClientAddress.bulkCreate(controller.request.data, {
                    updateOnDuplicate: ['clientId', 'addressId', 'name', 'number', 'complement', 'dateUpdate', 'dateRemoved'],
                    returning: true,
                    transaction: controller.transaction
                }).then((response) => {
                    if (!response) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }

                    return server.mysql.ClientAddress.findAll({
                        where: {
                            clientId: parseInt(controller.request.clientId)
                        },
                        include: [{
                            model: server.mysql.Address,
                            as: 'address'
                        }],
                        transaction: controller.transaction
                    }).then((findClientAddresses) => {
                        findClientAddresses = JSON.parse(JSON.stringify(findClientAddresses))

                        let clientAddressesES = _.map(findClientAddresses, clientAddress => {
                            return {
                                clientAddressId: clientAddress.id,
                                complement: clientAddress.complement,
                                address: clientAddress.address.name,
                                number: clientAddress.number,
                                cep: clientAddress.address.cep,
                                neighborhood: clientAddress.address.neighborhood
                            };
                        })

                        /*
                        server.elasticSearch.update({
                            index: 'main',
                            type: 'client',
                            id: parseInt(controller.request.clientId),
                            body: {
                                doc: {
                                    addresses: clientAddressesES
                                }
                            }
                        }, (esErr, esRes) => {
                            if (esErr) {
                                reject(esErr)
                            }
                            
                        })
                        */
                        let addressesES = []
                        controller.request.data.forEach((value) => {
                            if(_.has(value, 'addressES') && value.addressES){
                                addressesES.push(value.addressES) 
                            }
                        })

                        resolve({clientAddressesES: clientAddressesES, addressesES: addressesES});
                    })

                }).catch((error) => {
                    reject(error);
                })
            })
        }).then((response) => {
            return response
        }).catch((error) => {
            return error
        })
    }
};
