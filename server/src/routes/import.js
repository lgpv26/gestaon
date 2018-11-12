import shortid from "shortid"
import {Op} from "sequelize"
import pako from "pako"

const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const importController = require('./../controllers/import.controller')(server, restify);

    server.use(basePath(
        '/import', authGuard
    ));

    /* CRUD */

    server.post('/import/addresses', importController.importAddresses);

    /*
    server.patch('/devices/:id', devicesController.updateOne);
    server.get('/devices/:id', devicesController.getOne);
    server.del('/devices/:id', devicesController.removeOne);*/

};
