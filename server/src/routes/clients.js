const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const clientsController = require('./../controllers/clients.controller')(server, restify);

    server.use(basePath(
        '/clients', authGuard
    ));

    /* CRUD */

    server.get('/clients', clientsController.getAll);
    server.get('/clients/:id', clientsController.getOne);
    server.post('/clients', clientsController.createOne);
    server.patch('/clients/:id', clientsController.updateOne);

    server.get('/clients/:id/addresses', clientsController.getAddresses);
    server.del('/clients/:id/addresses/:clientAddressId', clientsController.removeOneAddress);
    server.patch('/clients/:id/addresses', clientsController.saveAddresses);

    server.get('/clients/:id/phones', clientsController.getPhones);
    server.del('/clients/:id/phones/:clientPhoneId', clientsController.removeOnePhone);
    server.patch('/clients/:id/phones', clientsController.savePhones);

    server.post('/clients/export-to-es', clientsController.exportToES);

    /*
    server.del('/devices/:id', devicesController.removeOne);*/

};
