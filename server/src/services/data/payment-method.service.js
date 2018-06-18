import _ from 'lodash'
import {Op} from 'sequelize'

module.exports = (server) => { return {
    name: "data/payment-method",
    actions: {
        getOne(ctx) {
            return server.mysql.PaymentMethod.findOne({
                where: {
                    id: ctx.params.data.id,
                    companyId: {
                        [Op.in]: [0,ctx.params.data.companyId]
                    }
                },
                transaction: ctx.params.transaction || null
            }).then((paymentMethod) => {
                return JSON.parse(JSON.stringify(paymentMethod))
            })
        },
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        getList(ctx){
            return server.mysql.PaymentMethod.findAll({
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
            return server.mysql.PaymentMethod.create(ctx.params.data).then((data) => {
                return JSON.parse(JSON.stringify(data))
            })
        },
        update(ctx){
            return server.mysql.PaymentMethod.update(ctx.params.data,{
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
                return server.mysql.PaymentMethod.findById(ctx.params.data.id).then((data) => {
                    return JSON.parse(JSON.stringify(data))
                })
            });
        },
        remove(ctx){
            return server.mysql.PaymentMethod.destroy({
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