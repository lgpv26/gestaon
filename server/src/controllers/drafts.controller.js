const utils = require('../utils');
const _ = require('lodash');
const Q = require('q');

module.exports = (server, restify) => {
    return {
        getAll() {
            return server.mongodb.Draft.find().then((drafts) => {
                return drafts
            }).catch((err) => {
                return err
            })
        },

        createOne(req) {
            return server.mongodb.Draft.findOne().sort({ _id: -1 }).then((draftIdNext) => {
                if (draftIdNext) {
                    return draftIdNext.draftId + 1
                }
                return 1
            }).then((seq) => {
                req.body.draftId = seq
                req.body.userId = req.auth.id
                req.body.companyId = req.query.companyId
                return server.mongodb.Draft.create(req.body).then((draft) => {
                    return draft
                }).catch((err) => {
                    return err
                });
            })
        },

        updateDraft(draftReq) {
            return new Promise((resolve, reject) => {
                server.mongodb.Draft.findOne({ draftId: draftReq.draftId }).then((draftConsult) => {
                    resolve(_.mergeWith(draftConsult.form, draftReq.form))
                }).catch((err) => {
                    reject(err)
                })
            }).then((draftObjUpdate) => {
                return server.mongodb.Draft.update({ draftId: draftReq.draftId }, { $set: {form: draftObjUpdate} }).then((draft) => {
                    return draft
                }).catch((err) => {
                    return err
                });
            })
        },

        /*



 return new Promise((resolve, reject) => {
                server.mongodb.Draft.findOne({ draftId: req.params.draftId }).then((draft) => {
                    resolve(_.merge(draft, req.body))
                }).catch((err) => {
                    reject(err)
                })
            }).then((draftObjUpdate) => {
                server.mongodb.Draft.update({ draftId: req.params.draftId }, { $set: draftObjUpdate }).then((draft) => {
                    if (!draft) {
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    return res.send(200, {
                        data: draft
                    });
                }).catch((err) => {
                    return next(
                        new restify.InternalServerError({
                            body: {
                                "code": err.name,
                                "message": err.message,
                                "detailed": err
                            }
                        })
                    );
                });
            })

    */
        removeAll() {
            server.mongodb.Draft.remove({}, (err, service) => {
                if (err) {
                    return next(
                        new restify.InternalServerError({
                            body: {
                                "code": err.name,
                                "message": err.message,
                                "detailed": err
                            }
                        })
                    );
                };
                return res.send(200, {
                    data: "OK"
                });
            });
        }
    }
};
