import _ from 'lodash'
import moment from 'moment'
const Op = require('sequelize').Op

module.exports = (server) => {
    return {
        name: "data/request-order",
        actions: {

            start(ctx) {
                const vm = this
                const companyId = ctx.params.companyId
                return new Promise((resolve, reject) => {
                    async function start() {
                        try {
                            ctx.params.data = _.assign(ctx.params.data, { companyId })
                            const transaction = ctx.params.transaction

                            const order = await vm.saveOrder(ctx.params.data, transaction)

                            if (_.has(ctx.params.data, "requestOrderProducts")) {
                                const requestOrderProducts = _.map(ctx.params.data.requestOrderProducts, requestOrderProduct => {
                                    return _.assign(requestOrderProduct, {
                                        requestOrderId: order.id,
                                        productId: (requestOrderProduct.product) ? requestOrderProduct.product.id : null
                                    })
                                })
                                _.set(order, 'requestOrderProducts', await vm.saveRequestOrderProducts(requestOrderProducts, order.id, transaction))
                            }

                            return resolve(order)
                        }
                        catch (err) {
                            console.log('try catch do requestOrder', err)
                            return reject(err)
                        }
                    }
                    start()
                })
            }

        },
        methods: {
            saveOrder(data, transaction) {
                if (data.id) { // update order
                    return server.mysql.RequestOrder.update(data, {
                        where: {
                            id: data.id
                        },
                        transaction
                    }).then(() => {
                        return server.mysql.RequestOrder.findById(data.id, { transaction })
                            .then((requestOrder) => {
                                return JSON.parse(JSON.stringify(requestOrder))
                            })
                    })
                }
                else { // create order
                    return server.mysql.RequestOrder.create(data, { transaction })
                        .then((requestOrder) => {
                            if (!requestOrder) return Promise.reject("Erro: Não foi possivel cadastrar os produtos dos pedidos!")
                            return JSON.parse(JSON.stringify(requestOrder))
                        }).catch(() => {
                            console.log('Erro no requestOrderCreate em request order service') //comentar
                            return Promise.reject('Erro ao criar o pedido.')
                        })

                }
            },
            
            /**
             * @param {Object} data, {Object} transaction
             * @returns {Promise.<Array>} RequestOrderProducts
             */
            saveRequestOrderProducts(data, orderId, transaction) {
                /*
                * Delete all
                */
                return server.mysql.RequestOrderProduct.destroy({
                    where: {
                        requestOrderId: orderId
                    },
                    transaction
                }).then(() => {
                    let requestOrderProductPromises = []
                    data.forEach((requestOrderProduct) => {
                        if (requestOrderProduct.id) {
                            requestOrderProductPromises.push(server.mysql.RequestOrderProduct.update(_.assign(requestOrderProduct, {
                                dateRemoved: null
                            }), {
                                    where: {
                                        id: requestOrderProduct.id
                                    },
                                    paranoid: false,
                                    transaction
                                }).then(() => {
                                    return server.mysql.RequestOrderProduct.findById(requestOrderProduct.id, { transaction })
                                        .then((requestOrderProductUpdated) => {
                                            return JSON.parse(JSON.stringify(requestOrderProductUpdated))
                                        })
                                })
                            )
                        }
                        else {
                            requestOrderProductPromises.push(
                                server.mysql.RequestOrderProduct.create(requestOrderProduct)
                                    .then((requestOrderProductCreate) => {
                                        if (!requestOrderProductCreate) return Promise.reject("Erro ao cadastrar o produto no pedido.")
                                        return _.assign(JSON.parse(JSON.stringify(requestOrderProductCreate)), { tmpId: requestOrderProduct.tmpId })
                                    })
                            )
                        }
                    })

                    return Promise.all(requestOrderProductPromises)
                        .then((requestOrderProducts) => {
                            return requestOrderProducts
                        }).catch((err) => {
                            console.log("Erro em: data/request-order.requestOrderProducts - Promise ALL")
                            return Promise.reject("Erro ao atualizar produtos do pedido.")
                        })
                }).catch((err) => {
                    console.log('Erro no saveRequestOrderProducts em request order service ao destroy order products')
                    return Promise.reject(err)
                })
            }
        }
    }
}