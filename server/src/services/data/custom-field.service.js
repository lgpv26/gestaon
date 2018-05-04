import _ from 'lodash'
import {Op} from 'sequelize'

module.exports = (server) => { return {
    name: "data/custom-field",
    actions: {
        get(ctx) {
            return server.mysql.CustomField.findOne({
                where: {
                    id: ctx.params.data.id,
                    companyId: {
                        [Op.in]: [0,ctx.params.data.companyId]
                    }
                }
            }).then((customField) => {
                return JSON.parse(JSON.stringify(customField))
            })
        },
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        list(ctx){
            return server.mysql.CustomField.findAll({
                where: {
                    companyId: {
                        [Op.in]: [0,ctx.params.data.companyId]
                    }
                }
            })
        },
        create(ctx){
            return server.mysql.CustomField.create(ctx.params.data)
        },
        update(ctx){
            return server.mysql.CustomField.update(ctx.params.data,{
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
                return server.mysql.CustomField.findById(ctx.params.data.id)
            });
        },
        remove(ctx){
            return server.mysql.CustomField.destroy({
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