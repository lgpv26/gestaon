module.exports = (server, restify) => {

    const positionsController = require('./../controllers/positions.controller')(server, restify);

    /* CRUD */

    // server.get('/', positionsController.createOne);

    server.post('/positions/filter', positionsController.getAll);

    /*
    server.get('/devices', positionsController.getAll);
    server.post('/devices', devicesController.createOne);
    server.put('/devices/:id', devicesController.updateOne);
    server.get('/devices/:id', devicesController.getOne);
    server.get('/devices/:id', devicesController.removeOne);
    */
};
