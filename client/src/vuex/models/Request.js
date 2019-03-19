import { Model } from "@vuex-orm/core";
import shortid from "shortid"
import utils from '../../utils'
import store from '../../vuex/store'
import _ from "lodash"
import PromiseQueue from 'p-queue'

import User from "./User"
import Client from "./Client"
import Card from "./Card"
import Window from "./Window"
import RequestOrder from "./RequestOrder"
import moment from "moment/moment"
import RequestPayment from "./RequestPayment"
import RequestChat from "./RequestChat"
import RequestClientAddress from "./RequestClientAddress"
import RequestUIState from "./RequestUIState"

export default class Request extends Model {
    static entity = "requests";
    static fields() {
        return {
            id: this.attr("tmp/" + shortid.generate()),
            userId: this.attr(null),
            user: this.belongsTo(User, "userId"),
            clientId: this.attr(null),
            client: this.belongsTo(Client, "clientId"),
            requestOrderId: this.attr(null),
            requestOrder: this.belongsTo(RequestOrder, "requestOrderId"),
            card: this.hasOne(Card, "requestId"),
            phoneLine: this.attr(null),
            obs: this.attr(null),
            requestUIState: this.hasOne(RequestUIState, "requestId"),
            requestPayments: this.hasMany(RequestPayment, "requestId"),
            requestChats: this.hasMany(RequestChat, "requestId"),
            requestClientAddresses: this.hasMany(RequestClientAddress, "requestId"),
            deliveryDate: this.attr(null),
            deliveredBy: this.attr(null),
            finishedBy: this.attr(null),
            deliveredDate: this.attr(null),
            dateUpdated: this.attr(null),
            dateCreated: this.attr(null),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }

    static _extractModelFields(ctx, { modelName, obj }){
        const returnObj = {}
        ctx.modelDefinitions[(modelName.includes('STATE_')) ? "stateModels" : "offlineDBModels"][modelName].split(',').forEach((column) => {
            column = column.trim()
            if(_.has(obj,column)){
                returnObj[column] = obj[column]
            }
        })
        return returnObj
    }

    static _offlineDBHelper(ctx, { modelName, action, data, primaryKey = null }){
        if(action === 'put'){
            return ctx.$db[modelName].put(Request._extractModelFields(ctx, {
                modelName,
                obj: data
            }))
        }
        else if(action === 'patch'){
            return ctx.$db[modelName].update(data.id, data)
        }
        else if(action === 'bulkPut'){
            data = _.map(data, (dataItem) => {
                return Request._extractModelFields(ctx, {
                    modelName,
                    obj: dataItem
                })
            })
            return ctx.$db[modelName].bulkPut(data)
        }
        else if(action === 'bulkPutWithReplacement'){
            return ctx.$db[modelName].where({
                [primaryKey]: _.first(data)[primaryKey]
            }).toArray((itemsToDelete) => {
                const ids = _.map(itemsToDelete, (itemToDelete) => itemToDelete.id)
                return ctx.$db[modelName].bulkDelete(ids).then(() => {
                    return Request._offlineDBHelper(ctx, {
                        modelName,
                        action: 'bulkPut',
                        data
                    })
                })
            })
        }
    }

    static async show(ctx, request, { showWindow = false, ignoreOfflineDBInsertion = false }){
        // guarantee the order of promises
        const requestPromiseQueue = new PromiseQueue({ concurrency: 1})

        // request
        requestPromiseQueue.add(async () => {
            await Request._offlineDBHelper(ctx, {
                modelName: "requests",
                action: 'put',
                data: request
            })
            ctx.$store.dispatch("entities/insertOrUpdate", {
                entity: 'requests',
                ignoreOfflineDBInsertion: false,
                data: request
            })

            const requestId = _.get(request, "tmpId", request.id)

            const card = Card.query().where("requestId", requestId).with("request.requestUIState").first()

            let windowId = `tmp/${shortid.generate()}`
            let cardId = `tmp/${shortid.generate()}`
            let requestUIStateId = `tmp/${shortid.generate()}`

            // map request card/window/requestUIState
            if(utils.isTmp(requestId) && card){ // is tmp && card exists - it means that the request was created by this user
                cardId = card.id
                requestUIStateId = card.request.requestUIState.id
                store.dispatch("entities/delete", {
                    entity: 'requests',
                    where: requestId
                })
                store.dispatch("entities/update", {
                    entity: 'cards',
                    ignoreOfflineDBInsertion: true,
                    where: cardId,
                    data: {
                        requestId: request.id
                    }
                })
                requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                    modelName: "STATE_cards",
                    action: "patch",
                    data: Card.query().where("id", cardId).first()
                }))
                store.dispatch("entities/update", {
                    entity: 'requestUIState',
                    ignoreOfflineDBInsertion: true,
                    where: requestUIStateId,
                    data: {
                        requestId: request.id
                    }
                })
                requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                    modelName: "STATE_requestUIState",
                    action: "patch",
                    data: RequestUIState.query().where("id", requestUIStateId).first()
                }))
            }
            else if(!card) { // card don't exist
                store.dispatch("entities/insert", {
                    entity: 'windows',
                    ignoreOfflineDBInsertion: true,
                    data: {
                        id: windowId,
                        zIndex:
                        store.getters["entities/windows/query"]().max("zIndex") + 1,
                        show: showWindow
                    }
                })
                requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                    modelName: "STATE_windows",
                    action: "put",
                    data: Window.query().where("id", windowId).first()
                }))
                store.dispatch("entities/insert", {
                    entity: 'cards',
                    ignoreOfflineDBInsertion: true,
                    data: {
                        id: cardId,
                        windowId: windowId,
                        requestId: request.id
                    }
                })
                requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                    modelName: "STATE_cards",
                    action: "put",
                    data: Card.query().where("id", cardId).first()
                }))
                store.dispatch("entities/insert", {
                    entity: 'requestUIState',
                    ignoreOfflineDBInsertion: true,
                    data: {
                        id: requestUIStateId,
                        windowId: windowId,
                        requestId: request.id
                    }
                })
                requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                    modelName: "STATE_requestUIState",
                    action: "put",
                    data: RequestUIState.query().where("id", requestUIStateId).first()
                }))
            }

            // request.requestPayments

            if(_.isArray(request.requestPayments) && request.requestPayments.length){
                requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                    modelName: "requestPayments",
                    action: "bulkPutWithReplacement",
                    data: request.requestPayments,
                    primaryKey: "requestId"
                }).then((promise) => {
                    const requestPayments = store.getters['entities/requestPayments']().where('requestId',(requestId) => {
                        return requestId === request.id
                    }).get()
                    requestPayments.forEach((requestPayment) => {
                        store.dispatch('entities/delete', {
                            entity: 'requestPayments',
                            ignoreOfflineDBInsertion,
                            where: requestPayment.id
                        })
                    })
                    store.dispatch("entities/insertOrUpdate", {
                        entity: 'requestPayments',
                        ignoreOfflineDBInsertion,
                        data: request.requestPayments
                    })
                    return promise
                }))
            }

            // check if requestOrder exists

            if(request.requestOrderId){

                // request.requestOrder

                requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                    modelName: "requestOrders",
                    action: 'put',
                    data: request.requestOrder
                }).then((promise) => {
                    store.dispatch("entities/insertOrUpdate", {
                        entity: 'requestOrders',
                        ignoreOfflineDBInsertion,
                        data: request.requestOrder
                    });
                    return promise
                }))

                // request.requestOrder.requestOrderProducts

                if(_.isArray(request.requestOrder.requestOrderProducts) && request.requestOrder.requestOrderProducts.length){
                    requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                        modelName: "requestOrderProducts",
                        action: "bulkPutWithReplacement",
                        data: request.requestOrder.requestOrderProducts,
                        primaryKey: "requestOrderId"
                    }).then((promise) => {
                        const requestOrderProducts = store.getters['entities/requestOrderProducts']().where('requestOrderId',(requestOrderId) => {
                            return requestOrderId === request.requestOrder.id
                        }).get()
                        requestOrderProducts.forEach((requestOrderProduct) => {
                            store.dispatch('entities/delete', {
                                entity: 'requestOrderProducts',
                                ignoreOfflineDBInsertion,
                                where: requestOrderProduct.id
                            })
                        })
                        store.dispatch("entities/insertOrUpdate", {
                            entity: 'requestOrderProducts',
                            ignoreOfflineDBInsertion,
                            data: request.requestOrder.requestOrderProducts
                        });
                        return promise
                    }))
                }

            }

            // check if client exists

            if(request.clientId){
                // request.client

                requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                    modelName: "clients",
                    action: 'put',
                    data: request.client
                }).then((promise) => {
                    store.dispatch("entities/insertOrUpdate", {
                        entity: 'clients',
                        ignoreOfflineDBInsertion,
                        data: request.client
                    });
                    if(_.isArray(request.client.clientAddresses) && request.client.clientAddresses.length){
                        request.client.clientAddresses.forEach(clientAddress => {
                            Request._offlineDBHelper(ctx, {
                                modelName: "addresses",
                                action: 'put',
                                data: clientAddress.address
                            })
                            store.dispatch("entities/insertOrUpdate", {
                                entity: 'addresses',
                                ignoreOfflineDBInsertion,
                                data: clientAddress.address
                            })
                        })
                    }
                    return promise
                }))

                // request.client.clientAddresses

                if(_.isArray(request.client.clientAddresses) && request.client.clientAddresses.length) {
                    requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                        modelName: "clientAddresses",
                        action: "bulkPutWithReplacement",
                        data: request.client.clientAddresses,
                        primaryKey: "clientId"
                    }).then((promise) => {
                        const clientAddresses = store.getters['entities/clientAddresses']().where('clientId', (clientId) => {
                            return clientId === request.client.id
                        }).get()
                        clientAddresses.forEach((clientAddress) => {
                            store.dispatch('entities/delete', {
                                where: clientAddress.id,
                                ignoreOfflineDBInsertion,
                                entity: 'clientAddresses'
                            })
                        })
                        store.dispatch("entities/insertOrUpdate", {
                            entity: 'clientAddresses',
                            data: request.client.clientAddresses,
                            ignoreOfflineDBInsertion
                        })
                        return promise
                    }))
                }

                // request.requestClientAddresses

                if(_.isArray(request.requestClientAddresses) && request.requestClientAddresses.length){
                    requestPromiseQueue.add(() => Request._offlineDBHelper(ctx, {
                        modelName: "requestClientAddresses",
                        action: "bulkPutWithReplacement",
                        data: request.requestClientAddresses,
                        primaryKey: "requestId"
                    }).then((promise) => {
                        store.dispatch("entities/insertOrUpdate", {
                            entity: 'requestClientAddresses',
                            ignoreOfflineDBInsertion,
                            data: request.requestClientAddresses
                        })
                        return promise
                    }))
                }
            }
        })

        return requestPromiseQueue.onIdle().then(async () => {
            // check if request has client
            if(request.clientId){
                // inserting search data
                const searchClients = _.map(request.client.clientAddresses, (clientAddress) => {
                    return {
                        id: `${request.client.id}#${clientAddress.id}`,
                        name: request.client.name,
                        address: _.get(clientAddress, "address.name", null),
                        neighborhood: _.get(clientAddress, "address.neighborhood", null),
                        number: _.get(clientAddress, "number", false) ? "" + _.get(clientAddress, "number") : null,
                        complement: _.get(clientAddress, "complement", null),
                        city: _.get(clientAddress, "address.city", null),
                        state: _.get(clientAddress, "address.state", null)
                    }
                })
                ctx.$db.searchClients.bulkPut(searchClients).then(() => {
                    searchClients.forEach((searchClient) => {
                        ctx.$static.searchClientsIndex.addDoc(searchClient)
                    })
                })
                const searchAddresses = _.map(request.client.clientAddresses, (clientAddress) => {
                    return {
                        id: _.get(clientAddress, "address.id", null),
                        name: _.get(clientAddress, "address.name", null),
                        address: _.get(clientAddress, "address.name", null),
                        neighborhood: _.get(clientAddress, "address.neighborhood", null),
                        city: _.get(clientAddress, "address.city", null),
                        state: _.get(clientAddress, "address.state", null),
                        cep: _.get(clientAddress, "address.cep", null),
                        country: _.get(clientAddress, "address.country", null)
                    }
                })
                ctx.$db.searchAddresses.bulkPut(searchAddresses).then(() => {
                    searchAddresses.forEach((searchAddress) => {
                        ctx.$static.searchAddressesIndex.addDoc(searchAddress)
                    })
                })
            }

            // update card info

            const savedRequest = Request.query()
                .with("card")
                .with("client.clientAddresses.address")
                .with("client.clientPhones")
                .with("requestClientAddresses.clientAddress.address")
                .with("requestOrder.requestOrderProducts")
                .with("requestPayments")
                .with("requestClientAddresses")
                .with("requestUIState")
                .find(request.id)

            ctx.$store.dispatch("entities/update", {
                entity: 'requestUIState',
                where: savedRequest.requestUIState.id,
                data: {
                    requestString: Request.getRequestComparationObj(savedRequest),
                    hasRequestChanges: false,
                    hasRequestOrderChanges: false
                }
            })

            const getClientAddress = () => {
                if (savedRequest.requestClientAddresses.length) {
                    const firstClientAddress = _.first(savedRequest.requestClientAddresses).clientAddress;
                    return _.truncate(_.startCase(_.toLower(firstClientAddress.address.name)), { length: 24, separator: "", omission: "..."}) +
                        ", " +
                        (firstClientAddress.number ? firstClientAddress.number : "S/N") +
                        (firstClientAddress.complement ? " " + firstClientAddress.complement : "")
                }
                return "SEM ENDEREÇO";
            }

            const getOrderSubtotal = () => {
                if(!savedRequest.requestOrderId){
                    return null
                }
                return _.sumBy(
                    savedRequest.requestOrder.requestOrderProducts,
                    requestOrderProduct => {
                        return (
                            requestOrderProduct.quantity * (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount)
                        )
                    }
                )
            }

            const cardData = _.assign(savedRequest.card, {
                clientName: (savedRequest.clientId) ? ((_.isEmpty(savedRequest.client.name)) ? "SEM NOME" : savedRequest.client.name) : "SEM CLIENTE",
                clientAddress: (savedRequest.clientId) ? getClientAddress() : "SEM ENDEREÇO",
                orderSubtotal: getOrderSubtotal(),
                status: savedRequest.status,
                responsibleUserId: savedRequest.userId
            })

            await Request._offlineDBHelper(ctx, {
                modelName: "STATE_cards",
                action: 'put',
                data: cardData
            }).then(() => {
                ctx.$store.dispatch("entities/insertOrUpdate", {
                    entity: 'cards',
                    ignoreOfflineDBInsertion: true,
                    data: cardData
                })
                return true
            })

            return savedRequest.id

        })

    }

    /*static guaranteeDependencies(request,promiseQueue,fillOfflineDBWithSyncedData,ignoreOfflineDBInsertion = false){

        const requestId = _.get(request, "tmpId", request.id)

        const card = Card.query().where("requestId", requestId)
            .with("request.requestUIState")
            .first()

        let windowId = `tmp/${shortid.generate()}`
        let cardId = `tmp/${shortid.generate()}`
        let requestUIStateId = `tmp/${shortid.generate()}`

        // map request card/window/requestUIState
        if(utils.isTmp(requestId) && card){ // is tmp && card exists - it means that the request was created by this user
            cardId = card.id
            requestUIStateId = card.request.requestUIState.id
            store.dispatch("entities/delete", {
                entity: 'requests',
                where: requestId
            })
            store.dispatch("entities/update", {
                entity: 'cards',
                ignoreOfflineDBInsertion: true,
                where: cardId,
                data: {
                    requestId: request.id
                }
            })
            promiseQueue.add(() => fillOfflineDBWithSyncedData(
                "STATE_cards",
                "patch",
                Card.query().where("id", cardId).first()
            ))
            store.dispatch("entities/update", {
                entity: 'requestUIState',
                ignoreOfflineDBInsertion: true,
                where: requestUIStateId,
                data: {
                    requestId: request.id
                }
            })
            promiseQueue.add(() => fillOfflineDBWithSyncedData(
                "STATE_requestUIState",
                "patch",
                RequestUIState.query().where("id", requestUIStateId).first()
            ))
        }
        else if(!card) { // card don't exist
            store.dispatch("entities/insert", {
                entity: 'windows',
                ignoreOfflineDBInsertion: true,
                data: {
                    id: windowId,
                    zIndex:
                    store.getters["entities/windows/query"]().max("zIndex") + 1,
                    show: false
                }
            })
            promiseQueue.add(() => fillOfflineDBWithSyncedData(
                "STATE_windows",
                "put",
                Window.query().where("id", windowId).first()
            ))
            store.dispatch("entities/insert", {
                entity: 'cards',
                ignoreOfflineDBInsertion: true,
                data: {
                    id: cardId,
                    windowId: windowId,
                    requestId: request.id
                }
            })
            promiseQueue.add(() => fillOfflineDBWithSyncedData(
                "STATE_cards",
                "put",
                Card.query().where("id", cardId).first()
            ))
            store.dispatch("entities/insert", {
                entity: 'requestUIState',
                ignoreOfflineDBInsertion: true,
                data: {
                    id: requestUIStateId,
                    windowId: windowId,
                    requestId: request.id
                }
            })
            promiseQueue.add(() => fillOfflineDBWithSyncedData(
                "STATE_requestUIState",
                "put",
                RequestUIState.query().where("id", requestUIStateId).first()
            ))
        }

        // request.requestPayments

        if(_.isArray(request.requestPayments) && request.requestPayments.length){
            promiseQueue.add(() => fillOfflineDBWithSyncedData(
                "requestPayments",
                "bulkPutWithReplacement",
                request.requestPayments,
                "requestId"
            ).then((promise) => {
                const requestPayments = store.getters['entities/requestPayments']().where('requestId',(requestId) => {
                    return requestId === request.id
                }).get()
                requestPayments.forEach((requestPayment) => {
                    store.dispatch('entities/delete', {
                        entity: 'requestPayments',
                        ignoreOfflineDBInsertion,
                        where: requestPayment.id
                    })
                })
                store.dispatch("entities/insertOrUpdate", {
                    entity: 'requestPayments',
                    ignoreOfflineDBInsertion,
                    data: request.requestPayments
                })
                return promise
            }))
        }

        // check if requestOrder exists

        if(request.requestOrderId){

            // request.requestOrder

            promiseQueue.add(() => fillOfflineDBWithSyncedData("requestOrders", 'put', request.requestOrder).then((promise) => {
                store.dispatch("entities/insertOrUpdate", {
                    entity: 'requestOrders',
                    ignoreOfflineDBInsertion,
                    data: request.requestOrder
                });
                return promise
            }))

            // request.requestOrder.requestOrderProducts

            if(_.isArray(request.requestOrder.requestOrderProducts) && request.requestOrder.requestOrderProducts.length){
                promiseQueue.add(() => fillOfflineDBWithSyncedData(
                    "requestOrderProducts",
                    "bulkPutWithReplacement",
                    request.requestOrder.requestOrderProducts,
                    "requestOrderId"
                ).then((promise) => {
                    const requestOrderProducts = store.getters['entities/requestOrderProducts']().where('requestOrderId',(requestOrderId) => {
                        return requestOrderId === request.requestOrder.id
                    }).get()
                    requestOrderProducts.forEach((requestOrderProduct) => {
                        store.dispatch('entities/delete', {
                            entity: 'requestOrderProducts',
                            ignoreOfflineDBInsertion,
                            where: requestOrderProduct.id
                        })
                    })
                    store.dispatch("entities/insertOrUpdate", {
                        entity: 'requestOrderProducts',
                        ignoreOfflineDBInsertion,
                        data: request.requestOrder.requestOrderProducts
                    });
                    return promise
                }))
            }

        }

        // check if client exists

        if(request.clientId){
            // request.client

            promiseQueue.add(() => fillOfflineDBWithSyncedData("clients", 'put', request.client).then((promise) => {
                store.dispatch("entities/insertOrUpdate", {
                    entity: 'clients',
                    ignoreOfflineDBInsertion,
                    data: request.client
                });
                if(_.isArray(request.client.clientAddresses) && request.client.clientAddresses.length){
                    request.client.clientAddresses.forEach(clientAddress => {
                        fillOfflineDBWithSyncedData("addresses", 'put', clientAddress.address)
                        store.dispatch("entities/insertOrUpdate", {
                            entity: 'addresses',
                            ignoreOfflineDBInsertion,
                            data: clientAddress.address
                        })
                    })
                }
                return promise
            }))

            // request.client.clientAddresses

            if(_.isArray(request.client.clientAddresses) && request.client.clientAddresses.length) {
                promiseQueue.add(() => fillOfflineDBWithSyncedData(
                    "clientAddresses",
                    "bulkPutWithReplacement",
                    request.client.clientAddresses,
                    "clientId"
                ).then((promise) => {
                    const clientAddresses = store.getters['entities/clientAddresses']().where('clientId', (clientId) => {
                        return clientId === request.client.id
                    }).get()
                    clientAddresses.forEach((clientAddress) => {
                        store.dispatch('entities/delete', {
                            where: clientAddress.id,
                            ignoreOfflineDBInsertion,
                            entity: 'clientAddresses'
                        })
                    })
                    store.dispatch("entities/insertOrUpdate", {
                        entity: 'clientAddresses',
                        data: request.client.clientAddresses,
                        ignoreOfflineDBInsertion
                    })
                    return promise
                }))
            }

            // request.requestClientAddresses

            if(_.isArray(request.requestClientAddresses) && request.requestClientAddresses.length){
                promiseQueue.add(() => fillOfflineDBWithSyncedData(
                    "requestClientAddresses",
                    "bulkPutWithReplacement",
                    request.requestClientAddresses,
                    "requestId"
                ).then((promise) => {
                    store.dispatch("entities/insertOrUpdate", {
                        entity: 'requestClientAddresses',
                        ignoreOfflineDBInsertion,
                        data: request.requestClientAddresses
                    })
                    return promise
                }))
            }
        }

    }*/

    static getRequestComparationObj(request){
        let requestChangeString = JSON.parse(JSON.stringify(request))
        requestChangeString = _.omit(requestChangeString, ['user','card','requestUIState','dateUpdated','dateCreated'])

        if(requestChangeString.client){
            requestChangeString.client = _.omit(requestChangeString.client, ['clientGroup','dateUpdated','dateCreated'])
            requestChangeString.client.clientAddresses = _.map(requestChangeString.client.clientAddresses, (clientAddress) => {
                clientAddress = _.omit(clientAddress, ['client','dateUpdated','dateCreated'])
                return clientAddress
            })
            requestChangeString.client.clientPhones = _.map(requestChangeString.client.clientPhones, (clientPhone) => {
                clientPhone = _.omit(clientPhone, ['client','dateUpdated','dateCreated'])
                return clientPhone
            })
        }
        requestChangeString.requestClientAddresses = _.map(requestChangeString.requestClientAddresses, (requestClientAddress) => {
            requestClientAddress = _.omit(requestClientAddress, ['clientAddress','request','dateUpdated','dateCreated'])
            return requestClientAddress
        })
        if(requestChangeString.requestOrder){
            requestChangeString.requestOrder = _.omit(requestChangeString.requestOrder, ['promotionChannel','request','dateUpdated','dateCreated'])
            requestChangeString.requestOrder.requestOrderProducts = _.map(requestChangeString.requestOrder.requestOrderProducts, (requestOrderProduct) => {
                requestOrderProduct = _.omit(requestOrderProduct, ['requestOrder','product','dateUpdated','dateCreated'])
                return requestOrderProduct
            })
        }
        requestChangeString.requestPayments = _.map(requestChangeString.requestPayments, (requestPayment) => {
            requestPayment = _.omit(requestPayment, ['paymentMethod','request','dateUpdated','dateCreated'])
            return requestPayment
        })

        return JSON.stringify(requestChangeString)
    }
}
