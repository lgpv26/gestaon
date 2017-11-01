const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const productsController = require('./../controllers/products.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/products', authGuard
    ));

    server.get('/products', productsController.getAll);
    server.get('/products/:id', productsController.getOne);
    server.post('/products', productsController.createOne);
    server.patch('/products/:id', productsController.updateOne);
    server.del('/products/:id', productsController.removeOne);

};
