import _ from "lodash"
const basePath = require('./../middlewares/base-path.middleware')

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify)

    /* CRUD */

    server.use(basePath(
        '/positions', authGuard
    ))

    
    server.get("/positions", authGuard, (req, res, next) => {
        return server.broker.call("data/position.getAll", {
            order: [['dateCreated', 'DESC']]
        })
        .then((positions) => {
            return res.send(200, {success: true, data: positions})
        })
    })

    server.get("/positions/:deviceId", authGuard, (req, res, next) => {
        let sort = null
        if(req.query.sort){
            sort = req.query.sort.split(",")
            if(sort.length != 2) res.send(200, {success: false, message: "Erro ao ordenar!"})
        }
        return server.broker.call("data/position.getAll", {
            order: (sort) ? [[sort[0], sort[1]]] : [['dateCreated', 'DESC']],
            where: {
                deviceId: req.params.deviceId
            },
            limit: (req.query.limit) ? parseInt(req.query.limit) : null,
            offset: (req.query.offset) ?  parseInt(req.query.offset) : null
        })
        .then((positions) => {
            return res.send(200, {success: true, data: positions})
        })
        .catch((err) => {
            console.log(err)
        })
    })
    /*
    server.get('/devices', positionsController.getAll);
    server.post('/devices', devicesController.createOne);
    server.put('/devices/:id', devicesController.updateOne);
    server.get('/devices/:id', devicesController.getOne);
    server.get('/devices/:id', devicesController.removeOne);
    */
};
