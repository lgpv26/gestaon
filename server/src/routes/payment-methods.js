const basePath = require('./../middlewares/base-path.middleware')
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const permissionGuard = require('./../middlewares/permission-guard.middleware')(server, restify);
    const queryParser = require('./../middlewares/query-parser.middleware')(server, restify);
    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const paymentMethodsController = require('./../controllers/payment-methods.controller')(server, restify);

    server.use(basePath(
        '/payment-methods', authGuard
    ));
    

    /* CRUD */

    server.get('/payment-methods', (req, res, next) => {
        const controller = new Controller({
            companyId: (req.query.companyId) ? req.query.companyId : null,
            request: {
                queryParser: {
                    companyId: (req.query.companyId) ? req.query.companyId : null
                }
            }
        })
        return paymentMethodsController.getAll(controller).then((paymentMethods) => {
            if(!paymentMethods){
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return res.send(200, { data: paymentMethods })
        }).catch((err) => {
            console.log('catch da rota do payment methods all', err)
        })
    })

    server.post('/payment-methods', (req, res, next) => {

        const controller = new Controller({
            companyId: (req.query.companyId) ? req.query.companyId : null,
            request: {
                queryParser: {
                    companyId: (req.query.companyId) ? req.query.companyId : null
                },
                data: req.body
            }
        })
        return paymentMethodsController.createOne(controller).then((paymentMethod) => {
            if(!paymentMethod){
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return res.send(200, { data: paymentMethod })
        }).catch((err) => {
            console.log('catch da rota do payment methods post', err)
        })
    })

    server.patch('/payment-methods/:id', (req, res, next) => {

        const controller = new Controller({
            companyId: (req.query.companyId) ? req.query.companyId : null,
            request: {
                params: {
                    id: req.params.id
                },
                queryParser: {
                    companyId: (req.query.companyId) ? req.query.companyId : null
                },
                data: req.body
            }
        })
        return paymentMethodsController.updateOne(controller).then((paymentMethod) => {
            if(!paymentMethod){
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return res.send(200, { data: paymentMethod })
        }).catch((err) => {
            console.log('catch da rota do payment methods patch', err)
        })
    })



};