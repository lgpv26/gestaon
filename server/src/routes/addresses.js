const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const addressesController = require('./../controllers/addresses.controller')(server, restify);

    server.use(basePath(
        '/addresses', authGuard
    ));

    server.get('/addresses/search', addressesController.search);

    /* CRUD */

    /*server.get('/addresses', addressesController.getAll);*/
    server.get('/addresses/:id', (req, res, next) => {
        return server.broker.call('data/address.get', {
            data: {
                companyId: req.query.companyId,
                id: req.params.id
            }
        }).then((data) => {
            return res.send(200, { data })
        })
    })
    /*server.post('/addresses', addressesController.createOne);
    server.patch('/addresses/:id', addressesController.updateOne);
    */

    server.del('/addresses/:addressId', (req, res, next) => { 
        addressesController.removeOne(req).then((address) => {
            return res.send(200, { data: address })
        }).catch((err) => {
            return console.log(err)
        })
    })

    server.post('/addresses/export-to-es', addressesController.exportToES);

};
