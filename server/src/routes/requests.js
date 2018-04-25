const basePath = require('./../middlewares/base-path.middleware')
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const permissionGuard = require('./../middlewares/permission-guard.middleware')(server, restify);
    const queryParser = require('./../middlewares/query-parser.middleware')(server, restify);
    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const requestsController = require('./../controllers/requests.controller')(server, restify);

    server.use(basePath(
        '/requests', authGuard
    ));
    

    /* CRUD */

    
    server.get('/requests', (req, res, next) => {
        const controller = new Controller({
            request: {
                id: (req.params.id) ? req.params.id : null,
                companyId: (req.query.companyId) ? req.query.companyId : null
            }
        })

        return requestsController.getAll(controller).then((request) => {
            if(!request){
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return res.send(200, { data: request })
        }).catch((err) => {
            console.log('catch da rota do requests all', err)
        })
    })

    server.get('/requests/:id', (req, res, next) => {

        const controller = new Controller({
            request: {
                id: req.params.id,
                companyId: (req.query.companyId) ? req.query.companyId : null
            }
        })

        return requestsController.getOne(controller).then((request) => {
            if(!request){
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return res.send(200, { data: request })
        }).catch((err) => {
            console.log('catch da rota do requests all', err)
        })
    })

    server.post('/requests', (req, res, next) => {
        server.broker.call('data/request.create', {
            data: {
                companyId: 1
            }
        }).then((request) => {
            return res.send(200, request)
        }).catch((err) => {
            console.log(err)
        })
    })



};