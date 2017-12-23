import { isArray } from 'util';

const basePath = require('../../middlewares/base-path.middleware');
const _ = require('lodash');

module.exports = class Draft {

    constructor(server, channels, socket) {
        // global variabels
        this.server = server
        this.channels = channels
        this.socket = socket
        this.controller = require('../../controllers/drafts.controller')(server)

        // local variables
        this._timer = null

        // functions
        this.setDraftEventListeners()
    }

    /**
     * Events on Request Listeners
     * 
     */
    setDraftEventListeners() {

        this.socket.on('draft:presence', (presenceUser) => {
            this.onPresenceUpdate(presenceUser)
        })

        this.socket.on('draft:update', (contentDraft) => {
            this.onDraftUpdate(contentDraft)
        })

        this.socket.on('disconnect', () => {
            this.onSocketDisconnect()
        })

        this.checkRedisPresence()
    }

        ///////////////////////
        ///     GENERAL     ///
        ///////////////////////
//
    /** 
     * Presence Update
     * @desc Controls users in room, draft loading
     *
     * @param {object} presenceUser expect: draftId, userId
     */
    onPresenceUpdate(presenceUser) {
        if (presenceUser.leave) {
            const objPresenceUser = { name: this.socket.user.name, email: this.socket.user.email }
            this.onLeavePresence(presenceUser.draftId, objPresenceUser)
            this.setRedisUserPresence({ draftId: null, userId: presenceUser.userId })
        }
        else {
            this.setArrayDraft({ draftId: presenceUser.draftId }).then(() => {
                this.saveDraft(presenceUser.draftId, true)

                this.setRedisUserPresence(presenceUser).then(() => {

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
                                this.server.io.in('draft/' + presenceUser.draftId).emit('draftPresence', newPresence)

                            }).catch(() => {
                                console.log('catch do NEW PRESENCEUSER - QUE É UM IF DENTRO DO CHECKPRESENCE')
                            })
                        }
                        else {
                            this.controller.newPresenceUser(presenceUser.draftId, objPresenceUser).then((newPresence) => {
                                this.server.io.in('draft/' + presenceUser.draftId).emit('draftPresence', newPresence)
                            }).catch(() => {
                                console.log('catch do NEW PRESENCEUSER - QUE É NO ELSE DENTRO DO CHECKPRESENCE')
                            })
                        }

                    }).catch(() => {
                        console.log('catch do CHECKPRESENCE')
                    })
                })
            }).catch(() => {
                console.log('catch do SET ARRAY DRAFT (QUE ESTA DENTRO DO ON PRESENCE DRAFT)')
            })

        }
    }

    /** 
     * Update Draft
     * @desc Controls draft's updates to server memory
     *
     * @param {any} contentDraft 
     */
    onDraftUpdate(contentDraft) {
        this.socket.broadcast.in('draft/' + contentDraft.draftId).emit('draftUpdate', contentDraft)

        const arrayPath = _.get(contentDraft, 'form.' + contentDraft.path)

        if (isArray(arrayPath)) {
            _.set(contentDraft, 'form.' + contentDraft.path,
                _.filter(arrayPath, (value) => {
                    return value !== null
                })
            )
        }
        if(contentDraft.path === 'activeStep'){
            this.setArrayDraft(contentDraft).then(() => {
                this.saveDraft(contentDraft.draftId)
            })
        }
        else {
            this.setArrayDraft(contentDraft).then(() => {
                this.timerSocketUpdate(contentDraft.draftId)
            }).catch(() => {
                console.log('catch do SET ARRAY DENTRO DO ONUPDATEDRAFT')
            })
        }
    }

    /** 
     * Socket Disconnect
     * @desc Removes the user from the room and presence (mongo) when him is disconnected
     * 
     */
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
                        this.server.io.in('draft/' + tempDraft.draftId).emit('draftPresence', tempDraft.presence)
                    }).catch(() => {
                        console.log('catch do SAVEPRESENCE USER - DENTRO DO SOCKET DISCONECT')
                    })
                }
            })
        }).catch(() => {
            console.log('catch do CHECKALL PRESENCE - NO ON SOCKET DISCONECCT')
        })
    }

    /** 
     * Check Redis Presence
     * @desc Check if the user is in a draft (presence) set by Redis
     * 
     * @return {} Puts the user in the draft's presence @property {Socket}
     */
    checkRedisPresence() {
        this.consultRedisUserPresence(this.socket.user.id).then((checkPresence) => {
            checkPresence = JSON.parse(checkPresence)
            if (checkPresence) this.socket.join('draft/' + checkPresence.draftId)
        })
    }
