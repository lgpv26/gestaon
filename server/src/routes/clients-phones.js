const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const clientsPhonesController = require('./../controllers/clients-phones.controller')(server, restify);

    server.use(basePath(
        '/clients-phones', authGuard
    ));

    /* CRUD */

    server.get('/clients-phones/:id', clientsPhonesController.getOne);
    server.patch('/clients-phones', clientsPhonesController.saveMultiple);

};
