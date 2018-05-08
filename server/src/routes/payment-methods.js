const basePath = require('./../middlewares/base-path.middleware')

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    server.use(basePath(
        '/payment-methods', authGuard
    ))

    /* Users CRUD */

    server.get('/payment-methods', (req, res, next) => {
        return server.broker.call('data/payment-method.list', {
            data: {
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.get('/payment-methods/:id', (req, res, next) => {
        return server.broker.call('data/payment-method.get', {
            data: {
                id: req.params.id,
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.patch('/payment-methods', (req, res, next) => {
        return server.broker.call('data/payment-method.update', {
            data: req.body
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.del('/payment-methods/:id', (req, res, next) => {
        return server.broker.call('data/payment-method.remove', {
            data: {
                id: req.params.id,
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

}