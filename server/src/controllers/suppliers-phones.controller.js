const _ = require('lodash')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {
    return {

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

        setSupplierPhones(controller) {
            return new Promise ((resolve, reject) => {
                let setData = _.cloneDeep(controller.request.data)
                setData = _.map(setData, (supplierPhone) => {
                    _.assign(supplierPhone, {
                        supplierId: (controller.request.supplierId) ? parseInt(controller.request.supplierId) : null
                    })
                    if(_.has(supplierPhone, 'dateUpdated')) delete clientPhone.dateUpdated // remove dateUpdated fields so it updates the dateUpdated field

                    supplierPhone.status = (supplierPhone.selected) ? 'selected' : 'activated'

                    return supplierPhone
                });
                return server.mysql.SupplierPhone.destroy({
                    where: {
                        supplierId: (controller.request.supplierId) ? parseInt(controller.request.supplierId) : 0
                    },
                    transaction: controller.transaction
                }).then(() => {
                    return server.mysql.SupplierPhone.bulkCreate(setData, {
                        updateOnDuplicate: ['supplierId', 'name', 'ddd', 'number', 'dateUpdated', 'dateRemoved', 'status'],
                        transaction: controller.transaction
                    }).then((bulk) => {
                        if(controller.request.supplierId){
                            return server.mysql.Supplier.findOne({
                                where: {
                                    id: parseInt(controller.request.supplierId)
                                },
                                include: [{
                                    model: server.mysql.SupplierPhone,
                                    as: 'supplierPhones'
                                }],
                                transaction: controller.transaction
                            }).then((supplier) => {
                                return new Promise((resolve, reject) => {
                                    if (!supplier) {
                                        return reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                                }
                                    let supplierPhoneIdSelect = null
                                    let supplierPhoneStatus = []
                                    supplier.supplierPhones.forEach((checkSupplierPhoneSelect) => {
                                    
                                        if(checkSupplierPhoneSelect.status === 'selected'){
                                            supplierPhoneIdSelect = parseInt(checkSupplierPhoneSelect.id)
                                            supplierPhoneStatus.push({id: parseInt(checkSupplierPhoneSelect.id), status: 'activated'})
                                        }
                                    })
                                    
                                    const esSupplierPhones = _.map(supplier.supplierPhones, supplierPhone => {
                                        return {
                                            supplierPhoneId: supplierPhone.id,
                                            ddd: supplierPhone.ddd,
                                            number: supplierPhone.number
                                        };
                                    })
    
                                    return server.mysql.SupplierPhone.bulkCreate(supplierPhoneStatus, {
                                        updateOnDuplicate: ['status'],
                                        transaction: controller.transaction
                                    }).then(() => {
                                        resolve({phonesES: esSupplierPhones, supplierPhoneId: supplierPhoneIdSelect});
                                    }).catch((err) => {
                                        reject(err)
                                    })
                                }).then((result) => {
                                    resolve(result)
                                })
                            }).catch((err) => {
                                console.log("ERRO NO SET supplier PHONES: ", err)
                            })
                        }
                        else {                            
                            resolve({supplierPhones: JSON.parse(JSON.stringify(bulk))})
                        }
                    })
                })
            })
        }
    }
};
