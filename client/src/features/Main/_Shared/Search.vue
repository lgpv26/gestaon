<template>
    <div class="app-search">
        <div class="search__search-input">
            <app-search v-if="!selectedClient && !selectedAddress" ref="search" :items="searchItems" :shouldStayOpen="isInputFocused" :forceNoResults="forceNoResults" :showOnly="showOnly" :query="query" :verticalOffset="19" :horizontalOffset="-20" @itemSelected="onItemSelect($event)">
                <input type="text" placeholder="ENCONTRAR ENDEREÇO/CLIENTE..." class="input--borderless search-input__field" v-model="inputValue" ref="searchInput"
                    @focus="isInputFocused = true" @blur="isInputFocused = false" @keydown="searchValueUpdated()" />
                <template slot="item" slot-scope="props">
                    <div class="search-input__item client" v-if="props.item.client">
                        <span class="detail__name" v-html="props.item.client.name"></span>
                        <span class="detail__address" v-if="props.item.client.address" v-html="props.item.client.address.address + ', ' + props.item.client.address.number"></span>
                        <span class="detail__phones" v-if="props.item.client.phones.length > 0">
                            <span v-for="(clientPhone, index) in props.item.client.phones" v-html="((index === 0) ? '' : ', ') + clientPhone.number"></span>
                        </span>
                    </div>
                    <div class="search-input__item address" v-if="props.item.address">
                        <span class="detail__address" v-html="props.item.address.name"></span>
                    </div>
                </template>
                <template slot="settings">
                    <div class="search-input__settings">
                        <app-switch v-model="showOnlyAddresses" @change="onShowOnlyAddressesChanged($event)" style="margin-right: 8px;"></app-switch>
                        <span style="margin-right: 8px;">Apenas endereços</span>
                        <a class="settings__info">?</a>
                    </div>
                </template>
                <template slot="no-results">
                    <span>Nenhum resulado encontrado...</span>
                </template>
            </app-search>
            <div class="selected" v-else>
                <a href="javascript:void(0)" @click="cleanSelected()"><icon-remove></icon-remove></a>
                <input type="text" class="input--borderless search-input__field" v-if="selectedClient" :value="selectedClient.name" disabled />
                <input type="text" class="input--borderless search-input__field" v-else-if="selectedAddress" :value="selectedAddress.name" disabled />
            </div>
        </div>
        <div class="search__action-button" ref="actionButton" >
            <app-dropdown-menu :menuList="menuList" placement="bottom-end" :verticalOffset="10">
                <div style="width: 40px; height: 20px; display: flex; align-items: center; justify-content: center;">
                    <icon-header-add></icon-header-add>
                </div>
            </app-dropdown-menu>
            <!--
            <app-popover :config = "{ contentPadding: false }">
                <template slot="triggerer">
                    <div style="width: 100%; height: 20px; display: flex; align-items: center; justify-content: center;">
                        <icon-header-add></icon-header-add>
                    </div>
                </template>
                <template slot="content">
                    <div>
                        <ul>
                            <li>Oi</li>
                        </ul>
                    </div>
                </template>
            </app-popover>
            -->
        </div>
    </div>
</template>

