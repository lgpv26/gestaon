const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const devicesController = require('./../controllers/devices.controller')(server, restify);
    const commandsController = require('./../controllers/commands.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/devices', authGuard
    ));

    server.get('/devices', devicesController.getAll);
    server.post('/devices', devicesController.createOne);
    server.patch('/devices/:id', devicesController.updateOne);
    server.get('/devices/:id', devicesController.getOne);
    server.del('/devices/:id', devicesController.removeOne);

    server.post('/devices/:id/commands', commandsController.createOne);

};
