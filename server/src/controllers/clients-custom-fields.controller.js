const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op

module.exports = (server, restify) => {

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

        saveClientCustomFields(req) {
            return new Promise((resolve, reject) => {

                let clientCustomFields = _.map(req.body.clientCustomFields, clientCustomField => _.extend({
                    clientId: parseInt(req.params.id)
                }, clientCustomField));
    
                server.mysql.ClientCustomField.bulkCreate(clientCustomFields, {
                    updateOnDuplicate: ['customFieldId', 'value', 'dateRemoved','dateUpdate']
                }).then((response) => {
                    if (!response) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }
                    
                    updateES(req)
                    
                    resolve(response)
                }).catch(function (error) {
                    reject(error)
                });
            });
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

                    updateES(req)

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

    function updateES(req) {
        return new Promise((resolve, reject) => {
            server.mysql.ClientCustomField.findAll({
                where: {
                    clientId: parseInt(req.params.id),
                    customFieldId: {
                        [Op.or]: [1, 2]
                    }
                },
                include: [{
                    model: server.mysql.CustomField,
                    as: 'customField'
                }]
            }).then((findClientCustomFields) => {
                
                if (!findClientCustomFields) {
                    return reject(new restify.ResourceNotFoundError("Custom Field not found or isn't a legaldocument."))
                }
                let clientCustomFieldES = _.map(findClientCustomFields, clientCustomField => {
                    return { clientCustomFieldId: clientCustomField.id,
                        documentType: clientCustomField.customField.name, 
                        documentNumber: clientCustomField.value }
                })
                server.elasticSearch.update({
                    index: 'main',
                    type: 'client',
                    id: parseInt(req.params.id),
                    body: {
                        doc: {
                            legaldocuments: clientCustomFieldES
                        }
                    }
                }, (esErr, esRes) => {
                    resolve(findClientCustomFields);
                })
            })
        })
    }
}