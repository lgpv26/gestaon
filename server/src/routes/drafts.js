const _ = require('lodash');
const basePath = require('./../middlewares/base-path.middleware');
const Controller = require('./../models/Controller')
import { HTTPError } from '~errors'

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const queryParser = require('./../middlewares/query-parser.middleware')(server, restify);
    const draftsController = require('./../controllers/drafts.controller')(server, restify);
    const clientsController = require('./../controllers/clients.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/drafts', authGuard
    ));

    server.get('/drafts', (req, res, next) => {
        draftsController.getAll(req).then((getAllResult) => {
            return res.send(200, { data: getAllResult })
        })
    })

    server.post('/drafts', (req, res, next) => {
        server.broker.call("draft.create", {
            data: {
                companyId: parseInt(req.query.companyId),
                type: req.body.type,
                data: req.body.data || {},
                createdBy: req.body.createdBy
            }
        }).then((draft) => {
            return res.send(200, { data: draft })
        }).catch((err) => {
            return next(new HTTPError(err.message, 500))
        })
    })

    server.patch('/drafts/:draftId', (req, res, next) => {
        const draftUpdate = _.assign(req.body, { draftId: parseInt(req.params.draftId) })
        draftsController.updateDraft(draftUpdate).then((getUpdateResult) => {
            if (getUpdateResult.nModified < 1) {
                return next(new restify.ResourceNotFoundError("Nenhum dado encontrado."))
            }
            return res.send(200, getUpdateResult)
        }).catch((err) => {
            return next(new restify.InternalServerError({
                body: {
                    "code": err.name,
                    "message": err.message,
                    "detailed": err
                }
            })
            );
        })
    });

    server.del('/drafts/:draftId', (req, res, next) => {
        server.broker.call("draft.remove", {
            data: {
                draftId: req.params.draftId,
                companyId: req.query.companyId,
                emittedBy: req.auth.id
            }
        }).then((draft) => {
            return res.send(200, { data: draft })
        }).catch((err) => {
            return next(new HTTPError(err.message, 500))
        })
    });
};
