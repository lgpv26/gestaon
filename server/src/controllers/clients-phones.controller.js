const _ = require('lodash')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

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

        removeClientPhones(controller) {
            let deleteClientPhones = JSON.parse(JSON.stringify(controller.request.data))
            return server.mysql.ClientPhone.destroy({
                where: {
                    id: {
                        [Op.in]: deleteClientPhones
                    }
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.ClientPhone.findAll({
                    where: {
                        clientId: parseInt(controller.request.clientId)
                    },
                    transaction: controller.transaction
                }).then((clientPhones) => {
                    return new Promise((resolve, reject) => {
                        if (!clientPhones) {
                            return reject(new restify.ResourceNotFoundError("Registro não encontrado."))
                        }

                        let clientPhonesES = _.map(clientPhones, clientPhone => {
                            return {
                                clientPhoneId: clientPhone.id,
                                number: clientPhone.number,
                                ddd: clientPhone.ddd
                            };
                        })
                        server.elasticSearch.update({
                            index: 'main',
                            type: 'client',
                            id: parseInt(controller.request.clientId),
                            body: {
                                doc: {
                                    phones: clientPhonesES
                                }
                            }
                        }, (esErr, esRes) => {
                            if (esErr) {
                                return reject(new Error('Erro ao excluir o(s) clientPhone(s) no ES.'));
                            }
                            resolve()
                        });
                    })
                })
            })
        },

        setClientPhones(controller) {
            return new Promise ((resolve, reject) => {
                let setData = _.cloneDeep(controller.request.data)
                setData = _.map(setData, (clientPhone) => {
                    _.assign(clientPhone, {
                        clientId: (controller.request.clientId) ? parseInt(controller.request.clientId) : null
                    })
                    if(_.has(clientPhone, 'dateUpdated')) delete clientPhone.dateUpdated // remove dateUpdated fields so it updates the dateUpdated field

                    clientPhone.status = (clientPhone.selected) ? 'selected' : 'activated'

                    return clientPhone
                });
                return server.mysql.ClientPhone.destroy({
                    where: {
                        clientId: (controller.request.clientId) ? parseInt(controller.request.clientId) : 0
                    },
                    transaction: controller.transaction
                }).then(() => {
                    return server.mysql.ClientPhone.bulkCreate(setData, {
                        updateOnDuplicate: ['clientId', 'name', 'ddd', 'number', 'dateUpdated', 'dateRemoved', 'status'],
                        transaction: controller.transaction
                    }).then((bulk) => {
                        if(controller.request.clientId){
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
                                    let clientPhoneIdSelect = null
                                    let clientPhoneStatus = []
                                    client.clientPhones.forEach((checkClientPhoneSelect) => {
                                    
                                        if(checkClientPhoneSelect.status === 'selected'){
                                            clientPhoneIdSelect = parseInt(checkClientPhoneSelect.id)
                                            clientPhoneStatus.push({id: parseInt(checkClientPhoneSelect.id), status: 'activated'})
                                        }
                                    })
                                    
                                    const esClientPhones = _.map(client.clientPhones, clientPhone => {
                                        return {
                                            clientPhoneId: clientPhone.id,
                                            ddd: clientPhone.ddd,
                                            number: clientPhone.number
                                        };
                                    })
    
                                    return server.mysql.ClientPhone.bulkCreate(clientPhoneStatus, {
                                        updateOnDuplicate: ['status'],
                                        transaction: controller.transaction
                                    }).then(() => {
                                        resolve({phonesES: esClientPhones, clientPhoneId: clientPhoneIdSelect});
                                    }).catch((err) => {
                                        reject(err)
                                    })
                                }).then((result) => {
                                    resolve(result)
                                })
                            }).catch((err) => {
                                console.log("ERRO NO SET CLIENT PHONES: ", err)
                            })
                        }
                        else {                            
                            resolve({clientPhones: JSON.parse(JSON.stringify(bulk))})
                        }
                    })
                })
            })
        }
    }
};
