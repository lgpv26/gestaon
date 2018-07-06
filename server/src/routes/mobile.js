const basePath = require('./../middlewares/base-path.middleware')
const _ = require("lodash")
const EventResponse = require('~server/models/EventResponse')

module.exports = (server, restify) => {

    const permissionGuard = require('./../middlewares/permission-guard.middleware')(server, restify)
    const queryParser = require('./../middlewares/query-parser.middleware')(server, restify)
    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify)

    server.use(basePath(
        '/mobile', authGuard
    ));
    

    /* CRUD */

    server.post('/mobile/requests', (req, res, next) => {
        server.broker.call('data/mobile.createRequest', {
            data: req.body,
            userAccountId: req.auth.accountId,
            userId: req.auth.id,
            companyId: (req.auth.activeCompanyUserId) ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
        }).then((request) => {
            return res.send(200, new EventResponse(request))
        }).catch((err) => {
            return res.send(200, new EventResponse(err))
        })
    })

    server.post('/mobile/requests/:id/status', (req, res, next) => {
        const aaa = {
            data: req.body,
            requestId: req.params.id,
            userAccountId: req.auth.accountId,
            userId: req.auth.id,
            companyId: (req.auth.activeCompanyUserId) ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
        }
        server.broker.call('data/mobile.changeStatus', aaa).then((request) => {
            return res.send(200, new EventResponse(request))
        }).catch((err) => {
            return res.send(200, new EventResponse(err))
        })
    })

    server.post('/mobile/requests/status', (req, res, next) => {
        const aaa = {
            data: req.body,
            userId: req.auth.id,
            companyId: (req.auth.activeCompanyUserId) ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
        }
        server.broker.call('data/mobile.changeStatusNew', aaa).then((request) => {
            return res.send(200, new EventResponse(request))
        }).catch((err) => {
            return res.send(200, new EventResponse(err))
        })
    })
    

    server.patch('/mobile/requests/:id', (req, res, next) => {
        server.broker.call('data/mobile.requestFinish', {
            data: _.assign({id: req.params.id },
                req.body),
            requestId: req.params.id,
            userId: req.auth.id,
            companyId: (req.auth.activeCompanyUserId) ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
        }).then((request) => {
            return res.send(200, new EventResponse(request))
        }).catch((err) => {
            return res.send(200, new EventResponse(err))
        })
    })

    server.post('/mobile/requests/:id/chat', (req, res, next) => {
        server.broker.call('data/mobile.itemSend', {
            data: _.assign({requestId: parseInt(req.params.id), userId: parseInt(req.auth.id) },
                req.body),
            requestId: req.params.id,
            userId: req.auth.id,
            companyId: (req.auth.activeCompanyUserId) ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
        }).then((request) => {
            return res.send(200, new EventResponse(request))
        }).catch((err) => {
            return res.send(200, new EventResponse(err))
        })
    })

/*
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
    */

}