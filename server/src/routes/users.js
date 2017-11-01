const basePath = require('./../middlewares/base-path.middleware');
const queryParserMiddleware = require('./../middlewares/query-parser.middleware');

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

    server.get('/users', queryParserMiddleware, usersController.getAll);
    server.post('/users', usersController.createOne);
    server.get('/users/:id', usersController.getOne);
    server.patch('/users/:id', usersController.updateOne);
    server.del('/users/:id', usersController.removeOne);

};
