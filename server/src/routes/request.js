const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const permissionGuard = require('./../middlewares/permission-guard.middleware')(server, restify);
    const queryParser = require('./../middlewares/query-parser.middleware')(server, restify);
    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const requestsController = require('./../controllers/requests.controller')(server, restify);

    server.use(basePath(
        '/requests', authGuard
    ));
    

    /* CRUD */

    server.get('/requests', permissionGuard('requests.list'), queryParser, requestsController.getAll);
    server.get('/requests/:id', permissionGuard('requests.list'), requestsController.getOne);
    server.post('/requests', permissionGuard('requests.add'), requestsController.createOne);
    server.patch('/requests/:id', permissionGuard('requests.edit'), requestsController.updateOne);
    server.del('/requests/:id', permissionGuard('requests.remove'), requestsController.removeOne);

    server.get('/requests/:id/products', permissionGuard('requests.list'), queryParser('requestId'), requestsController.getAllProducts);
    server.patch('/requests/:id/products', permissionGuard('requests.add'), requestsController.saveProducts);
    server.del('/requests/:id/products/:productId', permissionGuard('requests.add'), requestsController.removeOneProduct);

};