<template>
    <app-search ref="searchComponent" v-if="!address.id" :items="search.items" :shouldStayOpen="search.isAddressInputFocused" :query="search.query" :verticalOffset="8" :horizontalOffset="-20"
    @itemSelected="searchMethods().searchAddressSelected($event)">
        <input type="text" class="search-input__field" v-model="address.name" ref="searchInput"
        @focus="search.isAddressInputFocused = true" @blur="search.isAddressInputFocused = false" @keydown="searchMethods().searchValueUpdated()"
        @input="inputName()" />
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
        <input type="text" class="search-input__field" style="color: var(--font-color--primary)" v-model="address.name" @input="inputName()" />
        <div style="position: absolute; right: 0; top: -3px; cursor: pointer;" @click="changeAddress()">
            <icon-change></icon-change>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import AddressesAPI from '@/api/addresses';
    import SearchComponent from '../../../../../../components/Inputs/Search.vue';
    import utils from '../../../../../../utils/index';
    import models from '../../../../../../models';
    import Vue from 'vue';

    export default {
        components: {
            'app-search': SearchComponent
        },
        props: ['address', 'clientAddress'],
        data(){
            return {
                search: {
                    items: [],
                    isAddressInputFocused: false,
                    query: '',
                    lastQuery: '',
                    commitTimeout: null
                },
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
                Object.assign(this.address, models.createAddressModel())
            },
            draftClientAddressAddressSelect(address){
                utils.assignToExistentKeys(this.address, address)
                this.$emit('change', this.address)
            }
        },
        methods: {

            /**
             * Search
             */

            searchMethods(){
                const vm = this
                return {
                    searchAddresses(){
                        AddressesAPI.search({
                            actingCities: ['MARINGA'],
                            q: vm.search.query,
                            companyId: vm.company.id
                        }).then((result) => {
                            vm.search.items = result.data.map(({source}) => {
                                return source
                            })
                            vm.$refs.searchComponent.search()
                        }).catch((err) => {
                            vm.search.items = []
                        })
                    },
                    searchValueUpdated(){
                        if(vm.search.commitTimeout) clearTimeout(vm.search.commitTimeout)
                        vm.search.commitTimeout = setTimeout(() => {
                            vm.search.query = vm.address.name
                            vm.searchMethods().searchAddresses()
                        }, 300)
                    },
                    searchAddressSelected(item){
                        if(vm.clientAddress){
                            vm.$socket.emit('draft:client-address-address-select', {
                                draftId: vm.activeMorphScreen.draft.draftId,
                                addressId: item.id,
                                clientAddressId: (vm.clientAddress.id) ? vm.clientAddress.id : null
                            })
                        }
                    }
                }
            },

            /**
             * Actions
             */

            inputName(){
                const vm = this
                const emitData = {
                    draftId: vm.activeMorphScreen.draft.draftId,
                    name: vm.address.name
                }
                console.log("Emitting to draft/request.client.clientAddress.form.address.name", emitData)
                vm.$socket.emit('draft/request.client.clientAddress.form.address.name', emitData)
            },

            changeAddress(){
                this.$socket.emit('draft:client-address-address-reset', {
                    draftId: this.activeMorphScreen.draft.draftId
                })
            }
        },
        created(){
            const vm = this
            /**
             * Update address name
             * @param {Object} ev = { success:Boolean, evData = { name:String } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.form.address.name'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientAddress.form.address.name", ev)
                    vm.address.name = ev.evData.name
                }
            }
        },
        mounted(){
            this.initialAddressForm = _.clone(this.address, true)
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