import moment from "moment"
import _ from "lodash"
import shortid from "shortid"
import Request from "../vuex/models/Request"
import Card from "../vuex/models/Card"
import Client from "../vuex/models/Client";
import Address from "../vuex/models/Address";
import store from "../vuex/store";

export default {
    methods: {

        /**
         * load card from indexeddb
         * @param cardId
         * @returns {Promise<void>}
         */
        async loadCard(cardId){
            const card = await this.$db.STATE_cards.where('id').equals(cardId).first()
            await Card.insert({ data: card })
        },

        /**
         * load cards to state from indexeddb
         * @param deliveryDate
         * @returns {Promise<void>}
         */
        async loadCards(deliveryDate = moment().toISOString()){
            const persistedCards = await this.$db.STATE_cards.where('deliveryDate').between(
                this.moment(deliveryDate).startOf('day').toISOString(),
                this.moment(deliveryDate).endOf('day').toISOString()
            ).toArray()
            const draftCards = await this.$db.STATE_cards.where('status').equals("draft").toArray()
            await Card.insert({
                data: _.concat(persistedCards, draftCards)
            })
        },

        /**
         * add a new card to state and to state indexeddb
         * @returns {Promise<*>}
         */
        async addCard(){
            /*const requestUIStateTmpId = `tmp/${shortid.generate()}`
            const requestTmpId = `tmp/${shortid.generate()}`
            const windowTmpId = `tmp/${shortid.generate()}`*/

            // add first to STATE indexeddb

            return await this.stateHelper({
                modelName: 'cards',
                action: 'put',
                data: {
                    id: `tmp/${shortid.generate()}`,
                    status: "draft"
                }
            })

            /*await this._offlineDBHelper({
                modelName: "STATE_windows",
                action: "put",
                data: {
                    id: windowTmpId
                }
            })

            await this._offlineDBHelper({
                modelName: "STATE_cards",
                action: "put",
                data: {
                    id: cardTmpId,
                    requestId: requestTmpId,
                    windowId: windowTmpId,
                    status: "draft"
                }
            })

            await this._offlineDBHelper({
                modelName: "STATE_requestUIState",
                action: "put",
                data: {
                    id: requestUIStateTmpId,
                    requestId: requestTmpId
                }
            })

            await this._offlineDBHelper({
                modelName: "STATE_requests",
                action: "put",
                data: {
                    id: requestTmpId
                }
            })*/

            /*this.$store.dispatch("entities/windows/insert", {
                data: {
                    id: windowTmpId,
                    zIndex: this.$store.getters["entities/windows/query"]().max("zIndex") + 1
                }
            })
            this.$store.dispatch("entities/cards/insert", {
                data: {
                    id: cardTmpId,
                    windowId: windowTmpId,
                    requestId: requestTmpId
                }
            })
            this.$store.dispatch("entities/requestUIState/insert", {
                data: {
                    id: requestUIStateTmpId,
                    windowId: windowTmpId,
                    requestId: requestTmpId
                }
            })
            this.$store.dispatch("entities/requests/insert", {
                data: {
                    id: requestTmpId,
                    clientId: null,
                    requestOrderId: null,
                    status: "draft"
                }
            })*/
        },

        /**
         *
         * @returns {Promise<void>}
         */
        async clickCard(cardId){
            const vm = this

            let card, request, window, requestUIState, client, requestOrder

            return new Promise(async (resolve) => {

                // get the card
                card = await vm.$db.STATE_cards.where('id').equals(cardId).first()

                if(card.windowId && card.requestId){
                    console.log("Caiu no if", card)
                    request = await vm.$db.STATE_requests.where('id').equals(card.requestId).first()
                    window = await vm.$db.STATE_windows.where('id').equals(card.windowId).first()
                    requestUIState = await vm.$db.STATE_requestUIState.where('requestId').equals(request.id).first()

                    request = await vm.stateHelper({
                        modelName: 'requests',
                        action: 'put',
                        persist: false,
                        data: request
                    })
                    requestUIState = await vm.stateHelper({
                        modelName: 'requestUIState',
                        action: 'put',
                        persist: false,
                        data: requestUIState
                    })
                    card = await vm.stateHelper({
                        modelName: "cards",
                        action: "patch",
                        persist: false,
                        data: {
                            id: card.id,
                            windowId: window.id,
                            requestId: request.id
                        }
                    })

                    client = await vm.addClientToState(request)
                    await vm.addOrderToState(request)

                    await vm.addRequestClientAddressToState(request, client)
                    await vm.addRequestClientPhoneToState(request, client)

                    window = await vm.stateHelper({
                        modelName: "windows",
                        action: "put",
                        persist: false,
                        data: _.assign(window, {
                            zIndex: vm.$store.getters["entities/windows/query"]().max("zIndex") + 1
                        })
                    })

                }
                else {
                    console.log("Caiu no else")
                    const requestUIStateTmpId = `tmp/${shortid.generate()}`
                    const requestTmpId = `tmp/${shortid.generate()}`
                    const windowTmpId = `tmp/${shortid.generate()}`

                    request = await vm.stateHelper({
                        modelName: 'requests',
                        action: 'put',
                        data: {
                            id: requestTmpId
                        }
                    })
                    requestUIState = await vm.stateHelper({
                        modelName: 'requestUIState',
                        action: 'put',
                        data: {
                            id: requestUIStateTmpId,
                            requestId: requestTmpId
                        }
                    })
                    card = await vm.stateHelper({
                        modelName: "cards",
                        action: "put",
                        data: {
                            ...card,
                            windowId: windowTmpId,
                            requestId: requestTmpId
                        }
                    })

                    client = await vm.addClientToState(request)
                    await vm.addOrderToState(request)

                    await vm.addRequestClientAddressToState(request, client)
                    await vm.addRequestClientPhoneToState(request, client)

                    window = await vm.stateHelper({
                        modelName: "windows",
                        action: "put",
                        data: _.assign({
                            id: windowTmpId
                        }, {
                            zIndex: vm.$store.getters["entities/windows/query"]().max("zIndex") + 1
                        })
                    })
                }

                resolve(card)

            })

        },

        async removeClientFromRequest(request){
            const vm = this
            if(_.has(request,'client.clientAddresses')){
                request.client.clientAddresses.forEach((clientAddress) => {
                    if(clientAddress.addressId){
                        vm.stateHelper({
                            modelName: 'addresses',
                            action: 'delete',
                            persist: true,
                            data: clientAddress.addressId
                        })
                    }
                    vm.stateHelper({
                        modelName: 'clientAddresses',
                        action: 'delete',
                        persist: true,
                        data: clientAddress.id
                    })
                })
            }
            if(_.has(request,'client.clientPhones')){
                request.client.clientPhones.forEach((clientPhone) => {
                    vm.stateHelper({
                        modelName: 'clientPhones',
                        action: 'delete',
                        persist: true,
                        data: clientPhone.id
                    })
                })
            }
            vm.stateHelper({
                modelName: 'clients',
                action: 'delete',
                persist: true,
                data: request.client.id
            })
            vm.stateHelper({
                modelName: 'requests',
                action: 'patch',
                persist: true,
                data: {
                    id: request.id,
                    clientId: null
                }
            })
        },

        async addClientToState(request){
            const vm = this
            let client, clientAddresses, clientPhones
            const clientTmpId = `tmp/${shortid.generate()}`

            return new Promise(async (resolve) => {

                if(request.clientId){
                    client = await vm.$db.STATE_clients.where('id').equals(request.clientId).first()
                    client = await vm.stateHelper({
                        modelName: 'clients',
                        action: 'put',
                        persist: false,
                        data: client
                    })
                    request = await vm.stateHelper({
                        modelName: 'requests',
                        action: 'patch',
                        persist: false,
                        data: {
                            id: request.id,
                            clientId: client.id
                        }
                    })
                }
                else {
                    client = await vm.stateHelper({
                        modelName: 'clients',
                        action: 'put',
                        data: {
                            id: clientTmpId
                        }
                    })
                    request = await vm.stateHelper({
                        modelName: 'requests',
                        action: 'patch',
                        data: {
                            id: request.id,
                            clientId: client.id
                        }
                    })
                }

                // client clientAddresses

                const clientAddressTmpId = `tmp/${shortid.generate()}`
                const addressTmpId = `tmp/${shortid.generate()}`
                clientAddresses = await vm.$db.STATE_clientAddresses.where('clientId').equals(client.id).toArray()

                if(clientAddresses.length){
                    clientAddresses = await Promise.all(_.map(clientAddresses, async (clientAddress) => {
                        return new Promise(async (resolve) => {
                            await vm.stateHelper({
                                modelName: 'addresses',
                                persist: false,
                                action: 'put',
                                data: await vm.$db.STATE_addresses.where('id').equals(clientAddress.addressId).first()
                            })
                            resolve(await vm.stateHelper({
                                modelName: 'clientAddresses',
                                persist: false,
                                action: 'put',
                                data: clientAddress
                            }))
                        })

                    }))
                }
                else {
                    await vm.stateHelper({
                        modelName: 'addresses',
                        persist: true,
                        action: 'put',
                        data: {
                            id: addressTmpId
                        }
                    })

                    clientAddresses = await vm.stateHelper({
                        modelName: 'clientAddresses',
                        persist: true,
                        action: 'bulkPut',
                        data: [
                            {
                                id: clientAddressTmpId,
                                clientId: client.id,
                                addressId: addressTmpId
                            }
                        ]
                    })
                }

                // client clientPhones

                const clientPhoneTmpId = `tmp/${shortid.generate()}`
                clientPhones = await vm.$db.STATE_clientPhones.where('clientId').equals(client.id).toArray()

                if(clientPhones.length){
                    clientPhones = await Promise.all(_.map(clientPhones, async (clientPhone) => {
                        return new Promise(async (resolve) => {
                            resolve(await vm.stateHelper({
                                modelName: 'clientPhones',
                                persist: false,
                                action: 'put',
                                data: clientPhone
                            }))
                        })
                    }))
                }
                else {
                    clientPhones = await vm.stateHelper({
                        modelName: 'clientPhones',
                        persist: true,
                        action: 'bulkPut',
                        data: [
                            {
                                id: clientPhoneTmpId,
                                clientId: client.id
                            }
                        ]
                    })
                }

                resolve(client)

            })
        },

        async addOrderToState(request){
            const vm = this
            let requestOrder, requestOrderProducts, requestPayments
            const requestOrderTmpId = `tmp/${shortid.generate()}`

            return new Promise(async (resolve) => {
                if(request.requestOrderId){
                    requestOrder = await vm.$db.STATE_requestOrders.where('id').equals(request.requestOrderId).first()
                    requestOrder = await vm.stateHelper({
                        modelName: 'requestOrders',
                        action: 'put',
                        persist: false,
                        data: requestOrder
                    })
                    request = await vm.stateHelper({
                        modelName: 'requests',
                        action: 'patch',
                        persist: false,
                        data: {
                            id: request.id,
                            requestOrderId: requestOrder.id
                        }
                    })
                }
                else {
                    requestOrder = await vm.stateHelper({
                        modelName: 'requestOrders',
                        action: 'put',
                        data: {
                            id: requestOrderTmpId
                        }
                    })
                    request = await vm.stateHelper({
                        modelName: 'requests',
                        action: 'patch',
                        data: {
                            id: request.id,
                            requestOrderId: requestOrder.id
                        }
                    })
                }

                // requestOrder requestOrderProducts

                const requestOrderProductTmpId = `tmp/${shortid.generate()}`
                requestOrderProducts = await vm.$db.STATE_requestOrderProducts.where('requestOrderId').equals(requestOrder.id).toArray()

                if(requestOrderProducts.length){
                    requestOrderProducts = await Promise.all(_.map(requestOrderProducts, async (requestOrderProduct) => {
                        return vm.stateHelper({
                            modelName: 'requestOrderProducts',
                            persist: false,
                            action: 'put',
                            data: requestOrderProduct
                        })
                    }))
                }
                else {
                    requestOrderProducts = await vm.stateHelper({
                        modelName: 'requestOrderProducts',
                        persist: true,
                        action: 'bulkPut',
                        data: [
                            {
                                id: requestOrderProductTmpId,
                                requestOrderId: requestOrder.id
                            }
                        ]
                    })
                }

                // requestOrder requestPayments

                const requestPaymentTmpId = `tmp/${shortid.generate()}`
                requestPayments = await vm.$db.STATE_requestPayments.where('requestId').equals(request.id).toArray()

                if(requestPayments.length){
                    requestPayments = await Promise.all(_.map(requestPayments, async (requestPayment) => {
                        return vm.stateHelper({
                            modelName: 'requestPayments',
                            persist: false,
                            action: 'put',
                            data: requestPayment
                        })
                    }))
                }
                else {
                    requestPayments = await vm.stateHelper({
                        modelName: 'requestPayments',
                        persist: true,
                        action: 'bulkPut',
                        data: [
                            {
                                id: requestPaymentTmpId,
                                requestId: request.id
                            }
                        ]
                    })
                }

                resolve(requestOrder)
            })
        },

        async addRequestClientAddressToState(request, client = null, clientAddress = null){
            const vm = this
            let requestClientAddress
            const requestClientAddressTmpId = `tmp/${shortid.generate()}`
            const clientAddressTmpId = `tmp/${shortid.generate()}`

            return new Promise(async (resolve) => {
                requestClientAddress = await vm.$db.STATE_requestClientAddresses.where('requestId').equals(request.id).first()
                if(requestClientAddress){
                    requestClientAddress = await vm.stateHelper({
                        modelName: "requestClientAddresses",
                        action: "put",
                        persist: false,
                        data: requestClientAddress
                    })
                }
                else {
                    if(!clientAddress){
                        console.log("Sem client address")
                        clientAddress = await vm.$db.STATE_clientAddresses.where('clientId').equals(client.id).first()
                        if(!clientAddress){
                            clientAddress = await vm.stateHelper({
                                modelName: "clientAddresses",
                                action: "put",
                                persist: true,
                                data: {
                                    id: clientAddressTmpId,
                                    requestId: request.id
                                }
                            })
                        }
                    }
                    requestClientAddress = await vm.stateHelper({
                        modelName: "requestClientAddresses",
                        action: "put",
                        persist: false,
                        data: {
                            id: requestClientAddressTmpId,
                            requestId: request.id,
                            clientAddressId: (clientAddress) ? clientAddress.id : null
                        }
                    })
                }
                resolve(requestClientAddress)
            })
        },
        async addRequestClientPhoneToState(request, clientPhone = null){
            const vm = this
            let requestClientPhone
            const clientPhoneTmpId = `tmp/${shortid.generate()}`
            const requestClientPhoneTmpId = `tmp/${shortid.generate()}`

            return new Promise(async (resolve) => {
                requestClientPhone = await vm.$db.STATE_requestClientPhones.where('requestId').equals(request.id).first()
                if(requestClientPhone){
                    requestClientPhone = await vm.stateHelper({
                        modelName: "requestClientPhones",
                        action: "put",
                        persist: false,
                        data: requestClientPhone
                    })
                }
                else {
                    if(!clientPhone){
                        clientPhone = await vm.$db.STATE_clientPhones.where('clientId').equals(client.id).first()
                        if(!clientPhone){
                            clientPhone = await vm.stateHelper({
                                modelName: "clientPhones",
                                action: "put",
                                persist: true,
                                data: {
                                    id: clientPhoneTmpId,
                                    requestId: request.id
                                }
                            })
                        }
                    }
                    requestClientPhone = await vm.stateHelper({
                        modelName: "requestClientPhones",
                        action: "put",
                        persist: false,
                        data: {
                            id: requestClientPhoneTmpId,
                            requestId: request.id,
                            clientPhoneId: (clientPhone) ? clientPhone.id : null
                        }
                    })
                }
                resolve(requestClientPhone)
            })
        },

        /**
         *
         * @returns {Promise<void>}
         */
        async closeWindow(windowId){
            const vm = this

            const card = vm.$store.getters[`entities/cards`]()
                .where('windowId',windowId)
                .with('request.requestUIState')
                .with('request.client')
                .with('request.client.clientPhones')
                .with('request.client.clientAddresses.address')
                .with('request.requestOrder')
                .with('request.requestOrder.requestOrderProducts')
                .with('request.requestPayments')
                .with('request.requestClientAddresses.clientAddress.address')
                .with('request.requestClientPhones.clientPhone')
                .first()

            const clientAddresses =card.request.client.clientAddresses
            const clientPhones = card.request.client.clientPhones
            const requestOrder = card.request.requestOrder
            const requestOrderProducts = card.request.requestOrder.requestOrderProducts
            const requestPayments = card.request.requestPayments

            const requestId = card.requestId
            const requestUIStateId = card.request.requestUIState.id
            const clientId = card.request.clientId

            vm.stateHelper({
                modelName: 'windows',
                persist: false,
                action: 'delete',
                data: windowId
            })

            vm.stateHelper({
                modelName: 'requests',
                persist: false,
                action: 'delete',
                data: requestId
            })

            vm.stateHelper({
                modelName: 'requestUIState',
                persist: false,
                action: 'delete',
                data: requestUIStateId
            })

            vm.stateHelper({
                modelName: 'clients',
                persist: false,
                action: 'delete',
                data: clientId
            })

            clientAddresses.forEach((clientAddress) => {
                vm.stateHelper({
                    modelName: 'clientAddresses',
                    persist: false,
                    action: 'delete',
                    data: clientAddress.id
                })
                if(clientAddress.addressId){
                    vm.stateHelper({
                        modelName: 'addresses',
                        persist: false,
                        action: 'delete',
                        data: clientAddress.addressId
                    })
                }
            })

            clientPhones.forEach((clientPhone) => {
                vm.stateHelper({
                    modelName: 'clientPhones',
                    persist: false,
                    action: 'delete',
                    data: clientPhone.id
                })
            })

            requestOrderProducts.forEach((requestOrderProduct) => {
                vm.stateHelper({
                    modelName: 'requestOrderProducts',
                    persist: false,
                    action: 'delete',
                    data: requestOrderProduct.id
                })
            })

            vm.stateHelper({
                modelName: 'requestOrders',
                persist: false,
                action: 'delete',
                data: requestOrder.id
            })

            requestPayments.forEach((requestPayment) => {
                vm.stateHelper({
                    modelName: 'requestPayments',
                    persist: false,
                    action: 'delete',
                    data: requestPayment.id
                })
            })

            vm.stateHelper({
                modelName: 'cards',
                persist: false,
                action: 'patch',
                data: {
                    id: card.id,
                    windowId: null,
                    requestId: null
                }
            })

        },

        /**
         * remove a card from state and from state indexeddb
         * @param cardId
         * @returns {Promise<void>}
         */
        async removeCard(cardId){
            return await this.stateHelper({
                modelName: 'cards',
                action: 'delete',
                data: cardId
            })
        },

        /**
         * state in operations
         * @param modelName
         * @param action
         * @param persist
         * @param data
         * @returns {Promise<*>}
         * @private
         */
        async stateHelper({ modelName, action, persist = true, data}){
            const vm = this
            if(action === 'put'){
                let putData = await vm.$store.dispatch('entities/insert', {
                    entity: modelName,
                    data
                })
                putData = _.first(putData[modelName])
                if(persist){
                    await vm._offlineDBHelper({
                        action: 'put',
                        modelName: `STATE_${modelName}`,
                        data: putData
                    })
                }
                return putData
            }
            else if(action === 'patch' || action === 'update'){
                vm.$store.dispatch('entities/update', {
                    entity: modelName,
                    where: data.id,
                    data
                })
                if(persist){
                    await vm._offlineDBHelper({
                        action: 'patch',
                        modelName: `STATE_${modelName}`,
                        data
                    })
                }
                return vm.$store.getters[`entities/${modelName}`]().where('id',data.id).first()
            }
            else if(action === 'bulkPut'){
                let bulkPutData = await vm.$store.dispatch('entities/insert', {
                    entity: modelName,
                    data
                })
                bulkPutData = bulkPutData[modelName]
                if(persist){
                    return vm._offlineDBHelper({
                        action: 'bulkPut',
                        modelName: `STATE_${modelName}`,
                        data: bulkPutData
                    })
                }
                return bulkPutData
            }
            else if(action === 'delete'){
                vm.$store.dispatch('entities/delete', {
                    entity: modelName,
                    where: data
                })
                if(!persist) return
                return vm._offlineDBHelper({
                    action: 'delete',
                    modelName: `STATE_${modelName}`,
                    data: data
                })
            }
            else if(action === 'bulkDelete'){
                const toDeleteArray = vm.$store.getters[`entities/${modelName}`]().whereIdIn(data).get()
                return Promise.all(_.map(toDeleteArray, (toDeleteItem) => {
                    return vm.stateHelper({
                        modelName,
                        action: "delete",
                        persist,
                        data: toDeleteItem.id,
                    })
                }))

            }
        },

        /**
         * extract only model fields from object
         * @param modelName
         * @param obj
         * @private
         */
        _extractModelFields({ modelName, obj }){
            const returnObj = {}
            this.modelDefinitions[(modelName.includes('STATE_')) ? "stateModels" : "offlineDBModels"][modelName].split(',').forEach((column) => {
                column = column.trim()
                if(_.has(obj,column)){
                    returnObj[column] = obj[column]
                }
            })
            return returnObj
        },

        /**
         * helper to in operations in the indexeddb
         * @param modelName
         * @param action
         * @param data
         * @param primaryKey
         * @returns {*}
         * @private
         */
        _offlineDBHelper({ modelName, action, data, primaryKey = null }){
            const vm = this
            if(action === 'put'){
                return vm.$db[modelName].put(vm._extractModelFields({
                    modelName,
                    obj: data
                }))
            }
            else if(action === 'patch'){
                return vm.$db[modelName].update(data.id, data)
            }
            else if(action === 'bulkPut'){
                data = _.map(data, (dataItem) => {
                    return vm._extractModelFields({
                        modelName,
                        obj: dataItem
                    })
                })
                return vm.$db[modelName].bulkPut(data)
            }
            else if(action === 'delete'){
                return vm.$db[modelName].delete(data) // data should be the id to delete
            }
            else if(action === 'bulkDelete'){
                return vm.$db[modelName].bulkDelete(data) // data should be an array of ids to delete
            }
            else if(action === 'bulkPutWithReplacement'){
                return vm.$db[modelName].where({
                    [primaryKey]: _.first(data)[primaryKey]
                }).toArray((itemsToDelete) => {
                    const ids = _.map(itemsToDelete, (itemToDelete) => itemToDelete.id)
                    return vm.$db[modelName].bulkDelete(ids).then(() => {
                        return vm._offlineDBHelper({
                            modelName,
                            action: 'bulkPut',
                            data
                        })
                    })
                })
            }
        }
    }
}
