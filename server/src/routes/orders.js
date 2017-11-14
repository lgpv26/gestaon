const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const permissionGuard = require('./../middlewares/permission-guard.middleware')(server, restify);
    const queryParser = require('./../middlewares/query-parser.middleware')(server, restify);
    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const ordersController = require('./../controllers/orders.controller')(server, restify);

    server.use(basePath(
        '/orders', authGuard
    ));
    

    /* CRUD */

    server.get('/orders', permissionGuard('orders.list'), queryParser, ordersController.getAll);
    server.get('/orders/:id', permissionGuard('orders.list'), ordersController.getOne);
    server.post('/orders', permissionGuard('orders.add'), ordersController.createOne);
    server.patch('/orders/:id', permissionGuard('orders.edit'), ordersController.updateOne);
    server.del('/orders/:id', permissionGuard('orders.remove'), ordersController.removeOne);

    server.patch('/orders/:id/products', permissionGuard('orders.add'), ordersController.saveProducts);
    server.del('/orders/:id/products/:productId', permissionGuard('orders.add'), ordersController.removeOneProduct);

};