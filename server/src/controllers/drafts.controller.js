const utils = require('../utils');
const _ = require('lodash');
const Q = require('q');

module.exports = (server, restify) => {
    return {

        getOne(draftId) {
            return server.mongodb.Draft.findOne({ draftId: draftId }).then((draft) => {
                draft = JSON.parse(JSON.stringify(draft))
                return draft
            })
        },

        getAll(req) {
            return server.mongodb.Draft.find({ companyId: req.query.companyId }).then((drafts) => {
                drafts = JSON.parse(JSON.stringify(drafts))
                return server.mysql.User.findAll({
                    include: [{
                        model: server.mysql.CompanyUser,
                        as: 'userCompanies',
                        where: {
                            companyId: req.query.companyId
                        }
                    }]
                }).then((user) => {
                    _.map(drafts, (draft, index) => {
                        _.find(user, (userDraft) => {
                            if (userDraft.id === draft.createdBy) {
                                drafts[index] = _.assignIn(draft, { createdBy: userDraft.name })
                            }
                        })
                    })
                    return drafts
                }).catch((err) => {
                    err
                })
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
                req.body.createdBy = req.auth.id
                req.body.companyId = req.query.companyId,
                    req.body.presence = []
                return server.mongodb.Draft.create(req.body).then((draft) => {

                    draft = JSON.parse(JSON.stringify(draft))
                    draft = _.assignIn(draft, { createdBy: req.auth.name }) // change createdBy to user name for emit to all users

                    // check socket connections and emit 
                    let ids = Object.keys(server.io.sockets.connected)
                    ids.forEach(function (id) {
                        const socket = server.io.sockets.connected[id]

                        if (_.includes(socket.user.companies, parseInt(req.query.companyId))) {
                            socket.join('draft/' + draft.draftId)
                        }
                        const companyActiveId = (socket.user.activeCompanyUserId) ? socket.user.activeCompanyUserId : socket.user.companies[0]
                        if (parseInt(req.query.companyId) === parseInt(companyActiveId)) {
                            socket.emit('draftCreated', { data: draft, emittedBy: req.auth.id })
                        }
                    })

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
                return server.mongodb.Draft.update({ draftId: draftReq.draftId }, { $set: { form: draftObjUpdate } }).then((draft) => {
                    return draft
                }).catch((err) => {
                    return err
                });
            })
        },

        checkPresence(draftId) {
            return server.mongodb.Draft.findOne({ draftId: draftId }).then((draft) => {
                draft = JSON.parse(JSON.stringify(draft))
                return (draft.presence) ? draft.presence : null
            })
        },

        checkAllPresence() {
            return server.mongodb.Draft.find({}).then((drafts) => {
                let presenceUsers = []
                drafts.forEach((draft) => {
                    presenceUsers.push({draftId: draft.draftId, presence: draft.presence})
                })
                return presenceUsers
            })
        },

        newPresenceUser(draftId, objPresenceUser) {
            return new Promise((resolve, reject) => {
                server.mongodb.Draft.findOne({ draftId: draftId }).then((draftConsult) => {
                    draftConsult.presence.push(objPresenceUser)
                    resolve(draftConsult.presence)
                }).catch((err) => {
                    reject(err)
                })
            }).then((presenceUpdate) => {
                return this.savePresenceUser(draftId, presenceUpdate).then(() => {
                    return presenceUpdate
                })
            })
        },

        savePresenceUser(draftId, presenceUpdate) {
            return new Promise((resolve, reject) => {
                return server.mongodb.Draft.update({ draftId: draftId }, { $set: { presence: presenceUpdate } }).then((draft) => {
                    resolve(presenceUpdate)
                }).catch((err) => {
                    reject(err)
                })
            }).then((updatedPresence) => {
                return updatedPresence
            })           
        },

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
