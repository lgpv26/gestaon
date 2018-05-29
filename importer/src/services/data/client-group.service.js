import _ from 'lodash'
import {Op} from 'sequelize'

module.exports = (server) => { return {
    name: "data/client-group",
    actions: {
        getOne(ctx) {
            return server.mysql.ClientGroup.findOne({
                where: {
                    id: ctx.params.data.id,
                    companyId: {
                        [Op.in]: [0,ctx.params.data.companyId]
                    }
                }
            }).then((data) => {
                return JSON.parse(JSON.stringify(data))
            })
        },
        getList(ctx){
            return server.mysql.ClientGroup.findAll({
                where: {
                    companyId: {
                        [Op.in]: [0,ctx.params.data.companyId]
                    }
                }
            }).then((data) => {
                return JSON.parse(JSON.stringify(data))
            })
        },
        create(ctx){
            return server.mysql.ClientGroup.create(ctx.params.data).then((data) => {
                return JSON.parse(JSON.stringify(data))
            })
        },
        update(ctx){
            return server.mysql.ClientGroup.update(ctx.params.data,{
                where: {
                    id: ctx.params.data.id,
                    companyId: ctx.params.data.companyId
                }
            }).then((customField) => {
                if(!customField){
                    return next(
                        new Error("Nenhum registro encontrado.")
                    )
                }
                return server.mysql.ClientGroup.findById(ctx.params.data.id).then((data) => {
                    return JSON.parse(JSON.stringify(data))
                })
            })
        },
        remove(ctx){
            return server.mysql.ClientGroup.destroy({
                where: {
                    id: ctx.params.data.id,
                    companyId: ctx.params.data.companyId
                }
            }).then(() => {
                return {
                    removedId: ctx.params.data.id
                }
            })
        }
    }
}}