/*
const request = {
    client: {
        id: 7,
        name: 'MAILON RUAN DE LIMA',
        legalDocument: '06941033908',
        clientAddresses: [ 
            {
                "id" : 41,
                "complement" : "CASA",
                "number" : 70,
                "address" : {
                    "id" : 50594,
                    "name" : "RUA ONESIO FRANCISCO DE FARIAS",
                    "cep" : "87140000",
                    "neighborhood" : "CENTRO",
                    "city" : "PAIÇANDU",
                    "state" : "PR"
                }
            },
            selectedTypeIds: [  // <--- still needs implementation 
                {
                    id: '', 
                    name: ''
                }
            ]
        }],
        clientPhones : [ 
            {
                "id" : '', <-- if there is id update, if there isn't create
                "clientId" : '',
                "number" : ',
                "name" : ',
                "dateUpdated" : '',
                "dateCreated" : '',
                "dateRemoved" : 'null',
                "status" : ''
            }
        ]
    },
    order: {
    },
    task: {
    }
}
*/
const _ = require('lodash')
const sequelize = require('sequelize')

module.exports = (server) => { 
    //PRIVATES
    let _request = null
    let _transaction = null

    return {
    name: "draft/request/persistence",
    actions: {
        start(ctx){
            this._request = ctx.params.request

            return ctx.call("draft/request/persistence.setTransaction").then(() => {
            
                let promises = []
                if(_.has(this._request, "client")){
                    promises.push(ctx.call("draft/client/persistence.start", {
                        client: this._request.client,
                        transaction: this._transaction
                    }))
                }
                if(_.has(this._request, "order")){
                    promises.push(ctx.call("draft/request/persistence.setOrder"))
                }
                
                return Promise.all(promises).then((result) => {  
                    return ctx.call("draft/request/persistence.commit").then(() => {
                        return result
                    })
                    /*
                    return ctx.call("draft/request/persistence.setES", {
                        data: result,
                        transaction: this._transaction
                    }).then(() => {
                        return ctx.call("draft/request/persistence.commit").then(() => {
                            return result
                        })
                    }).catch(() => {
                        return ctx.call("draft/request/persistence.setES", {
                            data: result,
                            transaction: null
                        }).then(() => {
                            return ctx.call("draft/request/persistence.rollback")
                        }).catch((err) => {
                            console.log("Erro em: draft/request/persistence.setES (catch para transaction)")
                            return ctx.call("draft/request/persistence.rollback")
                        })
                    })
                    */
                }).catch((err) => {
                    return ctx.call("draft/request/persistence.rollback")                
                })
            })
        },

        setTransaction() {
            return server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
            })
        },

        setOrder(ctx){
            return ctx.call("draft/request/persistence.saveOrder").then((order) => {
                
                let promisses = []
                    
                if(_.has(this._request.order, "orderProducts")){
                    promisses.push(ctx.call("draft/request/persistence.setOrderProducts", {
                        data: {
                            requestOrderId: order.id
                        }
                    }))
                }

                return Promise.all(clientPromisses).then(() => {
                    return ctx.call("draft/client/persistence.saveES", {
                        transaction: this._transaction
                    })
                })

            })

        },

        setOrderProducts(ctx){
            return ctx.call("data/request.setRequestOrderProducts", {
                data: _.map(this._request.order.orderProducts, orderProduct => {
                    return _.assign(orderProduct, {
                        requestOrderId: ctx.params.data.requestOrderId,
                    })
                }),
                transaction: this._transaction
            }).then((orderProducts) => {
                return orderProducts
            })
        },

        saveOrder(ctx){
            if (this._request.order.id) { // update order
                return ctx.call("data/request.requestOrderUpdate", {
                    data: this._request.order,
                    where: {
                        id: this._request.order.id,
                        companyId: 1 // HARD CODED
                    },
                    transaction: this._transaction
                }).then((requestOrder) => {
                    return requestOrder
                }).catch((err) => {
                    console.log("Erro em: data/request.requestOrderUpdate")
                    throw new Error(err)
                })   
            }
            else { // create order
                return ctx.call("data/request.requestOrderCreate", {
                    data: this._request.order,
                    transaction: this._transaction
                }).then((requestOrder) => {
                    return requestOrder
                }).catch((err) => {
                    console.log("Erro em: data/request.requestOrderCreate")
                    throw new Error(err)
                })   
            }
        },

        setES(ctx) {
            ctx.params.data.forEach((data) => {
                if (_.has(data, "orderProducts")) {
                    return ctx.call("draft/request/persistence.setProductES", {
                        data: data.orderProducts,
                        transaction: ctx.params.transaction
                    }).then((responseProducts) => {
                        const esIndexPromises = []
                        responseProducts.products.forEach((product) => {
                            esIndexPromises.push(server.elasticSearch.index({
                                    index: 'main',
                                    type: 'product',
                                    id: product.id,
                                    body: _.omit(address, 'id')
                                }, function (esErr, esRes, esStatus) {
                                    if (esErr) {
                                        console.log("Erro em: draft/request/persistence.setES (product)")
                                        throw new Error(esErr)
                                    }
                                })
                            )
                        })
                        return Promise.all(esIndexPromises)
                    }).catch((err) => {
                        console.log("Erro em: draft/request/persistence.setES (general)")
                        throw new Error(err)
                    })
                }
            })
        },

        setProductES(ctx){
             return ctx.call("data/request.getOrderProduct", {
                where: {
                    id: parseInt(ctx.params.requestOrderId)
                },
                include: [{
                    model: server.mysql.Product,
                    as: 'product'
                }],
                transaction: (ctx.params.transaction) ? ctx.params.transaction : null
            }).then((requestOrder) => {
                let products = []

                if(_.has(requestOrder, "product")){
                    requestOrder.product.forEach((product) => {
                        products.push({
                            id: product.id,
                            companyId: product.companyId,
                            name: product.name,
                            suppliers: [{
                                supplierProductId: null,
                                supplierId: null,
                                name: 'SEM SUPPLIER CADASTRADO',
                                obs: null,
                                quantity: null,
                                price: null
                            }],
                            dateUpdated: product.dateUpdated,
                            dateCreated: product.dateCreated
                        })
                    })
                }
                return {products}
            })
        },

        /**
         * Commit persistence
         */
        commit() {
            console.log("Commit everything!")
            this._transaction.commit()
        },

        /**
         * Rollback persistence
         */
        rollback() {
            console.log("Oh God, just rollback!")
            this._transaction.rollback()
        }
    }
}}