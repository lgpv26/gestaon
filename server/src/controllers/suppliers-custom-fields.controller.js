const _ = require('lodash');
const utils = require('../utils/index');
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const customFieldsController = require('./../controllers/custom-fields.controller')(server)

    return {

        setSupplierCustomFields: (controller) => {
            return new Promise((resolve, reject) => {
                let customFieldsResolverPromisses = []
                const saveData = _.cloneDeep(controller.request.data)

                let customField = []
                _.map(saveData, (supplierCustomField, index) => {
                    if (_.has(supplierCustomField.customField, "id")) {
                        const checkId = supplierCustomField.customField.id.toString().split(':')
                        if (_.first(checkId) === 'temp') {
                            delete supplierCustomField.customField.id
                            customField.push(supplierCustomField)
                        }
                        else{
                            customField.push(supplierCustomField)
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
                    
                    let supplierCustomFieldData = []
                    _.first(resolvedCustomFieldsPromisses).forEach((result, index) => {
                        supplierCustomFieldData.push({
                            id: (result.id) ? result.id : null,
                            supplierId: parseInt(controller.request.supplierId),
                            customFieldId: parseInt(result.customField.id),
                            value: (result.value) ? result.value : null
                        })
                    })

                    let supplierCustomFieldPromisses = []

                    const supplierCustomFieldControllerObj = new Controller({
                        request: {
                            companyId: controller.request.companyId,
                            supplierId: controller.request.supplierId,
                            data: supplierCustomFieldData
                        },
                        transaction: controller.transaction
                    })

                    supplierCustomFieldPromisses.push(saveInSupplierCustomField(supplierCustomFieldControllerObj).then((response) => {
                        return response
                    }))

                    return Promise.all(supplierCustomFieldPromisses).then((resultCustomFieldPromises) => {
                        let supplierCustomFieldsES = []
                        _.map(resultCustomFieldPromises, (result) => {
                            supplierCustomFieldsES.push(result.supplierCustomFieldES) 
                        })
                        resolve({customFieldsES: _.first(supplierCustomFieldsES)})
                    }).catch((err) => {
                        //console.log(err)
                        reject(err)
                    })
                }).catch((err) => {
                    reject(err)
                })
            })
        }
    }

    function saveInSupplierCustomField(controller) {
        return new Promise((resolve, reject) => {
            return server.mysql.SupplierCustomField.destroy({
                where: {
                    supplierId: parseInt(controller.request.supplierId)
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.SupplierCustomField.bulkCreate(controller.request.data, {
                    updateOnDuplicate: ['supplierId', 'customFieldId', 'value', 'dateUpdate', 'dateRemoved'],
                    returning: true,
                    transaction: controller.transaction
                }).then((response) => {
                    if (!response) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }

                    return server.mysql.SupplierCustomField.findAll({
                        where: {
                            supplierId: parseInt(controller.request.supplierId)
                        },
                        include: [{
                            model: server.mysql.CustomField,
                            as: 'customField'
                        }],
                        transaction: controller.transaction
                    }).then((findSupplierCustomFields) => {
                        findSupplierCustomFields = JSON.parse(JSON.stringify(findSupplierCustomFields))

                        let supplierCustomFieldES = _.map(findSupplierCustomFields, supplierCustomField => {
                            return {
                                supplierCustomFieldId: supplierCustomField.id,
                                documentType: supplierCustomField.customField.name, 
                                documentValue: supplierCustomField.value
                            };
                        })

                        resolve({supplierCustomField: findSupplierCustomFields, supplierCustomFieldES: supplierCustomFieldES});
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