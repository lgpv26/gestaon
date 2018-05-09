import _ from 'lodash'
import {Op} from 'sequelize'

module.exports = (server) => { return {
    name: "data/custom-field",
    actions: {
        getOne(ctx) {
            return server.mysql.CustomField.findOne({
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
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        getList(ctx){
            return server.mysql.CustomField.findAll({
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
            return server.mysql.CustomField.create(ctx.params.data).then((data) => {
                return JSON.parse(JSON.stringify(data))
            })
        },
        update(ctx){
            return server.mysql.CustomField.update(ctx.params.data,{
                where: {
                    id: ctx.params.data.id,
                    companyId: ctx.params.data.companyId
                }
            }).then((data) => {
                if(!data){
                    throw new Error("Nenhum registro encontrado.")
                }
                return server.mysql.CustomField.findById(ctx.params.data.id).then((data) => {
                    return JSON.parse(JSON.stringify(data))
                })
            })
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