//

        ///////////////////////
        ///     TIMERS      ///
        ///////////////////////
//
    timerSocketUpdate(draftId) {
        if (this._timer) clearTimeout(this._timer)
        //TIMEOUT to save form in MONGO
        this._timer = setTimeout(() => {
            this.saveDraft(draftId)
        }, 3000)
    }

    resetTimeout(removeUpdate = false) {
        if (removeUpdate) {
            this.findDraftInArray(removeUpdate).then((index) => {
                this.channels.updates.drafts.splice(index, 1)
            })
        }

        if (this._timer) clearTimeout(this._timer)
    }
//
        /////////////////////////
        /// HELPERS FUNCTIONS ///
        /////////////////////////
//
    ///////////////////////////////////
    // HELPERS FUNCTIONS => PRESENCE //
    ///////////////////////////////////
    //
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
                    this.server.io.in('draft/' + draftId).emit('draftPresence', newPresence)
                }).catch(() => {
                    console.log('catch do SAVEPRESENCEUSER - DENTRO DO LEAVE PRESENCE')
                })
            })
        }
    //

    ////////////////////////////////
    // HELPERS FUNCTIONS => DRAFT //
    ////////////////////////////////
    //
        setArrayDraft(contentDraft) {
            return new Promise((resolve, reject) => {
                const draft = _.find(this.channels.updates.drafts, { draftId: contentDraft.draftId })
                const arrayPath = _.get(contentDraft, 'form.' + contentDraft.path)

                if (draft) {
                    const draftUpdateIndex = this.channels.updates.drafts.indexOf(draft)

                    const pathUpdate = _.get(this.channels.updates.drafts[draftUpdateIndex], 'form.' + contentDraft.path)

                    if (isArray(arrayPath)) {
                        const arrayIndex = _.findIndex(pathUpdate, (value) => {
                            return value.orderProductId === _.first(arrayPath).orderProductId
                        })

                        if(arrayIndex !== -1){
                            pathUpdate.splice(arrayIndex, 1, _.first(arrayPath))
                            _.set(contentDraft, 'form.' + contentDraft.path,
                                pathUpdate
                            )
                        }
                        else {
                            _.set(contentDraft, 'form.' + contentDraft.path,
                                _.concat((pathUpdate) ? pathUpdate : [], _.first(arrayPath))
                            )
                        }
                    }
                    this.channels.updates.drafts[draftUpdateIndex] = _.assignIn(draft, contentDraft)
                    resolve()
                }
                else {
                    this.channels.updates.drafts.push(_.assignIn(contentDraft, { hasArray: (isArray(arrayPath)) ? true : false, path: contentDraft.path }))
                    resolve()
                }
            }).catch((err) => {
                console.log(err, 'catch do SET ARRAY DRAFT MESMO')
            })
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
                this.socket.emit('draftUpdate', { draftId: draftId, form: draft.form, data: draft.data })
                this.server.redisClient.hgetall('draft:' + draftId, (err, checkEdition) => {
                    if (err) console.log(err)
                    if(draft.form.activeStep === 'client'){
                        if (_.has(checkEdition, 'clientFormEdition')) {
                            const update = JSON.parse(checkEdition.clientFormUpdate)
                            checkEdition = JSON.parse(checkEdition.clientFormEdition)

                            if (checkEdition.clientAddress.inEdition) {
                                if (checkEdition.clientAddress.clientAddressId) {
                                    this.socket.emit('draftClientAddressEdit', checkEdition.clientAddress.clientAddressId)
                                    if (update.clientAddressForm) {
                                        this.socket.emit('draftClientAddressUpdate', update.clientAddressForm)
                                        if (update.clientAddressForm.address.reset) {
                                            this.socket.emit('draftClientAddressAddressReset')
                                        }
                                        else {
                                            if (update.clientAddressForm.address.select) {
                                                this.socket.emit('draftClientAddressAddressSelect', update.clientAddressForm.address)
                                            }
                                            else {
                                                this.socket.emit('draftClientAddressAddressReset')
                                                this.socket.emit('draftClientAddressAddressSelect', update.clientAddressForm.address)
                                            }
                                        }
                                    }
                                }
                                else {
                                    this.socket.emit('draftClientAddressAdd')
                                    if (update.clientAddressForm) {
                                        this.socket.emit('draftClientAddressUpdate', update.clientAddressForm)
                                        if (update.clientAddressForm.address.reset) {
                                            this.socket.emit('draftClientAddressAddressReset')
                                        }
                                        else {
                                            this.socket.emit('draftClientAddressAddressSelect', update.clientAddressForm.address)
                                        }
                                    }
                                }
                            }
                            if(checkEdition.clientPhone.inEdition) {
                                if (checkEdition.clientPhone.inEdition) {
                                    if (checkEdition.clientPhone.clientPhoneId) {
                                        this.socket.emit('draftClientPhoneEdit', checkEdition.clientPhone.clientPhoneId)
                                        this.socket.emit('draftClientPhoneUpdate', update.clientPhoneForm)
                                    }
                                    else {
                                        this.socket.emit('draftClientPhoneUpdate', update.clientPhoneForm)
                                    }
                                }
                                else {
                                    this.socket.emit('draftClientPhoneEditionCancel')
                                }
                            }
                        }
                        else {
                            const objSetDraftRedis = { draftId: draftId, clientAddress: { inEdition: true }, clientPhone: { inEdition: true } }
                            this.setDraftRedis(objSetDraftRedis)
                        }
                    }
                    else if(draft.form.activeStep === 'order'){
                        if (checkEdition.orderProducts) {

                        }
                        else {
                            const objSetDraftRedis = {draftId: draftId, orderProductId: draft.form.order.orderProducts[0].orderProductId}
                            this.setDraftRedis(objSetDraftRedis, false, true)
                        }
                    }
                    else{
                        const objSetDraftRedis = {draftId: draftId, isNull: true, companyId: (this.socket.user.activeCompanyUserId) ? this.socket.user.activeCompanyUserId: this.socket.user.companies[0]}
                        this.setDraftRedis(objSetDraftRedis)
                    }
                })
            }).catch(() => {
                console.log('catch do CONSULTDRAFT')
            })
        }

        saveDraft(draftId, userEntry = false) {
            return new Promise((resolve, reject) => {
                this.findDraftInArray(draftId).then((index) => {
                    if (index !== -1) {
                        this.controller.updateDraft(this.channels.updates.drafts[index]).then(() => {

                            this.socket.emit('draftSave')
                            this.channels.updates.drafts.splice(index, 1)
                            if (userEntry) {
                                this.consultDraft(draftId)
                            }
                            resolve()
                        }).catch((err) => {
                            console.log(err, 'catch do UPDATEDRAFT - QUE TA DENTRO DO SAVEDRAFT')
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
    //
//

            /////////////
            /// REDIS ///
            /////////////
//
    setDraftRedis(setDraftRedis, selectedAddress = false, orderProduct = false) {
        return new Promise((resolve, reject) => {
            if(orderProduct){
                return this.server.redisClient.HMSET("draft:" + setDraftRedis.draftId, 'orderProducts', JSON.stringify({"orderProducts": [{orderProductId: setDraftRedis.orderProductId}]}), (err, res) => {
                    if (err) {
                        reject()
                    }
                    else {
                        resolve()
                    }
                }) 
            }
            else if(setDraftRedis.isNull){
                return this.server.redisClient.HMSET("draft:" + setDraftRedis.draftId, 'companyId', JSON.stringify(setDraftRedis.companyId), (err, res) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve()
                    }
                })
            }
            else {
                return this.server.redisClient.HMSET("draft:" + setDraftRedis.draftId, 'clientFormUpdate', JSON.stringify({ clientAddressForm: { address: { select: (selectedAddress) ? true : false } }, clientPhoneForm: {} }), 'clientFormEdition', JSON.stringify({ clientAddress: { inEdition: setDraftRedis.clientAddress.inEdition, clientAddressId: null }, clientPhone: { inEdition: setDraftRedis.clientPhone.inEdition, clientPhoneId: null } }), (err, res) => {
                    if (err) {
                        reject()
                    }
                    else {
                        resolve()
                    }
                })
            }
        })
    }

    updateDraftRedis(contentDraft, newEdit = false, resetOrSelectAddress = false) {
        return new Promise((resolve, reject) => {
            this.consultRedisDraft(contentDraft.draftId).then((redisConsult) => {
                const checkUpdate = JSON.parse(redisConsult.clientFormUpdate)

                let update = { clientAddressForm: checkUpdate.clientAddressForm,
                               clientPhoneForm: checkUpdate.clientPhoneForm
                            }
                            
                update.inEdition = _.merge(JSON.parse(redisConsult.clientFormEdition), contentDraft.inEdition)

                if (resetOrSelectAddress) {
                    if (resetOrSelectAddress.reset) {
                        update.clientAddressForm = _.assign(checkUpdate.clientAddressForm, { address: { reset: true } })
                    }
                    else {
                        update.clientAddressForm = _.assign(checkUpdate.clientAddressForm, { address: contentDraft.address, select: true })
                    }
                }
                else {
                    if (_.has(contentDraft, "clientAddressForm")) {
                        if (!newEdit) {
                            delete checkUpdate.clientAddressForm.address.reset
                            const address = _.assign(checkUpdate.clientAddressForm.address, contentDraft.form.clientAddressForm.address)
                            const updateClientAddress = _.assign(checkUpdate.clientAddressForm, contentDraft.form.clientAddressForm)
                            update.clientAddressForm = _.assign(updateClientAddress, { address: address })
                        }
                        else {
                            update.clientAddressForm = { address: { select: true } }
                        }

                    }
                    if (_.has(contentDraft, "clientPhoneForm")) {
                        if (contentDraft.clientPhoneForm.reset) {
                            update.clientPhoneForm = {}
                        }
                        else {
                            update.clientPhoneForm = _.assign(checkUpdate.clientPhoneForm, contentDraft.form.clientPhoneForm)
                        }
                    }
                }

                resolve(update)
            }).catch((err) => {
                console.log(err, "CATCH DO CONSULT REDIS QUE TA DENTRO DO SET DRAFT REDIS")
            })
        }).then((update) => {
            if (!update) {
                return false
            }
            else {
                const inEdition = update.inEdition

                delete update.inEdition
                return this.server.redisClient.HMSET("draft:" + contentDraft.draftId, 'clientFormUpdate', JSON.stringify(update), 'clientFormEdition', JSON.stringify(inEdition), (err, res) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        return res
                    }
                })
            }
        })
    }

    consultRedisDraft(draftId) {
        return new Promise((resolve, reject) => {
            this.server.redisClient.hgetall('draft:' + draftId, (err, redisConsult) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(redisConsult)
                }

            })
        }).then((consult) => {
            return consult
        }).catch((err) => {
            return err
        })
    }

    consultRedisUserPresence(userId) {
        return new Promise((resolve, reject) => {
            this.server.redisClient.get('presenceUser:' + userId, (err, redisConsult) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(redisConsult)
                }

            })
        }).then((consult) => {
            return consult
        }).catch((err) => {
            return err
        })
    }

    setRedisUserPresence(userPresence) {
        return new Promise((resolve, reject) => {
            this.server.redisClient.set("presenceUser:" + userPresence.userId, JSON.stringify({ draftId: userPresence.draftId }), 'EX', 86400, (err, res) => {
                if (err) {
                    reject()
                }
                else {
                    resolve()
                }
            })
        })
    }
//

}