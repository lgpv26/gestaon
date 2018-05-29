const basePath = require('./../middlewares/base-path.middleware')

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    server.use(basePath(
        '/promotion-channels', authGuard
    ))

    /* Users CRUD */

    server.get('/promotion-channels', (req, res, next) => {
        return server.broker.call('data/promotion-channel.getList', {
            data: {
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.get('/promotion-channels/:id', (req, res, next) => {
        return server.broker.call('data/promotion-channel.getOne', {
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

    server.patch('/promotion-channels', (req, res, next) => {
        return server.broker.call('data/promotion-channel.update', {
            data: req.body
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.del('/promotion-channels/:id', (req, res, next) => {
        return server.broker.call('data/promotion-channel.remove', {
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