import { request } from 'http';

const _ = require('lodash')
const utils = require('../utils/index')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const ordersProductsController = require('./../controllers/orders-products.controller')(server, restify);
    const productsController = require('./../controllers/products.controller')(server, restify);

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

            return server.mysql.Order.create(createData, {
                transaction: controller.transaction
            }).then((order) => {
                if (!order) {
                    throw new Error("Não foi possível encontrar o order criado.")
                }

                order = JSON.parse(JSON.stringify(order))

                return new Promise((resolve, reject) => {
                const promises = [];

                /* save orderProducts if existent */
                if(_.has(createData, "orderProducts")) {
                    const orderProductsControllerObj = new Controller({
                        request: {
                            orderId: order.id,
                            companyId: controller.request.companyId,
                            data: createData.orderProducts
                        },
                        transaction: controller.transaction
                    })
                    promises.push(ordersProductsController.setOrdersProducts(orderProductsControllerObj))
                }
                
                    /* return only when all promises are satisfied */
                    return Promise.all(promises).then((orderEs) => {
                        const objES = {}
                        _.map(orderEs, (value) => {
                            _.assign(objES, value)
                        })

                        let productsESPromise = []
                        if (_.has(objES, "productsES") && objES.productsES) {
                            objES.productsES.forEach((productES) => {
                                const productESControllerObj = new Controller({
                                    request: {
                                        companyId: controller.request.companyId,
                                        data: productES
                                    },
                                    transaction: controller.transaction
                                })

                                productsESPromise.push(productsController.saveProductsInES(productESControllerObj))
                            })
                        }

                        return Promise.all(productsESPromise).then(() => {
                            return resolve(order)
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
            return server.mysql.Order.update(updateData, {
                where: {
                    id: controller.request.data.id
                },
                transaction: controller.transaction
            }).then((order) => {
                if (!order) {
                    return new restify.ResourceNotFoundError("Não foi possivel encontrar registro atualizado, parte 1")
                }
                return server.mysql.Order.findById(controller.request.data.id, {
                    include: [{
                        model: server.mysql.OrderProduct,
                        as: 'orderProducts',
                        include: [{
                            model: server.mysql.Product,
                            as: 'product'
                        }]
                    }],
                    transaction: controller.transaction
                }).then((order) => {
                    if (!order) {
                        return new restify.ResourceNotFoundError("Não foi possivel encontrar registro atualizado, parte 2")
                    }
                    order = JSON.parse(JSON.stringify(order))

                    return new Promise((resolve, reject) => {
                    const promises = [];

                    /* save orderProducts if existent */
                    if(_.has(updateData, "orderProducts")) {
                        const orderProductsControllerObj = new Controller({
                            request: {
                                orderId: order.id,
                                companyId: controller.request.companyId,
                                data: updateData.orderProducts
                            },
                            transaction: controller.transaction
                        })
                        promises.push(ordersProductsController.setOrdersProducts(orderProductsControllerObj))
                    }

                        /* return only when all promises are satisfied */
                        return Promise.all(promises).then((orderEs) => {
                            const objES = {}
                            _.map(orderEs, (value) => {
                                _.assign(objES, value)
                            })

                            let productsESPromise = []
                            if (_.has(objES, "productsES") && objES.productsES) {
                                objES.productsES.forEach((productES) => {
                                    const productESControllerObj = new Controller({
                                        request: {
                                            companyId: controller.request.companyId,
                                            data: productES
                                        },
                                        transaction: controller.transaction
                                    })

                                    productsESPromise.push(productsController.saveProductsInES(productESControllerObj))
                                })
                            }

                            return Promise.all(productsESPromise).then(() => {
                                return resolve(order)
                            }).catch((err) => {
                                return reject()
                            })
                        }).catch((err) => {
                            return reject(err)
                        })
                    })
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
    /* --- Reusable order functions ------------------------------------------
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