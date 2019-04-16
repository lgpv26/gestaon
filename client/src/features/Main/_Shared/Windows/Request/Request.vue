<template>
    <div v-if="_.has(request, 'requestUIState') && _.has(request, 'client') && !request.requestUIState.isLoading" class="request__window">
        <app-request-chat v-if="false && request.requestUIState.showRequestChat" :request="request"></app-request-chat>
        <app-request-history v-if="request.requestUIState.showClientOrderTimeline" :request="request"
             @close="updateValue('requestUIState','showClientOrderTimeline',request.requestUIState.id,false)"></app-request-history>
        <div class="request__search">
            <input type="text" v-if="system.isSearchReady" autocomplete="off" :placeholder="'DIGITE AQUI PARA PESQUISAR'" v-model="searchValue" @focus="searchShow = true" @input="search()" />
            <input type="text" v-else disabled placeholder="AGUARDE ENQUANTO A PESQUISA É CARREGADA..." />
            <a href="javascript:void(0)" v-if="searchValue && searchItems.length && searchShow" @click="searchShow = false">
                <i class="mi mi-arrow-back"></i>
            </a>
        </div>
        <div class="request__main">
            <div class="request__body">
                <div class="request__section instruction" v-if="!request.requestUIState.activeTab" :class="{ active: !request.requestUIState.activeTab }">
                    <img :src="require('../../../../../assets/imgs/form-instructions/request.png')" style="width: 314px; height: 191px;" />
                </div>
                <app-request-client :request="request"></app-request-client>
                <app-request-order ref="requestOrder" :request="request"></app-request-order>
            </div>
            <div class="request__footer">
                <a class="button" v-if="Number.isInteger(request.id) && request.requestUIState.hasRequestChanges" @click="discardChanges()" style="display: flex; align-items: center; align-self: center; margin-left: 8px; text-transform: uppercase;">Descartar alterações</a>
                <a class="button" v-if="!Number.isInteger(request.id)" @click="discardDraft()" style="display: flex; align-items: center; align-self: center; margin-left: 8px; text-transform: uppercase;">Descartar rascunho</a>
                <span class="push-both-sides"></span>
                <app-select :items="getSelectUsers" :value="request.userId"
                        @input="updateValue('requests','userId',request.id,$event)" :popoverProps="{verticalOffset: 0, horizontalOffset: -15, placement: 'top-start'}">
                    <input type="text" class="readonly select" style="text-align: center; padding-top: 0; margin-bottom: 0; margin-right: 8px; width: 180px;" readonly :value="(_.has(request,'user.name')) ? request.user.name : 'RESPONSÁVEL'"/>
                    <template slot="item" slot-scope="slotProps">
                        <span>{{ slotProps.text }}</span>
                    </template>
                </app-select>
                <app-select :items="selectStatusItems" :value="request.status"
                        @input="updateValue('requests','status',request.id,$event)" :popoverProps="{ verticalOffset: 0, horizontalOffset: -15, placement: 'top-start' }">
                    <input type="text" class="select readonly" style="text-align: center; padding-top: 0; margin-bottom: 0; margin-right: 8px; width: 130px;" readonly :value="getStatusText" />
                    <template slot="item" slot-scope="slotProps">
                        <span>{{ slotProps.text }}</span>
                    </template>
                </app-select>
                <a class="button" v-if="Number.isInteger(request.id)" @click="createRequest()" style="display: flex; align-items: center; align-self: center; margin-right: 8px; text-transform: uppercase;">Salvar pedido</a>
                <a class="button" v-else @click="createRequest()" style="display: flex; align-items: center; align-self: center; margin-right: 8px; text-transform: uppercase;">Criar pedido</a>
            </div>
            <app-perfect-scrollbar v-if="searchValue && searchItems.length && searchShow" class="request__search-result">
                <div class="search-result__item" v-for="(searchItem, i) in searchItems" :key="i" @click="selectSearchItem(searchItem)">
                    <div style="display: flex; flex-direction: column;">
                        <span class="name" v-highlight="{keyword: searchValueStrings, sensitive: false}">
                            {{ searchItem.name }}
                        </span>
                        <span class="address" v-highlight="{keyword: searchValueStrings, sensitive: false}">
                            {{ searchItem.address ? searchItem.address : "S/ENDEREÇO" }},
                            {{ searchItem.number ? searchItem.number : "S/NÚMERO" }}
                            {{ searchItem.complement ? " " + searchItem.complement : "" }}
                        </span>
                        <span class="address-details" v-highlight="{keyword: searchValueStrings, sensitive: false}">
                            {{ searchItem.neighborhood ? searchItem.neighborhood : "S/BAIRRO" }}, {{ searchItem.city ? searchItem.city : "S/CIDADE" }} -
                            {{ searchItem.state ? searchItem.state : "S/ESTADO" }}
                        </span>
                    </div>
                    <span class="push-both-sides"></span>
                    <div style="display: flex; align-items: center;">
                        <span style="margin-right: 20px; font-weight: 600"
                              :style="{'font-size': (((searchItem.score * 3) > 24) ? 24 : searchItem.score * 3) + 'px' }"
                        >{{ searchItem.score }}</span>
                    </div>
                </div>
            </app-perfect-scrollbar>
        </div>
    </div>
    <div v-else class="request__window">
        <app-panel-loading :loading="true" :loadingText="'Aguarde...'"></app-panel-loading>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from "vuex";
    import _ from "lodash";
    import Vue from "vue";
    import shortid from "shortid";
    import RequestHelper from '../../../../../helpers/RequestHelper'
    import ClientSearchComponent from "../_Shared/Search/ClientSearch";
    import RequestClient from "./RequestClient";
    import RequestOrder from "./RequestOrder";
    import RequestHistory from "./RequestHistory";
    import RequestChat from "./RequestChat";

    import Request from '../../../../../vuex/models/Request'
    import User from '../../../../../vuex/models/User'

    export default {
        props: ["request"],
        mixins: [RequestHelper],
        components: {
            "app-request-client": RequestClient,
            "app-request-order": RequestOrder,
            "app-request-chat": RequestChat,
            "app-request-history": RequestHistory,
            "app-client-search": ClientSearchComponent
        },
        data() {
            return {
                moneyMask: {
                    decimal: ",",
                    thousands: ".",
                    precision: 2
                },

                selectStatusItems: [
                    {
                        text: "PENDENTE",
                        value: "pending"
                    },
                    {
                        text: "CANCELADO",
                        value: "canceled"
                    },
                    {
                        text: "EM DESLOCAMENTO",
                        value: "in-displacement"
                    },
                    {
                        text: "FINALIZADO",
                        value: "finished"
                    },
                    {
                        text: "RASCUNHO",
                        value: "draft"
                    }
                ],

                searchShow: false,
                searchTimeout: null,
                searchValue: null,
                searchValueStrings: [],
                searchItems: [],

                lastRequest: null,
                changeCheckInterval: null,

                worker: null
            }
        },
        watch: {
            ['system.requestsLoaded']: {
                handler(value){
                    if(!value) return
                    /*this.checkRequestChanges()*/
                },
                immediate: true
            }
        },
        computed: {
            ...mapState(['system']),
            getSelectUsers(){
                return _.map(_.filter(User.query().orderBy('name').get(), (user) => {
                    return user.status !== 'deactivated'
                }), (user) => {
                    return {
                        value: user.id,
                        text: user.name
                    }
                })
            },
            getStatusText() {
                const selectStatusItem = _.find(this.selectStatusItems, {
                    value: this.request.status
                });
                if (selectStatusItem) {
                    return selectStatusItem.text;
                } else {
                    return "STATUS";
                }
            }
        },
        methods: {
            ...mapActions('chat-queue',{
                'addToChatQueue': 'addToQueue'
            }),
            ...mapActions("request-queue", ["addToQueue"]),
            ...mapActions("toast", ["showToast", "showError"]),

            updateValue(modelName, field, id, value, modifier = false, ev = false) {
                let start, end
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    start = ev.target.selectionStart
                    end = ev.target.selectionEnd
                }
                switch (modifier) {
                    case "uppercase":
                        value = value.toUpperCase();
                        break;
                }
                // this.$store.dispatch(path, {where: id, data})
                this.stateHelper({
                    modelName,
                    action: 'update',
                    persist: true,
                    data: {
                        id: id,
                        [field]: value
                    }
                })
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    Vue.nextTick(() => {
                        ev.target.setSelectionRange(start,end);
                    })
                }
            },
            updateMaskValue(modelName, field, id, event){
                this.updateValue(modelName, field, id, event)
            },
            toggleChat(){
                this.updateValue("requestUIState", "showRequestChat", this.request.requestUIState.id, !this.request.requestUIState.showRequestChat)
                Vue.nextTick(() => {
                    if(this.request.requestUIState.showRequestChat){
                        this.addToChatQueue({
                            type: "request",
                            op: "chat-open",
                            data: {
                                requestId: this.request.id
                            },
                            date: this.moment().toISOString()
                        })
                    }
                    else {
                        this.addToChatQueue({
                            type: "request",
                            op: "chat-leave",
                            data: {
                                requestId: this.request.id
                            },
                            date: this.moment().toISOString()
                        })
                    }
                })
            },

            createRequest() {
                const request = this.$store.getters["entities/requests/query"]()
                    .where("id", this.request.id)
                    .with('client.clientPhones')
                    .with('client.clientAddresses.address')
                    .with('requestOrder.requestOrderProducts')
                    .with('requestPayments')
                    .with('requestClientAddresses')
                    .with('requestClientPhones')
                    .first()
                const requestJSON = JSON.parse(JSON.stringify(request))
                if(_.has(requestJSON,'client.name') && _.isEmpty(requestJSON.client.name)) {
                    this.showError("Adicione um cliente para o pedido")
                    return
                }
                if(_.has(requestJSON,'requestOrder.requestOrderProducts') && _.some(requestJSON.requestOrder.requestOrderProducts,(requestOrderProduct) => {
                    return !requestOrderProduct.productId
                })) {
                    this.showError("Adicione os produtos corretamente")
                    return
                }
                this.addToQueue({
                    type: "request",
                    op: "create",
                    data: requestJSON
                });
                this.updateValue('windows','show',this.request.card.windowId,false)
            },

            /* Search */

            async selectSearchItem(searchItem) {
                const vm = this;

                // set is loading state
                vm.updateValue("requestUIState", "isLoading", this.request.requestUIState.id, true)

                // create client if not existent
                /*vm.activateTab("client", false)*/

                // client
                const clientId = parseInt(searchItem.id.split("#")[0]) // get clientId from search
                const client = await this.$db.clients.where({ id: clientId }).first() // get client

                // clientAddresses
                const clientAddressId = parseInt(searchItem.id.split("#")[1]) // get clientAddressId from search
                const clientAddresses = await this.$db.clientAddresses.where({clientId: clientId}).toArray() // get clientAddresses
                const clientPhones = await this.$db.clientPhones.where({clientId: clientId}).toArray() // get clientAddresses
                const clientAddress = _.find(clientAddresses, { id: clientAddressId }) // get clientAddress clicked in search

                if(client){
                    await this.stateHelper({
                        modelName: 'clients',
                        action: 'put',
                        persist: true,
                        data: client
                    })

                    vm.removeClientFromRequest(this.request)

                    await Promise.all(_.map(clientAddresses, async (clientAddress) => {
                        if(clientAddress.addressId){
                            const address = await vm.$db.addresses.where({id: clientAddress.addressId}).first()
                            vm.stateHelper({
                                modelName: 'addresses',
                                action: 'put',
                                persist: true,
                                data: address
                            })
                        }
                        return await this.stateHelper({
                            modelName: 'clientAddresses',
                            action: 'put',
                            persist: true,
                            data: clientAddress
                        })
                    }))

                    // fill with clientPhones

                    _.forEach(clientPhones, async (clientPhone) => {
                        vm.stateHelper({
                            modelName: 'clientPhones',
                            action: 'put',
                            persist: true,
                            data: clientPhone
                        })
                    })

                    if(clientAddressId){
                        this.stateHelper({
                            modelName: 'requestClientAddresses',
                            action: 'patch',
                            persist: true,
                            data: {
                                id: _.first(this.request.requestClientAddresses).id,
                                clientAddressId: clientAddressId
                            }
                        })
                    }

                    // deal with clientPhones

                    if(clientPhones.length){
                        this.stateHelper({
                            modelName: 'requestClientPhones',
                            action: 'patch',
                            persist: true,
                            data: {
                                id: _.first(this.request.requestClientPhones).id,
                                clientPhoneId: _.first(clientPhones).id
                            }
                        })
                    }
                    else {
                        const clientPhoneTmpId = `tmp/${shortid.generate()}`
                        this.stateHelper({
                            modelName: 'clientPhones',
                            action: 'put',
                            persist: true,
                            data: {
                                id: clientPhoneTmpId,
                                clientId: client.id
                            }
                        })
                        this.stateHelper({
                            modelName: 'requestClientPhones',
                            action: 'patch',
                            persist: true,
                            data: {
                                id: _.first(this.request.requestClientPhones).id,
                                clientPhoneId: clientPhoneTmpId
                            }
                        })
                    }

                    await this.stateHelper({
                        modelName: 'requests',
                        action: 'patch',
                        persist: true,
                        data: {
                            id: vm.request.id,
                            clientId: client.id
                        }
                    })
                }

                /*if (clientAddress.addressId) {
                    const address = await this.$db.addresses.where({ id: clientAddress.addressId}).first()
                    this.$store.dispatch("entities/addresses/insert", { data: address })
                    this.$store.dispatch("entities/clients/insert", { data: client })

                    this.stateHelper({
                        modelName: 'requestUIState',
                        action: 'update',
                        persist: true,
                        data: {
                            id: this.request.requestUIState.id,
                            requestClientAddressForm: false,
                            isAddingClientAddress: false
                        }
                    })

                    if(clientAddresses.length){
                        this.$store.dispatch("entities/clientAddresses/insert", {data: clientAddresses})
                    }
                    this.updateValue('requestClientAddresses','clientAddressId',_.first(this.request.requestClientAddresses).id,clientAddress.id)
                    this.updateValue('requests','clientId',vm.request.id,clientId)
                    vm.searchShow = false
                    this.stateHelper({
                        modelName: 'requestUIState',
                        action: 'update',
                        persist: true,
                        data: {
                            id: this.request.requestUIState.id,
                            requestClientAddressForm: false,
                            isAddingClientAddress: false
                        }
                    })
                }

                // clientPhones
                const clientPhones = await this.$db.clientPhones.where({clientId: clientId}).toArray() // get clientPhones
                if(clientPhones.length){
                    this.$store.dispatch("entities/clientPhones/insert", { data: clientPhones })
                    this.$store.dispatch("entities/requestClientPhones/update", {
                        where: _.first(this.request.requestClientPhones).id,
                        data: {
                            clientPhoneId: _.first(clientPhones).id
                        }
                    })
                }*/

                vm.updateValue("requestUIState", "requestClientAddressForm", this.request.requestUIState.id, false)
                
                await Vue.nextTick()

                vm.searchShow = false

                // remove loading state
                vm.updateValue("requestUIState", "isLoading", this.request.requestUIState.id, false)
            },
            search() {
                const vm = this
                vm.searchValueStrings = _.filter(_.map(vm.searchValue.split(" "), searchValue => searchValue.trim(), searchValue => searchValue !== ''))
                if (vm.searchTimeout) clearTimeout(vm.searchTimeout);
                vm.searchTimeout = setTimeout(async () => {
                    const documents = await new Promise((resolve, reject) => {
                        const taskId = `task/${shortid.generate()}`
                        vm.$searchWorker.postMessage({
                            taskId,
                            operation: 'search',
                            query: vm.searchValue,
                            index: 'clients',
                            options: {
                                fields: {
                                    name: { boost: 1 },
                                    address: { boost: 1 },
                                    number: { boost: 2 },
                                    complement: { boost: 1 }
                                },
                                limit: 30,
                                bool: "OR"
                            }
                        })
                        vm.$searchWorker.onmessage = (event) => {
                            if(event.data.taskId === taskId){
                                resolve(event.data.documents)
                            }
                        }
                    })
                    vm.$db.searchClients.where("id").anyOf(
                        _.map(documents, resultDataItem => {
                            return resultDataItem.ref;
                        })
                    ).toArray().then(foundClients => {
                        vm.items = _.map(documents, resultDataItem => {
                            return _.assign(_.find(foundClients, { id: resultDataItem.ref }), {
                                score: resultDataItem.score.toFixed(1)
                            })
                        })
                        vm.searchItems = vm.items
                    })
                }, 500)
            },

            /*checkRequestChanges(){
                const vm = this
                if(vm.changeCheckInterval){
                    clearInterval(vm.changeCheckInterval)
                }
                vm.lastRequest = Request.getComparationObj(this.request)
                vm.changeCheckInterval = setInterval(() => {
                    const currentRequest = Request.getComparationObj(this.request)
                    if(!_.isEqual(currentRequest, vm.lastRequest)){

                        vm.lastRequest = currentRequest
                        if(_.isEqual(currentRequest, vm.request.requestUIState.requestString)){
                            /!*console.log("Original")*!/
                            this.updateValue(
                                "entities/requestUIState/update",
                                "hasRequestChanges",
                                this.request.requestUIState.id,
                                false
                            )
                        }
                        else {
                            /!*console.log("--- --- ---")
                            console.log("Different, from string", vm.request.requestUIState.requestString)
                            console.log("Different, from now", currentRequest)*!/
                            this.updateValue(
                                "entities/requestUIState/update",
                                "hasRequestChanges",
                                this.request.requestUIState.id,
                                true
                            )
                        }
                    }
                }, 1000)
            },*/

            /* Discard changes */

            async discardChanges(){
                console.log("Discard changes", this.request.id)

                const vm = this

                this.$db.requests.where({ id: this.request.id }).first((request) => {
                    if(!request){
                        return Promise.reject("Request not found")
                    }
                    return request
                }).then(async (request) => {
                    // _.assign(originalRequest, request)

                    vm.$store.dispatch("entities/insertOrUpdate", {
                        entity: "requests",
                        data: request
                    })

                    vm.$store.dispatch("entities/update", {
                        entity: "requestUIState",
                        where: vm.request.requestUIState.id,
                        data: {
                            isLoading: true
                        }
                    })

                    const asyncOperations = []

                    if(request.requestOrderId){
                        asyncOperations.push(this.$db.requestOrders.where({ id: request.requestOrderId }).first((requestOrder) => {
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: "requestOrders",
                                data: requestOrder
                            })
                            return true
                        }))
                        const requestOrderProducts = vm.$store.getters['entities/requestOrderProducts']().where('requestOrderId',(requestOrderId) => {
                            return requestOrderId === request.requestOrderId
                        }).get()
                        requestOrderProducts.forEach((requestOrderProduct) => {
                            vm.$store.dispatch("entities/requestOrderProducts/delete", requestOrderProduct.id)
                        })
                        asyncOperations.push(this.$db.requestOrderProducts.where({ requestOrderId: request.requestOrderId }).toArray((requestOrderProducts) => {
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: "requestOrderProducts",
                                data: requestOrderProducts
                            })
                            return true
                        }))
                    }

                    if(request.clientId){

                        asyncOperations.push(this.$db.clients.where({ id: request.clientId }).first((client) => {
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: "clients",
                                data: client
                            })
                            return true
                        }))

                        // clientAddresses

                        const clientAddresses = vm.$store.getters['entities/clientAddresses']().where('clientId',(clientId) => {
                            return clientId === request.clientId
                        }).get()
                        clientAddresses.forEach((clientAddress) => {
                            vm.$store.dispatch("entities/clientAddresses/delete", clientAddress.id)
                        })
                        asyncOperations.push(this.$db.clientAddresses.where({ clientId: request.clientId }).toArray((clientAddresses) => {
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: "clientAddresses",
                                data: clientAddresses
                            })
                            const addressAsyncOperations = []
                            clientAddresses.forEach((clientAddress) => {
                                addressAsyncOperations.push(this.$db.addresses.where({ id: clientAddress.addressId }).first((address) => {
                                    vm.$store.dispatch("entities/insertOrUpdate", {
                                        entity: "addresses",
                                        data: address
                                    })
                                    return true
                                }))
                            })
                            return Promise.all(addressAsyncOperations)
                        }))

                        // clientPhones

                        const clientPhones = vm.$store.getters['entities/clientPhones']().where('clientId',(clientId) => {
                            return clientId === request.clientId
                        }).get()
                        clientPhones.forEach((clientPhone) => {
                            vm.$store.dispatch("entities/clientPhones/delete", clientPhone.id)
                        })
                        asyncOperations.push(this.$db.clientPhones.where({ clientId: request.clientId }).toArray((clientPhones) => {
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: "clientPhones",
                                data: clientPhones
                            })
                        }))
                    }

                    const requestPayments = vm.$store.getters['entities/requestPayments']().where('requestId',(requestId) => {
                        return requestId === request.id
                    }).get()
                    requestPayments.forEach((requestPayment) => {
                        vm.$store.dispatch("entities/requestPayments/delete", requestPayment.id)
                    })
                    asyncOperations.push(this.$db.requestPayments.where({ requestId: request.id }).toArray((requestPayments) => {
                        vm.$store.dispatch("entities/insertOrUpdate", {
                            entity: "requestPayments",
                            data: requestPayments
                        })
                        return true
                    }))

                    const requestClientAddresses = vm.$store.getters['entities/requestClientAddresses']().where('requestId',(requestId) => {
                        return requestId === request.id
                    }).get()
                    requestClientAddresses.forEach((requestClientAddress) => {
                        vm.$store.dispatch("entities/requestClientAddresses/delete", requestClientAddress.id)
                    })
                    asyncOperations.push(this.$db.requestClientAddresses.where({ requestId: request.id }).toArray((requestClientAddresses) => {
                        vm.$store.dispatch("entities/insertOrUpdate", {
                            entity: "requestClientAddresses",
                            data: requestClientAddresses
                        })
                        return true
                    }))

                    const requestClientPhones = vm.$store.getters['entities/requestClientPhones']().where('requestId',(requestId) => {
                        return requestId === request.id
                    }).get()
                    requestClientPhones.forEach((requestClientPhone) => {
                        vm.$store.dispatch("entities/requestClientPhones/delete", requestClientPhone.id)
                    })
                    asyncOperations.push(this.$db.requestClientPhones.where({ requestId: request.id }).toArray((requestClientPhones) => {
                        vm.$store.dispatch("entities/insertOrUpdate", {
                            entity: "requestClientPhones",
                            data: requestClientPhones
                        })
                        return true
                    }))

                    await Promise.all(asyncOperations)

                    await Vue.nextTick()

                    vm.$store.dispatch("entities/update", {
                        entity: "requestUIState",
                        where: vm.request.requestUIState.id,
                        data: {
                            isLoading: false
                        }
                    })

                })

            },
            discardDraft(){
                console.log("Discard draft", this.request)

                this.$store.dispatch("entities/delete", {
                    entity: "windows",
                    where: this.request.card.windowId
                })

                this.$store.dispatch("entities/delete", {
                    entity: "cards",
                    where: this.request.card.id
                })

                this.$store.dispatch("entities/delete", {
                    entity: "requestUIState",
                    where: this.request.requestUIState.id
                })

                this.$store.dispatch("entities/delete", {
                    entity: "requests",
                    where: this.request.id
                })

            }

        }
    };
