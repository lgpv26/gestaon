import { Model } from "@vuex-orm/core";
import shortid from "shortid"
import utils from '../../utils'
import store from '../../vuex/store'
import _ from "lodash"
import PromiseQueue from 'p-queue'

import User from "./User"
import Client from "./Client"
import Card from "./Card"
import RequestOrder from "./RequestOrder"
import moment from "moment/moment"
import RequestPayment from "./RequestPayment"
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
            requestUIState: this.hasOne(RequestUIState, "requestId"),
            requestPayments: this.hasMany(RequestPayment, "requestId"),
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

    static guaranteeDependencies(request,promiseQueue,fillOfflineDBWithSyncedData,ignoreOfflineDBInsertion = false){
        const requestId = _.get(request, "tmpId", request.id)
        const card = Card.query().where("requestId", requestId)
            .with("request.requestUIState")
            .with("window")
            .first()

        let windowId = `tmp/${shortid.generate()}`
        let cardId = `tmp/${shortid.generate()}`
        let requestUIStateId = `tmp/${shortid.generate()}`

        // map request card/window/requestUIState
        if(utils.isTmp(request.id) && card){ // is tmp && card exists - it means that the request was created by this user
            store.dispatch("entities/delete", {
                entity: 'requests',
                where: card.requestId
            })
            windowId = card.window.id
            cardId = card.id
            requestUIStateId = card.request.requestUIState.id
        }
        else if(card) { // card exists - it means the request is not tmp and the request already existed before
            windowId = card.window.id
            cardId = card.id
            requestUIStateId = card.request.requestUIState.id
        }
        else { // card don't exist
            store.dispatch("entities/insert", {
                entity: 'windows',
                data: {
                    id: windowId,
                    zIndex:
                    store.getters["entities/windows/query"]().max("zIndex") + 1,
                    show: false
                }
            })
            store.dispatch("entities/insert", {
                entity: 'cards',
                data: {
                    id: cardId,
                    windowId: windowId,
                    requestId: request.id
                }
            })
            store.dispatch("entities/insert", {
                entity: 'requestUIState',
                data: {
                    id: requestUIStateId,
                    windowId: windowId,
                    requestId: request.id
                }
            })
        }

        // request.requestPayments

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

        // request.client

        promiseQueue.add(() => fillOfflineDBWithSyncedData("clients", 'put', request.client).then((promise) => {
            store.dispatch("entities/insertOrUpdate", {
                entity: 'clients',
                ignoreOfflineDBInsertion,
                data: request.client
            });
            request.client.clientAddresses.forEach(clientAddress => {
                fillOfflineDBWithSyncedData("addresses", 'put', clientAddress.address)
                store.dispatch("entities/insertOrUpdate", {
                    entity: 'addresses',
                    ignoreOfflineDBInsertion,
                    data: clientAddress.address
                });
            });
            return promise
        }))

        // request.client.clientAddresses

        promiseQueue.add(() => fillOfflineDBWithSyncedData(
            "clientAddresses",
            "bulkPutWithReplacement",
            request.client.clientAddresses,
            "clientId"
        ).then((promise) => {
            const clientAddresses = store.getters['entities/clientAddresses']().where('clientId',(clientId) => {
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

        // request.requestClientAddresses

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
