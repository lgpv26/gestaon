const basePath = require('./../middlewares/base-path.middleware')
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    const usersController = require('./../controllers/users.controller')(server, restify);

    /* Authentication */

    server.post('/authenticate', usersController.authenticate);

    /* Registration */

    server.post('/register', usersController.register);

    /* Forgot your password */

    server.post('/forgot-password', usersController.forgotPassword);

    /* Me */

    server.get('/me', authGuard, usersController.me);

    /* Auth Guard for /users route prefix */

    server.use(basePath('/users', authGuard));

    /* Users CRUD */

    server.get('/users', (req, res, next) => {
        const controller = new Controller({
            companyId: (req.query.companyId) ? req.query.companyId : null,
            request: {
                queryParser: {
                    companyId: (req.query.companyId) ? req.query.companyId : null
                }
            }
        })
        return usersController.getAll(controller).then((users) => {
            if(!users){
                return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
            }
            return res.send(200, { data: users })
        }).catch((err) => {
            return next(
                new restify.InternalServerError({
                    body: {
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }
                })
            )
        })
    })

    server.post('/users', usersController.createOne);
    server.get('/users/:id', usersController.getOne);
    server.patch('/users/:id', usersController.updateOne);
    server.del('/users/:id', usersController.removeOne);

};
