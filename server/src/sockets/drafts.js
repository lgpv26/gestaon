const basePath = require('./../middlewares/base-path.middleware');
const _ = require('lodash');

module.exports = class Drafts {

    constructor(server, channels, socket) {
        // global variabels
        this.server = server
        this.channels = channels
        this.socket = socket
        this.controller = require('./../controllers/drafts.controller')(server)

        // local variables
        this._timer = null

        // functions
        this.setSocketListeners()
    }

    setSocketListeners() {

        this.socket.on('presence-update-draft', (presenceUser) => {
            this.onPresenceUpdate(presenceUser)

        })

        this.socket.on('update-draft', (contentDraft) => {
            this.onUpdateDraft(contentDraft)
        })


        // VER IMPLEMENTAR EVENT ON RECONECT OU SIMILAR - ATÉ O YOSHIU FALAR 

        this.socket.on('disconnect', () => {
            this.onSocketDisconnect()
        })
    }

    onPresenceUpdate(presenceUser) {
        if (presenceUser.leave) {
            const objPresenceUser = { name: this.socket.user.name, email: this.socket.user.email }
            this.onLeavePresence(presenceUser.draftId, objPresenceUser)
        }
        else {
            this.setArrayDraft({ draftId: presenceUser.draftId }).then(() => {
                if (this._timer) clearTimeout(this._timer)
                this.saveDraft(presenceUser.draftId, true)

                this.socket.join('draft/' + presenceUser.draftId)

                let objPresenceUser = {}

                if (presenceUser.userId === this.socket.user.id) {
                    objPresenceUser.email = this.socket.user.email
                    objPresenceUser.name = this.socket.user.name
                }


                return this.controller.checkPresence(presenceUser.draftId).then((presence) => {
                    if (presence) {
                        const repeatUser = _.find(presence, (user) => {
                            return JSON.stringify(user.email) === JSON.stringify(objPresenceUser.email)
                        })
                        if (!repeatUser) this.controller.newPresenceUser(presenceUser.draftId, objPresenceUser).then((newPresence) => {
                            this.server.io.in('draft/' + presenceUser.draftId).emit('presenceDraft', newPresence)

                        })
                    }
                    else {
                        this.controller.newPresenceUser(presenceUser.draftId, objPresenceUser).then((newPresence) => {
                            this.server.io.in('draft/' + presenceUser.draftId).emit('presenceDraft', newPresence)
                        })
                    }
                })
            })

        }
    }

    onUpdateDraft(contentDraft) {
        this.socket.broadcast.in('draft/' + contentDraft.draftId).emit('updateDraft', contentDraft)

        this.setArrayDraft(contentDraft).then(() => {
            this.timerSocketUpdate(contentDraft.draftId)
        })
    }

    onLeavePresence(draftId, objPresenceUser) {
        this.socket.leave('draft/' + draftId)
        return new Promise((resolve, reject) => {
            this.controller.checkPresence(draftId).then((presence) => {
                _.map(presence, (user, index) => {
                    if (user.email === objPresenceUser.email) {
                        return presence.splice(index, 1)
                    }
                })
                resolve(presence)
            })
        }).then((userPresence) => {
            this.controller.savePresenceUser(draftId, userPresence).then((newPresence) => {
                this.server.io.in('draft/' + draftId).emit('presenceDraft', newPresence)
            })
        })
    }

    setArrayDraft(contentDraft) {
        return new Promise((resolve, reject) => {
            const draft = _.find(this.channels.updates.drafts, { draftId: contentDraft.draftId })
            if (draft) {
                const draftUpdateIndex = this.channels.updates.drafts.indexOf(draft);
                this.channels.updates.drafts[draftUpdateIndex] = _.mergeWith(draft, contentDraft)
                resolve()
            }
            else {
                this.channels.updates.drafts.push(contentDraft)
                resolve()
            }
        })
    }

    timerSocketUpdate(draftId) {
        if (this._timer) clearTimeout(this._timer)
        //TIMEOUT to save form in MONGO
        this._timer = setTimeout(() => {
            this.saveDraft(draftId)
        }, 3000)
    }

    findDraftInArray(draftId) {
        return new Promise((resolve, reject) => {
            const index = _.findIndex(this.channels.updates.drafts, (draft) => {
                return draft.draftId === draftId;
            })
            resolve(index)
        })
    }

    consultDraft(draftId) {
        this.controller.getOne(draftId).then((draft) => {
            this.socket.emit('updateDraft', { draftId: draftId, form: draft.form })
        })
    }

    saveDraft(draftId, userEntry = false) {
        this.findDraftInArray(draftId).then((index) => {
            this.controller.updateDraft(this.channels.updates.drafts[index]).then(() => {
                this.socket.emit('draftSaved')
                this.channels.updates.drafts[index] = {}
                if (userEntry) {
                    this.consultDraft(draftId)
                }
            })
        })
    }

    onSocketDisconnect() {

        //this.socket.leave('draft/' + draftId)

        return this.controller.checkAllPresence().then((presence) => {
            _.map(presence, (tempDraft) => {
                const userFound = _.some(tempDraft.presence, (disconnectUser) => {
                    if (disconnectUser.name === this.socket.user.name && disconnectUser.email === this.socket.user.email) {
                        return true
                    }
                })
                tempDraft.presence = _.filter(tempDraft.presence, (disconnectUser) => {
                    return (disconnectUser.name !== this.socket.user.name && disconnectUser.email !== this.socket.user.email)
                })
                if (userFound) {
                    this.controller.savePresenceUser(tempDraft.draftId, tempDraft.presence).then((newPresence) => {
                        this.server.io.in('draft/' + tempDraft.draftId).emit('presenceDraft', tempDraft.presence)
                    })
                }
            })
        })
    }
}
/*

    socket.user.companies.forEach((company) => {
        server.mongodb.Draft.find({
            companyId: company
        }).exec().then((drafts) => {
            drafts.forEach((draft) => {
                socket.join('draft/' + draft.draftId);
            });
        }).catch((err) => {
            console.log(err);
        })
    })
    
*/