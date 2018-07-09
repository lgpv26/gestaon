import fs from 'fs'
import _ from 'lodash'
import path from 'path'

import EventResponse from '~models/EventResponse'

module.exports = (server) => { return {
    name: "draft",
    actions: {
        /**
         * @param {Object} ctx.params.data = { companyId:Number, draftId:Number }
         * @returns
         */
        get(ctx) {
            return server.mongodb.Draft.findOne(ctx.params.where).then((draft) => {
                if(!draft) return null
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
                    data: ctx.params.data.data,
                    type: 'request',
                    isSingle: false
                }).then((draft) => {
                    server.io.to(`company/${ctx.params.data.companyId}`).emit('draft.create',new EventResponse(draft))
                    return draft
                })
            })
        },
        /**
         * @param {Object} ctx.params.data = { companyId:Number, draftId:Number, ...data to be changed }
         * @returns
         */
        update(ctx){
            return server.mongodb.Draft.findOneAndUpdate({
                draftId: ctx.params.data.draftId,
                companyId: ctx.params.data.companyId
            }, {
                $set: ctx.params.data
            }).then((draft) => {
                if(!draft) throw new Error ('Erro ao atualizar Draft')
                return draft.toJSON()
            })
        },
        remove(ctx){
            return server.mongodb.Draft.remove({
                draftId: parseInt(ctx.params.data.draftId),
                companyId: parseInt(ctx.params.data.companyId)
            }).then((draft) => {
                server.io.in(`company/${ctx.params.data.companyId}`).emit('draft.remove',new EventResponse({
                    draftId: parseInt(ctx.params.data.draftId),
                    emittedBy: parseInt(ctx.params.data.emittedBy)
                }))
                return true
            }).catch((err) => {
                console.log("ERRO: Remove draft - draft.remove")
                return Promise.reject('Erro ao remover o rascunho do pedido.')
            })
        }
    }
}}