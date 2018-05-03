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
                return server.mongodb.Draft.create({
                    draftId: draftId,
                    companyId: ctx.params.data.companyId,
                    createdBy: ctx.params.data.createdBy,
                    draft: {},
                    type: 'request',
                    isSingle: false
                })
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