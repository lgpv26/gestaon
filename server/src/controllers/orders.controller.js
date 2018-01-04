const _ = require('lodash')
const utils = require('../utils')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {
    return {
        getAll: (req, res, next) => {
            server.mysql.Order.findAndCountAll(req.queryParser).then((orders) => {
                if (orders.count === 0) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: orders
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
            server.mysql.Order.findOne({
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
                return res.send(200, {
                    data: order
                });
            });
        },

        createOne: (controller) => {
            const createData = _.cloneDeep(controller.request.data)
            _.assign(createData, {
                companyId: controller.request.companyId,
                clientId: controller.request.clientId,
                clientAddressId: controller.request.clientAddressId,
                clientPhoneId: controller.request.clientPhoneId
            })

            return server.mysql.Order.create(createData, {
                transaction: controller.transaction
            }).then((order) => {
                if (!order) {
                    throw new Error("Não foi possível encontrar o pedido criado.")
                }

                return new Promise((resolve, reject) => {
                    const promises = [];

                /* save orderProducts if existent */
                if(_.has(createData, "orderProducts")) {
                    const orderProductsControllerObj = new Controller({
                        request: {
                            orderId: order.id,
                            data: createData.orderProducts
                        },
                        transaction: controller.transaction
                    })
                    promises.push(clientsPhonesController.setClientPhones(orderProductsControllerObj))
                }

                })
                
                if ((_.has(createData, "orderProducts") && createData.orderProducts.length > 0)) {
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
        },

        updateOne: (req, res, next) => {
            if (!req.body) {
                return next(
                    new restify.ResourceNotFoundError("Erro, dados não enviados.")
                );
            }
            const updateData = _.cloneDeep(req.body);
            server.mysql.Order.update(updateData, {
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