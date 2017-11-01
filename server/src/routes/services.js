const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const servicesController = require('./../controllers/services.controller')(server, restify);

    server.use(basePath(
        '/services', authGuard
    ));

    server.get('/services', servicesController.getAll);
    server.get('/services/:id', servicesController.getOne);
    server.post('/services', servicesController.createOne);
    server.patch('/services/:id', servicesController.updateOne);
    server.del('/services/:id', servicesController.removeOne);

};
