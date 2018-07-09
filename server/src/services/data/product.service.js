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
            return server.mysql.Product.create(ctx.params.data)
            .then((product) => {
                if(!product){
                    console.log("Nenhum registro encontrado. Create.")
                    return Promise.reject('Erro ao criar o produto')
                }
                return JSON.parse(JSON.stringify(product))
            }).catch((err) => {
                console.log('Erro no create em product service') //comentar
                return Promise.reject(err)
            })
        },
        /**
         * @param {Object} where, {Object} transaction
         * @returns {Promise.<Object>} product
         */
        update(ctx){
            return server.mysql.Product.update(ctx.params.data, {
                where: ctx.params.where || {}
            }).then((productUpdate) => {
                if(parseInt(_.toString(productUpdate)) < 1 ){
                    console.log("Nenhum registro encontrado. Update.")
                    return Promise.reject('Erro ao atualizar o produto')
                }
                return server.mysql.Product.findById(ctx.params.data.id)
                .then((product) => {
                    return JSON.parse(JSON.stringify(product))
                })
            }).catch((err) => {
                console.log('Erro no update em product service') //comentar
                return Promise.reject(err)
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
                        }
                    }).then((product) => {
                        return _.assign(orderProduct, { product: product })
                    }).catch((err) =>{
                        console.log('Erro no saveProducts em product service') //comentar
                        return Promise.reject(err)
                    })
                    )
                }
                else {
                    productsPromises.push(ctx.call("data/product.create", {
                        data: _.assign(orderProduct.product, {
                            companyId: ctx.params.companyId,
                            price: orderProduct.unitPrice,
                            quantity: orderProduct.quantity
                        })
                    }).then((product) => {
                        return _.assign(orderProduct, { product: product })
                    }).catch((err) =>{
                        console.log('Erro no saveProducts em product service') //comentar
                        return Promise.reject(err)
                    })
                    )
                }
            })

            return Promise.all(productsPromises).then((products) => {
                return products
            }).catch((err) => {
                console.log('Erro no saveProducts em product service, promise all') //comentar
                return Promise.reject(err)
            })
        }
    }
}}