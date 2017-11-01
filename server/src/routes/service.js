const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const serviceController = require('./../controllers/service.controller')(server, restify);

    server.use(basePath(
        '/service', authGuard
    ));

    /* CRUD */

    server.get('/service/search', serviceController.search);
    server.get('/service/find-clients', serviceController.findClients);

    /*
    server.patch('/devices/:id', devicesController.updateOne);
    server.get('/devices/:id', devicesController.getOne);
    server.del('/devices/:id', devicesController.removeOne);*/

};
