const _ = require('lodash')
const utils = require('../utils')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const requestsProductsController = require('./../controllers/requests-products.controller')(server, restify);
    const productsController = require('./../controllers/products.controller')(server, restify);

    return {
        getAll: (req, res, next) => {
            server.mysql.Request.findAndCountAll(req.queryParser).then((requests) => {
                if (requests.count === 0) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: requests
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
            server.mysql.Request.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.mysql.RequestProduct,
                    as: 'orderProducts',
                    include: [{
                        model: server.mysql.Product,
                        as: 'product'
                    }]
                }]
            }).then((request) => {
                if (!request) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado.")
                    );
                }
                return res.send(200, {
                    data: request
                });
            });
        },

        createOne: (controller) => {
            const createData = _.cloneDeep(controller.request.data)
            _.assign(createData, {
                companyId: controller.request.companyId,
                userId: controller.request.userId,  
                clientId: controller.request.clientId,
                clientAddressId: controller.request.clientAddressId,
                clientPhoneId: controller.request.clientPhoneId
            })

            return server.mysql.Request.create(createData, {
                transaction: controller.transaction
            }).then((request) => {
                if (!request) {
                    throw new Error("Não foi possível encontrar o pedido criado.")
                }

                return new Promise((resolve, reject) => {
                const promises = [];

                /* save orderProducts if existent */
                if(_.has(createData, "requestProducts")) {
                    const requestProductsControllerObj = new Controller({
                        request: {
                            requestId: request.id,
                            companyId: controller.request.companyId,
                            data: createData.requestProducts
                        },
                        transaction: controller.transaction
                    })
                    promises.push(requestsProductsController.setRequestsProducts(requestProductsControllerObj))
                }

                    /* return only when all promises are satisfied */
                    return Promise.all(promises).then((requestEs) => {
                        const objES = {}
                        _.map(requestEs, (value) => {
                            _.assign(objES, value)
                        })

                        let productsESPromise = []
                        if (_.has(objES, "productsES") && objES.productsES) {
                            objES.productsES.forEach((productES) => {
                                const productESControllerObj = new Controller({
                                    request: {
                                        data: productES
                                    },
                                    transaction: controller.transaction
                                })
                                productsESPromise.push(productsController.saveProductsInES(productESControllerObj))
                            })
                        }

                        return Promise.all(productsESPromise).then(() => {
                            return resolve({id: request.id})
                        }).catch((err) => {
                            return reject()
                        })
                    }).catch((err) => {
                        return reject(err)
                    })
                })

            })

        },

        updateOne: (req, res, next) => {
            if (!req.body) {
                return next(
                    new restify.ResourceNotFoundError("Erro, dados não enviados.")
                );
            }
            const updateData = _.cloneDeep(req.body);
            server.mysql.Request.update(updateData, {
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((order) => {
                if (!order) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado P)arte 1.")
                    );
                }
                server.mysql.Order.findById(req.params.id, {
                    where: {
                        id: req.params.id,
                        status: 'activated'
                    },
                    include: [{
                        model: server.mysql.OrderProduct,
                        as: 'orderProducts',
                        include: [{
                            model: server.mysql.Product,
                            as: 'product'
                        }]
                    }]
                }).then((order) => {
                    if (!order) {
                        return next(
                            new restify.ResourceNotFoundError("Registro não encontrado.")
                        );
                    }
                    if (_.has(updateData, "orderProducts") && updateData.orderProducts.length > 0) {
                        req.params['id'] = order.id;
                        saveProducts(req, res, next).then((order) => {
                            return res.send(200, {
                                data: order
                            });
                        }).catch((err) => {
                            console.log(err);
                            next(err);
                        });
                    }
                    else {
                        return res.send(200, {
                            data: order
                        });
                    }
                })
            })
        },

        removeOne: (req, res, next) => {
            server.sequelize.transaction((t) => {
                return server.mysql.Order.destroy({
                    where: {
                        id: req.params.id
                    },
                    transaction: t
                }).then((order) => {
                    if (!order) {
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    deleteStatus(req.params.id)
                    return server.mysql.OrderProduct.findAll({
                        where: {
                            orderId: req.params.id
                        },
                        transaction: t
                    }).then((orderProducts) => {
                        let statusData = { status: "deleted" }
                        server.mysql.OrderProduct.update(statusData, {
                            where: {
                                orderId: req.params.id
                            }
                        })
                        return server.mysql.OrderProduct.destroy({
                            where: {
                                orderId: req.params.id
                            },
                            transaction: t
                        }).then(() => {
                            return res.send(200, {
                                data: {
                                    id: req.params.id
                                }
                            });
                        });;
                    })
                });
            });
        },

        getAllProducts: (req, res, next) => {
            server.mysql.OrderProduct.findAndCountAll(req.queryParser).then((products) => {
                if (products.count === 0) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: products
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

        saveProducts(req, res, next) {
            saveProducts(req, res, next).then((product) => {
                return res.send(200, {
                    data: product
                });
            }).catch((err) => {
                next(err);
            });
        },

        removeOneProduct: (req, res, next) => {
            return server.sequelize.transaction(function (t) {
                return server.mysql.OrderProduct.destroy({
                    where: {
                        productId: req.params.productId,
                        orderId: req.params.id
                    },
                    transaction: t
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

        }
    };

    // CHANCE STATUS DATA WHEN DELET (with paranoid)

    function deleteStatus(id) {
        let statusData = { status: "deleted" }
        server.mysql.Order.update(statusData, {
            where: {
                id: id
            }
        })
    };

    /* -------------------------------------- */
    /* --- Reusable request functions ------------------------------------------
    /* -------------------------------------- */


    function saveProducts(req, res, next) {
        return new Promise((resolve, reject) => {
            let orderProducts = _.map(req.body.orderProducts, orderProduct => _.extend({
                orderId: parseInt(req.params.id)
            }, orderProduct));

            server.mysql.OrderProduct.bulkCreate(orderProducts, {
                updateOnDuplicate: ['productId', 'orderId', 'quantity', 'unitPrice', 'unitDiscount', 'status']
            }).then((response) => {
                server.mysql.Order.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.mysql.OrderProduct,
                        as: 'orderProducts'
                    }]
                }).then((order) => {
                    if (!order) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }

                    resolve(order);
                }).catch((error) => {
                    reject(error);
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    }

};