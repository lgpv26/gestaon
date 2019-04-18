import _ from 'lodash'
import {Op} from 'sequelize'

module.exports = (server) => { return {
    name: "data/product",
    actions: {
        getOne(ctx) {
            return server.mysql.Product.findOne({
                where: {
                    id: ctx.params.data.id,
                    companyId: {
                        [Op.in]: [ctx.params.data.companyId]
                    }
                }
            }).then((data) => {
                return JSON.parse(JSON.stringify(data))
            })
        },
        getList(ctx){
            return server.mysql.Product.findAll({
                where: {
                    companyId: {
                        [Op.in]: [ctx.params.data.companyId]
                    }
                }
            }).then((data) => {
                return JSON.parse(JSON.stringify(data))
            })
        },
        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} product
         */
        create(ctx){
            return server.mysql.Product.create(ctx.params.data, {
                transaction: ctx.params.transaction
            }).then((product) => {
                if(!product){
                    console.log("Nenhum registro encontrado. Create.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(product))
            }).catch((err) => {
                throw new Error(err) // COMENTAR
            })
        },
        /**
         * @param {Object} where, {Object} transaction
         * @returns {Promise.<Object>} product
         */
        update(ctx){
            return server.mysql.Product.update(ctx.params.data, {
                where: ctx.params.where || {},
                transaction: ctx.params.transaction
            }).then((productUpdate) => {
                if(parseInt(_.toString(productUpdate)) < 1 ){
                    console.log("Nenhum registro encontrado. Update.")
                    throw new Error("Nenhum registro encontrado.")
                }
                return server.mysql.Product.findById(ctx.params.data.id, {
                    transaction: ctx.params.transaction
                }).then((product) => {
                    return JSON.parse(JSON.stringify(product))
                })
            }).catch((err) => {
                throw new Error(err) // COMENTAR
            })
        },
        remove(ctx){

        },
        /**
         * @param {Object} data, {Object} companyId, {Object} transaction
         * @returns {Promise.<Array>} products 
         */
        saveProducts(ctx) {
            let productsPromises = []
            ctx.params.data.forEach((orderProduct) => {
                if (orderProduct.product.id) {
                    productsPromises.push(ctx.call("data/product.update", {
                        data: _.assign(orderProduct.product, {
                            companyId: ctx.params.companyId
                        }),
                        where: {
                            id: orderProduct.product.id
                        },
                        transaction: ctx.params.transaction
                    }).then((product) => {
                        return _.assign(orderProduct, { product: product })
                    }).catch((err) =>{
                        //console.log(err) //comentar
                        throw new Error(err)
                    })
                    )
                }
                else {
                    productsPromises.push(ctx.call("data/product.create", {
                        data: _.assign(orderProduct.product, {
                            companyId: ctx.params.companyId,
                            price: orderProduct.unitPrice,
                            quantity: orderProduct.quantity
                        }),
                        transaction: ctx.params.transaction
                    }).then((product) => {
                        return _.assign(orderProduct, { product: product })
                    }).catch((err) =>{
                        //console.log(err) // COMENTAR
                        throw new Error(err)
                    })
                    )
                }
            })

            return Promise.all(productsPromises).then((products) => {
                return products
            }).catch((err) => {
                console.log('')
                throw new Error(err)
            })
        }
    }
}}