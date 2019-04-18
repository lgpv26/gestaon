const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const clientsAddressesController = require('./../controllers/clients-addresses.controller')(server, restify);

    server.use(basePath(
        '/clients-addresses', authGuard
    ));

    /* CRUD */

    server.get('/clients-addresses/:id', (req, res, next) => {
        clientsAddressesController.getOneAddress(req).then((address) => {
            if (!address || address.length < 1) {
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return address 
        })
    })
    /*server.del('/clients-addresses/:id', clientsAddressesController.removeOne);*/

};
