<template>
    <div class="request__window">
        <div class="request__overlay">
            <a href="javascript:void(0)" class="back"><i class="mi mi-arrow-back"></i></a>
        </div>
        <div class="request__search">
            <input type="text" class="input--borderless" placeholder="..." v-model="searchValue" @focus="searchShow = true" @input="search()" />
            <a href="javascript:void(0)" v-if="searchValue && searchItems.length && searchShow" @click="searchShow = false">
                <i class="mi mi-arrow-back"></i>
            </a>
        </div>
        <div class="request__main">
            <div class="request__body">
                <div class="request__section" :class="{active: activeTab === 'client'}">
                    <app-perfect-scrollbar class="section__content">
                        <div class="columns">
                            <div class="left-side">
                                <div class="box">
                                    <div class="form" style="display: flex; flex-direction: column; flex-grow: 1;">
                                        <label style="margin-bottom: 5px;">Nome</label>
                                        <input type="text" class="input" :value="request.client.name"
                                               @input="updateValue('entities/clients/update','name',request.client.id,$event.target.value)" />
                                    </div>
                                </div>
                                <div v-if="(request.client.clientAddresses.length > 0) && !requestClientAddressForm" class="box">
                                    <h3 style="margin-bottom: 5px;">Endereços</h3>
                                    <table style="margin: 3px 0 12px 0;">
                                        <tbody>
                                            <tr v-for="clientAddress in request.client.clientAddresses">
                                                <td>
                                                    {{ clientAddress.address.name }},
                                                    {{ clientAddress.number + ((clientAddress.complement) ? ' - ' + clientAddress.complement : '') }}
                                                </td>
                                                <td>{{ clientAddress.address.neighborhood }} - {{ clientAddress.address.city }}</td>
                                                <td style="text-align: right">
                                                    <a href="javascript:void(0)" @click="editClientAddress(clientAddress.id)">
                                                        <i class="mi mi-edit" style="font-size: 18px; padding: 2px;"></i>
                                                    </a>
                                                    <a href="javascript:void(0)" @click="removeClientAddress(clientAddress.id)" style="margin-left: 7px;">
                                                        <i class="mi mi-close" style="font-size: 18px; padding: 2px;"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div style="display: flex;">
                                        <a class="button" style="float: right;" @click="addClientAddress()">INCLUIR ENDEREÇO</a>
                                        <span class="push-both-sides"></span>
                                    </div>
                                </div>
                                <div class="box" v-if="requestClientAddressForm">
                                    <h3 style="margin-bottom: 15px;">Novo endereço</h3>
                                    <div style="display: flex; flex-direction: row;">
                                        <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 8px;">
                                            <label>Endereço</label>
                                            <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.address.name" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 50px; margin-right: 8px;">
                                            <label>Nº</label>
                                            <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.number" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 170px;">
                                            <label>Complemento</label>
                                            <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.complement" />
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: row;">
                                        <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 8px">
                                            <label>Bairro</label>
                                            <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.address.neighborhood" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 100px; margin-right: 8px">
                                            <label>CEP</label>
                                            <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.address.cep" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 170px; margin-right: 8px">
                                            <label>Cidade</label>
                                            <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.address.city" />
                                        </div>
                                        <div style="display: flex; flex-direction: column; width: 50px;">
                                            <label>Estado</label>
                                            <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.address.state" />
                                        </div>
                                    </div>
                                    <div style="display: flex;">
                                        <a class="button" @click="cancel()">VOLTAR</a>
                                        <span class="push-both-sides"></span>
                                        <a class="button" @click="requestClientAddressForm = !requestClientAddressForm">SALVAR ENDEREÇO</a>
                                    </div>
                                </div>
                            </div>
                            <div class="right-side">
                                <div class="box">
                                    <h3>Telefones</h3>
                                    <div class="box__item" v-for="clientPhone in request.client.clientPhones" :key="clientPhone.id">
                                        <app-mask :mask="['(##) ####-####','(##) #####-####']"
                                                  :value="clientPhone.number"
                                                  @input="updateValue('entities/clientPhones/update','number',clientPhone.id,$event)"
                                                  placeholder="(##) #####-####" class="input"
                                                  style="margin-bottom: 0;"></app-mask>
                                        <a :class="{disabled: request.client.clientPhones.length <= 1}" href="javascript:void(0)" @click="removeClientPhone(clientPhone.id)" style="margin-top: 7px; margin-left: 7px; padding: 0 3px; align-self: baseline;">
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
                                        <app-select :items="getSelectClientGroups"
                                                    :value="request.client.clientGroupId"
                                                    @input="updateValue('entities/clients/update','clientGroupId',request.client.id,$event)"
                                                    :popoverProps="{verticalOffset: 0, horizontalOffset: -15, placement: 'bottom-start'}">
                                            <input type="text" class="select readonly" readonly
                                                   :value="(_.has(request,'client.clientGroup.name')) ? request.client.clientGroup.name : '-- SELECIONE --'"/>
                                            <template slot="item" slot-scope="slotProps">
                                                <span>{{ slotProps.text }}</span>
                                            </template>
                                        </app-select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </app-perfect-scrollbar>
                    <div class="section__summary" @click="activeTab = 'client'">
                        <div class="summary-radio" style="margin-right: 5px;">
                            <app-switch :readonly="true" :value="activeTab === 'client'"></app-switch>
                        </div>
                        <h3>Cliente</h3>
                        <span class="push-both-sides"></span>
                    </div>
                </div>
                <div class="request__section" :class="{active: activeTab === 'order'}">
                    <app-request-order :request="request"></app-request-order>
                    <div class="section__summary" @click="activeTab = 'order'">
                        <div class="summary-radio" style="margin-right: 5px;">
                            <app-switch :readonly="true" :value="activeTab === 'order'"></app-switch>
                        </div>
                        <h3>Venda</h3>
                        <span class="push-both-sides"></span>
                    </div>
                </div>
            </div>
            <div class="request__footer">
                <span class="push-both-sides"></span>
                <a class="button"
                   @click="createRequest()"
                   style="display: flex; align-items: center; align-self: center; margin-right: 8px; text-transform: uppercase;">Criar pedido</a>
            </div>
            <app-perfect-scrollbar v-if="searchValue && searchItems.length && searchShow" class="request__search-result">
                <div class="search-result__item" v-for="searchItem in searchItems" @click="selectSearchItem(searchItem)">
                    <span class="name">{{ searchItem.name }}</span>
                    <span class="address">
                        {{(searchItem.address) ? searchItem.address : 'S/ENDEREÇO' }}, {{(searchItem.number) ? searchItem.number : 'S/NÚMERO' }}
                        {{(searchItem.complement) ? ' ' + searchItem.complement : '' }}
                    </span>
                    <span class="address-details">
                        {{(searchItem.neighborhood) ? searchItem.neighborhood : 'S/BAIRRO' }}, {{(searchItem.city) ? searchItem.city : 'S/CIDADE' }} - {{(searchItem.state) ? searchItem.state : 'S/ESTADO' }}
                    </span>
                </div>
            </app-perfect-scrollbar>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex'
    import _ from 'lodash'
    import shortid from 'shortid'
    import ClientSearchComponent from '../_Shared/Search/ClientSearch'
    import RequestOrder from './RequestOrder'

    export default {
        props: ['request'],
        components: {
            'app-request-order': RequestOrder,
            'app-client-search': ClientSearchComponent
        },
        data(){
            return {
                moneyMask: {
                    decimal: ',',
                    thousands: '.',
                    precision: 2,
                },

                searchShow: false,
                searchTimeout: null,
                searchValue: null,
                searchItems: [],

                users: [],
                products: [],
                clientGroups: [],
                promotionChannels: [],

                activeTab: 'client',

                requestClientAddressForm: false,

                isAddingClientAddress: false,

                price: 0
            }
        },
        computed: {
            getSelectClientGroups(){
                return _.map(this.$store.getters['entities/clientGroups/all'](), (clientGroup) => {
                    return {
                        value: clientGroup.id,
                        text: clientGroup.name
                    }
                })
            }
        },
        methods: {
            cancel(){
                if(this.isAddingClientAddress){
                    const clientAddressId = this.request.requestClientAddresses[0].clientAddressId
                    this.removeClientAddress(clientAddressId)
                    this.isAddingClientAddress = false
                }
                this.requestClientAddressForm = false

            },
            createRequest(){
                console.log(this.$store.getters['entities/paymentMethods/all']())
            },
            updateValue(path, field, id, value){
                console.log(value)
                const data = {}
                data[field] = value
                this.$store.dispatch(path, {
                    where: id,
                    data
                })
            },
            addClientPhone(){
                this.$store.dispatch('entities/clientPhones/insert',{
                    data: {
                        id: `tmp/${shortid.generate()}`,
                        clientId: this.request.client.id
                    }


                })
            },
            addClientAddress(){
                this.isAddingClientAddress = true
                this.requestClientAddressForm = true
                const requestClientAddressId = this.request.requestClientAddresses[0].id
                if(requestClientAddressId){
                    const clientAddressTmpId = `tmp/${shortid.generate()}`
                    const addressTmpId = `tmp/${shortid.generate()}`
                    this.$store.dispatch('entities/addresses/insert',{
                        data: {
                            id: addressTmpId
                        }
                    }).then(() => {
                        this.$store.dispatch('entities/clientAddresses/insert',{
                            data: {
                                id: clientAddressTmpId,
                                clientId: this.request.clientId,
                                addressId: addressTmpId
                            }
                        }).then(() => {
                            this.$store.dispatch('entities/requestClientAddresses/delete',requestClientAddressId).then(() => {
                                this.$store.dispatch('entities/requestClientAddresses/insert', {
                                    data: {
                                        id: `tmp/${shortid.generate()}`,
                                        requestId: this.request.id,
                                        clientAddressId: clientAddressTmpId
                                    }
                                })
                            })
                        })
                    })
                }
            },
            editClientAddress(clientAddressId){
                this.isAddingClientAddress = false
                this.requestClientAddressForm = true
                const requestClientAddressId = this.request.requestClientAddresses[0].id
                if(requestClientAddressId){
                    this.$store.dispatch('entities/requestClientAddresses/update', {
                        where: requestClientAddressId,
                        data: {
                            clientAddressId: clientAddressId
                        }
                    })
                }
            },
            removeClientAddress(clientAddressId){
                this.$store.dispatch('entities/clientAddresses/delete', clientAddressId)
            },
            removeClientPhone(clientPhoneId){
                if(this.request.client.clientPhones.length <= 1){
                    return;
                }
                this.$store.dispatch('entities/clientPhones/delete', clientPhoneId)
            },
            selectSearchItem(searchItem){
                const vm = this

                const clientId = parseInt(searchItem.id.split('#')[0])
                const clientAddressId = parseInt(searchItem.id.split('#')[1])

                console.log(clientId, clientAddressId)
                this.$db.clients.where({
                    'id': clientId
                }).first().then((client) => {
                    this.$db.clientPhones.where({
                        'clientId': clientId
                    }).toArray().then((clientPhones) => {
                        this.$db.clientAddresses.where({
                            'clientId': clientId
                        }).toArray().then((clientAddresses) => {
                            const clientAddress = _.find(clientAddresses, {id: clientAddressId})
                            if(clientAddress.addressId){
                                this.$db.addresses.where({
                                    'id': clientAddress.addressId
                                }).first().then((address) => {
                                    this.$store.dispatch('entities/addresses/insert', {
                                        data: address
                                    })
                                    this.$store.dispatch('entities/clients/insert',{
                                        data: client
                                    })
                                    this.$store.dispatch('entities/clientPhones/insert',{
                                        data: clientPhones
                                    })
                                    this.$store.dispatch('entities/clientAddresses/insert',{
                                        data: clientAddresses
                                    })
                                    this.$store.dispatch('entities/requestClientAddresses/insert',{
                                        data: {
                                            id: `tmp/${shortid.generate()}`,
                                            requestId: vm.request.id,
                                            clientAddressId: clientAddress.id
                                        }
                                    })
                                    this.$store.dispatch('entities/requests/update',{
                                        where: vm.request.id,
                                        data: {
                                            clientId: clientId
                                        }
                                    })
                                    vm.searchShow = false
                                    vm.requestClientAddressForm = true
                                })
                            }
                        })
                    })
                })
            },
            search(){
                if(this.searchTimeout) clearTimeout(this.searchTimeout)
                this.searchTimeout = setTimeout(() => {
                    if(this.$static.searchClientsIndex){
                        let resultData = this.$static.searchClientsIndex.search(this.searchValue,{
                            fields: {
                                name: {boost: 1},
                                address: {boost: 1},
                                number: {boost: 1},
                                complement: {boost: 1}
                            },
                            bool: "OR",
                            expand: false
                        }).slice(0,30)
                        this.$db.searchClients.where('id').anyOf(_.map(resultData,(resultDataItem) => {
                            return resultDataItem.ref
                        })).toArray().then((foundClients) => {
                            this.items = _.map(resultData, (resultDataItem) => {
                                return _.find(foundClients,{id: resultDataItem.ref})
                            })
                            this.searchItems = this.items
                        })
                    }
                }, 500)
            }
        },
        created(){
            const vm = this
            vm.$db.users.toArray().then((users) => {
                vm.users = users
            })
            vm.$db.products.toArray().then((products) => {
                vm.products = products
            })
            vm.$db.clientGroups.toArray().then((clientGroups) => {
                vm.clientGroups = clientGroups
            })
            vm.$db.promotionChannels.toArray().then((promotionChannels) => {
                vm.promotionChannels = promotionChannels
            })
        },
        mounted(){


        }
    }
</script>

<style lang="scss" scoped>
    @import '../window.scss';
    @import './request.scss';
    .request__window {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        position: relative;
        .request__overlay {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            z-index: 99;
            background-color: var(--bg-color--2);
            a.back {
                position: absolute;
                right: 20px;
                top: 20px;
                i {
                    font-size: 48px;
                }
            }
        }
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
                &:hover, &:focus, &:active {}
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
                            font-weight: 400
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
                            background-color: var(--bg-color--3)
                        }
                    }
                    &:last-child {
                        margin-bottom: 0;
                    }
                    &.active  {
                        display: flex;
                        flex-grow: 1;
                        flex-shrink: unset;
                        .section__content {
                            display: flex;
                            background-color: var(--bg-color--2);
                            flex-grow: 1;
                        }
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
                background-color: var(--bg-color--6)
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
                    flex-direction: column;
                    padding: 10px 8px;
                    border-bottom: 1px solid var(--border-color--0);
                    cursor: pointer;
                    transition: .5s all;
                    .name {
                        color: var(--font-color--primary);
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
