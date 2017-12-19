const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const clientsController = require('./../controllers/clients.controller')(server, restify)

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
    server.get('/clients/:id', (req, res, next) => {
        clientsController.getOne(req).then((client) => {
            return client
        }).catch((err) => {
            console.log('catch da rota do client', err)
        })
    });
    server.post('/clients', (req, res, next) => {
        clientsController.createOne().then(() => {

        })
    });
    server.patch('/clients/:id', clientsController.updateOne);

    // CLIENTS GROUP //
    server.patch('/clients/:id/clients-group', (req, res, next) => {
        clientsController.saveClientsGroup(req).then((clientsGroupPatch) => {
            if (!clientsGroupPatch || clientsGroupPatch.length < 1) {
                return next(
                    new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                );
            }
            return res.send(200, { data: clientsGroupPatch })
        })
    })

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
    server.get('/clients/:id/phones', (req, res, next) => {
        clientsController.getPhones(req).then((getAllResult) => {
            if (!getAllResult || getAllResult.length < 1) {
                return next(
                    new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                );
            }
            return res.send(200, { data: getAllResult })
        })
    })
    
    server.del('/clients/:id/phones/:clientPhoneId', (req, res, next) => {
        clientsController.removeOnePhone(req).then((phoneDeleted) => {
            return res.send(200, { data: phoneDeleted })
        }).catch((err) => {
            console.log(err)
        });
    
    })

    server.patch('/clients/:id/phones', (req, res, next) => {
        clientsController.savePhones(req).then((phonePatch) => {
            return res.send(200, { data: phonePatch })
        })
    });

    // CUSTOM FIELDS //
    server.get('/clients/:id/custom-fields', (req, res, next) => {
        clientsController.getCustomFields(req).then((getAllResult) => {
            return res.send(200, { data: getAllResult })
        })
    })

    server.get('/clients/:id/custom-fields/:customFieldId', (req, res, next) => {
        clientsController.getOneCustomField(req).then((getResult) => {
            return res.send(200, { data: getResult })
        })
    })
    
    server.del('/clients/:id/custom-fields/:customFieldId', (req, res, next) => {
        clientsController.removeOneCustomField(req).then((customFieldDeleted) => {
            return res.send(200, { data: customFieldDeleted })
        })
    })

    server.patch('/clients/:id/custom-fields', (req, res, next) => {
        clientsController.saveCustomFields(req).then((customFieldPatch) => {
            return res.send(200, { data: customFieldPatch })
        })
    })

    server.post('/clients/export-to-es', clientsController.exportToES);
};