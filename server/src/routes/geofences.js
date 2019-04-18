const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const geofencesController = require('./../controllers/geofences.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/geofences', authGuard
    ));

    server.get('/geofences', geofencesController.getAll);
    server.post('/geofences', geofencesController.createOne);
    server.get('/geofences/:id', geofencesController.getOne);
    server.patch('/geofences/:id', geofencesController.updateOne);
    server.del('/geofences/:id', geofencesController.removeOne);

    server.post('/geofences/check-position', geofencesController.checkPosition);

};
