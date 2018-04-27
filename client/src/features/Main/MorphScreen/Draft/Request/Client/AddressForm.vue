<template>
    <app-search ref="searchComponent" v-if="!form.id" :items="search.items" :shouldStayOpen="search.isAddressInputFocused" :query="search.query" :verticalOffset="8" :horizontalOffset="-20"
    @itemSelected="searchMethods().searchAddressSelected($event)">
        <input type="text" class="search-input__field" v-model="form.name" ref="searchInput"
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
        <input type="text" class="search-input__field" style="color: var(--font-color--primary)" v-model="form.name" @input="inputName()" />
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
        props: ['id', 'name'],
        watch: {
            id: {
                handler(){
                    this.form.id = this.id
                },
                immediate: true
            },
            name: {
                handler(){
                    this.form.name = this.name
                },
                immediate: true
            }
        },
        data(){
            return {
                search: {
                    items: [],
                    isAddressInputFocused: false,
                    query: '',
                    lastQuery: '',
                    commitTimeout: null
                },
                form: {
                    id: null,
                    name: null
                },
                address: {},
                initialAddressForm: null
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company'])
        },
        sockets: {
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
                            vm.search.query = vm.form.name
                            vm.searchMethods().searchAddresses()
                        }, 300)
                    },
                    searchAddressSelected(item){
                        vm.$emit('select', item)
                        console.log(item)
                        /*if(vm.clientAddress){
                            vm.$socket.emit('draft:client-address-address-select', {
                                draftId: vm.activeMorphScreen.draft.draftId,
                                addressId: item.id,
                                clientAddressId: (vm.clientAddress.id) ? vm.clientAddress.id : null
                            })
                        }*/
                    }
                }
            },

            /**
             * Actions
             */

            inputName(){
                this.$emit('update:name', this.form.name)
                this.$emit('input', this.form.name)
            },

            changeAddress(){
                this.$emit('reset', true)
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