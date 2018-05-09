const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const productsController = require('./../controllers/products.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/products', authGuard
    ));

    server.get('/products/search', (req, res, next) => {
        productsController.search(req).then((searchResult) => {
            return res.send(200, { data: searchResult })
        }).catch((err) => {
            return console.log(err)
        })
    })

    server.get('/products', (req, res, next) => {
        return server.broker.call('data/product.getList', {
            data: {
                companyId: req.query.companyId
            }
        }).then((data) => {
            return res.send(200, { data })
        }).catch((err) => {
            return next(err)
        })
    })

    server.get('/products/:id', (req, res, next) => {
        return server.broker.call('data/product.getOne', {
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

    server.post('/products', (req, res, next) => {
        productsController.createOne(req).then((product) => {
            return res.send(200, { data: product })
        })
    })

    server.patch('/products/:id', (req, res, next) => {
        productsController.updateOne(req).then((productUpdate) => {
            return res.send(200, { data: productUpdate })
        })
    })

    server.del('/products/:id', productsController.removeOne);

    server.post('/products/export-to-es', (req, res, next) => {
        productsController.exportToES(req).then((exportToES) => {
            return res.send(200, { data: exportToES })
        })
    })
};
