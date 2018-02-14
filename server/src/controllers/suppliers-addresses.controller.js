const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const addressesController = require('./../controllers/addresses.controller')(server)

    return {
        setSupplierAddresses: (controller) => {
            return new Promise((resolve, reject) => {
                let addressesResolverPromisses = []

                let setData = _.cloneDeep(controller.request.data)

                const addressesControllerObj = new Controller({
                    request: {
                        companyId: controller.request.companyId,
                        supplierId: (controller.request.supplierId) ? parseInt(controller.request.supplierId) : null,
                        data: setData
                    },
                    transaction: controller.transaction
                })

                addressesResolverPromisses.push(addressesController.saveAddresses(addressesControllerObj).then((response) => {
                    return response
                }))

                return Promise.all(addressesResolverPromisses).then((resolvedAddressPromisses) => {
                    
                    let supplierAddressData = []
                    _.first(resolvedAddressPromisses).forEach((result) => {
                        supplierAddressData.push({
                            id: (result.id) ? result.id : null,
                            status: (result.selected) ? 'selected' : 'activated',
                            supplierId: (controller.request.supplierId) ? parseInt(controller.request.supplierId) : null,
                            addressId: parseInt(result.address.id),
                            name: (result.name) ? result.name : null,
                            number: (result.number) ? result.number : null,
                            complement: (result.complement) ? result.complement : null,
                            addressES: (result.addressES) ? result.addressES : null
                        })
                    })

                    let supplierAddressesPromisses = []

                    const supplierAddressControllerObj = new Controller({
                        request: {
                            companyId: controller.request.companyId,
                            supplierId: (controller.request.supplierId) ? parseInt(controller.request.supplierId) : null,
                            data: supplierAddressData
                        },
                        transaction: controller.transaction
                    })
                    supplierAddressesPromisses.push(saveInSupplierAddresses(supplierAddressControllerObj).then((response) => {
                        return response
                    }))

                    return Promise.all(supplierAddressesPromisses).then((resultAddressPromises) => {

                        if(controller.request.supplierId){
                        
                            let supplierAddressesES = []
                            _.map(resultAddressPromises, (result) => {
                                supplierAddressesES.push(result.supplierAddressesES) 
                            })

                            let addressesES = []
                            _.map(resultAddressPromises, (result) => {
                                addressesES.push(result.addressesES) 
                            })

                            resolve({supplierAddressesES: _.first(supplierAddressesES), addressesES: _.first(addressesES), supplierAddressId: _.first(resultAddressPromises).supplierAddressId})
                        }
                        else{
                            resolve({supplierAddresses: _.first(resultAddressPromises)})
                        }
                    }).catch((err) => {
                        //console.log(err)
                        reject(err)
                    })
                }).catch((err) => {
                    reject(err)
                })
            })
        },

    }

    function saveInSupplierAddresses(controller) {
        return new Promise((resolve, reject) => { 
            return server.mysql.SupplierAddress.destroy({
                where: {
                    supplierId: (controller.request.supplierId) ? parseInt(controller.request.supplierId) : 0
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.SupplierAddress.bulkCreate(controller.request.data, {
                    updateOnDuplicate: ['supplierId', 'addressId', 'name', 'number', 'complement', 'dateUpdate', 'dateRemoved', 'status'],
                    returning: true,
                    transaction: controller.transaction
                }).then((response) => {
                    if (!response) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }
                    if(controller.request.supplierId){
                        return server.mysql.SupplierAddress.findAll({
                            where: {
                                supplierId: parseInt(controller.request.supplierId)
                            },
                            include: [{
                                model: server.mysql.Address,
                                as: 'address'
                            }],
                            transaction: controller.transaction
                        }).then((findSupplierAddresses) => {
                            findSupplierAddresses = JSON.parse(JSON.stringify(findSupplierAddresses))
                            
                            let supplierAddressIdSelect = null
                            let supplierAddressStatus = []
                            findSupplierAddresses.forEach((checkSupplierAddressSelect) => {
                                if(checkSupplierAddressSelect.status === 'selected'){
                                    supplierAddressIdSelect = parseInt(checkSupplierAddressSelect.id)
                                    supplierAddressStatus.push({id: parseInt(checkSupplierAddressSelect.id), status: 'activated'})
                                }
                            })

                            let supplierAddressesES = _.map(findSupplierAddresses, supplierAddress => {
                                return {
                                    supplierAddressId: supplierAddress.id,
                                    complement: supplierAddress.complement,
                                    address: supplierAddress.address.name,
                                    number: supplierAddress.number,
                                    cep: supplierAddress.address.cep,
                                    neighborhood: supplierAddress.address.neighborhood
                                };
                            })

                            let addressesES = []
                            controller.request.data.forEach((value) => {
                                if(_.has(value, 'addressES') && value.addressES){
                                    addressesES.push(value.addressES) 
                                }
                            })

                            return server.mysql.SupplierAddress.bulkCreate(supplierAddressStatus, {
                                updateOnDuplicate: ['status'],
                                transaction: controller.transaction
                            }).then(() => {
                                resolve({supplierAddressesES: supplierAddressesES, addressesES: addressesES, supplierAddressId: supplierAddressIdSelect});
                            }).catch((err) => {
                                reject(err)
                            })
                        })
                    }
                    else {                            
                        resolve(JSON.parse(JSON.stringify(response)))
                    }
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
};
