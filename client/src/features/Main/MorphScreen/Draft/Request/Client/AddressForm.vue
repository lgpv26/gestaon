<template>
    <app-search ref="searchComponent" v-if="!id" :items="search.items" :shouldStayOpen="search.isAddressInputFocused" :query="search.query" :verticalOffset="8" :horizontalOffset="-20"
    @itemSelected="searchMethods().searchAddressSelected($event)">
        <input type="text" class="search-input__field" v-model="name" ref="searchInput"
        @focus="search.isAddressInputFocused = true" @blur="search.isAddressInputFocused = false" @keydown="searchMethods().searchValueUpdated()"
        @input="sync(name, 'name')" />
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
        <input type="text" class="search-input__field" style="color: var(--font-color--primary)" v-model="name" @input="sync(name, 'name')" />
        <div style="position: absolute; right: 0; top: -3px; cursor: pointer;" @click="changeAddress()">
            <icon-change></icon-change>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'

    import _ from 'lodash'
    import AddressesAPI from '@/api/addresses'
    import SearchComponent from '@/components/Inputs/Search.vue'
    import utils from '@/utils/index'
    import Vue from 'vue'

    import DraftMixin from '../../DraftMixin'

    const { mapFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-search': SearchComponent
        },
        mixins: [DraftMixin],
        data(){
            return {
                search: {
                    items: [],
                    isAddressInputFocused: false,
                    query: '',
                    lastQuery: '',
                    commitTimeout: null
                },
                formPath: 'request.client.clientAddressForm.address'
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            ...mapFields([
                'form.client.clientAddressForm.address',
                'form.client.clientAddressForm.address.id',
                'form.client.clientAddressForm.address.name'
            ])
        },
        sockets: {
        },
        methods: {

            ...mapActions('draft/request', ['setClientAddressFormAddress']),

            /**
             * Search
             */

            searchMethods(){
                const vm = this
                return {
                    searchAddresses(){
                        AddressesAPI.search({
                            actingCities: ['MARINGA','SARANDI'],
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
                            vm.search.query = vm.name
                            vm.searchMethods().searchAddresses()
                        }, 300)
                    },
                    searchAddressSelected(item){
                        vm.$emit('select', item)
                        const emitData = {
                            draftId: vm.activeMorphScreen.draft.draftId,
                            addressId: parseInt(item.id)
                        }
                        console.log("Emitting draft/request.address.select", emitData)
                        vm.$socket.emit('draft/request.address.select', emitData)
                    }
                }
            },

            /**
             * Actions
             */

            changeAddress(){
                this.setClientAddressFormAddress()
                this.syncMultiple(_.map(this.address, (v, k) => {
                    return {
                        value: v,
                        path: k
                    }
                }))
            }
        },
        created(){
            const vm = this

            /**
             * On address select
             * @param {Object} ev = { success:Boolean, evData = { } }
             */
            vm.$options.sockets['draft/request.address.select'] = (ev) => {
                console.log("Received draft/request.address.select", ev)
                if (ev.success) {
                    vm.setClientAddressFormAddress(ev.evData)
                    Vue.nextTick(() => {
                        vm.syncMultiple(_.map(vm.address, (v, k) => {
                            return {
                                value: v,
                                path: k
                            }
                        }))
                    })
                }
            }
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