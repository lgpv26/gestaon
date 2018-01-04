const _ = require('lodash')
const utils = require('../utils')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {
    return {
        search(req) {
            return new Promise((resolve, reject) => {
                server.elasticSearch.search(
                    {
                        index: 'main',
                        type: 'product',
                        body: {
                            "from": 0,
                            "size": 5,
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": utils.removeDiacritics(req.params.q.trim()),
                                                            "fields": [
                                                                "name"
                                                            ],
                                                            "operator": "or",
                                                            "analyzer": "standard"
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "suppliers",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.params.q.trim()),
                                                                    "fields": [
                                                                        "suppliers.name",
                                                                        "suppliers.obs"
                                                                    ],
                                                                    "analyzer": "standard",
                                                                    "operator": "and"
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": utils.removeDiacritics(req.params.q.trim()),
                                                            "fields": [
                                                                "name"
                                                            ],
                                                            "operator": "and",
                                                            "analyzer": "standard",
                                                            "type": "cross_fields"
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "suppliers",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.params.q.trim()),
                                                                    "fields": [
                                                                        "suppliers.name",
                                                                        "suppliers.obs"
                                                                    ],
                                                                    "analyzer": "standard"
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": utils.removeDiacritics(req.params.q.trim()),
                                                            "fields": [
                                                                "name"
                                                            ],
                                                            "analyzer": "standard",
                                                            "operator": "or",
                                                            "minimum_should_match": "75%"
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "suppliers",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.params.q.trim()),
                                                                    "fields": [
                                                                        "suppliers.name",
                                                                        "suppliers.obs"
                                                                    ],
                                                                    "analyzer": "standard",
                                                                    "operator": "or",
                                                                    "minimum_should_match": "75%"
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    "filter": {
                                        "term": {
                                            "companyId": req.params.companyId
                                        }
                                    }
                                }
                            }
                        }
                    },
                    (esErr, esRes) => {
                        if (esErr) {
                            console.error("Search (product) error: ", esErr);
                            reject(new restify.ResourceNotFoundError("Erro no ElasticSearch."))
                        }
                        else {

                            const filter = { productId: 2, supplierId: 2 }

                            let products = [] // Array of the products to be returned
                            _.map(esRes.hits.hits, (hit, index) => {
                                if (hit.inner_hits.suppliers.hits.total > 0) { //Checks for innerhits in product's suppliers
                                    _.map(hit.inner_hits.suppliers.hits.hits, (innerHitSupplier) => {

                                        products.push(_.assign({}, {
                                            supplierProductId: parseInt(innerHitSupplier._source.supplierProductId),
                                            product: hit._source.name,
                                            productId: parseInt(hit._id),
                                            supplierName: innerHitSupplier._source.name,
                                            supplierId: innerHitSupplier._source.supplierId,
                                            quantity: innerHitSupplier._source.quantity,
                                            price: innerHitSupplier._source.price
                                        })
                                        ) // if has innerHits in
                                    })
                                }
                                else {
                                    _.map(hit._source.suppliers, (supplier) => {
                                        products.push(_.assign({}, {
                                            supplierProductId: parseInt(supplier.supplierProductId),
                                            product: hit._source.name,
                                            productId: parseInt(hit._id),
                                            supplierName: supplier.name,
                                            supplierId: supplier.supplierId,
                                            quantity: supplier.quantity,
                                            price: supplier.price
                                        })
                                        )
                                    })
                                }
                            })
                            resolve(products)
                        }
                    }
                )
            }).then((dataSearch) => {
                return dataSearch
            }).catch((err) => {
                return err.body
            })
        },

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

        getOne: (controller) => {
            return server.mysql.Product.findOne({
                where: {
                    id: controller.request.id,
                    status: 'activated',
                    include: [{
                        model: server.mysql.SupplierProduct,
                        as: 'productSuppliers',
                        include: [{
                            model: server.mysql.Supplier,
                            as: 'supplier'
                        }]
                    }]
                }
            }).then((product) => {
                if (!product) {
                    return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                }
                return product
            })
        },

        saveProducts: (controller) => {
            return new Promise((resolve, reject) => {  

                let setData = _.cloneDeep(controller.request.data)

                let productsPromises = []
                _.first(setData).forEach((orderProduct) => {
                    if (orderProduct.product.id) {
                        const productUpdate = new Controller({
                                request: {
                                    data: orderProduct
                                },
                                transaction: controller.transaction
                            })
                            productsPromises.push(updateOne(productUpdate).then((updatedProduct) => {
                                    return _.assign(orderProduct, {product: updatedProduct.product}, {productES: updatedProduct.esProduct})
                                })
                            )
                    }
                    else {
                        const productCreate = new Controller({
                            request: {
                                companyId: controller.request.companyId,
                                data: orderProduct
                            },
                            transaction: controller.transaction
                        })
                        productsPromises.push(createOne(productCreate).then((createdProduct) => {
                            return _.assign(orderProduct, {product: createdProduct.product}, {productES: createdProduct.esProduct})
                        })
                        )
                    }
                })

                return Promise.all(productsPromises).then((products) => {
                    resolve(products)
                })
            }).then((response) => {
                return (response) ? response : []
            }).catch((error) => {
                return error
            })
        },

        createOne(req) {
            let createData = _.cloneDeep(req.body)
            createData.companyId = req.params.companyId
            return server.mysql.Product.create(createData, {
                include: [{
                    model: server.mysql.SupplierProduct,
                    as: 'productSuppliers',
                    include: [{
                        model: server.mysql.Supplier,
                        as: 'supplier'
                    }]
                }]
            }).then((productCreate) => {
                if (!productCreate) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                else {
                    return server.mysql.Product.findOne({
                        where: {
                            id: productCreate.id,
                            status: 'activated'
                        },
                        include: [{
                            model: server.mysql.SupplierProduct,
                            as: 'productSuppliers',
                            include: [{
                                model: server.mysql.Supplier,
                                as: 'supplier'
                            }]
                        }]
                    }).then((product) => {
                        product = JSON.parse(JSON.stringify(product))
                        server.elasticSearch.index({
                            index: 'main',
                            type: 'product',
                            id: product.id,
                            body: {
                                companyId: product.companyId,
                                name: product.name,
                                suppliers: _.map(product.productSuppliers, productSupplier => {
                                    return {
                                        supplierProductId: productSupplier.id,
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
                        return product
                    })
                }
            })
        },

        updateOne(req) {
            const updateData = _.cloneDeep(req.body)

            return server.mysql.Product.update(updateData, {
                where: {
                    id: req.params.id,
                    status: 'activated',
                    companyId: req.params.companyId
                }
            }).then((productUpdate) => {
                if (!productUpdate) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                else {
                    return server.mysql.Product.findOne({
                        where: {
                            id: req.params.id,
                            status: 'activated'
                        },
                        include: [{
                            model: server.mysql.SupplierProduct,
                            as: 'productSuppliers',
                            include: [{
                                model: server.mysql.Supplier,
                                as: 'supplier'
                            }]
                        }]
                    }).then((product) => {
                        product = JSON.parse(JSON.stringify(product))
                        server.elasticSearch.update({
                            index: 'main',
                            type: 'product',
                            id: product.id,
                            body: {
                                doc: {
                                    companyId: product.companyId,
                                    name: product.name,
                                    dateUpdated: product.dateUpdated,
                                    dateCreated: product.dateCreated,
                                    status: product.status
                                }
                            }
                        }, (esErr, esRes, esStatus) => {
                            if (esErr) {
                                console.log(esErr)
                                return new restify.ResourceNotFoundError(esErr)
                            }
                            else {
                                if (_.has(updateData, "productSuppliers") && updateData.productSuppliers.length > 0) {
                                    req.params['id'] = product.id;
                                    saveProductSuppliers(req).then((productSupplier) => {
                                        return productSupplier
                                    }).catch((err) => {
                                        console.log(err);
                                        return err
                                    });
                                }
                            }
                        })
                        return product
                    })
                }
            })
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

        saveProductSuppliers(req) {
            return saveProductSuppliers(req).then((productSupplier) => {
                return productSupplier
            }).catch((err) => {
                return err
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
                                supplierProductId: productSupplier.id,
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


    function createOne(controller) {
        return new Promise((resolve, reject) => {

            const createData = _.cloneDeep(controller.request.data)
            return server.mysql.Product.create(createData.product, {
                transaction: controller.transaction
            }).then((createProduct) => {
                if (!createProduct) {
                    reject("Não foi possível encontrar o product criado.")
                }
                createProduct = JSON.parse(JSON.stringify(createProduct))

                _.assign(createProduct, {
                    productSuppliers: [{
                        supplierId: null,
                        productId: createProduct.id,
                        price: createData.price,
                        quantity: createData.quantity
                    }] // < _---- continuar daqui
                })

                const productSupplierCreate = new Controller({
                    request: {
                        data: createProduct
                    },
                    transaction: controller.transaction
                })

                return saveProductSuppliers(productSupplierCreate).then((product) => {
                    const esProduct = {
                        id: product.id,
                        body: {
                            companyId: product.companyId,
                            name: product.name,
                            suppliers: _.map(product.productSuppliers, productSupplier => {
                                return {
                                    supplierProductId: productSupplier.id,
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
                        },
                        createES: true
                    }
                    resolve({product: product, esProduct: esProduct})
                })
            })
        }).then((product) => {
            return product
        }).catch((err) => {
            return err
        })
    }

    function updateOne(controller) {
        return new Promise((resolve, reject) => {

            const updateData = _.cloneDeep(controller.request.data)

            return server.mysql.Product.update(updateData, {
                where: {
                    id: updateData.id,
                    status: 'activated',
                    companyId: controller.request.companyId
                },
                include: [{
                    model: server.mysql.SupplierProduct,
                    as: 'productSuppliers',
                    include: [{
                        model: server.mysql.Supplier,
                        as: 'supplier'
                    }]
                }],
                transaction: controller.transaction
            }).then((productUpdate) => {
                    if (!productUpdate) {
                        reject("Não foi possível encontrar o product editado.")
                    }
                    return server.mysql.Product.findById(controller.request.data.id, {
                        include: [{
                            model: server.mysql.SupplierProduct,
                            as: 'productSuppliers',
                            include: [{
                                model: server.mysql.Supplier,
                                as: 'supplier'
                            }]
                        }],
                        transaction: controller.transaction
                    }).then((product) => {
                        product = JSON.parse(JSON.stringify(product))

                        const esProduct = {
                            id: product.id,
                            body: {
                                companyId: product.companyId,
                                name: product.name,
                                suppliers: _.map(product.productSuppliers, productSupplier => {
                                    return {
                                        supplierProductId: productSupplier.id,
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
                            },
                            createES: false
                        }
                        resolve({product: product, esProduct: esProduct})
                })
            })
        }).then((product) => {
            return product
        }).catch((err) => {
            return err
        })
    }

    function saveProductSuppliers(controller) {

        return new Promise((resolve, reject) => {
            let productSuppliers = _.map(controller.productSuppliers, productSupplier => _.extend({
                productId: parseInt(req.params.id)
            }, productSupplier));

            server.mysql.SupplierProduct.bulkCreate(productSuppliers, {
                updateOnDuplicate: ['price', 'quantity', 'dateUpdate']
            }).then((response) => {
                server.mysql.Product.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
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
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }
                    let productSuppliers = _.map(product.productSuppliers, productSupplier => {
                        return {
                            supplierProductId: productSupplier.id,
                            supplierId: productSupplier.supplier.id,
                            name: productSupplier.supplier.name,
                            obs: productSupplier.supplier.obs,
                            quantity: productSupplier.quantity,
                            price: productSupplier.price
                        };
                    });
                    server.elasticSearch.update({
                        index: 'main',
                        type: 'product',
                        id: parseInt(req.params.id),
                        body: {
                            doc: {
                                suppliers: productSuppliers
                            }
                        }
                    }, (esErr, esRes) => {
                        resolve(response)
                    })
                }).catch((error) => {
                    reject(error)
                })
            }).catch((error) => {
                reject(error)
            })
        })
    }
};