</script>

<style lang="scss">
    @import "../window.scss";
    @import "./request.scss";
    .request__window {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        position: relative;
        .request__search {
            height: 50px;
            border-top: 1px solid var(--border-color--0);
            border-bottom: 1px solid var(--border-color--0);
            flex-shrink: 0;
            position: relative;
            display: flex;
            background-color: var(--bg-color--2);
            margin-bottom: 5px;
            input {
                color: #cacbce;
                background: transparent;
                border: 0 none;
                height: 50px;
                padding: 10px 8px;
                font-size: 12px;
                width: 100%;
                text-transform: uppercase;
                outline: 0;
                &:hover,
                &:focus,
                &:active {
                    background-color: var(--bg-color--3)
                }
            }
            a {
                position: absolute;
                top: 12px;
                right: 8px;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                i {
                    font-size: 18px;
                }
            }
        }
        .request__main {
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            position: relative;
            .request__body {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                .request__section {
                    display: flex;
                    background-color: var(--bg-color--2);
                    flex-direction: column;
                    margin-bottom: 5px;
                    flex-shrink: 0;
                    .section__content {
                        display: none;
                        .columns {
                            flex-grow: 1;
                            display: flex;
                            flex-direction: row;
                        }
                    }
                    .section__summary {
                        height: 50px;
                        align-items: center;
                        background-color: var(--bg-color--2);
                        display: flex;
                        flex-direction: row;
                        padding: 8px;
                        cursor: pointer;
                        flex-shrink: 0;
                        h3 {
                            font-weight: 400;
                        }
                        .summary-radio {
                            margin: 0 0 0 0;
                            .v-input {
                                margin: 0;
                                padding: 0;
                                .v-radio {
                                    margin: 0;
                                }
                            }
                        }
                        &:hover {
                            background-color: var(--bg-color--3);
                        }
                    }
                    &.instruction {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    &.active {
                        display: flex;
                        flex-grow: 1;
                        flex-shrink: unset;
                        .section__content {
                            display: flex;
                            background-color: var(--bg-color--2);
                            flex-grow: 1;
                        }
                    }
                    &:last-child {
                        margin-bottom: 0;
                    }
                }
                table {
                    width: 100%;
                    text-align: left;
                    margin: 8px;
                }
                .left-side {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    div.box {
                        margin: 8px 8px 0 8px;
                        padding: 10px 12px;
                        display: flex;
                        flex-direction: column;
                        background-color: var(--bg-color--5);
                        flex-shrink: 0;
                        h3 {
                            margin-bottom: 8px;
                        }
                        &:last-child {
                            margin-bottom: 8px;
                        }
                        .client-addresses {
                            tr {
                                td {
                                    cursor: pointer;
                                    padding-top: 8px;
                                    padding-bottom: 8px;
                                    border-bottom: 1px solid var(--border-color--0);
                                }
                                &.selected {
                                    td {
                                        color: var(--font-color--primary);
                                    }
                                    &:hover {
                                        td {
                                            color: var(--font-color--primary);
                                        }
                                    }
                                }
                                &:hover {
                                    td {
                                        color: var(--font-color--6);
                                    }
                                }
                                &:first-child {
                                    td {
                                        padding-top: 0;
                                    }
                                }
                                &:last-child {
                                    td {
                                        padding-bottom: 0;
                                        margin-bottom: 0;
                                        border-bottom: 0;
                                    }
                                }
                            }
                        }
                    }
                }
                .right-side {
                    display: flex;
                    flex-direction: column;
                    width: 240px;
                    flex-shrink: 0;
                    div.box {
                        margin: 8px 8px 0 0;
                        padding: 10px 12px;
                        display: flex;
                        flex-direction: column;
                        background-color: var(--bg-color--5);
                        flex-shrink: 0;
                        .box__item {
                            display: flex;
                            flex-direction: row;
                        }
                        &:last-child {
                            margin-bottom: 8px;
                        }
                    }
                }
            }
            .request__footer {
                display: flex;
                flex-direction: row;
                height: 44px;
                flex-shrink: 0;
                background-color: var(--bg-color--6);
            }
            .request__search-result {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: var(--bg-color--2);
                .search-result__item {
                    display: flex;
                    flex-direction: row;
                    padding: 10px 8px;
                    border-bottom: 1px solid var(--border-color--0);
                    cursor: pointer;
                    transition: 0.5s all;
                    .name {
                        margin-bottom: 5px;
                    }
                    &:hover {
                        background-color: var(--bg-color--1);
                    }
                }
            }
        }
    }
</style>
