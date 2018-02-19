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
                            return value.id === _.first(arrayPath).id
                        })

                        if (arrayIndex !== -1) {
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
                    else {
                        if(contentDraft.path) {
                            if(_.first(contentDraft.path.split('.')) === 'client') {
                                contentDraft.form.client = _.assign(contentDraft.form.client, {isNull: false})
                            }
                        }
                    }

                    this.channels.updates.drafts[draftUpdateIndex] = _.mergeWith(draft, contentDraft)
                    resolve()
                }
                else {
                    if(contentDraft.path) {
                        if(_.first(contentDraft.path.split('.')) === 'client') {
                            contentDraft.form.client = _.assign(contentDraft.form.client, {isNull: false})
                        }
                    }

                    this.channels.updates.drafts.push(_.assignIn(contentDraft, {hasArray: (isArray(arrayPath)) ? true : false, path: (contentDraft.path) ? contentDraft.path : null }))
                    
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

                    if(!_.has(checkEdition, "clientFormEdition") && !_.has(checkEdition, "clientFormUpdate")) {
                        const objSetDraftRedis = { draftId: draftId, clientAddress: { inEdition: true }, clientPhone: { inEdition: true } }
                        this.setDraftRedis(objSetDraftRedis)                     
                    }

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
                            const objSetDraftRedis = { draftId: draftId, clientAddress: { inEdition: true }, clientPhone: { inEdition: true }, type: draft.type }
                            this.setDraftRedis(objSetDraftRedis)
                        }
                    }
                    else if(draft.form.activeStep === 'order'){
                        if (!_.has(checkEdition, 'orderProducts')) {
                            const objSetDraftRedis = {draftId: draftId, id: draft.form.order.orderProducts[0].id}
                            this.setDraftRedis(objSetDraftRedis, false, true)
                        }
                    }
                    else if(draft.form.activeStep === 'supplier'){
                        if (_.has(checkEdition, 'supplierFormEdition')) {
                            const update = JSON.parse(checkEdition.supplierFormUpdate)
                            checkEdition = JSON.parse(checkEdition.supplierFormEdition)

                            if (checkEdition.supplierAddress.inEdition) {
                                if (checkEdition.supplierAddress.supplierAddressId) {
                                    this.socket.emit('draftClientAddressEdit', checkEdition.supplierAddress.supplierAddressId)
                                    if (update.supplierAddressForm) {
                                        this.socket.emit('draftSupplierAddressUpdate', update.supplierAddressForm)
                                        if (update.supplierAddressForm.address.reset) {
                                            this.socket.emit('draftSupplierAddressAddressReset')
                                        }
                                        else {
                                            if (update.supplierAddressForm.address.select) {
                                                this.socket.emit('draftSupplierAddressAddressSelect', update.supplierAddressForm.address)
                                            }
                                            else {
                                                this.socket.emit('draftSupplierAddressAddressReset')
                                                this.socket.emit('draftSupplierAddressAddressSelect', update.supplierAddressForm.address)
                                            }
                                        }
                                    }
                                }
                                else {
                                    this.socket.emit('draftSupplierAddressAdd')
                                    if (update.supplierAddressForm) {
                                        this.socket.emit('draftSupplierAddressUpdate', update.supplierAddressForm)
                                        if (update.supplierAddressForm.address.reset) {
                                            this.socket.emit('draftSupplierAddressAddressReset')
                                        }
                                        else {
                                            this.socket.emit('draftSupplierAddressAddressSelect', update.supplierAddressForm.address)
                                        }
                                    }
                                }
                            }
                            if(checkEdition.supplierPhone.inEdition) {
                                if (checkEdition.supplierPhone.inEdition) {
                                    if (checkEdition.supplierPhone.supplierPhoneId) {
                                        this.socket.emit('draftSupplierPhoneEdit', checkEdition.supplierPhone.supplierPhoneId)
                                        this.socket.emit('draftSupplierPhoneUpdate', update.supplierPhoneForm)
                                    }
                                    else {
                                        this.socket.emit('draftSupplierPhoneUpdate', update.supplierPhoneForm)
                                    }
                                }
                                else {
                                    this.socket.emit('draftSupplierPhoneEditionCancel')
                                }
                            }
                        }
                        else {
                            const objSetDraftRedis = { draftId: draftId, supplierAddress: { inEdition: true }, supplierPhone: { inEdition: true }, type: draft.type }
                            this.setDraftRedis(objSetDraftRedis)
                        }
                    }
                    else{
                        const objSetDraftRedis = {draftId: draftId, isNull: true, type: draft.type, companyId: (this.socket.user.activeCompanyUserId) ? this.socket.user.activeCompanyUserId: this.socket.user.companies[0]}
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
                return this.server.redisClient.HMSET("draft:" + setDraftRedis.draftId, 'orderProducts', JSON.stringify({"orderProducts": [{id: setDraftRedis.id}]}), (err, res) => {
                    if (err) {
                        reject()
                    }
                    else {
                        resolve()
                    }
                }) 
            }
            else if(setDraftRedis.isNull){
                return this.server.redisClient.HMSET("draft:" + setDraftRedis.draftId, 'companyId', JSON.stringify(setDraftRedis.companyId), 'type', JSON.stringify(setDraftRedis.type), (err, res) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve()
                    }
                })
            }
            else if(setDraftRedis.type == 'request'){
                return this.server.redisClient.HMSET("draft:" + setDraftRedis.draftId, 'clientFormUpdate', JSON.stringify({ clientAddressForm: { address: { select: (selectedAddress) ? true : false } }, clientPhoneForm: {} }), 'clientFormEdition', JSON.stringify({ clientAddress: { inEdition: setDraftRedis.clientAddress.inEdition, clientAddressId: null }, clientPhone: { inEdition: setDraftRedis.clientPhone.inEdition, clientPhoneId: null } }), (err, res) => {
                    if (err) {
                        reject()
                    }
                    else {
                        resolve()
                    }
                })
            }
            else if(setDraftRedis.type == 'expense'){
                return this.server.redisClient.HMSET("draft:" + setDraftRedis.draftId, 'supplierFormUpdate', JSON.stringify({ supplierAddressForm: { address: { select: (selectedAddress) ? true : false } }, supplierPhoneForm: {} }), 'supplierFormEdition', JSON.stringify({ supplierAddress: { inEdition: setDraftRedis.supplierAddress.inEdition, supplierAddressId: null }, supplierPhone: { inEdition: setDraftRedis.supplierPhone.inEdition, supplierPhoneId: null } }), (err, res) => {
                    if (err) {
                        reject()
                    }
                    else {
                        resolve()
                    }
                })
            }
            else if(setDraftRedis.type == 'accounts'){
                return this.server.redisClient.HMSET("draft:" + setDraftRedis.draftId, 'supplierFormUpdate', JSON.stringify({ supplierAddressForm: { address: { select: (selectedAddress) ? true : false } }, supplierPhoneForm: {} }), 'supplierFormEdition', JSON.stringify({ supplierAddress: { inEdition: setDraftRedis.supplierAddress.inEdition, supplierAddressId: null }, supplierPhone: { inEdition: setDraftRedis.supplierPhone.inEdition, supplierPhoneId: null } }), (err, res) => {
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
                let type = {}

                if(_.has(redisConsult, "type") && redisConsult.type){
                    const verifyType = JSON.parse(redisConsult.type)
                    if(verifyType == 'request'){
                        type.name = 'Client'
                        type.formUpdate = 'clientFormUpdate'
                        type.addressForm = 'clientAddressForm'
                        type.phoneForm = 'clientPhoneForm'
                        type.formEdition = 'clientFormEdition'

                    }
                }

                const checkUpdate = JSON.parse(redisConsult[type.formUpdate])

                let update = { [type.addressForm]: checkUpdate[type.addressForm],
                               [type.phoneForm]: checkUpdate[type.phoneForm],
                               type: type
                            }
                            
                update.inEdition = _.merge(JSON.parse(redisConsult[type.formEdition]), contentDraft.inEdition)

                if (resetOrSelectAddress) {
                    if (resetOrSelectAddress.reset) {
                        update[type.addressForm] = _.assign(checkUpdate[type.addressForm], { address: { reset: true } })
                    }
                    else {
                        update[type.addressForm] = _.assign(checkUpdate[type.addressForm], { address: contentDraft.address, select: true })
                    }
                }
                else {
                    if (_.has(contentDraft, type.addressForm) && (contentDraft[type.addressForm])) {
                        if (!newEdit) {
                            delete checkUpdate[type.addressForm].address.reset
                            const address = _.assign(checkUpdate[type.addressForm].address, contentDraft.form[type.addressForm].address)
                            const updateAgentAddress = _.assign(checkUpdate[type.addressForm], contentDraft.form[type.addressForm])
                            update[type.addressForm] = _.assign(updateAgentAddress, { address: address })
                        }
                        else {
                            update[type.addressForm] = { address: { select: true } }
                        }

                    }
                    if (_.has(contentDraft, [type.phoneForm]) && (contentDraft[type.phoneForm])) {
                        if (contentDraft[type.phoneForm].reset) {
                            update[type.phoneForm] = {}
                        }
                        else {
                            update[type.phoneForm] = _.assign(checkUpdate[type.phoneForm], contentDraft.form[type.phoneForm])
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
                const type = update.type
                const inEdition = update.inEdition

                delete update.inEdition
                delete update.type
                return this.server.redisClient.HMSET("draft:" + contentDraft.draftId, type.formUpdate, JSON.stringify(update), type.formEdition, JSON.stringify(inEdition), (err, res) => {
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