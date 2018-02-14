const _ = require('lodash')
const utils = require('../utils')
const Op = require('sequelize').Op
const Controller = require('./../models/Controller')

module.exports = (server, restify) => {

    const addressesController = require('./../controllers/addresses.controller')(server, restify);
    const suppliersAddressesController = require('./../controllers/suppliers-addresses.controller')(server, restify);
    const suppliersPhonesController = require('./../controllers/suppliers-phones.controller')(server, restify);
    const suppliersCustomFieldsController = require('./../controllers/suppliers-custom-fields.controller')(server, restify);

    return {
        getAll: (req, res, next) => {
            return server.mysql.Supplier.findAndCountAll(req.queryParser).then((suppliers) => {
                if (suppliers.count === 0) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: suppliers
                });
            }).catch((err) => {
                return next(
                    new restify.InternalError({
                        body: {
                            "code": err.name,
                            "message": err.message,
                            "detailed": err
                        }
                    })
                );
            });
        },
        getOne: (controller) => {
            return server.mysql.Supplier.findOne({
                where: {
                    id: controller.request.id,
                    status: 'activated'
                },
                include: [{
                    model: server.mysql.SupplierProduct,
                    as: 'products',
                    include: [{
                        model: server.mysql.Product,
                        as: 'product'
                    }] 
                    }, {
                        model: server.mysql.SupplierPhone,
                        as: 'supplierPhones'
                    }, {
                        model: server.mysql.SupplierAddress,
                        as: 'supplierAddresses',
                        include: [{
                            model: server.mysql.Address,
                            as: 'address'
                        }]
                    }, {
                        model: server.mysql.SupplierCustomField,
                        as: 'supplierCustomFields',
                        include: [{
                            model: server.mysql.CustomField,
                            as: 'customField'
                        }]
                    }, {
                    model: server.mysql.SupplierCompany,
                    as: 'companies',
                    include: [{
                        model: server.mysql.Company,
                        as: 'company'
                    }]
                }]
            }).then((supplier) => {
                if (!supplier) {
                    throw new Error("Registro não encontrado.")
                }
                return JSON.parse(JSON.stringify(supplier))
            });
        },

        createOne: (controller) => {
            const createData = _.cloneDeep(controller.request.data)
            _.assign(createData, {
                companyId: controller.request.companyId
            })

            return server.mysql.Supplier.create(createData, {
                transaction: controller.transaction
            }).then((supplier) => {
                if (!supplier) {
                    throw new Error("Não foi possível encontrar o supplier criado.")
                }

                return new Promise((resolve, reject) => {

                    const promises = [];

                    promises.push(new Promise((resolve, reject) => {
                        const esSupplier = {
                            id: supplier.id,
                            body: {
                                companyId: supplier.companyId,
                                name: supplier.name,
                                obs: supplier.obs
                            }
                        }
                        resolve({supplierES: esSupplier})
                    }))

                 /* save supplierPhones if existent */
                    if(_.has(createData, "supplierPhones")) {
                        const supplierPhonesControllerObj = new Controller({
                            request: {
                                supplierId: supplier.id || null,
                                data: createData.supplierPhones
                            },
                            transaction: controller.transaction
                        })
                        promises.push(suppliersPhonesController.setSupplierPhones(supplierPhonesControllerObj))
                    }

                    /* save supplierAddresses if existent */
                    if(_.has(createData, "supplierAddresses") && createData.supplierAddresses.length) {
                        const supplierAddressesControllerObj = new Controller({
                            request: {
                                supplierId: supplier.id || null,
                                companyId: createData.companyId,
                                data: createData.supplierAddresses
                            },
                            transaction: controller.transaction
                        })
                        promises.push(suppliersAddressesController.setSupplierAddresses(supplierAddressesControllerObj))
                    }
        
                    /* save supplierCustomFields if existent */
                    if(_.has(createData, "supplierCustomFields") && createData.supplierCustomFields.length) {

                        const supplierCustomFieldControllerObj = new Controller({
                            request: {
                                supplierId: supplier.id,
                                companyId: createData.companyId,
                                data: createData.supplierCustomFields
                            },
                            transaction: controller.transaction
                        })
                        promises.push(suppliersCustomFieldsController.setSupplierCustomFields(supplierCustomFieldControllerObj))
                    }

                    /* return only when all promises are satisfied */
                    return Promise.all(promises).then((supplierEs) => {
                        const objES = {}
                        _.map(supplierEs, (value) => {
                            _.assign(objES, value)
                        })

                        let addressesESPromise = []
                            if(_.has(objES, "addressesES") && objES.addressesES){
                                objES.addressesES.forEach((addressEs) => {  
                                    const addressESControllerObj = new Controller({
                                        request: {
                                            data: addressEs
                                        },
                                        transaction: controller.transaction
                                    })
                                    addressesESPromise.push(addressesController.saveAddressesInES(addressESControllerObj))
                                })
                            }

                            return Promise.all(addressesESPromise).then(() => {
                                const body = _.assign({}, objES.supplierES.body, {addresses: objES.supplierAddressesES}, {customFields: objES.customFieldsES}, {phones: objES.phonesES})

                                return server.elasticSearch.index({
                                        index: 'main',
                                        type: 'supplier',
                                        id: objES.supplierES.id,
                                        body: body
                                    }, function (esErr, esRes, esStatus) {
                                        if (esErr) {
                                            return reject(new Error(esErr))
                                        }

                                        return server.mysql.Supplier.findById(objES.supplierES.id, {
                                            include: [{
                                                model: server.mysql.SupplierProduct,
                                                as: 'products',
                                                include: [{
                                                    model: server.mysql.Product,
                                                    as: 'product'
                                                }] 
                                                }, {
                                                    model: server.mysql.SupplierPhone,
                                                    as: 'supplierPhones'
                                                }, {
                                                    model: server.mysql.SupplierAddress,
                                                    as: 'supplierAddresses',
                                                    include: [{
                                                        model: server.mysql.Address,
                                                        as: 'address'
                                                    }]
                                                }, {
                                                    model: server.mysql.SupplierCustomField,
                                                    as: 'supplierCustomFields',
                                                    include: [{
                                                        model: server.mysql.CustomField,
                                                        as: 'customField'
                                                    }]
                                                }, {
                                                model: server.mysql.SupplierCompany,
                                                as: 'companies',
                                                include: [{
                                                    model: server.mysql.Company,
                                                    as: 'company'
                                                }]
                                            }],
                                            transaction: controller.transaction
                                        }).then((supplierReturn) => {
                                            supplierReturn = (supplierReturn) ? JSON.parse(JSON.stringify(supplierReturn)) : {}
                                            const supplierAddressId = (objES.supplierAddressId) ? {supplierAddressId: objES.supplierAddressId} : {}
                                            const supplierPhoneId = (objES.supplierPhoneId) ? {supplierPhoneId: objES.supplierPhoneId} : {}
                                            
                                            resolve(_.assign(supplierReturn, supplierAddressId, supplierPhoneId))
                                        })
                                    }
                                )
                            }).catch((err) => {
                                return reject()
                            })
                    }).catch((err) => {
                        return reject(err)
                    })
                })
            })
        },

        updateOne: (controller) => {

            const updateData = _.cloneDeep(controller.request.data)
            return server.mysql.Supplier.update(updateData, {
                where: {
                    id: controller.request.supplierId
                },
                transaction: controller.transaction
            }).then((supplier) => {
                if (!supplier) {
                    throw new Error("Supplier não encontrado.");
                }

                return server.mysql.Client.findById(controller.request.supplierId, {
                    include: [{
                        model: server.mysql.SupplierProduct,
                        as: 'products',
                        include: [{
                            model: server.mysql.Product,
                            as: 'product'
                        }] 
                        }, {
                            model: server.mysql.SupplierPhone,
                            as: 'supplierPhones'
                        }, {
                            model: server.mysql.SupplierAddress,
                            as: 'supplierAddresses',
                            include: [{
                                model: server.mysql.Address,
                                as: 'address'
                            }]
                        }, {
                            model: server.mysql.SupplierCustomField,
                            as: 'supplierCustomFields',
                            include: [{
                                model: server.mysql.CustomField,
                                as: 'customField'
                            }]
                        }, {
                        model: server.mysql.SupplierCompany,
                        as: 'companies',
                        include: [{
                            model: server.mysql.Company,
                            as: 'company'
                        }]
                    }],
                    transaction: controller.transaction
                }).then((supplier) => {
                    if (!supplier) throw new Error("Supplier não encontrado.");

                    return new Promise((resolve, reject) => {

                        const promises = [];

                        promises.push(new Promise((resolve, reject) => {
                            const esSupplier = {
                                id: supplier.id,
                                body: {
                                    companyId: supplier.companyId,
                                    name: supplier.name,
                                    obs: supplier.obs,
                                    legalDocument: supplier.legalDocument
                                }
                            }
                            resolve({supplierES: esSupplier})
                        }))

                        /* save supplierPhones if existent */
                        if(_.has(updateData, "supplierPhones") && updateData.supplierPhones) {
                            const supplierPhonesControllerObj = new Controller({
                                request: {
                                    supplierId: controller.request.supplierId,
                                    data: updateData.supplierPhones
                                },
                                transaction: controller.transaction
                            })
                            promises.push(suppliersPhonesController.setSupplierPhones(supplierPhonesControllerObj))
                        }

                        /* save supplierAddresses if existent */
                        if(_.has(updateData, "supplierAddresses") && updateData.supplierAddresses) {
                            const supplierAddressesControllerObj = new Controller({
                                request: {
                                    supplierId: controller.request.supplierId,
                                    companyId: controller.request.companyId,
                                    data: updateData.supplierAddresses
                                },
                                transaction: controller.transaction
                            })
                            promises.push(suppliersAddressesController.setSupplierAddresses(supplierAddressesControllerObj))
                        }

                        /* save supplierCustomFields if existent */
                        if(_.has(updateData, "supplierCustomFields") && updateData.supplierCustomFields) {

                            const supplierCustomFieldControllerObj = new Controller({
                                request: {
                                    supplierId: controller.request.supplierId,
                                    companyId: controller.request.companyId,
                                    data: updateData.supplierCustomFields
                                },
                                transaction: controller.transaction
                            })
                            promises.push(suppliersCustomFieldsController.setSupplierCustomFields(supplierCustomFieldControllerObj))
                        }                        

                        /* return only when all promises are satisfied */
                        return Promise.all(promises).then((supplierEs) => {
                            const objES = {}
                            _.map(supplierEs, (value) => {
                                _.assign(objES, value)
                            })

                            //obs ES rollback check
                            let addressesESPromise = []
                                if(_.has(objES, "addressesES") && objES.addressesES){
                                    objES.addressesES.forEach((addressEs) => {  
                                        const addressESControllerObj = new Controller({
                                            request: {
                                                data: addressEs
                                            },
                                            transaction: controller.transaction
                                        })
                                        addressesESPromise.push(addressesController.saveAddressesInES(addressESControllerObj))
                                    })
                                }

                                return Promise.all(addressesESPromise).then(() => {
                                    const body = _.assign({}, objES.supplierES.body, {addresses: objES.supplierAddressesES}, {customFields: objES.customFieldsES}, {phones: objES.phonesES})

                                    return server.elasticSearch.index({
                                            index: 'main',
                                            type: 'supplier',
                                            id: objES.supplierES.id,
                                            body: body
                                        }, function (esErr, esRes, esStatus) {
                                            if (esErr) {
                                                return reject(new Error(esErr))
                                            }
                                            return server.mysql.Supplier.findById(controller.request.supplierId, {
                                                include: [{
                                                    model: server.mysql.SupplierProduct,
                                                    as: 'products',
                                                    include: [{
                                                        model: server.mysql.Product,
                                                        as: 'product'
                                                    }] 
                                                    }, {
                                                        model: server.mysql.SupplierPhone,
                                                        as: 'supplierPhones'
                                                    }, {
                                                        model: server.mysql.SupplierAddress,
                                                        as: 'supplierAddresses',
                                                        include: [{
                                                            model: server.mysql.Address,
                                                            as: 'address'
                                                        }]
                                                    }, {
                                                        model: server.mysql.SupplierCustomField,
                                                        as: 'supplierCustomFields',
                                                        include: [{
                                                            model: server.mysql.CustomField,
                                                            as: 'customField'
                                                        }]
                                                    }, {
                                                    model: server.mysql.SupplierCompany,
                                                    as: 'companies',
                                                    include: [{
                                                        model: server.mysql.Company,
                                                        as: 'company'
                                                    }]
                                                }],
                                                transaction: controller.transaction
                                            }).then((supplierReturn) => {
                                                supplierReturn = JSON.parse(JSON.stringify(supplierReturn))
                                                const supplierAddressId = (objES.supplierAddressId) ? {supplierAddressId: objES.supplierAddressId} : {}
                                                const supplierPhoneId = (objES.supplierPhoneId) ? {supplierPhoneId: objES.supplierPhoneId} : {}
                                                
                                                resolve(_.assign(supplierReturn, supplierAddressId, supplierPhoneId))
                                            }).catch((err) => {
                                                console.log('ERRO: NO FIND SUPPLIER IN SUPPLIERS FINALE UPDATE: ', err)
                                            })  
                                        }
                                    )                                    
                                }).catch((err) => {
                                    return reject()
                                })
                            })
                        }).catch((err) => {
                            return reject(err)
                    })
                })
            }).catch((err) => {
                console.log('ERRO: client UPDATE: ', err)
            }) 
        },

        removeOne: (req, res, next) => {
            server.sequelize.transaction((t) => {
                return server.mysql.Supplier.destroy({
                    where: {
                        id: req.params.id
                    }
                }).then((supplier) => {
                    if (!supplier) {
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    deleteStatus(req.params.id)
                    server.mysql.SupplierCompany.destroy({
                        where: {
                            supplierId: req.params.id
                        }
                    })
                    server.mysql.SupplierProduct.destroy({
                        where: {
                            supplierId: req.params.id
                        }
                    }).then(() => {
                        return res.send(200, {
                            data: {
                                id: req.params.id
                            }
                        });
                    });;
                })
            });
        },
        saveCompanies(req, res, next) {
            saveCompanies(req, res, next).then((company) => {
                return res.send(200, {
                    data: company
                });
            }).catch((err) => {
                next(err);
            });
        },

        saveProducts(req, res, next) {
            saveProducts(req, res, next).then((product) => {
                return res.send(200, {
                    data: product
                });
            }).catch((err) => {
                next(err);
            });
        },

        getProducts: (req, res, next) => {
            server.mysql.SupplierProduct.findAndCountAll(req.queryParser)
            .then((supplierProducts) => {
                if (supplierProducts.count === 0) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: supplierProducts
                });
            }).catch((err) => {
                return next(
                    new restify.InternalError({
                        body: {
                            "code": err.name,
                            "message": err.message,
                            "detailed": err
                        }
                    })
                );
            });
        },

        removeOneProduct: (req, res, next) => {
            return server.sequelize.transaction(function (t) {
                return server.mysql.SupplierProduct.destroy({
                    where: {
                        productId: req.params.productId,
                        supplierId: req.params.id
                    }
                }).then((product) => {
                    if (!product) {
                        throw new restify.ResourceNotFoundError("Registro não encontrado.");
                    }
                    return product
                });
            }).then(function (product) {
                // Transaction has been committed
                return res.send(200, {
                    data: product
                });
            }).catch(function (err) {
                // Transaction has been rolled back
                return next(err);
            });

        },

        getCompanies: (req, res, next) => {
            server.mysql.SupplierCompany.findAndCountAll(req.queryParser)
            .then((supplierCompany) => {
                if (supplierCompany.count === 0) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: supplierCompany
                });
            }).catch((err) => {
                return next(
                    new restify.InternalError({
                        body: {
                            "code": err.name,
                            "message": err.message,
                            "detailed": err
                        }
                    })
                );
            });
        },

        removeOneCompany: (req, res, next) => {
            return server.sequelize.transaction(function (t) {
                return server.mysql.SupplierCompany.destroy({
                    where: {
                        companyId: req.params.companyId,
                        supplierId: req.params.id
                    }
                }).then((company) => {
                    if (!company) {
                        throw new restify.ResourceNotFoundError("Registro não encontrado.");
                    }
                    return company
                });
            }).then(function (company) {
                // Transaction has been committed
                return res.send(200, {
                    data: company
                });
            }).catch(function (err) {
                // Transaction has been rolled back
                return next(err);
            });

        }
    };
    
    // CHANCE STATUS DATA WHEN DELET (with paranoid)

    function deleteStatus(id) {
        let statusData = { status: "deleted" }
        server.mysql.Supplier.update(statusData, {
            where: {
                id: id
            }
        })
    };

    /* -------------------------------------- */
    /* --- Reusable request functions ------------------------------------------
    /* -------------------------------------- */


    function saveCompanies(req, res, next) {
        return new Promise((resolve, reject) => {
            let supplierCompanies = _.map(req.body.supplierCompanies, supplierCompany => _.extend({
                supplierId: parseInt(req.params.id)
            }, supplierCompany));

            server.mysql.SupplierCompany.bulkCreate(supplierCompanies, {
                updateOnDuplicate: ['supplierId', 'companyId']
            }).then((response) => {
                server.mysql.Supplier.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.mysql.SupplierCompany,
                        as: 'supplierCompanies'
                    }]
                }).then((supplier) => {
                    if (!supplier) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }

                    resolve(supplier);
                }).catch((error) => {
                    reject(error);
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    function saveProducts(req, res, next) {
        return new Promise((resolve, reject) => {
            let supplierProducts = _.map(req.body.supplierProducts, supplierProduct => _.extend({
                supplierId: parseInt(req.params.id)
            }, supplierProduct));

            server.mysql.SupplierProduct.bulkCreate(supplierProducts, {
                updateOnDuplicate: ['supplierId', 'productId']
            }).then((response) => {
                server.mysql.Supplier.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.mysql.SupplierProduct,
                        as: 'supplierProducts'
                    }]
                }).then((supplier) => {
                    if (!supplier) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }
                    resolve(supplier);
                }).catch((error) => {
                    reject(error);
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    }

};