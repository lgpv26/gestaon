const basePath = require('./../middlewares/base-path.middleware')
const Controller = require('../models/Controller')
const _ = require("lodash")

import {Op} from 'sequelize'

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    const usersController = require('./../controllers/users.controller')(server, restify);

    /* Authentication */

    server.post('/authenticate', usersController.authenticate);

    /* Registration */

    server.post('/register', usersController.register);

    /* Forgot your password */

    server.post('/forgot-password', usersController.forgotPassword);

    /* Me */

    server.get('/me', authGuard, usersController.me);

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
                    as: 'requestClientPhones'
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
            return res.send(200, {
                data: requests
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
                    as: 'requestClientPhones'
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
            return res.send(200, {
                data: request
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
