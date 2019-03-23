const basePath = require('./../middlewares/base-path.middleware')
import _ from 'lodash'

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    server.use(basePath(
        '/cashier-balancing', authGuard
    ))

    /* Users CRUD */

    server.get('/cashier-balancing', (req, res, next) => {
        return server.broker.call('cashier-balancing.getList', {
            data: {
                filter: req.query.filter || null,
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.post('/cashier-balancing/mark-as-received', (req, res, next) => {
        return server.broker.call('cashier-balancing.markAsReceived', {
            data: _.assign({
                companyId: parseInt(req.query.companyId),
                createdById: parseInt(req.auth.id),
                received: true
            }, req.body)
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.post('/cashier-balancing/change-received-as-paid', (req, res, next) => {
        return server.broker.call('cashier-balancing.changeReceived', {
                companyId: parseInt(req.query.companyId)
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.post('/cashier-balancing/mark-as-settled', (req, res, next) => {
        return server.broker.call('cashier-balancing.markAsSettled', {
            data: _.assign({
                companyId: parseInt(req.query.companyId),
                createdById: parseInt(req.auth.id)
            }, req.body)
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })


}