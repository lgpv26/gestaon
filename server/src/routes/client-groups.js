const basePath = require('./../middlewares/base-path.middleware')

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify)

    server.use(basePath(
        '/client-groups', authGuard
    ));

    /* CRUD */

    server.get('/client-groups', (req, res, next) => {
        return server.broker.call('data/client-group.getList', {
            data: {
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.get('/client-groups/:id', (req, res, next) => {
        return server.broker.call('data/client-group.getOne', {
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

    server.patch('/client-groups', (req, res, next) => {
        return server.broker.call('data/client-group.update', {
            data: req.body
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.del('/client-groups/:id', (req, res, next) => {
        return server.broker.call('data/client-group.remove', {
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