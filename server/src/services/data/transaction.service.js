import _ from "lodash"
import { Op } from "sequelize"

module.exports = server => {
    return {
        name: "data/transaction",
        actions: {

            getOne(ctx) {
                return server.mysql.Transaction.findOne({
                    where: {
                        id: ctx.params.data.id,
                        companyId: {
                            [Op.in]: [ctx.params.data.companyId]
                        }
                    }
                })
                    .then((data) => {
                        return JSON.parse(JSON.stringify(data))
                    })
            },

            getList(ctx) {
                return server.mysql.Transaction.findAll({
                    where: {
                        companyId: {
                            [Op.in]: [ctx.params.data.companyId]
                        }
                    }
                })
                    .then((data) => {
                        return JSON.parse(JSON.stringify(data))
                    })
            },

            /**
             * @param {Object} data, {Object} transaction
             * @returns {Promise.<Object>} transaction
             */
            create(ctx) {
                return server.mysql.Transaction.create(ctx.params.data, {
                    transaction: ctx.params.transaction || null
                })
                    .then((transaction) => {
                        if (!transaction) {
                            console.log("Nenhum registro encontrado. Create.")
                            return Promise.reject("Nenhum registro encontrado.")
                        }
                        return JSON.parse(JSON.stringify(transaction))
                    })
                    .catch(err => {
                        return Promise.reject(err) // COMENTAR
                    })
            },

            /**
             * @param {Object} where, {Object} transaction
             * @returns {Promise.<Object>} transaction
             */
            update(ctx) {
                return server.mysql.Transaction.update(ctx.params.data, {
                    where: ctx.params.where || {},
                    transaction: ctx.params.transaction || null
                })
                    .then(() => {
                        return server.mysql.Transaction.findByPk(ctx.params.data.id, {
                            transaction: ctx.params.transaction
                        })
                            .then((transaction) => {
                                return JSON.parse(JSON.stringify(transaction))
                            })
                    })
                    .catch((err) => {
                        return Promise.reject(err) // COMENTAR
                    })
            },

            remove(ctx) { },

            /**
             * @param {Object} data, {Object} companyId, {Object} transaction
             * @returns {Promise.<Array>} transactions
             */
            saveTransactions(ctx) {
                let transactionsPromises = []
                ctx.params.data.forEach((orderTransaction) => {
                    if (orderTransaction.transaction.id) {
                        transactionsPromises.push(ctx.call("data/transaction.update", {
                            data: _.assign(orderTransaction.transaction, {
                                companyId: ctx.params.companyId
                            }),
                            where: {
                                id: orderTransaction.transaction.id
                            },
                            transaction: ctx.params.transaction
                        })
                            .then((transaction) => {
                                return _.assign(orderTransaction, {
                                    transaction: transaction
                                })
                            })
                            .catch(err => {
                                //console.log(err) //comentar
                                return Promise.reject(err)
                            })
                        )
                    }
                    else {
                        transactionsPromises.push(ctx.call("data/transaction.create", {
                            data: _.assign(orderTransaction.transaction, {
                                companyId: ctx.params.companyId,
                                price: orderTransaction.unitPrice,
                                quantity: orderTransaction.quantity
                            }),
                            transaction: ctx.params.transaction
                        })
                            .then((transaction) => {
                                return _.assign(orderTransaction, {
                                    transaction: transaction
                                })
                            })
                            .catch(err => {
                                //console.log(err) // COMENTAR
                                return Promise.reject(err)
                            })
                        )
                    }
                })

                return Promise.all(transactionsPromises)
                    .then((transactions) => {
                        return transactions
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }
        }
    }
}
