const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

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

        saveCustomFields: (controller) => {
            let customFieldsCantChange = []
            return new Promise((resolve, reject) => {
                let customFieldsResolverPromisses = []
                let setData = _.cloneDeep(controller.request.data)
                
                customFieldsResolverPromisses.push(new Promise((resolve, reject) => {
                    let customFieldsIds = []
                    setData.forEach((forEachCustomField, index) => {
                        if (forEachCustomField.customField.id) {
                            customFieldsIds.push(forEachCustomField.customField.id)
                        }
                        else {
                            setData[index].customField.companyId = parseInt(controller.request.companyId)
                        }
                    })
                    server.mysql.CustomField.findAll({
                        where: {
                            id: {
                                [Op.in]: customFieldsIds
                            }
                        },
                        transaction: controller.transaction
                    }).then((customFieldConsult) => {
                        customFieldConsult.forEach((result) => {
                            const index = _.findIndex(setData, (customFieldFind) => {
                                return customFieldFind.customField.id === result.id
                            })
                            if (result.companyId === 0) {
                                customFieldsCantChange.push(_.assign(setData[index], {customField: JSON.parse(JSON.stringify(result))}))
                                setData.splice(index, 1)
                            }
                        })
                        resolve(setData)
                    })
                })
                )

                return Promise.all(customFieldsResolverPromisses).then((setData) => {

                    let customFieldChangePromises = []
                    _.first(setData).forEach((clientCustomField) => {
                        if (clientCustomField.customField.id) {

                            const customFieldUpdate = new Controller({
                                 request: {
                                     data: clientCustomField.customField
                                 },
                                 transaction: controller.transaction
                            })
                            customFieldChangePromises.push(updateOne(customFieldUpdate).then((updatedCustomField) => {
                                    return _.assign(clientCustomField, {customField: updatedCustomField} )
                                })
                            )
                        }
                        else {
                            const customFieldCreate = new Controller({
                                request: {
                                    companyId: controller.request.companyId,
                                    data: clientCustomField.customField
                                },
                                transaction: controller.transaction
                            })
                            customFieldChangePromises.push(createOne(customFieldCreate).then((createdCustomField) => {
                                return _.assign(clientCustomField, {customField: createdCustomField} )
                            })
                            )
                        }
                    })
                    return Promise.all(customFieldChangePromises).then((customFields) => {
                        resolve(customFields)
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


    function createOne(controller) {
        return new Promise((resolve, reject) => {

            const createData = _.cloneDeep(controller.request.data)
            return server.mysql.CustomField.create(createData, {
                transaction: controller.transaction
            }).then((customField) => {
                if (!customField) {
                    reject("Não foi possível encontrar o customField criado.")
                }
                resolve(JSON.parse(JSON.stringify(customField)))                
            })
        }).then((customField) => {
            return customField
        }).catch((err) => {
            return err
        })
    }

    function updateOne(controller) {

        return new Promise((resolve, reject) => {

            const updateData = _.cloneDeep(controller.request.data)
            return server.mysql.CustomField.update(updateData, {
                where: {
                    id: updateData.id
                },
                transaction: controller.transaction
            }).then((customFieldUpdate) => {
                    if (!customFieldUpdate) {
                        reject("Não foi possível encontrar o address editado.")
                    }
                    return server.mysql.CustomField.findById(controller.request.data.id, {
                        transaction: controller.transaction
                    }).then((customField) => {
                        resolve(JSON.parse(JSON.stringify(customField)))
                })
            })
        }).then((customField) => {
            return customField
        }).catch((err) => {
            return err
        })
    }

}