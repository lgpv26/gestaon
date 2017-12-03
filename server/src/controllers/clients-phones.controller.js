const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getPhones(req) {
            return server.models.ClientPhone.findAll({
                where: {
                    clientId: req.params.id,
                    status: 'activated'
                }
            }).then((clientPhones) => {
                if (!clientPhones) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                return clientPhones
            });
        },

        getOnePhone(req) {
            return server.models.ClientAddress.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.models.Address,
                    as: 'address'
                }]
            }).then((clientPhone) => {
                if (!clientPhone) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                return clientPhone
            });
        },

        removeOne(req) {
            return server.sequelize.transaction(function (t) {
                return server.models.ClientPhone.destroy({
                    where: {
                        id: req.params.clientPhoneId
                    },
                    transaction: t
                }).then((clientPhone) => {
                    if (!clientPhone) {
                        throw new restify.ResourceNotFoundError("Registro não encontrado.");
                    }

                    server.models.ClientPhone.findAll({
                        where: {
                            clientId: parseInt(req.params.id)
                        }
                    }).then((findClientPhones) => {
                        let clientPhonesES = _.map(findClientPhones, clientPhone => {
                            return {
                                clientPhoneId: clientPhone.id,
                                number: clientPhone.number,
                                ddd: clientPhone.ddd
                            };
                        })
                        server.elasticSearch.update({
                            index: 'main',
                            type: 'client',
                            id: parseInt(req.params.id),
                            body: {
                                doc: {
                                    phones: clientPhonesES
                                }
                            }
                        }, (esErr, esRes) => {
                            if (esErr) {
                                throw esErr;
                            }
                            return clientPhone;
                        });
                    })
                })
            }).then(function (clientPhone) {
                // Transaction has been committed
                return clientPhone
            }).catch(function (err) {
                // Transaction has been rolled back
                return err
            });
        },

        savePhones(req) {
            return new Promise((resolve, reject) => {
                let clientPhones = _.map(req.body.clientPhones, clientPhone => _.extend({
                    clientId: parseInt(req.params.id)
                }, clientPhone));
    
                server.models.ClientPhone.bulkCreate(clientPhones, {
                    updateOnDuplicate: ['clientId', 'name', 'ddd', 'number']
                }).then((response) => {
                    server.models.Client.findOne({
                        where: {
                            id: parseInt(req.params.id),
                            status: 'activated'
                        },
                        include: [{
                            model: server.models.ClientPhone,
                            as: 'clientPhones'
                        }]
                    }).then((client) => {
                        if (!client) {
                            reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                        }
                        let clientPhones = _.map(client.clientPhones, clientPhone => {
                            return {
                                clientPhoneId: clientPhone.id,
                                ddd: clientPhone.ddd,
                                number: clientPhone.number
                            };
                        });
                        server.elasticSearch.update({
                            index: 'main',
                            type: 'client',
                            id: parseInt(req.params.id),
                            body: {
                                doc: {
                                    phones: clientPhones
                                }
                            }
                        }, function (esErr, esRes) {
                            resolve(response);
                        })
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch(function (error) {
                    reject(error);
                });
            });
        }
    }
};
