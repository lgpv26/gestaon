const _ = require('lodash')
const utils = require('../utils')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const ordersProductsController = require('./../controllers/orders-products.controller')(server, restify);
    const productsController = require('./../controllers/products.controller')(server, restify)
    const requestsClientsPhone = require('./../controllers/requests-clients-phones.controller')(server, restify)
    const requestsClientsAddress = require('./../controllers/requests-clients-addresses.controller')(server, restify)

    const addressesController = require('./../controllers/addresses.controller')(server, restify);
    const clientsAddressesController = require('./../controllers/clients-addresses.controller')(server, restify);
    const clientsPhonesController = require('./../controllers/clients-phones.controller')(server, restify);

    return {

        getAll: (controller) => {
            return server.mysql.Request.findAndCountAll(controller.request.queryParser).then((requests) => {
                if (!requests.count) {
                   throw new Error("Nenhum registro encontrado.")
                }
                return requests;
            })
        },

        getOne: (controller) => {
            return server.mysql.Request.findOne({
                where: {
                    id: parseInt(controller.request.id),
                    companyId: parseInt(controller.request.companyId)
                },
                include: [{
                    model: server.mysql.User,
                    as: "user"
                }, {
                    model: server.mysql.RequestClientPhone,
                    as: "requestClientPhones",
                        include: [{
                            model: server.mysql.ClientPhone,
                            as: "clientPhone",
                        }]
                    }, {
                    model: server.mysql.RequestClientAddress,
                    as: "requestClientAddresses",
                        include: [{
                            model: server.mysql.ClientAddress,
                            as: "clientAddress",
                            include:[{
                                model: server.mysql.Address,
                                as: "address"
                            }]
                        }]
                    },{
                    model: server.mysql.Client,
                    as: "client",
                        include: [{
                            model: server.mysql.ClientPhone,
                            as: 'clientPhones'
                        }, {
                            model: server.mysql.ClientAddress,
                            as: 'clientAddresses',
                            include: [{
                                model: server.mysql.Address,
                                as: 'address'
                            }]
                        }, {
                            model: server.mysql.ClientCustomField,
                            as: 'clientCustomFields',
                            include: [{
                                model: server.mysql.CustomField,
                                as: 'customField'
                            }]
                        }, {
                            model: server.mysql.ClientGroup,
                            as: 'clientGroup'
                        }]
                }, {
                model: server.mysql.Order,
                as: "order",
                    include: [{
                        model: server.mysql.OrderProduct,
                        as: 'orderProducts',
                        include: [{
                            model: server.mysql.Product,
                            as: 'product'
                        }]
                    }]
                }]
                /*, {
                    model: server.mysql.Task,
                    as: "task"
                }*/
            }).then((request) => {
                if (!request) {
                    return new restify.ResourceNotFoundError("Registro não encontrado.")
                }
                return request
            });
        },

        createOne: (controller) => {
            const createData = _.cloneDeep(controller.request.data)
            _.assign(createData, {
                companyId: controller.request.companyId,
                userId: controller.request.userId,  
                clientId: controller.request.clientId,
                orderId: controller.request.orderId,
                taskId: controller.request.taskId
            })
            return server.mysql.Request.create(createData, {
                transaction: controller.transaction
            }).then((request) => {
                if (!request) {
                    throw new Error("Não foi possível encontrar o pedido criado.")
                }

                let promises = []

                if(controller.request.clientId){

                    const clientPhonesControllerObj = new Controller({
                        request: {
                            requestId: request.id,
                            data: controller.request.clientPhones
                        },
                        transaction: controller.transaction
                    })
                    
                    promises.push(requestsClientsPhone.setClientPhones(clientPhonesControllerObj))

                    const clientAddressesControllerObj = new Controller({
                        request: {
                            requestId: request.id,
                            data: controller.request.clientAddresses
                        },
                        transaction: controller.transaction
                    })

                    promises.push(requestsClientsAddress.setClientAddresses(clientAddressesControllerObj))

                    return Promise.all(promises).then(() => {
                        return JSON.parse(JSON.stringify(request))
                    }).catch((err) => {
                        return reject()
                    })
                }
                else{
                    /* save clientPhones if existent */
                    if(_.has(controller.request, "clientPhones") && controller.request.clientPhones) {
                        const clientPhonesControllerObj = new Controller({
                            request: {
                                clientId: null,
                                data: controller.request.clientPhones
                            },
                            transaction: controller.transaction
                        })
                        promises.push(clientsPhonesController.setClientPhones(clientPhonesControllerObj))
                    }

                    /* save clientAddresses if existent */
                    if(_.has(controller.request, "clientAddresses") && controller.request.clientAddresses) {
                        const clientAddressesControllerObj = new Controller({
                            request: {
                                clientId: null,
                                companyId: controller.request.companyId,
                                data: controller.request.clientAddresses
                            },
                            transaction: controller.transaction
                        })
                        promises.push(clientsAddressesController.setClientAddresses(clientAddressesControllerObj))
                    }

                    return Promise.all(promises).then((result) => {
                        let requestClientsPromises = []
                        result.forEach((value, index) => {
                            /* save clientPhones if existent */
                            if(_.has(value, "clientPhones")) {
                                const clientPhonesControllerObj = new Controller({
                                    request: {
                                        requestId: request.id,
                                        data: value.clientPhones
                                    },
                                    transaction: controller.transaction
                                })
                                requestClientsPromises.push(requestsClientsPhone.setClientPhones(clientPhonesControllerObj))
                            }

                            /* save clientPhones if existent */
                            if(_.has(value, "clientAddresses")) {
                                const clientAddressesControllerObj = new Controller({
                                    request: {
                                        requestId: request.id,
                                        data: value.clientAddresses
                                    },
                                    transaction: controller.transaction
                                })
                                requestClientsPromises.push(requestsClientsAddress.setClientAddresses(clientAddressesControllerObj))
                            }
                        })

                        return Promise.all(requestClientsPromises).then(() => {
                            return true
                        })
                    }).catch((err) => {
                        return reject()
                    })
                }
            })
        },

        updateOne: (controller) => {
            const updateData = _.cloneDeep(controller.request.data)
            if (!updateData) {
                throw new Error("Erro, dados não enviados.")
            }
            _.assign(updateData, {
                companyId: controller.request.companyId,
                userId: controller.request.userId,  
                clientId: controller.request.clientId,
                orderId: controller.request.orderId,
                taskId: controller.request.taskId
            })

            return server.mysql.Request.update(updateData, {
                where: {
                    id: controller.request.data.id
                },
                transaction: controller.transaction
            }).then((request) => {
                if (!request) {
                    throw new Error("Registro não encontrado Parte 1..")
                }
                return server.mysql.Request.findById(controller.request.data.id, {
                    include: [{
                        model: server.mysql.User,
                        as: "user"
                    }, {
                        model: server.mysql.RequestClientPhone,
                        as: "requestClientPhones",
                            include: [{
                                model: server.mysql.ClientPhone,
                                as: "clientPhone",
                            }]
                        }, {
                        model: server.mysql.RequestClientAddress,
                        as: "requestClientAddresses",
                            include: [{
                                model: server.mysql.ClientAddress,
                                as: "clientAddress",
                                include:[{
                                    model: server.mysql.Address,
                                    as: "address"
                                }]
                            }]
                        },{
                        model: server.mysql.Client,
                        as: "client",
                            include: [{
                                model: server.mysql.ClientPhone,
                                as: 'clientPhones'
                            }, {
                                model: server.mysql.ClientAddress,
                                as: 'clientAddresses',
                                include: [{
                                    model: server.mysql.Address,
                                    as: 'address'
                                }]
                            }, {
                                model: server.mysql.ClientCustomField,
                                as: 'clientCustomFields',
                                include: [{
                                    model: server.mysql.CustomField,
                                    as: 'customField'
                                }]
                            }, {
                                model: server.mysql.ClientGroup,
                                as: 'clientGroup'
                            }]
                    }, {
                    model: server.mysql.Order,
                    as: "order",
                        include: [{
                            model: server.mysql.OrderProduct,
                            as: 'orderProducts',
                            include: [{
                                model: server.mysql.Product,
                                as: 'product'
                            }]
                        }]
                    }]
                    /*, {
                        model: server.mysql.Task,
                        as: "task"
                    }*/,
                    transaction: controller.transaction
                }).then((request) => {
                    if (!request) {
                        throw new Error("Registro não encontrado Parte 2..")
                    }

                    let promises = []

                    if(controller.request.clientId){

                        const clientPhonesControllerObj = new Controller({
                            request: {
                                requestId: request.id,
                                data: controller.request.clientPhones
                            },
                            transaction: controller.transaction
                        })
                        
                        promises.push(requestsClientsPhone.setClientPhones(clientPhonesControllerObj))

                        const clientAddressesControllerObj = new Controller({
                            request: {
                                requestId: request.id,
                                data: controller.request.clientAddresses
                            },
                            transaction: controller.transaction
                        })

                        promises.push(requestsClientsAddress.setClientAddresses(clientAddressesControllerObj))

                        return Promise.all(promises).then(() => {
                            return JSON.parse(JSON.stringify(request))
                        }).catch((err) => {
                            return reject()
                        })
                    }
                    else{
                        /* save clientPhones if existent */
                        if(_.has(controller.request, "clientPhones") && controller.request.clientPhones) {
                            const clientPhonesControllerObj = new Controller({
                                request: {
                                    clientId: null,
                                    data: controller.request.clientPhones
                                },
                                transaction: controller.transaction
                            })
                            promises.push(clientsPhonesController.setClientPhones(clientPhonesControllerObj))
                        }

                        /* save clientAddresses if existent */
                        if(_.has(controller.request, "clientAddresses") && controller.request.clientAddresses) {
                            const clientAddressesControllerObj = new Controller({
                                request: {
                                    clientId: null,
                                    companyId: controller.request.companyId,
                                    data: controller.request.clientAddresses
                                },
                                transaction: controller.transaction
                            })
                            promises.push(clientsAddressesController.setClientAddresses(clientAddressesControllerObj))
                        }

                        return Promise.all(promises).then((result) => {
                            let requestClientsPromises = []
                            result.forEach((value, index) => {
                                /* save clientPhones if existent */
                                if(_.has(value, "clientPhones")) {
                                    const clientPhonesControllerObj = new Controller({
                                        request: {
                                            requestId: request.id,
                                            data: value.clientPhones
                                        },
                                        transaction: controller.transaction
                                    })
                                    requestClientsPromises.push(requestsClientsPhone.setClientPhones(clientPhonesControllerObj))
                                }

                                /* save clientPhones if existent */
                                if(_.has(value, "clientAddresses")) {
                                    const clientAddressesControllerObj = new Controller({
                                        request: {
                                            requestId: request.id,
                                            data: value.clientAddresses
                                        },
                                        transaction: controller.transaction
                                    })
                                    requestClientsPromises.push(requestsClientsAddress.setClientAddresses(clientAddressesControllerObj))
                                }
                            })

                            return Promise.all(requestClientsPromises).then(() => {
                                return true
                            })
                        }).catch((err) => {
                            return reject()
                        })
                    }
                    
                }).catch((err) => {
                    console.log("ERRO, CONSULT (APOS UPDATE): ", err)
                })
            }).catch((err) => {
                console.log("ERRO, UPDATE REQUEST: ", err)
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