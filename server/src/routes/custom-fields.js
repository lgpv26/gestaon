const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const customFieldsController = require('./../controllers/custom-fields.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/companies', authGuard
    ));

    /* Users CRUD */

    server.get('/custom-fields/', (req, res, next) => {
        customFieldsController.getCustomFields(req).then((getAllResult) => {
            if (!getAllResult || getAllResult.length < 1) {
                return next(
                    new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                );
            }
            return res.send(200, { data: getAllResult })
        })
    })

    server.get('/custom-fields/:customFieldId', (req, res, next) => {
        customFieldsController.getOne(req).then((getResult) => {
            if (!getResult || getResult.length < 1) {
                return next(
                    new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                );
            }
            return res.send(200, { data: getResult })
        })
    })

    server.patch('/custom-fields', (req, res, next) => {
        customFieldsController.saveCustomFields(req).then((customFieldPatch) => {
            return res.send(200, { data: customFieldPatch })
        })
    })

    server.del('/custom-fields/:customFieldId', (req, res, next) => {
        customFieldsController.removeOne(req).then((removedCustomField) => {
            return res.send(200, { data: removedCustomField })
        })
    })


    /*server.put('/companies/:companyId/users/:userId/permissions', companiesController.companyUserPermissionsSaveMultiple);*/

};
