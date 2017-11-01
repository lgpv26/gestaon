const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const addressesController = require('./../controllers/addresses.controller')(server, restify);

    server.use(basePath(
        '/addresses', authGuard
    ));

    server.get('/addresses/search', addressesController.search);

    /* CRUD */

    /*server.get('/addresses', addressesController.getAll);*/
    server.get('/addresses/:id', addressesController.getOne);
    /*server.post('/addresses', addressesController.createOne);
    server.patch('/addresses/:id', addressesController.updateOne);
    server.del('/addresses/:id', addressesController.removeOne);*/

    server.post('/addresses/export-to-es', addressesController.exportToES);

};
