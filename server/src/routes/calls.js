const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    /* CRUD */

    /*server.use(basePath(
        '/calls', authGuard
    ));*/

    /* Users CRUD */

    server.get('/calls', (req, res, next) => {
        return server.broker.call('data/call.getList', {
            where: {
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.get('/calls/:id', (req, res, next) => {
        return server.broker.call('data/call.getOne', {
            where: {
                id: req.params.id,
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.post('/calls', (req, res, next) => {
        return server.broker.call('data/call.create', {
            data: req.body,
            companyId: req.query.companyId
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.patch('/calls', (req, res, next) => {
        return server.broker.call('data/call.update', {
            data: req.body
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.del('/calls/:id', (req, res, next) => {
        return server.broker.call('data/call.remove', {
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

};
