const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const eventsController = require('./../controllers/events.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/events', authGuard
    ));

    server.post('/events/filter', eventsController.filter);
    server.get('/events', eventsController.getAll);
    server.post('/events', eventsController.createOne);
    server.patch('/events/:id', eventsController.updateOne);
    server.get('/events/:id', eventsController.getOne);
    server.del('/events/:id', eventsController.removeOne);

};
