const { Request, Response } = require('oauth2-server');
const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    server.post('/oauth/authenticate', (req, res, next) => {
        const request = new Request(req);
        const response = new Response(res);
        return server.oAuth2.authenticate(request, response).then((token) => {
            return res.send(200, {
                token
            });
        }).catch((err) => {
            return next(err);
        });
    });

    server.post('/oauth/authorize', (req, res, next) => {
        const request = new Request(req);
        const response = new Response(res);
        return server.oAuth2.authorize(request, response).then((code) => {
            return res.send(200, {
                code
            });
        }).catch((err) => {
            return next(err);
        });
    });

    server.post('/oauth/token', (req, res, next) => {
        const request = new Request(req);
        const response = new Response(res);
        return server.oAuth2.token(request, response, {
            accessTokenLifetime: 3600
        }).then((token) => {
            return res.send(200, {
               data: token
            });
        }).catch((err) => {
            return next(err);
        });
    });

    server.post('/oauth/verify-token', authGuard, (req, res, next) => {
        return res.send(200, {
            data: "Valid token."
        });
    });

};