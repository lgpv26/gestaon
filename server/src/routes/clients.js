const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const clientsController = require('./../controllers/clients.controller')(server, restify);

    server.use(basePath(
        '/clients', authGuard
    ));

    /* SEARCH */

    server.get('/clients/search', (req, res, next) => {
        clientsController.search(req).then((searchResult) => {
            return res.send(200, { data: searchResult })
        }).catch((err) => {
            return console.log(err)
        })
    })

    /* CRUD */

    server.get('/clients', clientsController.getAll);
    server.get('/clients/:id', clientsController.getOne);
    server.post('/clients', clientsController.createOne);
    server.patch('/clients/:id', clientsController.updateOne);

    // ADDRESS //
    server.get('/clients/:id/addresses', (req, res, next) => {
        clientsController.getAddresses(req).then((getAllResult) => {
            if (!getAllResult || getAllResult.length < 1) {
                return next(
                    new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                );
            }
            return res.send(200, { data: getAllResult })
        })
    })
    server.del('/clients/:id/addresses/:clientAddressId', (req, res, next) => {
        clientsController.removeOneAddress(req).then((addressDeleted) => {
            return res.send(200, { data: addressDeleted })
        }).catch((err) => {
            console.log(err)
        });
    })    
    server.patch('/clients/:id/addresses', (req, res, next) => {
        clientsController.saveAddresses(req).then((addressPatch) => {
            return res.send(200, { data: addressPatch })
        })
    })

    // PHONES //
    server.get('/clients/:id/phones', clientsController.getPhones);
    server.del('/clients/:id/phones/:clientPhoneId', clientsController.removeOnePhone);
    server.patch('/clients/:id/phones', clientsController.savePhones);

    // CUSTOM FIELDS //
    server.get('/clients/:id/customFields', clientsController.getCustomFields);
    server.del('/clients/:id/customFields/:customFieldId', clientsController.removeOneCustomField);
    server.patch('/clients/:id/customFields', clientsController.saveCustomFields);

    server.post('/clients/export-to-es', clientsController.exportToES);

    /*
    server.del('/devices/:id', devicesController.removeOne);*/

};
