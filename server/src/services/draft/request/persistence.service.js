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
import EventResponse from '~server/models/EventResponse'

module.exports = (server) => { 
    //PRIVATES
    let _request = null
    let _transaction = null

    let _companyId = null
    let _userId = null

    return {
    name: "draft/request/persistence",
    actions: {
        start(ctx){
            //SET
            this._request = ctx.params.request
            this._companyId = ctx.params.companyId,
            this._userId = ctx.params.userId

            //START

            return ctx.call("draft/request/persistence.setTransaction").then(() => {
                let promises = []
                
                if(_.has(this._request, "client")){
                    promises.push(ctx.call("draft/client/persistence.start", {
                        client: this._request.client,
                        transaction: this._transaction
                    }).then((client) => {
                        return {client}
                    }).catch((err) => {
                        //console.log(err) // COMENTAR
                        throw new Error(err)
                    }))
                }
                if(_.has(this._request, "order")){
                    promises.push(ctx.call("draft/request/persistence.setOrder").then((order) => {
                        return {order}
                    }).catch((err) => {
                        //console.log('AQUI') comentar
                        throw new Error(err)
                    }))
                }
                
                return Promise.all(promises).then((result) => {
                    const client = _.find(result, 'client')
                    const order = _.find(result, 'order')
                    const task = _.find(result, 'task')

                    return ctx.call("draft/request/persistence.setRequest", {
                        data: {
                            companyId: this._companyId,
                            userId: this._userId,
                            clientId: (client) ? _.get(client, 'client.id') : null,
                            requestOrderId: (order) ? _.get(order, 'order.id') : null,
                            taskId: (task) ? _.get(task, 'task.id') : null
                        },
                        transaction: this._transaction
                    }).then((request) => {  
                        return ctx.call("draft/request/persistence.commit").then(() => {
                            //console.log(result)
                            return new EventResponse(request) 
                        }).catch((err) => {
                            //console.log(err) // COMENTAR
                            return ctx.call("draft/request/persistence.rollback").then(() => {
                                return new EventResponse(err)
                            })
                        })
                    }).catch((err) => {
                        // console.log(err) COMENTAR
                        return ctx.call("draft/request/persistence.rollback").then(() => {
                            return new EventResponse(err)
                        })           
                    })
                }).catch((err) => {
                    //console.log(err) // COMENTAR
                    return ctx.call("draft/request/persistence.rollback").then(() => {
                        return new EventResponse(err)
                    })           
                })
            })
        },

        setTransaction() {
            return server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
            })
        },

        setRequest(ctx){
            return ctx.call("draft/request/persistence.saveRequest",{
                data: ctx.params.data
            }).then((request) => {
                return ctx.call("data/request.createTimeline", {
                    data: {
                        requestId: request.id,
                        triggeredBy: this._userId,
                        companyId: this._companyId,
                        userId: (this._request.responsibleUserId) ? this._request.responsibleUserId : this._userId,
                        status: 'pending'
                    },
                    transaction: this._transaction
                }).then(() => {
                    return request
                }).catch((err) => {
                    return new EventResponse(err)
                })            
            })
        },

        saveRequest(ctx){
            if (this._request.id) { // update request
                return ctx.call("data/request.update", {
                    data: ctx.params.data,
                    where: {
                        id: this._request.id,
                        companyId: 1 // HARD CODED
                    },
                    transaction: this._transaction
                }).then((request) => {
                    return request
                }).catch((err) => {
                    console.log("Erro em: data/request.update")
                    throw new Error(err)
                })   
            }
            else { // create request
                return ctx.call("data/request.create", {
                    data: ctx.params.data,
                    transaction: this._transaction
                }).then((request) => {
                    return request
                }).catch((err) => {
                    console.log("Erro em: data/request.create")
                    throw new Error(err)
                })   
            }
        },

        setOrder(ctx){
            return ctx.call("draft/request/persistence.saveOrder").then((order) => {
                
                let promisses = []
                    
                if(_.has(this._request.order, "orderProducts")){
                    promisses.push(ctx.call("draft/request/persistence.setOrderProducts", {
                        data: {
                            requestOrderId: order.id
                        }
                    }).then((orderProducts) => {
                        _.set(order, "orderProducts", orderProducts)
                    }).catch((err) => {
                        //console.log('AQUI') COMENTAR
                        throw new Error(err)
                    })
                )
                }

                return Promise.all(promisses).then(() => {
                    return ctx.call("draft/request/persistence.saveES", {
                        requestOrderId: order.id,
                        transaction: this._transaction
                    }).then(() => {
                        return order
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
                companyId: 1, // HARD CODED
                requestOrderId: ctx.params.data.requestOrderId,
                transaction: this._transaction
            }).then((orderProducts) => {
                return orderProducts
            }).catch((err) => {
                // console.log('AQUI') COMENTAR
                throw new Error(err)
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

        saveES(ctx) {
            if (ctx.params.requestOrderId) {
                return ctx.call("draft/request/persistence.setProductES", {
                    requestOrderId: ctx.params.requestOrderId,
                    transaction: ctx.params.transaction
                }).then((responseProducts) => {
                    const esIndexPromises = []
                    responseProducts.products.forEach((product) => {
                        esIndexPromises.push(server.elasticSearch.index({
                                index: 'main',
                                type: 'product',
                                id: product.id,
                                body: _.omit(product, 'id')
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
        },

        setProductES(ctx){
             return ctx.call("data/request.getRequestOrder", {
                where: {
                    id: parseInt(ctx.params.requestOrderId)
                },
                include: [{
                    model: server.mysql.RequestOrderProduct,
                    as: 'requestOrderProducts',
                    include: [{
                        model: server.mysql.Product,
                        as: 'product'
                    }]
                }],
                transaction: (ctx.params.transaction) ? ctx.params.transaction : null
            }).then((requestOrder) => {
                let products = []

                if(_.has(requestOrder, "requestOrderProducts")){
                    requestOrder.requestOrderProducts.forEach((requestOrderProduct) => {
                        products.push({
                            id: requestOrderProduct.product.id,
                            companyId: requestOrderProduct.product.companyId,
                            name: requestOrderProduct.product.name,
                            suppliers: [{
                                supplierProductId: null,
                                supplierId: null,
                                name: 'SEM SUPPLIER CADASTRADO',
                                obs: null,
                                quantity: null,
                                price: null
                            }],
                            dateUpdated: requestOrderProduct.product.dateUpdated,
                            dateCreated: requestOrderProduct.dateCreated
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