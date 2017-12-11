<template>
    <app-search ref="search" v-if="!address.id" :items="addresses" :shouldStayOpen="isAddressInputFocused" :query="addressQuery" :verticalOffset="8" :horizontalOffset="-20"
    @itemSelected="addressSearchItemSelected($event)">
        <input type="text" class="search-input__field" v-model="address.name" ref="searchInput"
        @focus="isAddressInputFocused = true" @blur="isAddressInputFocused = false" @keydown="onAddressSearchInputKeyDown($event)"
        @input="onSearchInput()" />
        <template slot="item" slot-scope="props">
            <div class="search-input__item">
                <span class="detail__address" v-html="props.item.name"></span>
                <span class="detail__neighborhood" v-html="props.item.neighborhood + ' - ' + props.item.city + '/' + props.item.state"></span>
            </div>
        </template>
        <template slot="settings">
            <div class="search-input__settings">
                <app-switch style="margin-right: 8px;"></app-switch>
                <span style="margin-right: 8px;">Apenas endereços</span>
                <a class="settings__info">?</a>
            </div>
        </template>
        <template slot="no-results">
            <span>Nenhum resulado encontrado...</span>
        </template>
    </app-search>
    <div style="flex-grow: 1" v-else>
        <input type="text" class="search-input__field" style="color: var(--font-color--primary)" v-model="address.name" @input="onSearchInput()" />
        <a class="btn btn--border-only" style="position: absolute; right: 0; top: -3px;" @click="changeAddress()">Mudar</a>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import AddressesAPI from '../../../../api/addresses';
    import SearchComponent from '../../../../components/Inputs/Search.vue';
    import utils from '../../../../utils';
    import models from '../../../../models';

    export default {
        components: {
            'app-search': SearchComponent
        },
        props: ['address', 'clientAddress'],
        data(){
            return {
                addressQuery: null,
                addressInputTimeout: null,
                isAddressInputFocused: false,
                addresses: [],
                addressEmptyObj: {
                    companyId: null,
                    id: null,
                    name: null,
                    neighborhood: null,
                    cep: null,
                    city: null,
                    state: null
                },
                initialAddressForm: null
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company'])
        },
        sockets: {
            draftClientAddressAddressReset(){
                Object.assign(this.address, models.createAddressModel());
            },
            draftClientAddressAddressSelect(address){
                utils.assignToExistentKeys(this.address, address);
                this.$emit('change', this.address);
            }
        },
        methods: {

            /**
             * Search
             */

            searchAddresses(){
                const vm = this;
                const searchComponent = vm.$refs.search;
                AddressesAPI.search({
                    actingCities: ['MARINGA'],
                    q: vm.addressQuery
                }).then((result) => {
                    vm.addresses = result.data.map(({source}) => {
                        return source;
                    });
                    searchComponent.search();
                }).catch((err) => {
                    vm.addresses = [];
                });
            },
            onSearchInput(){
                this.$emit('input', this.address.name);
            },
            onAddressSearchInputKeyDown(ev){
                if(this.addressInputTimeout) clearTimeout(this.addressInputTimeout);
                this.addressInputTimeout = setTimeout(() => {
                    this.addressQuery = this.address.name;
                    this.searchAddresses();
                }, 300);
            },
            addressSearchItemSelected(item){
                const vm = this;
                if(this.clientAddress){
                    this.$socket.emit('draft:client-address-address-select', {
                        draftId: this.activeMorphScreen.draft.draftId,
                        addressId: item.id,
                        clientAddressId: (this.clientAddress.id) ? this.clientAddress.id : null
                    });
                }
            },

            /**
             * Actions
             */

            changeAddress(){
                this.$socket.emit('draft:client-address-address-reset', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            }
        },
        mounted(){
            this.initialAddressForm = _.clone(this.address, true);
        }

    }
</script>

<style scoped>

    /* search input */

    .search .search-input__item {
        display: flex;
        flex-direction: column;
    }
    .search .search-input__item span {
        line-height: 150%;
        font-size: 13px;
    }
    .search .search-input__item span em {
        font-style: initial;
        color: red;
    }
    .search .search-input__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
        padding-top: 15px;
        margin-top: 15px;
        border-top: 1px solid var(--bg-color--8);
    }
    .search .search-input__settings .settings__info {
        background-color: var(--bg-color--7);
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        border: 1px solid var(--base-color--d);
    }

</style>