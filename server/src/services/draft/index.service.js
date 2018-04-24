import fs from 'fs'
import _ from 'lodash'
import path from 'path'

module.exports = (server) => { return {
    name: "draft",
    actions: {
        /**
         * @param {Object} ctx.params.data = { companyId:Number, draftId:Number }
         * @returns
         */
        get(ctx) {
            return server.mongodb.Draft.findOne({ draftId: ctx.params.data.draftId, companyId: ctx.params.data.companyId }).then((draft) => {
                return draft.toJSON()
            })
        },
        getList(ctx){

        },
        /**
         * @param {Object} ctx.params.data = { companyId:Number, type:String, createdBy:Number }
         * @returns
         */
        create(ctx){
            return server.mongodb.Draft.findOne().sort({ _id: -1 }).then((nextDraftId) => {
                if (nextDraftId) {
                    return nextDraftId.draftId + 1
                }
                return 1
            }).then((draftId) => {
                try {
                    const draftModelFile = require('../../models/draft/' + _.upperFirst(_.camelCase(ctx.params.data.type)) + '.js')
                    if(draftModelFile){
                        const draftModel = new draftModelFile(ctx.params.data.companyId, draftId, ctx.params.data.createdBy)
                        return server.mongodb.Draft.create(draftModel.toObj())
                    }
                }
                catch(err){
                    console.log(err)
                    throw new Error(err.message)
                }
                /*
                if(controller.request.recoverance){
                    // temporary until generic file is created
                    let type = {}

                    if(draft.type === 'request'){
                        type.name = 'client'
                        type.Addresses = 'clientAddresses'
                        type.Phones = 'clientPhones'
                        type.CustomFields = 'clientCustomFields'
                    }
                    else if(setData.type === 'expense'){
                        type.name = 'supplier'
                        type.Addresses = 'supplierAddresses'
                        type.Phones = 'supplierPhones'
                        type.CustomFields = 'supplierCustomFields'
                    }
                }
                else{
                    const draftFormModel = new server.draftFormModels[_.upperFirst(_.camelCase(setData.type))]()
                    draftFormModel.setCompanyId(controller.request.companyId)
                    if(setData.type == 'request'){
                        draftFormModel.setUser(parseInt(controller.request.createdBy.id)) // initial user to request
                        draftFormModel.setStatus("pending") // status in initial request timeline
                    }

                    setData.form = draftFormModel.getObject()
                    setData.isSingle = draftFormModel.isSingle()
                }

                setData.data = { company: null, client: null }

                return server.mongodb.Draft.create(setData).then((draft) => {

                    draft = JSON.parse(JSON.stringify(draft))

                    console.log("Created draft", draft)
                    draft = _.assignIn(draft, { createdBy: controller.request.createdBy.name, recoverancedBy: (controller.request.recoverancedBy) ? controller.request.recoverancedBy.name : null })
                    // change createdBy to user name for emit to all users

                    // check socket connections and emit
                    let ids = Object.keys(server.io.sockets.connected)
                    ids.forEach(function (id) {
                        const socket = server.io.sockets.connected[id]

                        if (_.includes(socket.user.companies, parseInt(controller.request.companyId))) {
                            socket.join('draft/' + draft.draftId)
                        }
                        const companyActiveId = (socket.user.activeCompanyUserId) ? socket.user.activeCompanyUserId : socket.user.companies[0]
                        if (parseInt(controller.request.companyId) === parseInt(companyActiveId)) {
                            socket.emit('draftCreated', { data: draft, emittedBy: (controller.request.recoverancedBy) ? parseInt(controller.request.recoverancedBy.id) : parseInt(controller.request.createdBy.id) })
                        }
                    })

                    return draft
                }).catch((err) => {
                    console.log("Error", err)
                    return err
                });
                */
            })
        },
        /**
         * @param {Object} ctx.params.data = { companyId:Number, draftId:Number, ...data to be changed }
         * @returns
         */
        update(ctx){
            return server.mongodb.Draft.findOneAndUpdate({ draftId: ctx.params.data.draftId, companyId: ctx.params.data.companyId }, {
                $set: ctx.params.data
            }).then((draft) => {
                return draft.toJSON()
            })
        },
        remove(ctx){
            return server.mongodb.Draft.remove({
                draftId: ctx.params.data.draftId,
                companyId: ctx.params.data.companyId
            }, (err, data) => {
                return {
                    removedDraftId: ctx.params.data.draftId
                }
            });
        }
    }
}}