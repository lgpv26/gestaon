const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op

module.exports = (server, restify) => {

    return {
        getCustomFields(req) {
            return server.mysql.CustomField.findAll({
                where: {
                    companyId: {
                        [Op.in]: [0, parseInt(req.params.companyId)]
                    }
                }
            }).then((customFields) => {
                if (!customFields) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                return customFields
            });
        },

        getOne(req) {
            return server.mysql.CustomField.findOne({
                where: {
                    companyId: {
                        [Op.in]: [0, parseInt(req.params.companyId)]
                    },
                    id: req.params.customFieldId
                }
            }).then((customField) => {
                return customField
            });
        },

        saveCustomFields(req) {
            let customFieldsCantChange = []
            return new Promise((resolve, reject) => {
                let customFieldsResolverPromisses = []
                
                customFieldsResolverPromisses.push(new Promise((resolve, reject) => {
                    let customFieldsIds = []
                    req.params.customFields.forEach((forEachCustomField, index) => {
                        if (forEachCustomField.id) {
                            customFieldsIds.push(forEachCustomField.id)
                        }
                        else {
                            req.params.customFields[index].companyId = parseInt(req.params.companyId)
                        }
                    })
                    server.mysql.CustomField.findAll({
                        where: {
                            id: {
                                [Op.in]: customFieldsIds
                            }
                        }
                    }).then((customFieldConsult) => {
                        customFieldConsult.forEach((result) => {
                            const index = _.findIndex(req.params.customFields, (customFieldFind) => {
                                return customFieldFind.id === result.id
                            })
                            if (result.companyId === 0) {
                                customFieldsCantChange.push(result)
                                req.params.customFields.splice(index, 1)
                            }
                        })
                        resolve(req.params.customFields)
                    })
                })
                )

                return Promise.all(customFieldsResolverPromisses).then(() => {
                    server.mysql.CustomField.bulkCreate(req.params.customFields, {
                        updateOnDuplicate: ['name', 'dateUpdated', 'dateRemoved'],
                        returning: true
                    }).then((customFieldBulk) => {
                        if (!customFieldBulk) {
                            reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                        }
                        let customFieldChange = []

                        _.map(customFieldBulk, (customField) => {
                            customFieldChange.push(customField)
                        })

                        resolve(customFieldChange)
                    }).catch((error) => {
                        reject(error);
                    })
                })
            }).then((response) => {
                return _.concat((response) ? response : [], (customFieldsCantChange) ? customFieldsCantChange : [])
            }).catch((error) => {
                return error
            })
        },

        removeOne(req) {
            return server.sequelize.transaction(function (t) {
                return server.mysql.CustomField.destroy({
                    where: {
                        id: req.params.customFieldId,
                        companyId: {
                            [Op.not]: 0,
                            [Op.eq]: parseInt(req.params.companyId)
                        }
                    },
                    transaction: t
                }).then((customField) => {
                    if (!customField) {
                        throw new restify.ResourceNotFoundError("Registro não encontrado ou registro padrão.")
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

}