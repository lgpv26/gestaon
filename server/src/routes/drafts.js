const _ = require('lodash');
const basePath = require('./../middlewares/base-path.middleware');

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const draftsController = require('./../controllers/drafts.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/drafts', authGuard
    ));

    server.get('/drafts', (req, res, next) => {
        draftsController.getAll().then((getAllResult) => {
            if(!getAllResult || getAllResult.length < 1){
                return next(
                    new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                );
            }
            return res.send(200, getAllResult)
        }).catch((err) => {
            return console.log(err)
        })
    });

    server.post('/drafts', (req, res, next) => {     
        draftsController.createOne(req).then((draft) => {
            let ids = Object.keys(server.io.sockets.connected);
            ids.forEach(function(id) {
                const socket = server.io.sockets.connected[id]
                if(_.includes(socket.user.companies, parseInt(req.query.companyId))){
                    socket.join('draft/' + draft.draftId);
                }
            })

            return res.send(200, draft)
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

   
    server.patch('/drafts/:draftId', (req, res,next) => {
        const draftUpdate = _.assign(req.body, {draftId: parseInt(req.params.draftId)})
        draftsController.updateDraft(draftUpdate).then((getUpdateResult) => {
            if(getUpdateResult.nModified < 1){
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

    
    server.del('/drafts', (req, res,next) => {
        draftsController.removeAll()

    });    
};
