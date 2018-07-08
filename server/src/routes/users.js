const basePath = require('./../middlewares/base-path.middleware')
const Controller = require('../models/Controller')
const _ = require("lodash")

import {Op} from 'sequelize'

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify)

    const usersController = require('./../controllers/users.controller')(server, restify)

    /* Authentication */

    server.post('/authenticate', usersController.authenticate)

    /* Registration */

    server.post('/register', usersController.register)

    /* Forgot your password */

    server.post('/forgot-password', usersController.forgotPassword)

    /* Me */

    server.get('/me', authGuard, usersController.me)

    /* User setting */
    server.post('/me/setting', authGuard, (req, res, next) => {
        const userSetting = _.assign(req.body, {
            userId: req.auth.id
        })
        server.sequelize.transaction((t) => {
            return server.mysql.UserSetting.upsert(userSetting)
        }).then((result) => {
            res.send(200, {
                data: result
            })
        }).catch((err) => {
            next(err)
        })
    })

    /* User settings */
    server.post('/me/settings', authGuard, (req, res, next) => {
        server.mysql.User.findOne({
            where: {
                id: req.auth.id
            },
            include: [
                {
                    model: server.mysql.UserSetting,
                    as : 'userSettings'
                }
            ]
        }).then((user) => {
            const userSettings = req.body
            userSettings.map((userSetting) => {
                _.assign(userSetting, {
                    userId: user.id
                })
                return userSetting
            })
            return server.sequelize.transaction(function (t) {
                return server.mysql.UserSetting.destroy({
                    where: {
                        userId: user.id
                    },
                    transaction: t
                }).then(() => {
                    return server.mysql.UserSetting.bulkCreate(userSettings, {
                        transaction: t
                    }).then((response) => {
                        res.send(200, {
                            data: response
                        })
                    }).catch((error) => {
                        next(error)
                    })
                })
            })
        })
    })

    /* My requests */

    server.get('/me/requests', authGuard, (req, res, next) => {
        server.broker.call('data/request.getList', {
            where: {
                userId: req.auth.id,
                status: {
                    [Op.or]: ['pending','in-displacement']
                }
            },
            include: [
                {
                    model: server.mysql.Client,
                    as: 'client'
                },
                {
                    model: server.mysql.RequestClientAddress,
                    as: 'requestClientAddresses',
                    include: [{
                        model: server.mysql.ClientAddress,
                        as: 'clientAddress',
                        include: [{
                            model: server.mysql.Address,
                            as: 'address'
                        }]
                    }]
                },
                {
                    model: server.mysql.RequestClientPhone,
                    as: 'requestClientPhones',
                    include: [{
                        model: server.mysql.ClientPhone,
                        as: 'clientPhone'
                    }]
                },
                {
                    model: server.mysql.RequestPayment,
                    as: "requestPayments",
                    include: [{
                        model: server.mysql.PaymentMethod,
                        as: 'paymentMethod'
                    },
                        {
                            model: server.mysql.RequestPaymentTransaction,
                            as: 'requestPaymentTransactions',
                            include: [{
                                model: server.mysql.Transaction,
                                as: 'transaction'
                            }]
                        },{
                            model: server.mysql.RequestPaymentBill,
                            as: 'requestPaymentBills'
                        }]
                },
                {
                    model: server.mysql.RequestOrder,
                    as: "requestOrder",
                    include: [{
                        model: server.mysql.RequestOrderProduct,
                        as: 'requestOrderProducts',
                        include: [{
                            model: server.mysql.Product,
                            as: 'product'
                        }]
                    }]
                }
            ]
        }).then((requests) => {
            requests = JSON.parse(JSON.stringify(requests))
            let promises = []
            requests.forEach((request, index) => {
                    promises.push(server.mysql.RequestChatItem.findAll({
                            where: {
                                requestId: request.id
                            },
                            attributes: ['id'],
                            include: [{
                                model: server.mysql.RequestChatItemRead,
                                as: 'usersRead'
                            }]
                        }).then((chatItems) => {
                            const count = _.filter(chatItems, (chat) => {
                                if(!chat.usersRead.length && chat.userId !== req.auth.id) return chat
                            })
                            return _.set(requests[index], 'unreadChatItemCount', count.length)
                    })
                )
            })

            return Promise.all(promises).then(() => {
                return res.send(200, {
                    data: requests
                })
            })
        }).catch((err) => {
            console.log(err)
        })
    })

    /* My request */

    server.get('/me/requests/:id', authGuard, (req, res, next) => {
        server.broker.call('data/request.getOne', {
            where: {
                id: req.params.id,
                userId: req.auth.id,
                status: {
                    [Op.or]: ['pending','in-displacement']
                }
            },
            include: [
                {
                    model: server.mysql.Client,
                    as: 'client'
                },
                {
                    model: server.mysql.RequestClientAddress,
                    as: 'requestClientAddresses',
                    include: [{
                        model: server.mysql.ClientAddress,
                        as: 'clientAddress',
                        include: [{
                            model: server.mysql.Address,
                            as: 'address'
                        }]
                    }]
                },
                {
                    model: server.mysql.RequestClientPhone,
                    as: 'requestClientPhones',
                    include: [{
                        model: server.mysql.ClientPhone,
                        as: 'clientPhone'
                    }]
                },
                {
                    model: server.mysql.RequestPayment,
                    as: "requestPayments",
                    include: [
                        {
                            model: server.mysql.PaymentMethod,
                            as: 'paymentMethod'
                        },
                        {
                            model: server.mysql.RequestPaymentTransaction,
                            as: 'requestPaymentTransactions',
                            include: [{
                                model: server.mysql.Transaction,
                                as: 'transaction'
                            }]
                        },{
                            model: server.mysql.RequestPaymentBill,
                            as: 'requestPaymentBills'
                        }
                    ]
                },
                {
                    model: server.mysql.RequestOrder,
                    as: "requestOrder",
                    include: [{
                        model: server.mysql.RequestOrderProduct,
                        as: 'requestOrderProducts',
                        include: [{
                            model: server.mysql.Product,
                            as: 'product'
                        }]
                    }]
                }
            ]
        }).then((request) => {
            /*request.requestPayments.forEach((requestPayment, index) => {
                if(requestPayment.requestPaymentBills) _.set(request.requestPayments[index], 'deadlineDatetime', requestPayment.requestPaymentBills.deadlineDatetime)
            })*/
            request = JSON.parse(JSON.stringify(request))

            return server.mysql.RequestChatItem.findAll({
                        where: {
                            requestId: request.id
                        },
                        attributes: ['id'],
                        include: [{
                            model: server.mysql.RequestChatItemRead,
                            as: 'usersRead'
                        }]
                    }).then((chatItems) => {
                        const count = _.filter(chatItems, (chat) => {
                            if(!chat.usersRead.length && chat.userId !== req.auth.id) return chat
                        })
                        _.set(request, 'unreadChatItemCount', count.length)
                        return res.send(200, {
                            data: request
                        })
                })
        }).catch((err) => {
            console.log(err)
        })
    })

    /* Save FCM token to current accessToken */

    server.post('/users/fcm', authGuard, usersController.fcm);

    /* Auth Guard for /users route prefix */

    server.use(basePath('/users', authGuard));

    /* Users CRUD */

    server.get('/users', (req, res, next) => {
        const controller = new Controller({
            companyId: (req.query.companyId) ? req.query.companyId : null,
            request: {
                queryParser: {
                    companyId: (req.query.companyId) ? req.query.companyId : null
                }
            }
        })
        return usersController.getAll(controller).then((users) => {
            if(!users){
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return res.send(200, { data: users })
        }).catch((err) => {
            return next(
                new restify.InternalServerError({
                    body: {
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }
                })
            )
        })
    })

    server.post('/users', usersController.createOne);
    server.get('/users/:id', usersController.getOne);
    server.patch('/users/:id', usersController.updateOne);
    server.del('/users/:id', usersController.removeOne);

};
