const utils = require('../utils');
const _ = require('lodash')
const Op = require('sequelize').Op

module.exports = (server, restify) => {
    const clientsController = require('./../controllers/clients.controller')(server)
    const addressesController = require('./../controllers/addresses.controller')(server)

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
                    console.log(err)
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
                    presenceUsers.push({ draftId: draft.draftId, presence: draft.presence })
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

        selectClient(clientSelect) {
            return this.getOne(clientSelect.draftId).then((draft) => {
                const req = { params: { id: clientSelect.clientId } }
                return clientsController.getOne(req).then((client) => {
                    client = JSON.parse(JSON.stringify(client))
                    const update = _.assign(draft.form, { client: client, clientAddressForm: {}, clientAddressId: null })
                    return server.mongodb.Draft.update({ draftId: clientSelect.draftId }, { $set: { form: update } }).then(() => {
                        return client
                    })
                })
            })
        },

        resetClient(clientReset) {
            return this.getOne(clientReset.draftId).then((draft) => {
                const update = _.assign(draft.form, { client: {}, clientAddressForm: {}, clientAddressId: null })
                return server.mongodb.Draft.update({ draftId: clientReset.draftId }, { $set: { form: update } }).then(() => {
                    return null
                })
            })
        },

        selectAddressClientAddress(addressSelect) {
            return this.getOne(addressSelect.draftId).then((draft) => {
                const req = { params: { id: addressSelect.addressId } }
                return addressesController.getOne(req).then((address) => {
                    address = JSON.parse(JSON.stringify(address))
                    

                    const clientAddressForm = _.assign(draft.form.clientAddressForm, {id: (addressSelect.clientAddressId) ? addressSelect.clientAddressId : null , address: address})
                    const update = _.assign(draft.form, {clientAddressForm: clientAddressForm})

                    return server.mongodb.Draft.update({ draftId: addressSelect.draftId }, { $set: { form: update } }).then(() => {
                        return address
                    })
                })
            })
        },

        resetAddressClientAddress(addressReset) {
            return this.getOne(addressReset.draftId).then((draft) => {
                const formAddress = _.assign(draft.form.clientAddressForm, { address: {} })
                const update = _.assign(draft.form, { clientAddressForm: formAddress })
                return server.mongodb.Draft.update({ draftId: addressReset.draftId }, { $set: { form: update } }).then(() => {
                    return null
                })
            })
        },

        clientAddressBack(addressBack) {
            return this.getOne(addressBack.draftId).then((draft) => {
                const update = _.assign(draft.form, { clientAddressForm: {} })
                return server.mongodb.Draft.update({ draftId: addressBack.draftId }, { $set: { form: update } }).then(() => {
                    return null
                })
            })
        },

        saveClientAddress(clientAddressSave) {
            return new Promise((resolve, reject) => {
                return server.mongodb.Draft.findOne({ draftId: clientAddressSave.draftId }).then((draft) => {
                    draft = JSON.parse(JSON.stringify(draft))
                    const index = _.findIndex(draft.form.client.clientAddresses, (clientAddress) => {
                        return clientAddress.id === draft.form.clientAddressForm.id
                    })
                    let saveClientAddresses = draft.form.client.clientAddresses
                    let update = {}

                    if (index !== -1) {

                        const address = _.assign(saveClientAddresses[index].address, draft.form.clientAddressForm.address)
                        const clientAddressForm = _.assign(draft.form.clientAddressForm, {address: address})
                        saveClientAddresses[index] = _.assign(saveClientAddresses[index], clientAddressForm)
                        update.addressClientReturn = _.assign(saveClientAddresses[index], clientAddressForm)
                    }
                    else {
                        saveClientAddresses.push(draft.form.clientAddressForm)
                        update.addressClientReturn = draft.form.clientAddressForm
                    }

                    const client = _.assign(draft.form.client, {clientAddresses: saveClientAddresses})
                    update.form = _.assign(draft.form, {client: client, clientAddressForm: {}})

                    resolve(update)
                })
            }).then((save) => {
                return server.mongodb.Draft.update({ draftId: clientAddressSave.draftId }, { $set: { form: save.form } }).then(() => {
                    return save.addressClientReturn
                })
            })
        },

        removeClientAddress(clientAddressRemove) {
            return new Promise((resolve, reject) => {
                return server.mongodb.Draft.findOne({ draftId: clientAddressRemove.draftId }).then((draft) => {
                    draft = JSON.parse(JSON.stringify(draft))
                    let update = {}
                    update.saveClientAddresses = _.filter(draft.form.client.clientAddresses, (clientAddress) => {
                        return clientAddress.id !== clientAddressRemove.clientAddressId
                    })

                    update.clientAddressId = clientAddressRemove.clientAddressId

                    const client = _.assign(draft.form.client, {clientAddresses: update.saveClientAddresses})
                    update.form = _.assign(draft.form, {client: client, clientAddressForm: {}, })

                    resolve(update)
                })
            }).then((save) => {
                return server.mongodb.Draft.update({ draftId: clientAddressRemove.draftId }, { $set: { form: save.form } }).then(() => {
                    return save.clientAddressId
                })
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