<script>
    import DraftsAPI from '../../../api/drafts';
    import ServiceAPI from '../../../api/service';
    import ClientsAPI from '../../../api/clients';
    import AddressesAPI from '../../../api/addresses';
    import SearchComponent from '../../../components/Inputs/Search.vue';
    import DropdownMenuComponent from "@/components/Utilities/DropdownMenu.vue";
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import markjs from 'mark.js';

    import {createRequest} from '@/models/RequestModel'

    export default {
        components: {
            'app-search': SearchComponent,
            "app-dropdown-menu": DropdownMenuComponent
        },
        data(){
            return {
                selectedClient: null,
                selectedAddress: null,

                query: '',
                lastSearchObj: {},
                inputValue: '',
                isInputFocused: false,
                commitTimeout: null,
                markJs: null,
                searchItems: [],
                forceNoResults: false,
                showOnlyAddresses: false,
                menuList: [
                    {text: 'Atendimento', type: 'system', action: this.addRequestDraft},
                    {text: 'Plano de contas', type: 'system', action: this.addAccountsDraft},
                    {text: 'Compra/Despesa', type: 'system', action: this.addExpenseDraft}
                ]
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapState('morph-screen', { isShowingMorphScreen: 'isShowing' }),
            ...mapState('morph-screen', ['searchData']),
            showOnly(){
                if(this.showOnlyAddresses === true){
                    return 'address';
                }
                return null;
            },
            searchObject(){
                return {
                    inputValue: this.inputValue
                }
            }
        },
        methods: {
            ...mapActions('morph-screen', ['createDraft']),
            ...mapMutations('morph-screen', ['ADD_DRAFT','SET_MS', 'SHOW_MS', 'SET_SEARCH_DATA']),
            ...mapActions('toast', ['showError']),
            cleanSelected(){
                this.selectedClient = null
                this.selectedAddress = null
                this.resetSearch()
            },
            addRequestDraft(){
                const vm = this;
                if(!vm.isShowingMorphScreen){
                    const createDraftArgs = {
                        body: {
                            type: 'request',
                            createdBy: vm.user.id,
                            data: {}
                        },
                        companyId: vm.company.id
                    }
                    if(vm.selectedClient){
                        // default
                        createDraftArgs.body.data = {
                            request: createRequest({
                                activeStep: 'client',
                                client: vm.selectedClient || {}
                            })
                        }
                        // select first address and phone
                        if(vm.selectedClient.clientAddresses.length){
                            createDraftArgs.body.data.request.clientAddressId = vm.selectedClient.clientAddresses[0].id
                        }
                        if(vm.selectedClient.clientPhones.length){
                            createDraftArgs.body.data.request.clientPhoneId = vm.selectedClient.clientPhones[0].id
                        }
                        //if two of them are selected, go directly to order tab
                        if(_.get(createDraftArgs, 'body.data.request.clientAddressId', null) && _.get(createDraftArgs,'body.data.request.clientPhoneId', null)){
                            createDraftArgs.body.data.request.activeStep = 'order'
                        }
                    }
                    else if(vm.selectedAddress){
                        createDraftArgs.body.data = {
                            request: createRequest({
                                activeStep: 'client',
                                client: vm.selectedClient || {}
                            })
                        }
                    }
                    vm.createDraft(JSON.parse(JSON.stringify(createDraftArgs)))
                } else {
                    this.SHOW_MS(false)
                }
            },
            onItemSelect(item){
                if(_.has(item, 'client')){
                    console.log("Client", item.client)
                    this.SET_SEARCH_DATA({
                        text: this.inputValue,
                        client: item.client
                    })
                    ClientsAPI.getOne(item.client.id, {
                        companyId: this.company.id
                    }).then(({data}) => {
                        this.selectedAddress = null
                        this.selectedClient = data
                    })
                }
                else if(_.has(item, 'address')){
                    console.log("Address", item.address)
                    this.SET_SEARCH_DATA({
                        text: this.inputValue,
                        address: item.address
                    })
                    AddressesAPI.getOne(item.address.id, {
                        companyId: this.company.id
                    }).then(({data}) => {
                        this.selectedAddress = data
                        this.selectedClient = null
                    })
                }
            },
            onShowOnlyAddressesChanged(){
                if(this.showOnlyAddresses){
                    this.search();
                }
                else {
                    this.forceNoResults = false
                }
            },
            search(){
                const vm = this;
                const searchComponent = vm.$refs.search;
                ServiceAPI.search({
                    actingCities: ['MARINGA'],
                    q: vm.query,
                    companyId: vm.company.id
                }).then(({data}) => {
                    let clients = data[0]
                    let addresses = data[1]
                    vm.searchItems = []
                    clients = clients.map(({source}) => {
                        // source refers to search address item
                        return {
                            client: source
                        }
                    })
                    addresses = addresses.map(({source}) => {
                        // source refers to search address item
                        return {
                            address: source
                        }
                    })
                    if(vm.showOnly === 'address' && addresses.length <= 0){
                        vm.forceNoResults = true
                    }
                    else {
                        vm.forceNoResults = false
                    }
                    vm.searchItems = _.concat(clients, addresses)
                    searchComponent.search()

                }).catch((err) => {
                    vm.searchItems = []
                })
            },
            resetSearch(){
                this.query = ''
                this.inputValue = ''
                this.lastSearchObj = {}
                this.searchItems = []
            },
            searchValueCommited(searchObj){
                let query = ''
                if(searchObj.inputValue.trim()){
                    query += " " + searchObj.inputValue
                }
                this.query = query;
                this.search()
            },
            commitUpdatedValue(){
                const vm = this
                if(JSON.stringify(vm.searchObject) !== JSON.stringify(vm.lastSearchObj)){
                    vm.lastSearchObj = vm.searchObject
                    vm.searchValueCommited(vm.searchObject)
                }
            },
            searchValueUpdated(ignoreTimeout = false){
                const vm = this
                if(vm.commitTimeout) clearTimeout(vm.commitTimeout)
                if(ignoreTimeout){
                    vm.searchValueCommited(vm.searchObject)
                }
                else{
                    vm.commitTimeout = setTimeout(() => {
                        vm.commitUpdatedValue()
                    }, 300)
                }
            }
        },
        created(){
            const vm = this
            /**
             * On draft created in the company - open morphscreen if the user id equals to the draft createdBy
             * @param {Object} ev = { success:Boolean, evData:Draft }
             */
            vm.$options.sockets['draft.create'] = (ev) => {
                if (ev.success) {
                    vm.ADD_DRAFT(ev.evData)
                    setImmediate(() => {
                        if (ev.evData.createdBy === vm.user.id) {
                            vm.SET_SEARCH_DATA({
                                text: vm.inputValue
                            })
                            vm.SET_MS({
                                draftId: ev.evData.draftId,
                                screen: {
                                    active: true
                                }
                            })
                            vm.SHOW_MS(true)
                        }
                    })
                }
                console.log("Received draft.create", ev)
            }
        }
    }
</script>

<style lang="scss" scoped>

    div.app-search {
        height: 32px;
        align-self: center;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    /* search input */

    .search__search-input {
        width: 320px;
        padding-left: 20px;
        padding-right: 20px;
        border-bottom-left-radius: 32px;
        border-top-left-radius: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color--9);
        div.selected {
            width: 100%;
            input {
                color: var(--font-color--primary);
                margin-left: 20px;
            }
            a {
                position: absolute;
                left: 17px;
                top: 8px;
            }
        }
    }
    .search__search-input .search-input__field {
        border-bottom: 0;
    }
    .search__search-input .search-input__item {
        display: flex;
        flex-direction: column;
    }

    .search__search-input .search-input__item span {
        line-height: 150%;
        font-size: 13px;
    }
    .search__search-input .search-input__item span em {
        font-style: initial;
        color: red;
    }
    .search__search-input .search-input__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
        padding-top: 15px;
        margin-top: 15px;
        border-top: 1px solid var(--bg-color--8);
    }
    .search__search-input .search-input__settings .settings__info {
        background-color: var(--bg-color--7);
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        border: 1px solid var(--base-color--d);
    }

    /* search button */

    div.app-search > .search__search-button {
        width: 50px;
        height: 32px;
        display: flex;
        padding-left: 3px;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color--9);
        border-bottom-left-radius: 32px;
        border-top-left-radius: 32px;
        cursor: pointer;
    }
    div.app-search.active.has-chips > .search__search-button {
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
    }
    div.app-search > .search__dropdown-menu {
        padding: 0 20px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary-color);
        cursor: pointer;
    }
    div.app-search > .search__dropdown-menu span {
        color: var(--base-color--l);
        font-size: 12px;
        font-weight: 600;
    }
    div.app-search > .search__separator {
        width: 1px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary-color);
    }
    div.app-search > .search__separator > .separator--line {
        height: 20px;
        border-left: 1px solid rgba(255,255,255,.2);
    }
    div.app-search > .search__action-button {
        padding-right: 2px;
        width: 50px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary-color);
        border-bottom-right-radius: 32px;
        border-top-right-radius: 32px;
        cursor: pointer;
    }
</style>
