const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getAll: (req, res, next) => {
            server.models.Order.findAll().then((orders) => {
                if (!orders) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: orders
                });
            });
        },
        getOne: (req, res, next) => {
            server.models.Order.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.models.OrderProduct,
                    as: 'orderProducts',
                    include: [{
                        model: server.models.Product,
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

        createOne: (req, res, next) => {
            if (!req.body) {
                return next(
                    new restify.ResourceNotFoundError("Erro, dados não enviados.")
                );
            }
            const createData = _.cloneDeep(req.body);
            server.models.Order.create(createData, {
                include: [{
                    model: server.models.OrderProduct,
                    as: 'orderProducts'
                }]
            }).then((order) => {
                if (!order) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado.")
                    );
                }
                server.elasticSearch.index({
                    index: 'main',
                    type: 'order',
                    id: order.id,
                    body: {
                        companyId: order.company_id,
                        userId: order.user_id,
                        clientId: order.client_id,
                        obs: order.obs,
                        status: order.status
                    }
                }, function (esErr, esRes, esStatus) {
                    if (esErr) {
                        console.error(esErr);
                        return next(
                            new restify.ResourceNotFoundError(esErr)
                        );
                    }
                    if ((_.has(createData, "orderProducts") && createData.orderProducts.length > 0)) {
                        return res.send(200, {
                            data: order.id
                        })
                    }
                    else {
                        return res.send(200, {
                            data: order
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
            server.models.Order.update(updateData, {
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
                server.models.Order.findById(req.params.id, {
                    where: {
                        id: req.params.id,
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.OrderProduct,
                        as: 'orderProducts',
                        include: [{
                            model: server.models.Product,
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
                return server.models.Order.destroy({
                    where: {
                        id: req.params.id
                    },
                    transaction: t
                }).then((order) => {
                    if(!order){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    deleteStatus(req.params.id)
                    return server.models.OrderProduct.findAll({
                        where: {
                            orderId: req.params.id
                        },
                        transaction: t
                    }).then((orderProducts) => {
                        let statusData = { status: "deleted" }
                        server.models.OrderProduct.update(statusData, {
                            where: {
                                orderId: req.params.id
                            }
                        })
                        return server.models.OrderProduct.destroy({
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
            return server.sequelize.transaction(function(t){
                return server.models.OrderProduct.destroy({
                    where: {
                        productId: req.params.productId,
                        orderId: req.params.id
                    },
                    transaction: t
                }).then((product) => {
                    if(!product){
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

    function deleteStatus(id){
        let statusData = { status: "deleted" }
        server.models.Order.update(statusData, {
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

            server.models.OrderProduct.bulkCreate(orderProducts, {
                updateOnDuplicate: ['id','productId','orderId','quantity', 'unitPrice', 'unitDiscount', 'status']                
            }).then((response) => {
                server.models.Order.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.OrderProduct,
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