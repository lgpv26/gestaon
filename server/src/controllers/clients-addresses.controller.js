const _ = require('lodash');
const utils = require('../utils');

module.exports = (server, restify) => {
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

        saveClientAddresses(req) {            
            return new Promise((resolve, reject) => {
                return server.mysql.ClientAddress.bulkCreate(req.body.clientAddresses, {
                    updateOnDuplicate: ['clientId', 'addressId', 'name', 'number', 'complement', 'dateUpdate', 'dateRemoved'],
                    returning: true
                }).then((response) => {
                    if (!response) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }
                    
                    let clientAddressesES = {}
                    let clientId = null

                    server.mysql.ClientAddress.findAll({
                        where: {
                            clientId: parseInt(req.params.id)
                        },
                        include: [{
                                model: server.mysql.Address,
                                as: 'address'
                            }]
                    }).then((findClientAddresses) => {
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
                        server.elasticSearch.update({
                            index: 'main',
                            type: 'client',
                            id: parseInt(req.params.id),
                            body: {
                                doc: {
                                    addresses: clientAddressesES
                                }
                            }
                        }, (esErr, esRes) => {
                            _.map(response, (dataResponse, indexResponse) => {
                                req.body.clientAddresses.forEach((addressClient) => {
                                    const indexAddress = _.findIndex(req.body.clientAddresses, (findAddress) => {
                                        return findAddress.address.id === addressClient.address.id
                                    })
                                    response[indexResponse].dataValues.address = req.body.clientAddresses[indexAddress].address.dataValues
                                })
                            })
                            resolve(response);
                        })
                    })

                }).catch((error) => {
                    reject(error);
                })
            }).then((response) => {
                return response
            }).catch((error) => {
                return error
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
};
