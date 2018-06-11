const basePath = require('./../middlewares/base-path.middleware')
const Controller = require('../models/Controller')
const _ = require("lodash")

module.exports = (server, restify) => {

    const permissionGuard = require('./../middlewares/permission-guard.middleware')(server, restify);
    const queryParser = require('./../middlewares/query-parser.middleware')(server, restify);
    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const requestsController = require('./../controllers/requests.controller')(server, restify);

    server.use(basePath(
        '/requests', authGuard
    ));
    

    /* CRUD */

    
    server.get('/requests', (req, res, next) => {
        const controller = new Controller({
            request: {
                id: (req.params.id) ? req.params.id : null,
                companyId: (req.query.companyId) ? req.query.companyId : null
            }
        })

        return requestsController.getAll(controller).then((request) => {
            if(!request){
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return res.send(200, { data: request })
        }).catch((err) => {
            console.log('catch da rota do requests all', err)
        })
    })

    server.get('/requests/:id', (req, res, next) => {
        server.broker.call('data/request.getOne', {
            where: {
                id: req.params.id
            },
            include: [{
                model: server.mysql.RequestTimeline,
                as: "requestTimeline",
                include: [{
                    model: server.mysql.User,
                    as: "triggeredByUser",
                },{
                    model: server.mysql.User,
                    as: "user",
                }]
            },
            {
                model: server.mysql.RequestClientPhone,
                as: "requestClientPhones",
                include: [{
                    model: server.mysql.ClientPhone,
                    as: "clientPhone",
                }]
            },{
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
            },{
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
            },{
                model: server.mysql.RequestPayment,
                as: "requestPayments",
                include: [{
                    model: server.mysql.PaymentMethod,
                    as: 'paymentMethod'
                },{
                    model: server.mysql.RequestPaymentTransaction,
                    as: 'requestPaymentTransactions',
                    include: [{
                        model: server.mysql.Transaction,
                        as: 'transaction'
                    }]
                }]
            }]
        }).then((request) => {
            return res.send(200, request)
        }).catch((err) => {
            console.log(err)
        })
    })

    server.post('/requests', (req, res, next) => {
        server.broker.call('data/request.create', {
            data: {
                companyId: 1
            }
        }).then((request) => {
            return res.send(200, request)
        }).catch((err) => {
            console.log(err)
        })
    })

    server.post('/requests/persistence/:draftId', (req, res, next) => {
        return server.broker.call('draft/request/persistence.start', {
            request: req.body,
            userId: req.auth.id,
            userAccountId: req.auth.accountId,
            draftId: req.params.draftId,
            companyId: (req.auth.activeCompanyUserId) ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
        }).then((request) => {
            return res.send(200, request)
        }).catch((err) => {
            console.log(err)
        })
    })

    server.post('/requests/recoverance/:id', (req, res, next) => {
        return server.broker.call('draft/request/recoverance.start',{
            requestId: req.params.id,
            userId: req.auth.id,
            companyId: (req.auth.activeCompanyUserId) ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
        }).then((request) => {
            return res.send(200, request)
        }).catch((err) => {
            console.log(err)
        })
    })

}