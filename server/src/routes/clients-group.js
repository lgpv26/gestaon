const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const clientsGroupController = require('./../controllers/clients-group.controller')(server, restify);

    server.use(basePath(
        '/clients', authGuard
    ));

    /* CRUD */

    server.get('/clients-group', (req, res, next) => {
        clientsGroupController.getAll(req).then((getAllResult) => {
            if (!getAllResult || getAllResult.length < 1) {
                return next(
                    new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                );
            }
            return res.send(200, { data: getAllResult })
        })
    })

    server.get('/clients-group/:id', (req, res, next) => {
        clientsGroupController.getOne(req).then((getOne) => {
            if (!getOne || getOne.length < 1) {
                return next(
                    new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                );
            }
            return res.send(200, { data: getOne })
        })
    })

    server.del('/clients-group/:id', (req, res, next) => {
        clientsGroupController.removeOne(req).then((clientsGroupDeleted) => {
            return res.send(200, { data: clientsGroupDeleted })
        }).catch((err) => {
            console.log(err)
        });
    })    

    server.patch('/clients-group', (req, res, next) => {
        clientsGroupController.saveClientsGroup(req).then((clientGroupPatch) => {
            return res.send(200, { data: clientGroupPatch })
        })
    })

};