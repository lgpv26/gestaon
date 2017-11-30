const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const serviceController = require('./../controllers/service.controller')(server, restify);

    server.use(basePath(
        '/service', authGuard
    ));

    server.get('/service/search', (req, res, next) => {
        serviceController.search(req).then((searchResult) => {
            return res.send(200, { data: searchResult })
        }).catch((err) => {
            return console.log(err)
        })
    })

    //server.get('/service/find-clients', serviceController.findClients);
    
    /* CRUD */
    /*
    server.patch('/devices/:id', devicesController.updateOne);
    server.get('/devices/:id', devicesController.getOne);
    server.del('/devices/:id', devicesController.removeOne);*/

};
