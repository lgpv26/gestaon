const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getAll: (req, res, next) => {
            server.models.Supplier.findAndCountAll(req.queryParser).then((suppliers) => {
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
        getOne: (req, res, next) => {
            server.models.Supplier.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.models.SupplierProduct,
                    as: 'products',
                    include: [{
                        model: server.models.Product,
                        as: 'product'
                    }],
                    model: server.models.SupplierCompany,
                    as: 'companies',
                    include: [{
                        model: server.models.Company,
                        as: 'company'
                    }]
                }]
            }).then((supplier) => {
                if (!supplier) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado.")
                    );
                }
                return res.send(200, {
                    data: supplier
                });
            });
        },

        createOne: (req, res, next) => {
            if (!req.body) {
                return next(
                    new restify.ResourceNotFoundError("Erro, dados não enviados.")
                );
            }
            const createData = _.cloneDeep(req.body);
            server.models.Supplier.create(createData, {
                include: [{
                    model: server.models.SupplierProduct,
                    as: 'supplierProducts',
                    include: [{
                        model: server.models.Product,
                        as: 'product'
                    }],
                    model: server.models.SupplierCompany,
                    as: 'supplierCompanies',
                    include: [{
                        model: server.models.Company,
                        as: 'company'
                    }]
                }]
            }).then((supplier) => {
                if (!supplier) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado.")
                    );
                }
                server.elasticSearch.index({
                    index: 'main',
                    type: 'supplier',
                    id: supplier.id,
                    body: {
                        companyId: supplier.companyId,
                        name: supplier.name,
                        obs: supplier.obs
                    }
                }, function (esErr, esRes, esStatus) {
                    if (esErr) {
                        return next(
                            new restify.ResourceNotFoundError(esErr)
                        );
                    }
                    if ((_.has(createData, "supplierProducts") && createData.supplierProducts.length > 0) ||
                        (_.has(createData, "supplierCompanies") && createData.supplierCompanies.length > 0)) {
                        if ((_.has(createData, "supplierProducts") && createData.supplierProducts.length > 0)) {
                            req.params['id'] = supplier.id;
                            saveProducts(req, res, next).then((supplier) => {
                                return res.send(200, {
                                    data: supplier
                                });
                            }).catch((err) => {
                                next(err);
                            });
                        }
                        else if ((_.has(createData, "supplierCompanies") && createData.supplierCompanies.length > 0)) {
                            req.params['id'] = supplier.id;
                            saveCompanies(req, res, next).then((supplier) => {
                                return res.send(200, {
                                    data: supplier
                                });
                            }).catch((err) => {
                                next(err);
                            });
                        }
                    }
                    else {
                        return res.send(200, {
                            data: supplier
                        });
                    }
                });
            })
        },

        updateOne: (req, res, next) => {
            if (!req.body) {
                return next(
                    new restify.ResourceNotFoundError("Erro, dados não enviados.")
                );
            }
            const updateData = _.cloneDeep(req.body);
            server.models.Supplier.update(updateData, {
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((supplier) => {
                if (!supplier) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado Parte 1.")
                    );
                }
                server.models.Supplier.findById(req.params.id, {
                    where: {
                        id: req.params.id,
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.SupplierProduct,
                        as: 'supplierProducts',
                        include: [{
                            model: server.models.Product,
                            as: 'product'
                        }],
                        model: server.models.SupplierCompany,
                        as: 'supplierCompanies',
                        include: [{
                            model: server.models.Company,
                            as: 'company'
                        }]
                    }]
                }).then((supplier) => {
                    if (!supplier) {
                        return next(
                            new restify.ResourceNotFoundError("Registro não encontrado.")
                        );
                    }
                    if ((_.has(updateData, "supplierProducts") && updateData.supplierProducts.length > 0) ||
                        (_.has(updateData, "supplierCompanies") && updateData.supplierCompanies.length > 0)) {
                        if ((_.has(updateData, "supplierProducts") && updateData.supplierProducts.length > 0)) {
                            req.params['id'] = supplier.id;
                            saveProducts(req, res, next).then((supplier) => {
                                return res.send(200, {
                                    data: supplier
                                });
                            }).catch((err) => {
                                next(err);
                            });
                        }
                        else if ((_.has(updateData, "supplierCompanies") && updateData.supplierCompanies.length > 0)) {
                            req.params['id'] = supplier.id;
                            saveCompanies(req, res, next).then((supplier) => {
                                return res.send(200, {
                                    data: supplier
                                });
                            }).catch((err) => {
                                next(err);
                            });
                        }
                    }
                    else {
                        return res.send(200, {
                            data: supplier
                        });
                    }
                })
            })
        },

        removeOne: (req, res, next) => {
            server.sequelize.transaction((t) => {
                return server.models.Supplier.destroy({
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
                    server.models.SupplierCompany.destroy({
                        where: {
                            supplierId: req.params.id
                        }
                    })
                    server.models.SupplierProduct.destroy({
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
            server.models.SupplierProduct.findAndCountAll(req.queryParser)
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
                return server.models.SupplierProduct.destroy({
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
            server.models.SupplierCompany.findAndCountAll(req.queryParser)
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
                return server.models.SupplierCompany.destroy({
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
        server.models.Supplier.update(statusData, {
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

            server.models.SupplierCompany.bulkCreate(supplierCompanies, {
                updateOnDuplicate: ['supplierId', 'companyId']
            }).then((response) => {
                server.models.Supplier.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.SupplierCompany,
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

            server.models.SupplierProduct.bulkCreate(supplierProducts, {
                updateOnDuplicate: ['supplierId', 'productId']
            }).then((response) => {
                server.models.Supplier.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.SupplierProduct,
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