const utils = require('../utils')
const _ = require('lodash')
const Op = require('sequelize').Op
const shortid = require('shortid')
const restify = require('restify')
const Controller = require('./../models/Controller')

module.exports = (server) => {

    ///////////////////////
    ///   CONTROLLERS   ///
    ///////////////////////
    //
    const clientsController = require('./../controllers/clients.controller')(server)
    const addressesController = require('./../controllers/addresses.controller')(server)
    const customFieldsController = require('./../controllers/custom-fields.controller')(server)
    const productsController = require('./../controllers/products.controller')(server)

    //  <-- end CONTORLLERS

    return {

        ////////////////
        ///   CRUD   ///
        ////////////////
        //
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
                req.body.companyId = req.query.companyId
                req.body.presence = []
                req.body.form = { activeStep: null, client: { id: null, clientAddresses: [], clientPhones: [], clientCustomFields: [], companyId: req.query.companyId }, order: { orderProducts: [{orderProductId: 'temp:' + shortid.generate()}] } }
                req.body.data = { company: null, client: null }
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
                    const path = draftReq.path
                    delete draftReq.path

                    if (draftReq.hasArray) {
                        delete draftReq.hasArray

                        return new Promise((resolve, reject) => {
                            let update = []
                            _.get(draftConsult, 'form.' + path).map((value, index) => {
                                const arrayIndex = _.findIndex(_.get(draftReq, 'form.' + path), {orderProductId: value.orderProductId})
                                if(arrayIndex !== -1){
                                    update.push(_.assign(value, _.get(draftReq, 'form.' + path)[arrayIndex]))
                                }
                                else {
                                    update.push(value)
                                }
                            })
                            resolve(update)
                        }).then((update) => {
                            _.set(draftReq, 'form.' + path,
                                update
                            )
                            resolve(_.mergeWith(draftConsult.form, draftReq.form))
                        })
                    }
                    else {
                    resolve(_.mergeWith(draftConsult.form, draftReq.form))
                }
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
        },
        // <-- end CRUD

        /////////////////////
        ///   PRESENCES   ///
        /////////////////////
        //
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
        // <-- end PRESENCES

        ///////////////////////
        ///     CLIENT      ///
        ///////////////////////
//
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
                const update = _.assign(draft.form, { client: { id: null, clientAddresses: [], clientPhones: [], clientCustomFields: [] }, clientAddressForm: {}, clientAddressId: null })
                return server.mongodb.Draft.update({ draftId: clientReset.draftId }, { $set: { form: update } }).then(() => {
                    return null
                })
            })
        },

        ///////////////////////
        ///     CLIENT      ///
        ///  ** address     ///
        ///////////////////////
    //
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
                        const clientAddressForm = _.assign(draft.form.clientAddressForm, { address: address })
                        saveClientAddresses[index] = _.assign(saveClientAddresses[index], clientAddressForm)
                        update.addressClientReturn = _.assign(saveClientAddresses[index], clientAddressForm)
                    }
                    else {
                        saveClientAddresses.push(_.assign(draft.form.clientAddressForm, { id: (draft.form.clientAddressForm.id) ? draft.form.clientAddressForm.id : 'temp:' + shortid.generate() }))
                        update.addressClientReturn = draft.form.clientAddressForm
                    }

                    const client = _.assign(draft.form.client, { clientAddresses: saveClientAddresses })
                    update.form = _.assign(draft.form, { client: client, clientAddressForm: {} })

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
                    const selectedClientAddressId = (draft.form.clientAddressId === clientAddressRemove.clientAddressId) ? null : draft.form.clientAddressId
                    const client = _.assign(draft.form.client, { clientAddresses: update.saveClientAddresses })
                    update.form = _.assign(draft.form, { client: client, clientAddressForm: {}, clientAddressId: selectedClientAddressId })

                    resolve(update)
                })
            }).then((save) => {
                return server.mongodb.Draft.update({ draftId: clientAddressRemove.draftId }, { $set: { form: save.form } }).then(() => {
                    return save
                })
            })
        },

        ///////////////////////////////
        //CLIENT ADDRESS => ADDRESS  //
        ///////////////////////////////

            //
                selectAddressClientAddress(addressSelect) {
                    return this.getOne(addressSelect.draftId).then((draft) => {
                        const req = { params: { id: addressSelect.addressId } }
                        return addressesController.getOne(req).then((address) => {
                            address = JSON.parse(JSON.stringify(address))


                            const clientAddressForm = _.assign(draft.form.clientAddressForm, { id: (addressSelect.clientAddressId) ? addressSelect.clientAddressId : null, address: address })
                            const update = _.assign(draft.form, { clientAddressForm: clientAddressForm })

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
            // <--- end CLIENT ADDRESS => ADDRESS | CLIENT ** address

    //  <-- end CLIENT ** address

        ///////////////////////
        ///     CLIENT      ///
        ///  ** phone       ///
        ///////////////////////
        //
            phoneEditionCancel(phoneEditionCancel) {
                return this.getOne(phoneEditionCancel.draftId).then((draft) => {
                    const update = _.assign(draft.form, { clientPhoneForm: {} })
                    return server.mongodb.Draft.update({ draftId: phoneEditionCancel.draftId }, { $set: { form: update } }).then(() => {
                        return null
                    })
                })
            },

            saveClientPhone(clientPhoneSave) {
                return new Promise((resolve, reject) => {
                    return server.mongodb.Draft.findOne({ draftId: clientPhoneSave.draftId }).then((draft) => {
                        draft = JSON.parse(JSON.stringify(draft))
                        const index = _.findIndex(draft.form.client.clientPhones, (clientPhone) => {
                            return clientPhone.id === draft.form.clientPhoneForm.id
                        })
                        let saveClientPhones = draft.form.client.clientPhones
                        let update = {}

                        if (index !== -1) {
                            saveClientPhones[index] = _.assign(saveClientPhones[index], draft.form.clientPhoneForm)
                            update.phoneClientReturn = _.assign(saveClientPhones[index], draft.form.clientPhoneForm)
                        }
                        else {
                            saveClientPhones.push(_.assign(draft.form.clientPhoneForm, { id: (draft.form.clientPhoneForm.id) ? draft.form.clientPhoneForm.id : 'temp:' + shortid.generate() }))
                            update.phoneClientReturn = draft.form.clientPhoneForm
                        }

                        const client = _.assign(draft.form.client, { clientPhones: saveClientPhones })
                        update.form = _.assign(draft.form, { client: client, clientPhoneForm: {} })

                        resolve(update)
                    })
                }).then((save) => {
                    return server.mongodb.Draft.update({ draftId: clientPhoneSave.draftId }, { $set: { form: save.form } }).then(() => {
                        return save.phoneClientReturn
                    })
                })
            },

            removeClientPhone(clientPhoneRemove) {
                return new Promise((resolve, reject) => {
                    return server.mongodb.Draft.findOne({ draftId: clientPhoneRemove.draftId }).then((draft) => {
                        draft = JSON.parse(JSON.stringify(draft))
                        let update = {}
                        update.saveClientPhones = _.filter(draft.form.client.clientPhones, (clientPhone) => {
                            return clientPhone.id !== clientPhoneRemove.clientPhoneId
                        })

                        update.clientPhoneId = clientPhoneRemove.clientPhoneId

                        const client = _.assign(draft.form.client, { clientPhones: update.saveClientPhones })
                        update.form = _.assign(draft.form, { client: client, clientPhoneForm: {} })

                        resolve(update)
                    })
                }).then((save) => {
                    return server.mongodb.Draft.update({ draftId: clientPhoneRemove.draftId }, { $set: { form: save.form } }).then(() => {
                        return save.clientPhoneId
                    })
                })
            },

        //  <--- end CLIENT ** phone

        ///////////////////////
        ///     CLIENT      ///
        /// ** customField  ///
        ///////////////////////
        //    
            clientCustomFieldAdd(clientCustomFieldAdd) {
                return this.getOne(clientCustomFieldAdd.draftId).then((draft) => {

                    return new Promise((resolve, reject) => {
                        if (!_.isInteger(clientCustomFieldAdd.customFieldId)) {
                            const checkCustomFieldId = clientCustomFieldAdd.customFieldId.split(':')
                            if (_.first(checkCustomFieldId) === 'temp') {
                                const index = _.findIndex(draft.data.company.customFields, { id: clientCustomFieldAdd.customFieldId })

                                resolve(draft.data.company.customFields[index])
                            }
                        }
                        else {
                            const req = { params: { customFieldId: clientCustomFieldAdd.customFieldId, companyId: (clientCustomFieldAdd.user.activeCompanyUserId) ? clientCustomFieldAdd.user.activeCompanyUserId : clientCustomFieldAdd.user.companies[0] } }
                            customFieldsController.getOne(req).then((customField) => {
                                resolve(JSON.parse(JSON.stringify(customField)))
                            })
                        }
                    }).then((addCustomField) => {

                        if (addCustomField || addCustomField.length > 1) {
                            let update = {}
                            let saveClientCustomFields = (draft.form.client.clientCustomFields) ? draft.form.client.clientCustomFields : []

                            update.clientCustomField = { id: 'temp:' + shortid.generate(), 
                                                        clientId: (clientCustomFieldAdd.clientId) ? clientCustomFieldAdd.clientId : null, 
                                                        value: null, 
                                                        customField: addCustomField 
                                                    }
                            const client = _.assign(draft.form.client, { clientCustomFields: _.concat(saveClientCustomFields, update.clientCustomField) })
                            update.form = _.assign(draft.form, { client: client })

                            return server.mongodb.Draft.update({ draftId: clientCustomFieldAdd.draftId }, { $set: { form: update.form } }).then(() => {
                                return update
                            })
                        }
                        else {
                            return { clientCustomField: 'Erro na consulta do custom Field' }
                        }
                    })
                })

            },

            clientCustomFieldRemove(clientCustomFieldRemove) {
                return new Promise((resolve, reject) => {
                    return server.mongodb.Draft.findOne({ draftId: clientCustomFieldRemove.draftId }).then((draft) => {
                        draft = JSON.parse(JSON.stringify(draft))
                        let update = {}
                        update.saveClientCustomFields = _.filter(draft.form.client.clientCustomFields, (clientCustomField) => {
                            return clientCustomField.id !== clientCustomFieldRemove.clientCustomFieldId
                        })

                        update.clientCustomFieldId = clientCustomFieldRemove.clientCustomFieldId

                        const client = _.assign(draft.form.client, { clientCustomFields: update.saveClientCustomFields })
                        update.form = _.assign(draft.form, { client: client })

                        resolve(update)
                    })
                }).then((save) => {
                    return server.mongodb.Draft.update({ draftId: clientCustomFieldRemove.draftId }, { $set: { form: save.form } }).then(() => {
                        return save
                    })
                })
            },
        //  <--- end CLIENT ** customField


        ///////////////////////
        ///  CUSTOM FIELD   ///
        /// ** in company   ///
        ///////////////////////
        //    
            customFieldChange(customFieldChange) {
                return this.getOne(customFieldChange.draftId).then((draft) => {

                    if (!draft.data.company) {
                        draft.data.company = { customFields: null }
                    }

                    const index = _.findIndex(draft.data.company.customFields, (customField) => {
                        return customField.id === (customFieldChange.customFieldId) ? customFieldChange.customFieldId : null
                    })

                    let saveCustomFields = (draft.data.company.customFields) ? draft.data.company.customFields : []
                    let update = {}

                    update.customField = {
                        id: (customFieldChange.customFieldId) ? customFieldChange.customFieldId : 'temp:' + shortid.generate(),
                        name: _.toUpper(customFieldChange.name),
                        companyId: (customFieldChange.user.activeCompanyUserId) ? customFieldChange.user.activeCompanyUserId : customFieldChange.user.companies[0],
                        remove: (customFieldChange.remove) ? true : false
                    }

                    if (index !== -1) {
                        saveCustomFields[index] = _.assign(saveCustomFields[index], update.customField)
                        update.customFieldReturn = _.assign(saveCustomFields[index], update.customField)
                    }
                    else {
                        saveCustomFields.push(update.customField)
                        update.customFieldReturn = update.customField
                    }

                    const company = _.assign(draft.data.company, { customFields: saveCustomFields })
                    update.data = _.assign(draft.data, { company: company })

                    return server.mongodb.Draft.update({ draftId: customFieldChange.draftId }, { $set: { data: update.data } }).then(() => {
                        return update
                    })
                })
            },

        // <-- end CUSTOM FIELD ** in company

//  <-- end CLIENT

        //////////////////////
        ///     ORDER      ///
        //////////////////////

//
            //////////////////////
            ///     ORDER      ///
            /// ** product     ///
            //////////////////////

        orderProductAdd(orderProductAdd) {
            return this.getOne(orderProductAdd.draftId).then((draft) => {
                const orderProduct = {orderProductId: 'temp:' + shortid.generate()}

                draft.form.order.orderProducts.push(orderProduct)

                const order = _.assign(draft.form.order, {orderProducts: draft.form.order.orderProducts})
                const update = _.assign(draft.form, { order: order })

                return server.mongodb.Draft.update({ draftId: orderProductAdd.draftId }, { $set: { form: update } }).then(() => {
                    return orderProduct
                })
            })
        },

        orderProductRemove(orderProductRemove) {
            return this.getOne(orderProductRemove.draftId).then((draft) => {

                let orderProducts = _.filter(draft.form.order.orderProducts, (orderProduct) => {
                    return orderProduct.orderProductId !== orderProductRemove.orderProductId
                })

                const order = _.assign(draft.form.order, {orderProducts: orderProducts})
                const update = _.assign(draft.form, { order: order })

                return server.mongodb.Draft.update({ draftId: orderProductRemove.draftId }, { $set: { form: update } }).then(() => {
                    return true
                })
            })
        },

        selectProductOrderProdut(productSelect) {
            return this.getOne(productSelect.draftId).then((draft) => {

                const controller = new Controller({
                    request: {
                        id: 1 //productSelect.productId
                    }
                })

                return productsController.getOne(controller).then((product) => {
                    product = JSON.parse(JSON.stringify(product))

                    const arrayIndex = _.findIndex(draft.form.order.orderProducts, {orderProductId: productSelect.orderProductId})

                    draft.form.order.orderProducts[arrayIndex] = _.assign(draft.form.order.orderProducts[arrayIndex], {product: product})
                    
                    const update = _.assign(draft.form, { order: draft.form.order })

                    return server.mongodb.Draft.update({ draftId: productSelect.draftId }, { $set: { form: update } }).then(() => {
                        return product
                    })
                })
            })

        },

// <-- end ORDER

    } // <-- end RETURN

} // <-- end EXPORTS