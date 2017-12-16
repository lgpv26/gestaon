const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getAll: (req, res, next) => {
            server.mysql.Product.findAll({
                include: [{
                    model: server.mysql.SupplierProduct,
                    as: 'productSuppliers',
                    include: [{
                        model: server.mysql.Supplier,
                        as: 'supplier'                        
                    }]
                }]
            }).then((products) => {
                if (!products) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: products
                });
            });
        },
        getOne: (req, res, next) => {
            server.mysql.Product.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((product) => {
                if (!product) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: product
                });
            });
        },
        createOne(req) {
            let createData = _.assign(req.body, {});
            return server.mysql.Product.create(createData, {
                include: [{
                    model: server.mysql.SupplierProduct,
                    as: 'productSuppliers',
                    include: [{
                        model: server.mysql.Supplier,
                        as: 'supplier'                        
                    }]
                }]
            }).then((product) => {
                if (!product) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }

                server.elasticSearch.index({
                    index: 'main',
                    type: 'product',
                    id: product.id,
                    body: {
                        companyId: product.companyId,
                        name: product.name,
                        suppliers: _.map(product.productSuppliers, productSupplier => {
                            return {
                                supplierId: productSupplier.supplier.id,
                                name: productSupplier.supplier.name,
                                obs: productSupplier.supplier.obs,
                                quantity: productSupplier.quantity,
                                price: productSupplier.price
                            };
                        }),
                        dateUpdated: product.dateUpdated,
                        dateCreated: product.dateCreated,
                        status: product.status
                    }
                }, function (esErr, esRes, esStatus) {
                    if (esErr) {
                            new restify.ResourceNotFoundError(esErr)
                    }
                })
            })
        },


        updateOne: (req, res, next) => {
            server.mysql.Product.update(req.body, {
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((product) => {
                if (!product) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                server.mysql.Product.findById(req.params.id, {
                    where: {
                        id: req.params.id,
                        status: 'activated'
                    }
                }).then((product) => {
                    if (!product) {
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    return res.send(200, {
                        data: product
                    });
                })
            });
        },
        removeOne: (req, res, next) => {
            server.mysql.Product.destroy({
                where: {
                    id: req.params.id
                }
            }).then((product) => {
                if (!product) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: product
                });
            });
        },

        ///////////////////
        // EXPORT TO ES  //  
        ///////////////////
        exportToES(req) {
            let esRequestBody = [];
            return server.mysql.Product.findAll({
                include: [{
                    model: server.mysql.SupplierProduct,
                    as: 'productSuppliers',
                    include: [{
                        model: server.mysql.Supplier,
                        as: 'supplier'                        
                    }]
                }]
            }).then((products) => {
                products.forEach((product) => {
                    let metaObj = {};
                    metaObj.index = {
                        _index: 'main',
                        _type: 'product',
                        _id: product.id
                    }
                    esRequestBody.push(metaObj);
                    let docObj = {
                        companyId: product.companyId,
                        name: product.name,
                        suppliers: _.map(product.productSuppliers, productSupplier => {
                            return {
                                supplierId: productSupplier.supplier.id,
                                name: productSupplier.supplier.name,
                                obs: productSupplier.supplier.obs,
                                quantity: productSupplier.quantity,
                                price: productSupplier.price
                            };
                        }),
                        dateUpdated: product.dateUpdated,
                        dateCreated: product.dateCreated,
                        status: product.status
                    };
                    esRequestBody.push(docObj);
                });

                return server.elasticSearch.bulk({
                    body: esRequestBody
                }, function (esErr, esRes) {
                    if (esErr) {
                        console.error(esErr);
                        return new restify.ResourceNotFoundError(esErr)
                    }
                    return esRes
                });
            });
        }
    }
};
