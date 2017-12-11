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
        this.setSocketDraftListeners()
    }

    setSocketDraftListeners() {
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

    resetTimeout(removeUpdate = false) {
        if (removeUpdate) {
            this.findDraftInArray(removeUpdate).then((index) => {
                this.channels.updates.drafts.splice(index, 1)
            })
        }

        if (this._timer) clearTimeout(this._timer)
    }

    onPresenceUpdate(presenceUser) {
        if (presenceUser.leave) {
            const objPresenceUser = { name: this.socket.user.name, email: this.socket.user.email }
            this.onLeavePresence(presenceUser.draftId, objPresenceUser)
        }
        else {
            this.setArrayDraft({ draftId: presenceUser.draftId }).then(() => {
                this.saveDraft(presenceUser.draftId, true)

                this.socket.join('draft/' + presenceUser.draftId)

                let objPresenceUser = {}

                if (presenceUser.userId === this.socket.user.id) {
                    objPresenceUser.email = this.socket.user.email
                    objPresenceUser.name = this.socket.user.name
                }

                if (this._timer) clearTimeout(this._timer)
                return this.controller.checkPresence(presenceUser.draftId).then((presence) => {
                    if (presence) {
                        const repeatUser = _.find(presence, (user) => {
                            return JSON.stringify(user.email) === JSON.stringify(objPresenceUser.email)
                        })
                        if (!repeatUser) this.controller.newPresenceUser(presenceUser.draftId, objPresenceUser).then((newPresence) => {
                            this.server.io.in('draft/' + presenceUser.draftId).emit('presenceDraft', newPresence)

                        }).catch(() => {
                            console.log('catch do NEW PRESENCEUSER - QUE É UM IF DENTRO DO CHECKPRESENCE')
                        })
                    }
                    else {
                        this.controller.newPresenceUser(presenceUser.draftId, objPresenceUser).then((newPresence) => {
                            this.server.io.in('draft/' + presenceUser.draftId).emit('presenceDraft', newPresence)
                        }).catch(() => {
                            console.log('catch do NEW PRESENCEUSER - QUE É NO ELSE DENTRO DO CHECKPRESENCE')
                        })
                    }
                }).catch(() => {
                    console.log('catch do CHECKPRESENCE')
                })
            }).catch(() => {
                console.log('catch do SET ARRAY DRAFT (QUE ESTA DENTRO DO ON PRESENCE DRAFT)')
            })

        }
    }

    onUpdateDraft(contentDraft) {
        this.socket.broadcast.in('draft/' + contentDraft.draftId).emit('updateDraft', contentDraft)

        this.setArrayDraft(contentDraft).then(() => {
            this.timerSocketUpdate(contentDraft.draftId)
        }).catch(() => {
            console.log('catch do SET ARRAY DENTRO DO ONUPDATEDRAFT')
        })
    }

    onLeavePresence(draftId, objPresenceUser) {
        this.socket.leave('draft/' + draftId)
        return new Promise((resolve, reject) => {
            this.controller.checkPresence(draftId).then((presence) => {
                // JSON.parse(JSON.stringify(presence))
                presence = _.filter(presence, (user, index) => {
                    if (user.email !== objPresenceUser.email) {
                        return user
                    }
                })
                resolve(presence)
            }).catch(() => {
                console.log('catch do CHECK PRESENCE - DENTRO DO ONLEAVE PRESENCE')
            })
        }).then((userPresence) => {
            this.controller.savePresenceUser(draftId, userPresence).then((newPresence) => {
                this.server.io.in('draft/' + draftId).emit('presenceDraft', newPresence)
            }).catch(() => {
                console.log('catch do SAVEPRESENCEUSER - DENTRO DO LEAVE PRESENCE')
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
        }).catch(() => {
            console.log('catch do SET ARRAY DRAFT MESMO')
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
        }).then((index) => {
            return index
        }).catch(() => {
            console.log('catch do FIND DRAFTIN ARRAY')
        })
    }

    consultDraft(draftId) {
        this.controller.getOne(draftId).then((draft) => {
            this.socket.emit('updateDraft', { draftId: draftId, form: draft.form })
        }).catch(() => {
            console.log('catch do CONSULTDRAFT')
        })
    }

    saveDraft(draftId, userEntry = false) {
        return new Promise((resolve, reject) => {
            this.findDraftInArray(draftId).then((index) => {
                if (index !== -1) {
                    this.controller.updateDraft(this.channels.updates.drafts[index]).then(() => {
                        this.socket.emit('draftSaved')
                        this.channels.updates.drafts.splice(index, 1)
                        if (userEntry) {
                            this.consultDraft(draftId)
                        }
                        resolve()
                    }).catch(() => {
                        console.log('catch do UPDATEDRAFT - QUE TA DENTRO DO SAVEDRAFT')
                        reject()
                    })
                }
                else {
                    resolve()
                }                
            }).catch(() => {
                console.log('catch do FINDDRAFTIN ARRAY - DENTRO DO SAVEDRAFT')
                reject()
            })
        })
    }

    onSocketDisconnect() {
        this.controller.checkAllPresence().then((presence) => {
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
                    }).catch(() => {
                        console.log('catch do SAVEPRESENCE USER - DENTRO DO SOCKET DISCONECT')
                    })
                }
            })
        }).catch(() => {
            console.log('catch do CHECKALL PRESENCE - NO ON SOCKET DISCONECCT')
        })
    }
}