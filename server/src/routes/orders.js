const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const ordersController = require('./../controllers/orders.controller')(server, restify);

    
    server.use(basePath(
        '/orders', authGuard
    ));
    

    /* CRUD */

    server.get('/orders', ordersController.getAll);
    server.get('/orders/:id', ordersController.getOne);
    server.post('/orders', ordersController.createOne);
    server.patch('/orders/:id', ordersController.updateOne);
    server.del('/orders/:id', ordersController.removeOne);

    server.patch('/orders/:id/products', ordersController.saveProducts);
    server.del('/orders/:id/products/:productId', ordersController.removeOneProduct);

};
