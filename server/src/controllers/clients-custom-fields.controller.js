const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const customFieldsController = require('./../controllers/custom-fields.controller')(server)

    return {
        getClientCustomFields(req) {
            return server.mysql.ClientCustomField.findAll({
                where: {
                    clientId: req.params.id
                },
                include: [{
                    model: server.mysql.CustomField,
                    as: 'customField'
                }]
            }).then((customFields) => {
                if (!customFields) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                return customFields
            });
        },

        getOne(req) {
            return server.mysql.ClientCustomField.findOne({
                where: {
                    clientId: req.params.id,
                    id: req.params.customFieldId
                },
                include: [{
                    model: server.mysql.CustomField,
                    as: 'customField'
                }]
            }).then((customField) => {
                if (!customField) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                return customField
            });
        },

        saveClientCustomFields: (controller) => {
            return new Promise((resolve, reject) => {
                let customFieldsResolverPromisses = []
                const saveData = _.cloneDeep(controller.request.data)

                let customField = []
                _.map(saveData, (clientCustomField, index) => {
                    if (_.has(clientCustomField.customField, "id")) {
                        const checkId = clientCustomField.customField.id.toString().split(':')
                        if (_.first(checkId) === 'temp') {
                            delete clientCustomField.customField.id
                            customField.push(clientCustomField)
                        }
                        else{
                            customField.push(clientCustomField)
                        }
                    }
                })

                const customFieldsControllerObj = new Controller({
                    request: {
                        companyId: controller.request.companyId,
                        data: customField
                    },
                    transaction: controller.transaction
                })

                customFieldsResolverPromisses.push(customFieldsController.saveCustomFields(customFieldsControllerObj).then((response) => {
                    return response
                }))

                return Promise.all(customFieldsResolverPromisses).then((resolvedCustomFieldsPromisses) => {
                    
                    let clientCustomFieldData = []
                    _.first(resolvedCustomFieldsPromisses).forEach((result, index) => {
                        clientCustomFieldData.push({
                            id: (result.id) ? result.id : null,
                            clientId: parseInt(controller.request.clientId),
                            customFieldId: parseInt(result.customField.id),
                            value: (result.value) ? result.value : null
                        })
                    })

                    let clientCustomFieldPromisses = []

                    const clientCustomFieldControllerObj = new Controller({
                        request: {
                            companyId: controller.request.companyId,
                            clientId: controller.request.clientId,
                            data: clientCustomFieldData
                        },
                        transaction: controller.transaction
                    })

                    clientCustomFieldPromisses.push(saveInClientCustomField(clientCustomFieldControllerObj).then((response) => {
                        return response
                    }))

                    return Promise.all(clientCustomFieldPromisses).then((resultCustomFieldPromises) => {
                        _.map(resultCustomFieldPromises, (result) => {
                            resolve(result)
                        })
                    }).catch((err) => {
                        //console.log(err)
                        reject(err)
                    })
                }).catch((err) => {
                    reject(err)
                })
            })
        },

        removeOne(req) {
            return server.sequelize.transaction(function (t) {
                return server.mysql.ClientCustomField.destroy({
                    where: {
                        id: req.params.customFieldId
                    },
                    transaction: t
                }).then((customField) => {
                    if (!customField) {
                        throw new restify.ResourceNotFoundError("Registro não encontrado.")
                    }

                    

                    return customField
                })
            }).then((customField) => {
                // Transaction has been committed
                return customField
            }).catch((err) => {
                // Transaction has been rolled back
                return err
            });
        }
    }

    function saveInClientCustomField(controller) {
        return new Promise((resolve, reject) => {
            return server.mysql.ClientCustomField.destroy({
                where: {
                    clientId: parseInt(controller.request.clientId)
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.ClientCustomField.bulkCreate(controller.request.data, {
                    updateOnDuplicate: ['clientId', 'customFieldId', 'value', 'dateUpdate', 'dateRemoved'],
                    returning: true,
                    transaction: controller.transaction
                }).then((response) => {
                    if (!response) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }

                    return server.mysql.ClientCustomField.findAll({
                        where: {
                            clientId: parseInt(controller.request.clientId)
                        },
                        include: [{
                            model: server.mysql.CustomField,
                            as: 'customField'
                        }],
                        transaction: controller.transaction
                    }).then((findClientCustomFields) => {
                        findClientCustomFields = JSON.parse(JSON.stringify(findClientCustomFields))

                        let clientCustomFieldES = _.map(findClientCustomFields, clientCustomField => {
                            return {
                                clientCustomFieldId: clientCustomField.id,
                                documentType: clientCustomField.customField.name, 
                                documentValue: clientCustomField.value
                            };
                        })
                        
                        server.elasticSearch.update({
                            index: 'main',
                            type: 'client',
                            id: parseInt(controller.request.clientId),
                            body: {
                                doc: {
                                    customFields: clientCustomFieldES
                                }
                            }
                        }, (esErr, esRes) => {
                            if (esErr) {
                                reject(esErr)
                            }
                            resolve(findClientCustomFields);
                        })
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
}