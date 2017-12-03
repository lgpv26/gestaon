const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const companiesController = require('./../controllers/companies.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/companies', authGuard
    ));

    /* Users CRUD */

    server.get('/companies', companiesController.getAll);
    server.post('/companies', companiesController.createOne);
    server.get('/companies/:id', companiesController.getOne);
    server.get('/companies/:id/active', companiesController.getOneAndSetActive);
    server.put('/companies/:id', companiesController.updateOne);
    server.patch('/companies/:id/settings', companiesController.updateOneSettings);
    server.del('/companies/:id', companiesController.removeOne);
    server.get('/companies/:companyId/users', companiesController.companyUsersGetAll);
    server.del('/companies/:companyId/users/:userId', companiesController.companyUsersRemoveOne);
    server.post('/companies/:companyId/users/permissions', companiesController.companyUsersPermissionsSaveMultiple);
    /*server.put('/companies/:companyId/users/:userId/permissions', companiesController.companyUserPermissionsSaveMultiple);*/

};
