import _ from 'lodash'

module.exports = (server) => { return {
    name: "data/product",
    actions: {
        get(ctx) {
            return 'returning a product'
        },
        list(ctx){

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
                        data: orderProduct.product,
                        where: {
                            id: orderProduct.product.id
                        },
                        transaction: ctx.params.transaction
                    }).then((product) => {
                        return _.assign(orderProduct, { product: product })
                    })
                    )
                }
                else {
                    productsPromises.push(ctx.call("data/product.create", {
                        data: _.assign(orderProduct.product, {
                            companyId: ctx.params.companyId
                        }),
                        transaction: ctx.params.transaction
                    }).then((product) => {
                        return _.assign(orderProduct, { product: product })
                    })
                    )
                }
            })

            return Promise.all(productsPromises).then((products) => {
                return products
            })
        }
    }
}}