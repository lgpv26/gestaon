const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/custom-fields', authGuard
    ));

    /* Users CRUD */

    server.get('/custom-fields', (req, res, next) => {
        return server.broker.call('data/custom-field.getList', {
            data: {
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.get('/custom-fields/:id', (req, res, next) => {
        return server.broker.call('data/custom-field.getOne', {
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

    server.patch('/custom-fields', (req, res, next) => {
        return server.broker.call('data/custom-field.update', {
            data: req.body
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.del('/custom-fields/:id', (req, res, next) => {
        return server.broker.call('data/custom-field.remove', {
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
