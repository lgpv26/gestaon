const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getPhones(req) {
            return server.mysql.ClientPhone.findAll({
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
            return server.mysql.ClientAddress.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.mysql.Address,
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
                return server.mysql.ClientPhone.destroy({
                    where: {
                        id: req.params.clientPhoneId
                    },
                    transaction: t
                }).then((clientPhone) => {
                    if (!clientPhone) {
                        throw new restify.ResourceNotFoundError("Registro não encontrado.");
                    }

                    server.mysql.ClientPhone.findAll({
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
        saveClientPhones(controller) {
            let clientPhones = _.cloneDeep(controller.request.data);
            clientPhones = _.map(clientPhones, clientPhone => _.assign(clientPhone, {
                clientId: parseInt(controller.request.clientId)
            }));
            return server.mysql.ClientPhone.bulkCreate(clientPhones, {
                updateOnDuplicate: ['clientId', 'name', 'ddd', 'number', 'dateUpdate', 'dateRemoved'],
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.Client.findOne({
                    where: {
                        id: parseInt(controller.request.clientId)
                    },
                    include: [{
                        model: server.mysql.ClientPhone,
                        as: 'clientPhones'
                    }],
                    transaction: controller.transaction
                }).then((client) => {
                    return new Promise((resolve, reject) => {
                        if (!client) {
                            return reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                        }
                        const esClientPhones = _.map(client.clientPhones, clientPhone => {
                            return {
                                clientPhoneId: clientPhone.id,
                                ddd: clientPhone.ddd,
                                number: clientPhone.number
                            };
                        });
                        return server.elasticSearch.update({
                            index: 'main',
                            type: 'client',
                            id: parseInt(controller.request.clientId),
                            body: {
                                doc: {
                                    phones: esClientPhones
                                }
                            }
                        }, function (esErr, esRes) {
                            if(esErr){
                                return reject(new Error('Erro ao salvar o(s) clientPhone(s) no ES.'));
                            }
                            return resolve();
                        })
                    });
                });
            });
        }
    }
};
