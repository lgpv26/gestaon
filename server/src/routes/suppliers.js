const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const permissionGuard = require('./../middlewares/permission-guard.middleware')(server, restify);
    const queryParser = require('./../middlewares/query-parser.middleware')(server, restify);
    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const suppliersController = require('./../controllers/suppliers.controller')(server, restify);

    server.use(basePath(
        '/suppliers', authGuard
    ));
    

    /* CRUD */

    server.get('/suppliers', permissionGuard('suppliers.list'), queryParser, suppliersController.getAll);
    server.get('/suppliers/:id', permissionGuard('suppliers.list'), suppliersController.getOne);
    server.post('/suppliers', permissionGuard('suppliers.add'), suppliersController.createOne);
    server.patch('/suppliers/:id', permissionGuard('suppliers.edit'), suppliersController.updateOne);
    server.del('/suppliers/:id', permissionGuard('suppliers.remove'), suppliersController.removeOne);

    server.get('/suppliers/:id/products', permissionGuard('suppliers.list'), queryParser('supplierId'), suppliersController.getProducts);
    server.del('/suppliers/:id/products/:productId', permissionGuard('suppliers.add'), suppliersController.removeOneProduct);
    server.patch('/suppliers/:id/products', permissionGuard('suppliers.add'), suppliersController.saveProducts);

    server.get('/suppliers/:id/companies', permissionGuard('suppliers.list'), queryParser('supplierId'), suppliersController.getCompanies);
    server.del('/suppliers/:id/companies/:companyId', permissionGuard('suppliers.add'), suppliersController.removeOneCompany);
    server.patch('/suppliers/:id/companies', permissionGuard('suppliers.add'), suppliersController.saveCompanies);

};