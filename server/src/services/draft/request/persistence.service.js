const _ = require('lodash')
const sequelize = require('sequelize')
import moment from 'moment'
import EventResponse from '~server/models/EventResponse'

module.exports = (server) => { 
    //PRIVATES
    let _request = null
    let _transaction = null

    let _companyId = null
    let _userId = null

    let _draftId = null

    return {
    name: "draft/request/persistence",
    actions: {
        /**
         * @param {Object} request, {Int} companyId, {Int} userId
         * @returns {Promise.<object>} request
         */   
        start(ctx){
            //SET PRIVATES
            this._request = ctx.params.request
            this._companyId = ctx.params.companyId
            this._userId = ctx.params.userId
            this._draftId = ctx.params.request.draftId
           
            return ctx.call("draft/request/persistence.checkTempIds").then(() => {
             //START 
                return ctx.call("draft/request/persistence.setTransaction").then(() => {
                    let promises = []

                    //SAVE INITIAL CLIENT 
                    if(_.has(this._request, "client")){
                        promises.push(ctx.call("draft/client/persistence.start", {
                            client: this._request.client,
                            companyId: this._companyId,
                            transaction: this._transaction
                        }).then((client) => {
                            _.set(this._request, 'client', client)
                            return {client}
                        }).catch((err) => {
                            console.log("Erro em: draft/client/persistence.start")
                            throw new Error(err)
                        }))
                    }
                    //SAVE INITIAL REQUEST ORDER 
                    if(_.has(this._request, "order")){
                        promises.push(ctx.call("draft/request/persistence.setOrder").then((order) => {
                            return {order}
                        }).catch((err) => {
                            console.log("Erro em: draft/request/persistence.setOrder")
                            throw new Error(err)
                        }))
                    }
                    
                    return Promise.all(promises).then((result) => {
                        // SET RESULT'S PROMISES
                        const client = _.find(result, 'client')
                        const order = _.find(result, 'order')
                        const task = _.find(result, 'task')
                        
                        // SET REQUEST'S DATA
                        return ctx.call("draft/request/persistence.setRequest", {
                            data: {
                                companyId: this._companyId,
                                userId: this._userId,
                                clientId: (client) ? _.get(client, 'client.id') : null,
                                requestOrderId: (order) ? _.get(order, 'order.id') : null,
                                taskId: (task) ? _.get(task, 'task.id') : null,
                                deadlineDatetime: (this._request.deadlineDatetime) ? moment(this._request.deadlineDatetime).format("YYYY-MM-DD HH:mm:ss") : moment().add(20, 'm').format("YYYY-MM-DD HH:mm:ss"),
                                obs: (this._request.obs) ? this._request.obs : null
                            },
                            transaction: this._transaction
                        }).then((request) => {
                            return ctx.call("draft/request/persistence.createCard", {
                                data: request,
                                transaction: this._transaction
                            }).then(() => {
                                return ctx.call("draft/request/persistence.commit").then(() => {
                                    return new EventResponse(request)                        
                                }).catch((err) => {
                                    console.log("Erro em: draft/request/persistence.commit")
                                    return ctx.call("draft/request/persistence.rollback").then(() => {
                                        return new EventResponse(err)
                                    }) 
                                })
                            }).catch((err) => {
                                console.log("Erro em: draft/request/persistence.createCard")
                                return ctx.call("draft/request/persistence.rollback").then(() => {
                                    return new EventResponse(err)
                                }) 
                            })                            
                        }).catch((err) => {
                            console.log("Erro em: draft/request/persistence.setRequest")
                            return ctx.call("draft/request/persistence.rollback").then(() => {
                                return new EventResponse(err)
                            })         
                        })
                    }).catch((err) => {
                        console.log("Erro em: draft/request/persistence.setRequest")
                        return ctx.call("draft/request/persistence.rollback").then(() => {
                            return new EventResponse(err)
                        })      
                    })
                })
            }).catch((err) => {
                console.log("Erro em: draft/request/persistence.removeTempIds")
                return ctx.call("draft/request/persistence.rollback").then(() => {
                    return new EventResponse(err)
                })      
            })
        },
        /**
         * @returns {Promise} set transaction
         */ 
        setTransaction() {
            return server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
            })
        },

        createCard(ctx) {
            return ctx.call("data/request.getOne", {
                where: {
                    id: ctx.params.data.id
                },
                include: [{
                    model: server.mysql.Client,
                    as: 'client'
                }, {
                    model: server.mysql.RequestTimeline,
                    as: "requestTimeline",
                    include: [{
                        model: server.mysql.User,
                        as: "triggeredByUser",
                    }, {
                        model: server.mysql.User,
                        as: "user",
                    }]
                }],
                transaction: ctx.params.transaction
            }).then((request) => {
                return ctx.call("request-board.consultSectionOne", {
                    where: {
                        companyId: request.companyId
                    },
                    companyId: request.companyId
                }).then((section) => {
                    let maxCard = _.maxBy(section.cards, (card) => {
                        return card.position
                    })
                    let maxCardPosition = 65535
                    if (maxCard) maxCardPosition += maxCard.position
                    return ctx.call("request-board.createCard", {
                        section: section,
                        data: {
                            requestId: request.id,
                            position: maxCardPosition,
                            section: section.id,
                            createdBy: _.first(request.requestTimeline).triggeredBy,
                            companyId: request.companyId
                        },
                        request: request
                    }).then((card) => {
                        return card
                    })
                })
            }).catch((err) => {
                console.log(err)
                throw new Error(err)
            })
        },

        setRequest(ctx){
            return ctx.call("draft/request/persistence.saveRequest",{
                data: ctx.params.data
            }).then((request) => {
                let promises = []
                promises.push(ctx.call("data/request.createTimeline", {
                        data: {
                            requestId: request.id,
                            triggeredBy: this._userId,
                            companyId: this._companyId,
                            userId: (this._request.responsibleUserId) ? this._request.responsibleUserId : this._userId,
                            status: 'pending'
                        },
                        transaction: this._transaction
                    })
                )

                if(this._request.requestPaymentMethods){
                    promises.push(ctx.call("data/request.setPaymentMethods", {
                            data: this._request.requestPaymentMethods,
                            requestId: request.id,
                            transaction: this._transaction
                        })
                    )
                }

                if(this._request.clientAddressId){
                    const clientAddressSelect = _.find(this._request.client.clientAddresses, 'select')
                    promises.push(ctx.call("data/request.setRequestClientAddresses", {
                            data: [_.assign({clientAddressId: clientAddressSelect.id,
                                requestId: request.id
                            })],
                            requestId: request.id,
                            transaction: this._transaction
                        })
                    )
                }

                if(this._request.clientPhoneId){
                    const clientPhoneSelect = _.find(this._request.client.clientPhones, 'select')
                    promises.push(ctx.call("data/request.setRequestClientPhones", {
                            data: [_.assign({clientPhoneId: clientPhoneSelect.id,
                                requestId: request.id
                            })],
                            requestId: request.id,
                            transaction: this._transaction
                        })
                    )
                }

                return Promise.all(promises).then(() => {
                    return request
                }).catch((err) => {
                    console.log("Erro em: data/request.setRequest - PROMISE ALL")
                    throw new Error(err)
                })         
            }).catch((err) => {
                console.log(err, "Erro em: data/request.saveRequest")
                throw new Error(err)
            })  
        },

        saveRequest(ctx){
            if (this._request.id) { // update request
                return ctx.call("data/request.update", {
                    data: ctx.params.data,
                    where: {
                        id: this._request.id,
                        companyId: this._companyId
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
                        console.log("Erro em: draft/request/persistence.setOrderProducts")
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
                    }).catch((err) => {
                        console.log("Erro em: draft/request/persistence.saveES")
                        throw new Error(err)
                    })
                })
            })
        },

        checkTempIds(ctx){
            let removeTemps = []
            if(_.has(this._request, "client")){
                if(_.has(this._request, "client.clientAddresses")){
                    removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                            path: 'client.clientAddresses',
                            select: 'clientAddressId'
                        })
                    )
                }
                if(_.has(this._request, "client.clientPhones")){
                    removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                            path: 'client.clientPhones',
                            select: 'clientPhoneId'
                        })
                    )
                }
                if(_.has(this._request, "client.clientCustomFields")){
                    removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                            path: 'client.clientCustomFields'
                        })
                    )
                }
            }
            if(_.has(this._request, "order")){
                if(_.has(this._request, "order.orderProducts")){
                    removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                            path: 'order.orderProducts'
                        })
                    )
                }
            }
            if(_.has(this._request, "requestPaymentMethods")){
                removeTemps.push(ctx.call("draft/request/persistence.removeTempIds", {
                        path: 'requestPaymentMethods'
                    })
                )
            }
            return Promise.all(removeTemps).then(() => {
                return true
            }).catch((err) => {
                console.log("Erro em: draft/request/persistence.checkTempIds")
                throw new Error(err)
            })
        },

        removeTempIds(ctx){
            let newValue = []
            _.map(_.get(this._request, ctx.params.path), (obj) => {
                if(ctx.params.select && _.has(this._request, ctx.params.select)){
                    if(obj.id === _.get(this._request, ctx.params.select)){
                        obj.select = true
                    }
                    else{
                        obj.select = false
                    }                        
                }
                if(_.get(obj, 'id', false) && !_.isNumber(obj.id) && obj.id.substring(0,4) === "tmp/"){
                    obj.id = null              
                }
                newValue.push(obj)
            })
            return _.set(this._request, ctx.params.path, newValue)
        },

        setOrderProducts(ctx){
            return ctx.call("draft/request/persistence.validValues").then(() => {
                return ctx.call("data/request.setRequestOrderProducts", {
                    data: _.map(this._request.order.orderProducts, orderProduct => {
                        return _.assign(orderProduct, {
                            requestOrderId: ctx.params.data.requestOrderId,
                        })
                    }),
                    companyId: this._companyId, 
                    requestOrderId: ctx.params.data.requestOrderId,
                    transaction: this._transaction
                }).then((orderProducts) => {
                    return orderProducts
                }).catch((err) => {
                    console.log("Erro em: data/request.setRequestOrderProducts")
                    throw new Error(err)
                })
            }).catch((err) => {
                console.log("Erro em: draft/request/persistence.validValues")
                throw new Error(err)
            })
        },

        validValues(ctx){
            let valueOrder = null
            let valuePayments = null
            this._request.order.orderProducts.forEach((orderProduct) => {
                valueOrder += orderProduct.quantity * (orderProduct.unitPrice - orderProduct.unitDiscount)
            })
            this._request.requestPaymentMethods.forEach((paymentMethods) => {
                valuePayments += paymentMethods.amount
            })
            if(valueOrder === valuePayments){
                return true
            }
            else{
                throw new Error('Valores incompativeis')
            }
        },

        saveOrder(ctx){
            if (this._request.order.id) { // update order
                return ctx.call("data/request.requestOrderUpdate", {
                    data: this._request.order,
                    where: {
                        id: this._request.order.id,
                        companyId: this._companyId
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
            }).catch((err) => {
                console.log("Erro em: data/request.getRequestOrder")
                throw new Error(err)
            })
        },

        /**
         * Commit persistence
         */
        commit(ctx) {
            console.log("Commiting...")
            this._transaction.commit().then(() => {
                console.log("Commit everything!")
                console.log("Removing draft...")
                return ctx.call("draft.remove", {
                    data: {
                        draftId: this._draftId,
                        companyId: this._companyId
                    }
                }).then(() => {
                    console.log("Remove draft!")
                    return true
                })
            })
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