<template>
    <div v-if="_.has(request, 'requestUIState') && _.has(request, 'client') && !request.requestUIState.isLoading" class="request__window">
        <app-request-chat v-if="false && request.requestUIState.showRequestChat" :request="request"></app-request-chat>
        <app-request-history v-if="request.requestUIState.showClientOrderTimeline" :request="request" @close="updateValue('entities/requestUIState/update','showClientOrderTimeline',request.requestUIState.id,false)"></app-request-history>
        <div class="request__search">
            <input type="text" autocomplete="off" class="input&#45;&#45;borderless" placeholder="DIGITE AQUI PARA PESQUISAR ..." v-model="searchValue" @focus="searchShow = true" @input="search()" />
            <a href="javascript:void(0)" v-if="searchValue && searchItems.length && searchShow" @click="searchShow = false">
                <i class="mi mi-arrow-back"></i>
            </a>
        </div>
        <div class="request__main">
            <div class="request__body">
                <div class="request__section instruction" v-if="!request.requestUIState.activeTab" :class="{ active: !request.requestUIState.activeTab }">
                    <img :src="require('../../../../../assets/imgs/form-instructions/request.png')" style="width: 314px; height: 191px;" />
                </div>
                <div class="request__section" :class="{ active: request.requestUIState.activeTab === 'client' }">
                    <app-perfect-scrollbar v-if="request.requestUIState.activeTab === 'client' && request.client" class="section__content">
                        <div class="columns">
                            <div class="left-side">
                                <div class="box">
                                    <div class="form" style="display: flex; flex-direction: column; flex-grow: 1;">
                                        <label style="margin-bottom: 5px;">Nome</label>
                                        <div style="display: flex; flex-direction: row; flex-wrap: nowrap;">
                                            <input type="text" class="input" :value="request.client.name" @input="updateValue('entities/clients/update','name',request.client.id,$event.target.value,'uppercase',$event)" />
                                            <div v-if="!isNewClient" style="margin-left: 8px; display: flex; align-items: flex-end;">
                                                <a class="button" style="white-space: nowrap; margin-bottom: 15px;" @click="addClient()">NOVO CLIENTE</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="!request.requestUIState.requestClientAddressForm" class="box">
                                    <h3 style="margin-bottom: 5px;">Endereços</h3>
                                    <table class="client-addresses" style="margin: 3px 0 12px 0;" v-if="request.requestClientAddresses.length > 0 && request.client.clientAddresses.length > 0">
                                        <tbody>
                                        <tr v-for="clientAddress in request.client.clientAddresses"
                                            :class="{ selected: request.requestClientAddresses[0].clientAddressId === clientAddress.id }"
                                            :key="clientAddress.id"
                                            v-if="clientAddress.address"
                                            @click="selectClientAddress(clientAddress.id)">
                                            <td>
                                                {{ clientAddress.address.name }},
                                                {{ clientAddress.number }}<br />
                                                {{
                                                clientAddress.complement
                                                ? clientAddress.complement
                                                : "S/ COMPLEMENTO"
                                                }}
                                            </td>
                                            <td>
                                                {{ clientAddress.address.neighborhood }}<br />{{
                                                clientAddress.address.city
                                                }}/{{ clientAddress.address.state }}
                                            </td>
                                            <td style="text-align: right; white-space: nowrap;">
                                                <a href="javascript:void(0)" @click.stop="editClientAddress(clientAddress.id)">
                                                    <i class="mi mi-edit" style="font-size: 18px; padding: 2px;"></i>
                                                </a>
                                                <a href="javascript:void(0)" @click.stop="removeClientAddress(clientAddress.id)" style="margin-left: 7px;">
                                                    <i class="mi mi-close" style="font-size: 18px; padding: 2px;"></i>
                                                </a>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <div style="margin: 3px 0 12px 0;" v-else>
                                        <p>Este cliente não possui endereço cadastrado.</p>
                                    </div>
                                    <div style="display: flex;">
                                        <a class="button" style="float: right;" @click="addClientAddress()">INCLUIR ENDEREÇO</a>
                                        <span class="push-both-sides"></span>
                                    </div>
                                </div>
                                <div class="box" v-if="request.requestUIState.requestClientAddressForm">
                                    <h3 style="margin-bottom: 15px;">Novo endereço</h3>
                                    <div style="display: flex; flex-direction: row;">
                                        <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 8px;">
                                            <label>Endereço</label>
                                            <app-address-search-input :value="request.requestClientAddresses[0].clientAddress.address.name" :address="request.requestClientAddresses[0].clientAddress.address" @select="onAddressSelect($event)" @input="updateValue('entities/addresses/update','name',request.requestClientAddresses[0].clientAddress.address.id,$event)">
                                            </app-address-search-input>
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 50px; margin-right: 8px;">
                                            <label>Nº</label>
                                            <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.number" @input="updateValue('entities/clientAddresses/update','number',request.requestClientAddresses[0].clientAddress.id,$event.target.value)" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 170px;">
                                            <label>Complemento</label>
                                            <input type="text"class="input" :value="request.requestClientAddresses[0].clientAddress.complement" @input="updateValue('entities/clientAddresses/update','complement',request.requestClientAddresses[0].clientAddress.id,$event.target.value,'uppercase',$event)" />
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: row;">
                                        <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 8px">
                                            <label>Bairro</label>
                                            <input type="text" class="input" :disabled="isEditingAddress" :class="{ readonly: isEditingAddress }" :value="request.requestClientAddresses[0].clientAddress.address.neighborhood" @input="updateValue('entities/addresses/update','neighborhood',request.requestClientAddresses[0].clientAddress.address.id,$event.target.value,'uppercase',$event)" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 100px; margin-right: 8px">
                                            <label>CEP</label>
                                            <input type="text" class="input" :disabled="isEditingAddress" :class="{ readonly: isEditingAddress }" :value="request.requestClientAddresses[0].clientAddress.address.cep" @input="updateValue('entities/addresses/update','cep',request.requestClientAddresses[0].clientAddress.address.id,$event.target.value)" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 170px; margin-right: 8px">
                                            <label>Cidade</label>
                                            <input type="text" class="input" :disabled="isEditingAddress" :class="{ readonly: isEditingAddress }" :value="request.requestClientAddresses[0].clientAddress.address.city" @input="updateValue('entities/addresses/update','city',request.requestClientAddresses[0].clientAddress.address.id,$event.target.value,'uppercase',$event)" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 50px;">
                                            <label>Estado</label>
                                            <input type="text" class="input" autocomplete="off" :disabled="isEditingAddress" :class="{ readonly: isEditingAddress }" :value="request.requestClientAddresses[0].clientAddress.address.state" @input="updateValue('entities/addresses/update','state',request.requestClientAddresses[0].clientAddress.address.id,$event.target.value,'uppercase',$event)" />
                                        </div>
                                    </div>
                                    <div style="display: flex;">
                                        <a class="button" v-if="request.client.clientAddresses.length >= 1" @click="cancel()">VOLTAR</a>
                                        <span class="push-both-sides"></span>
                                        <a class="button" style="margin-right: 5px;" v-if="isEditingAddress" @click="onAddressUnselect()">LIMPAR</a>
                                        <a class="button" v-if="request.requestUIState.isAddingClientAddress" @click="updateValue('entities/requestUIState/update','requestClientAddressForm',request.requestUIState.id,!request.requestUIState.requestClientAddressForm)">SALVAR ENDEREÇO</a>
                                    </div>
                                </div>
                            </div>
                            <div class="right-side">
                                <div class="box">
                                    <div style="display: flex; align-items: center;">
                                        <h3>Telefones</h3>
                                        <span class="push-both-sides"></span>
                                        <span style="font-size: 12px">{{ (request.phoneLine) ? request.phoneLine : ''}}</span>
                                    </div>

                                    <div class="box__item" v-for="clientPhone in request.client.clientPhones" :key="clientPhone.id">
                                        <a href="javascript:void(0)" v-if="clientPhone.id === _.get(request,'requestClientPhones[0].clientPhoneId',false)"
                                           style="margin-top: 7px; margin-right: 7px; padding: 0 3px; align-self: baseline;">
                                            <i class="mi mi-check" style="font-size: 18px;"></i>
                                        </a>
                                        <a href="javascript:void(0)" v-else
                                           @click="updateValue('entities/requestClientPhones/update','clientPhoneId',request.requestClientPhones[0].id,clientPhone.id)"
                                           style="margin-top: 7px; margin-right: 7px; padding: 0 3px; align-self: baseline;">
                                            <i class="mi mi-close" style="font-size: 18px;"></i>
                                        </a>
                                        <app-mask :mask="['(##) ####-####', '(##) #####-####']" :value="clientPhone.number" @input="updateValue('entities/clientPhones/update','number',clientPhone.id,$event)" placeholder="(##) #####-####" class="input" style="margin-bottom: 0;"></app-mask>
                                        <a :class="{ disabled: request.client.clientPhones.length <= 1 }" href="javascript:void(0)" @click="removeClientPhone(clientPhone.id)" style="margin-top: 7px; margin-left: 7px; padding: 0 3px; align-self: baseline;">
                                            <i class="mi mi-close" style="font-size: 18px;"></i>
                                        </a>
                                    </div>
                                    <div class="box__item">
                                        <a class="button" style="margin-top: 10px;" @click="addClientPhone()">ADICIONAR TELEFONE</a>
                                    </div>
                                </div>
                                <div class="box" style="padding: 10px 12px;">
                                    <div class="box__item" style="display: flex; flex-direction: column;">
                                        <h3>Grupo do cliente</h3>
                                        <app-select :items="getSelectClientGroups" :value="request.client.clientGroupId"
                                                    @input="updateValue('entities/clients/update','clientGroupId',request.client.id,$event)"
                                                    :popoverProps="{verticalOffset: 0,horizontalOffset: -15,placement: 'bottom-start'}">
                                            <input type="text" class="select readonly" readonly
                                                   :value="_.has(request, 'client.clientGroup.name') ? request.client.clientGroup.name : '-- SELECIONE --'" />
                                            <template slot="item" slot-scope="slotProps">
                                                <span>{{ slotProps.text }}</span>
                                            </template>
                                        </app-select>
                                    </div>
                                </div>
                                <div class="box">
                                    <h3>Obs. do cliente</h3>
                                    <textarea-autosize
                                            class="input"
                                            style="flex-shrink: 0;"
                                            :min-height="30"
                                            :max-height="350"
                                            :value="request.client.obs"
                                            @input.native="updateValue('entities/clients/update','obs',request.client.id,$event.target.value.toUpperCase(),'uppercase',$event)"
                                    ></textarea-autosize>
                                </div>
                            </div>
                        </div>
                    </app-perfect-scrollbar>
                    <div class="section__summary" @click="activateTab('client')">
                        <div class="summary-radio" style="margin-right: 5px;">
                            <app-switch :readonly="true" :value="request.requestUIState.activeTab === 'client'"></app-switch>
                        </div>
                        <h3>Cliente</h3>
                        <div v-if="request.requestUIState.activeTab !== 'client' && request.clientId" style="margin-left: 12px; display: flex; flex-direction: row; align-items: center;">
                            <div class="dot-separator"></div>
                            <div v-if="hasClientSelected" style="display: flex; flex-direction: row; align-items: center;">
                                <h3 style="margin-left: 8px; margin-right: 8px;">
                                    {{ utils.getShortString(request.client.name, 14, "[...]") }}
                                </h3>
                                <div class="dot-separator"></div>
                                <h3 style="margin-left: 8px; margin-right: 8px;">
                                    {{ utils.getShortString(request.requestClientAddresses[0].clientAddress.address.name, 22, "[...]") }},
                                    {{ request.requestClientAddresses[0].clientAddress.number ? request.requestClientAddresses[0].clientAddress.number : "S/N" }}
                                </h3>
                                <div class="dot-separator"></div>
                                <h3 style="margin-left: 8px;" v-if="request.requestClientAddresses[0].clientAddress.complement">
                                    {{ utils.getShortString(request.requestClientAddresses[0].clientAddress.complement, 9, "[...]") }}
                                </h3>
                                <h3 style="margin-left: 8px;" v-else>S/ COMPLEMENTO</h3>
                            </div>
                            <div v-else style="display: flex; flex-direction: row; align-items: center;">
                                <h3 style="margin-left: 8px;">S/CLIENTE</h3>
                            </div>
                        </div>
                        <span class="push-both-sides"></span>
                        <a class="button" v-if="request.clientId && !isNewClient"
                           @click.stop="updateValue('entities/requestUIState/update','showClientOrderTimeline',request.requestUIState.id,true)"
                           style="display: flex; align-items: center; align-self: center; text-transform: uppercase;">últimas compras</a>
                    </div>
                </div>
                <div class="request__section" :class="{ active: request.requestUIState.activeTab === 'order' }">
                    <app-request-order ref="requestOrder" v-if="request.requestUIState.activeTab === 'order' && hasValidRequestOrder" :request="request"></app-request-order>
                    <div class="section__summary" @click="activateTab('order')">
                        <div class="summary-radio" style="margin-right: 5px;">
                            <app-switch :readonly="true" :value="request.requestUIState.activeTab === 'order'"></app-switch>
                        </div>
                        <h3>Venda</h3>
                        <span class="push-both-sides"></span>
                    </div>
                </div>
            </div>
            <div class="request__footer">
                <a class="button" v-if="Number.isInteger(request.id) && request.requestUIState.hasRequestChanges" @click="discardChanges()" style="display: flex; align-items: center; align-self: center; margin-left: 8px; text-transform: uppercase;">Descartar alterações</a>
                <a class="button" v-if="!Number.isInteger(request.id)" @click="discardDraft()" style="display: flex; align-items: center; align-self: center; margin-left: 8px; text-transform: uppercase;">Descartar rascunho</a>
                <span class="push-both-sides"></span>
                <app-select :items="getSelectUsers" :value="request.userId" @input="updateValue('entities/requests/update','userId',request.id,$event)" :popoverProps="{verticalOffset: 0, horizontalOffset: -15, placement: 'top-start'}">
                    <input type="text" class="readonly select" style="text-align: center; padding-top: 0; margin-bottom: 0; margin-right: 8px; width: 180px;" readonly :value="(_.has(request,'user.name')) ? request.user.name : 'RESPONSÁVEL'"/>
                    <template slot="item" slot-scope="slotProps">
                        <span>{{ slotProps.text }}</span>
                    </template>
                </app-select>
                <app-select :items="selectStatusItems" :value="request.status" @input="updateValue('entities/requests/update','status',request.id,$event)" :popoverProps="{ verticalOffset: 0, horizontalOffset: -15, placement: 'top-start' }">
                    <input type="text" class="select readonly" style="text-align: center; padding-top: 0; margin-bottom: 0; margin-right: 8px; width: 130px;" readonly :value="getStatusText" />
                    <template slot="item" slot-scope="slotProps">
                        <span>{{ slotProps.text }}</span>
                    </template>
                </app-select>
                <a class="button" v-if="Number.isInteger(request.id)" @click="createRequest()" style="display: flex; align-items: center; align-self: center; margin-right: 8px; text-transform: uppercase;">Salvar pedido</a>
                <a class="button" v-else @click="createRequest()" style="display: flex; align-items: center; align-self: center; margin-right: 8px; text-transform: uppercase;">Criar pedido</a>
            </div>
            <app-perfect-scrollbar v-if="searchValue && searchItems.length && searchShow" class="request__search-result">
                <div class="search-result__item" v-for="searchItem in searchItems" @click="selectSearchItem(searchItem)">
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
    import ClientSearchComponent from "../_Shared/Search/ClientSearch";
    import AddressSearchInputComponent from "../_Shared/Search/AddressSearchInput";
    import RequestOrder from "./RequestOrder";
    import RequestHistory from "./RequestHistory";
    import RequestChat from "./RequestChat";

    import Request from '../../../../../vuex/models/Request'
    import User from '../../../../../vuex/models/User'

    export default {
        props: ["request"],
        components: {
            "app-request-order": RequestOrder,
            "app-request-chat": RequestChat,
            "app-request-history": RequestHistory,
            "app-client-search": ClientSearchComponent,
            "app-address-search-input": AddressSearchInputComponent
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
                changeCheckInterval: null
            }
        },
        watch: {
            ['system.requestsLoaded']: {
                handler(value){
                    if(!value) return
                    this.checkRequestChanges()
                },
                immediate: true
            }
        },
        computed: {
            ...mapState(['system']),
            isEditingAddress() {
                return Number.isInteger(
                    this.request.requestClientAddresses[0].clientAddress.addressId
                );
            },
            hasClientSelected() {
                return (
                    _.get(this.request, "client.name", false) &&
                    typeof this.request.client.name === "string" &&
                    this.request.client.name.trim()
                );
            },
            hasValidRequestOrder(){
                return _.get(this.request,'requestOrder.requestOrderProducts',false) && _.get(this.request,'requestPayments',false)
            },
            isNewClient() {
                return this.utils.isTmp(this.request.clientId);
            },
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
            getSelectClientGroups() {
                return _.map(
                    this.$store.getters["entities/clientGroups/all"](),
                    clientGroup => {
                        return {
                            value: clientGroup.id,
                            text: clientGroup.name
                        };
                    }
                );
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
            updateValue(path, field, id, value, modifier = false, ev = false) {
                const data = {};
                let start, end
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    start = ev.target.selectionStart
                    end = ev.target.selectionEnd
                }
                switch (modifier) {
                    case "uppercase":
                        data[field] = value.toUpperCase();
                        break;
                    default:
                        data[field] = value;
                }
                this.$store.dispatch(path, {where: id, data})
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    Vue.nextTick(() => {
                        ev.target.setSelectionRange(start,end);
                    })
                }
            },
            toggleChat(){
                this.updateValue("entities/requestUIState/update", "showRequestChat", this.request.requestUIState.id, !this.request.requestUIState.showRequestChat)
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
            async activateTab(tab, toggle = true) {
                const vm = this
                // if already active tab clicked
                if(toggle && (vm.request.requestUIState.activeTab === tab)){
                    vm.updateValue("entities/requestUIState/update", "activeTab", vm.request.requestUIState.id, null)
                    return
                }
                // if going to order tab
                if (tab === "order") {
                    // create requestOrder if not existent
                    if(!_.get(vm.request,'requestOrderId',false)){

                        const clientRequests = await vm.$db.requests.where('clientId').equals(vm.request.clientId).toArray()
                        _.sortBy(clientRequests, (clientRequest) => {
                            return clientRequest.deliveryDate
                        })
                        const mostRecentClientRequest = _.last(clientRequests)
                        if(mostRecentClientRequest){
                            if(_.get(mostRecentClientRequest,'requestOrderId',false)){
                                _.assign(mostRecentClientRequest, {
                                    requestOrder: await vm.$db.requestOrders.where('id').equals(mostRecentClientRequest.requestOrderId).first()
                                })
                                _.assign(mostRecentClientRequest.requestOrder, {
                                    requestOrderProducts: await vm.$db.requestOrderProducts.where('requestOrderId').equals(mostRecentClientRequest.requestOrderId).toArray()
                                })
                            }
                            _.assign(mostRecentClientRequest, {
                                requestPayments: await vm.$db.requestPayments.where('requestId').equals(mostRecentClientRequest.id).toArray()
                            })

                            console.log("Most recent client request is", mostRecentClientRequest)

                            console.log("Creating requestOrder")
                            const requestOrderTmpId = `tmp/${shortid.generate()}`

                            vm.$store.dispatch("entities/requestOrders/insert", {
                                data: {
                                    id: requestOrderTmpId,
                                    promotionChannelId: mostRecentClientRequest.requestOrder.promotionChannelId
                                }
                            })
                            vm.$store.dispatch("entities/requests/update", {
                                where: vm.request.id,
                                data: {
                                    requestOrderId: requestOrderTmpId
                                }
                            })
                            vm.$store.dispatch("entities/requestPayments/insert", {
                                data: _.map(mostRecentClientRequest.requestPayments, (requestPayment) => {
                                    return {
                                        id: `tmp/${shortid.generate()}`,
                                        requestId: vm.request.id,
                                        paymentMethodId: requestPayment.paymentMethodId,
                                        amount: requestPayment.amount
                                    }
                                })
                            })
                            vm.$store.dispatch("entities/requestOrderProducts/insert", {
                                data: _.map(mostRecentClientRequest.requestOrder.requestOrderProducts, (requestPayment) => {
                                    return {
                                        id: `tmp/${shortid.generate()}`,
                                        requestOrderId: requestOrderTmpId,
                                        productId: requestPayment.productId,
                                        quantity: requestPayment.quantity,
                                        unitPrice: requestPayment.unitPrice,
                                        unitDiscount: requestPayment.unitDiscount
                                    }
                                })
                            })
                        }
                        else {
                            console.log("Creating requestOrder")
                            const requestPaymentTmpId = `tmp/${shortid.generate()}`
                            const requestOrderTmpId = `tmp/${shortid.generate()}`
                            const requestOrderProductTmpId = `tmp/${shortid.generate()}`
                            vm.$store.dispatch("entities/requestPayments/insert", {
                                data: {
                                    id: requestPaymentTmpId,
                                    requestId: vm.request.id,
                                    paymentMethodId: 1,
                                    amount: _.get(
                                        vm.$store.getters["entities/products/find"](1),
                                        "price",
                                        false
                                    )
                                        ? vm.$store.getters["entities/products/find"](1).price
                                        : 0
                                }
                            })
                            vm.$store.dispatch("entities/requestOrderProducts/insert", {
                                data: {
                                    id: requestOrderProductTmpId,
                                    requestOrderId: requestOrderTmpId,
                                    productId: 1,
                                    unitPrice: _.get(
                                        vm.$store.getters["entities/products/find"](1),
                                        "price",
                                        0
                                    )
                                }
                            })
                            vm.$store.dispatch("entities/requestOrders/insert", {
                                data: {
                                    id: requestOrderTmpId
                                }
                            })
                            vm.$store.dispatch("entities/requests/update", {
                                where: vm.request.id,
                                data: {
                                    requestOrderId: requestOrderTmpId
                                }
                            })
                        }
                    }
                }
                // if going to client tab
                if(tab === "client"){
                    // create client if not existent
                    if(!vm.request.clientId){
                        console.log("Creating client")
                        const clientTmpId = `tmp/${shortid.generate()}`
                        const addressTmpId = `tmp/${shortid.generate()}`
                        const clientAddressTmpId = `tmp/${shortid.generate()}`
                        const clientPhoneTmpId = `tmp/${shortid.generate()}`
                        const requestClientAddressTmpId = `tmp/${shortid.generate()}`
                        const requestClientPhoneTmpId = `tmp/${shortid.generate()}`
                        vm.$store.dispatch("entities/clients/insert", {
                            data: {
                                id: clientTmpId
                            }
                        })
                        vm.$store.dispatch("entities/clientPhones/insert", {
                            data: {
                                id: clientPhoneTmpId,
                                clientId: clientTmpId
                            }
                        })
                        vm.$store.dispatch("entities/addresses/insert", {
                            data: {
                                id: addressTmpId
                            }
                        })
                        vm.$store.dispatch("entities/clientAddresses/insert", {
                            data: {
                                id: clientAddressTmpId,
                                clientId: clientTmpId,
                                addressId: addressTmpId
                            }
                        })
                        vm.$store.dispatch("entities/requestClientAddresses/insert", {
                            data: {
                                id: requestClientAddressTmpId,
                                requestId: vm.request.id,
                                clientAddressId: clientAddressTmpId
                            }
                        })
                        vm.$store.dispatch("entities/requestClientPhones/insert", {
                            data: {
                                id: requestClientPhoneTmpId,
                                requestId: vm.request.id,
                                clientPhoneId: clientPhoneTmpId
                            }
                        })
                        vm.$store.dispatch("entities/requests/update", {
                            where: vm.request.id,
                            data: {
                                clientId: clientTmpId
                            }
                        })
                    }
                }
                vm.updateValue("entities/requestUIState/update", "activeTab", vm.request.requestUIState.id, tab)
            },
            cancel() {
                if (this.request.requestUIState.isAddingClientAddress) {
                    if (this.utils.isTmp(this.request.requestClientAddresses[0].id)) {
                        const clientAddressId = this.request.requestClientAddresses[0].clientAddressId
                        this.removeClientAddress(clientAddressId)
                    }
                    this.updateValue(
                        "entities/requestUIState/update",
                        "isAddingClientAddress",
                        this.request.requestUIState.id,
                        false
                    )
                }
                this.updateValue(
                    "entities/requestUIState/update",
                    "requestClientAddressForm",
                    this.request.requestUIState.id,
                    false
                );
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
                console.log(_.some(requestJSON.requestOrder.requestOrderProducts,(requestOrderProduct) => {
                    return !requestOrderProduct.productId
                }))
                if(_.has(requestJSON,'requestOrder.requestOrderProducts') && _.some(requestJSON.requestOrder.requestOrderProducts,(requestOrderProduct) => {
                    console.log(requestOrderProduct)
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
                this.$store.dispatch("entities/windows/update", {
                    where: this.request.card.windowId,
                    data: {
                        show: false
                    }
                })
            },

            /* Client */

            addClient() {
                const clientTmpId = `tmp/${shortid.generate()}`;
                this.$store.dispatch("entities/clients/insert", {
                    data: {
                        id: clientTmpId
                    }
                })
                this.$store.dispatch("entities/requests/update", {
                    where: this.request.id,
                    data: {
                        clientId: clientTmpId
                    }
                })
                this.addClientAddress();
            },
            async selectSearchItem(searchItem) {
                const vm = this;
                // create client if not existent
                vm.activateTab("client", false)
                const clientId = parseInt(searchItem.id.split("#")[0])
                const clientAddressId = parseInt(searchItem.id.split("#")[1])
                const client = await this.$db.clients.where({ id: clientId }).first()
                const clientPhones = await this.$db.clientPhones.where({clientId: clientId}).toArray()
                const clientAddresses = await this.$db.clientAddresses.where({clientId: clientId}).toArray()
                const clientAddress = _.find(clientAddresses, { id: clientAddressId })
                if (clientAddress.addressId) {
                    const address = await this.$db.addresses.where({ id: clientAddress.addressId}).first()
                    this.$store.dispatch("entities/addresses/insert", { data: address })
                    this.$store.dispatch("entities/clients/insert", { data: client })
                    if(clientPhones.length){
                        console.log(this.request)
                        this.$store.dispatch("entities/clientPhones/insert", { data: clientPhones })
                        this.$store.dispatch(
                            "entities/requestClientPhones/update",
                            {
                                where: _.first(this.request.requestClientPhones).id,
                                data: {
                                    clientPhoneId: _.first(clientPhones).id
                                }
                            }
                        )
                    }
                    if(clientAddresses.length){
                        this.$store.dispatch("entities/clientAddresses/insert", {data: clientAddresses})
                    }
                    this.$store.dispatch(
                        "entities/requestClientAddresses/update",
                        {
                            where: _.first(this.request.requestClientAddresses).id,
                            data: {
                                clientAddressId: clientAddress.id
                            }
                        }
                    )
                    this.$store.dispatch("entities/requests/update", {
                        where: vm.request.id,
                        data: {
                            clientId: clientId
                        }
                    })
                    vm.searchShow = false
                    vm.updateValue(
                        "entities/requestUIState/update",
                        "requestClientAddressForm",
                        this.request.requestUIState.id,
                        false
                    )
                    vm.updateValue(
                        "entities/requestUIState/update",
                        "isAddingClientAddress",
                        this.request.requestUIState.id,
                        false
                    )
                }
            },
            search() {
                const vm = this
                vm.searchValueStrings = _.filter(_.map(vm.searchValue.split(" "), searchValue => searchValue.trim(), searchValue => searchValue !== ''))
                if (vm.searchTimeout) clearTimeout(vm.searchTimeout);
                vm.searchTimeout = setTimeout(() => {
                    if (vm.$static.searchClientsIndex) {
                        let resultData = vm.$static.searchClientsIndex.search(vm.searchValue, {
                            fields: {
                                name: { boost: 1 },
                                address: { boost: 1 },
                                number: { boost: 2 },
                                complement: { boost: 1 }
                            },
                            bool: "OR"
                        })
                        resultData = resultData.slice(0, 30)
                        vm.$db.searchClients.where("id").anyOf(
                            _.map(resultData, resultDataItem => {
                                return resultDataItem.ref;
                            })
                        ).toArray().then(foundClients => {
                            vm.items = _.map(resultData, resultDataItem => {
                                return _.assign(_.find(foundClients, { id: resultDataItem.ref }), {
                                    score: resultDataItem.score.toFixed(1)
                                })
                            })
                            vm.searchItems = vm.items
                        })
                    }
                }, 500)
            },

            /* Client Phones */

            addClientPhone() {
                this.$store.dispatch("entities/clientPhones/insert", {
                    data: {
                        id: `tmp/${shortid.generate()}`,
                        clientId: this.request.client.id
                    }
                });
            },
            removeClientPhone(clientPhoneId) {
                if (this.request.client.clientPhones.length <= 1) {
                    return;
                }
                this.$store.dispatch("entities/clientPhones/delete", clientPhoneId);
            },

            /* Client Address */

            addClientAddress() {
                const requestClientAddressId = this.request.requestClientAddresses[0].id;
                if (requestClientAddressId) {
                    const clientAddressTmpId = `tmp/${shortid.generate()}`;
                    const addressTmpId = `tmp/${shortid.generate()}`;
                    this.$store
                        .dispatch("entities/addresses/insert", {
                            data: {
                                id: addressTmpId
                            }
                        })
                        .then(() => {
                            Vue.nextTick(() => {
                                this.$store
                                    .dispatch("entities/clientAddresses/insert", {
                                        data: {
                                            id: clientAddressTmpId,
                                            clientId: this.request.clientId,
                                            addressId: addressTmpId
                                        }
                                    })
                                    .then(() => {
                                        this.$store
                                            .dispatch("entities/requestClientAddresses/update", {
                                                where: requestClientAddressId,
                                                data: {
                                                    clientAddressId: clientAddressTmpId,
                                                    number: 0,
                                                    complement: null
                                                }
                                            })
                                            .then(() => {
                                                this.updateValue(
                                                    "entities/requestUIState/update",
                                                    "isAddingClientAddress",
                                                    this.request.requestUIState.id,
                                                    true
                                                );
                                                this.updateValue(
                                                    "entities/requestUIState/update",
                                                    "requestClientAddressForm",
                                                    this.request.requestUIState.id,
                                                    true
                                                );
                                            });
                                    });
                            });
                        });
                }
            },
            editClientAddress(clientAddressId) {
                this.updateValue(
                    "entities/requestUIState/update",
                    "isAddingClientAddress",
                    this.request.requestUIState.id,
                    false
                );
                this.updateValue(
                    "entities/requestUIState/update",
                    "requestClientAddressForm",
                    this.request.requestUIState.id,
                    true
                );
                const requestClientAddressId = this.request.requestClientAddresses[0].id;
                if (requestClientAddressId) {
                    this.$store.dispatch("entities/requestClientAddresses/update", {
                        where: requestClientAddressId,
                        data: {
                            clientAddressId: clientAddressId
                        }
                    });
                }
            },
            selectClientAddress(clientAddressId) {
                this.updateValue(
                    "entities/requestClientAddresses/update",
                    "clientAddressId",
                    this.request.requestClientAddresses[0].id,
                    clientAddressId
                );
            },
            removeClientAddress(clientAddressId) {
                this.$store.dispatch("entities/clientAddresses/delete", clientAddressId);
            },
            onAddressSelect(address) {
                this.$store.dispatch("entities/addresses/insert", {
                    data: address
                });
                this.$store.dispatch("entities/clientAddresses/update", {
                    where: this.request.requestClientAddresses[0].clientAddress.id,
                    data: {
                        addressId: address.id
                    }
                });
            },
            onAddressUnselect() {
                const addressTmpId = `tmp/${shortid.generate()}`;
                this.$store.dispatch("entities/addresses/insert", {
                    data: {
                        id: addressTmpId
                    }
                });
                this.$store.dispatch("entities/clientAddresses/update", {
                    where: this.request.requestClientAddresses[0].clientAddress.id,
                    data: {
                        addressId: addressTmpId
                    }
                });
            },
            checkRequestChanges(){
                const vm = this
                if(vm.changeCheckInterval){
                    clearInterval(vm.changeCheckInterval)
                }
                vm.lastRequest = Request.getRequestComparationObj(this.request)
                vm.changeCheckInterval = setInterval(() => {
                    const currentRequest = Request.getRequestComparationObj(this.request)
                    if(!_.isEqual(currentRequest, vm.lastRequest)){
                        vm.lastRequest = currentRequest
                        if(_.isEqual(currentRequest, vm.request.requestUIState.requestString)){
                            /* console.log("Original") */
                            this.updateValue(
                                "entities/requestUIState/update",
                                "hasRequestChanges",
                                this.request.requestUIState.id,
                                false
                            )
                        }
                        else {
                            /*console.log("--- --- ---")
                            console.log("Different, from string", vm.request.requestUIState.requestString)
                            console.log("Different, from now", currentRequest)*/
                            this.updateValue(
                                "entities/requestUIState/update",
                                "hasRequestChanges",
                                this.request.requestUIState.id,
                                true
                            )
                        }
                    }
                }, 1000)
            },

            /* Discard changes */

            discardChanges(){
                console.log("Discard changes", this.request.id)

                const vm = this

                this.$db.requests.where({ id: this.request.id }).first((request) => {
                    if(!request){
                        return Promise.reject("Request not found")
                    }
                    return request
                }).then((request) => {
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

                    Promise.all(asyncOperations).then(() => {
                        setTimeout(() => {
                            vm.$store.dispatch("entities/update", {
                                entity: "requestUIState",
                                where: vm.request.requestUIState.id,
                                data: {
                                    isLoading: false
                                }
                            })
                        }, 1000)
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

<style lang="scss" scoped>
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
