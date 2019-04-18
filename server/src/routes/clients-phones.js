const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const clientsPhonesController = require('./../controllers/clients-phones.controller')(server, restify);

    server.use(basePath(
        '/clients-phones', authGuard
    ));

    /* CRUD */

    server.get('/clients-phones/:id', (req, res, next) => {
        clientsPhonesController.getOnePhone(req).then((getAllResult) => {
            if (!getAllResult || getAllResult.length < 1) {
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return getAllResult 
        })
    })

    server.patch('/clients-phones', (req, res, next) => {
        clientsPhonesController.savePhones(req).then((phone) => {
            return res.send(200, { data: phone })
        })
    })
};
