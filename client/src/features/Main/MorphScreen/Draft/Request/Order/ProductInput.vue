<template>
    <div class="product-input">
        <app-search v-if="!_.get(value,'id',false)" ref="search" :items="search.items" :shouldStayOpen="search.isInputFocused" :query="search.query" :verticalOffset="5" :horizontalOffset="-20"
                    @itemSelected="searchMethods().onSearchProductSelect($event)" >
            <input type="text" class="search-input__field" placeholder="ENCONTRAR" v-model="product.name" ref="searchInput"
                   @keydown="searchMethods().onSearchValueUpdate()" @focus="search.isInputFocused = true" @blur="search.isInputFocused = false"
                   @input="searchMethods().onSearchInput()" />
            <template slot="item" slot-scope="props">
                <div class="search-input__item">
                    <span class="detail__name">{{ props.item.product }}</span>
                    <span class="detail__supplier">{{ props.item.supplierName }}</span>
                </div>
            </template>
            <template slot="no-results">
                <span>Nenhum resultado encontrado...</span>
            </template>
        </app-search>
        <div style="flex-grow: 1; position: relative;" v-else>
            <input type="text" class="search-input__field" style="color: var(--font-color--primary)" v-model="product.name" @input="searchMethods().onSearchInput()" />
            <div style="position: absolute; right: 0; top: -3px; cursor: pointer;" @click="resetOrderProductProduct()">
                <icon-change></icon-change>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import { Select } from "@/components/Inputs/Select/index"
    import _ from 'lodash'
    import utils from '@/utils/index'
    import ProductsAPI from '@/api/products'
    import SearchComponent from '@/components/Inputs/Search.vue'

    import {createProduct} from '@/models/ProductModel'

    const { mapFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-search': SearchComponent
        },
        props: ['value'],
        watch: {
            value: {
                handler(product){
                    this.product = createProduct(product)
                },
                deep: true,
                immediate: true
            }
        },
        data(){
            return {
                product: {},
                search: {
                    isInputFocused: false,
                    items: [],
                    lastQuery: '',
                    query: '',
                    searchValue: '',
                    commitTimeout: null
                }
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company'])
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            /**
             * Product search
             */

            searchMethods(){
                const vm = this
                return {
                    search() {
                        ProductsAPI.search({
                            q: vm.search.query,
                            companyId: vm.company.id
                        }).then(({data}) => {
                            //vm.search.items = data
                            vm.search.items = []
                            vm.$refs.search.search()
                        }).catch((err) => {
                            vm.search.items = []
                        })
                    },
                    onSearchProductSelect(item) {
                        console.log(item)
                        vm.search.items = [];
                    },
                    onSearchValueUpdate() {
                        if (vm.search.commitTimeout) clearTimeout(vm.search.commitTimeout)
                        vm.search.commitTimeout = setTimeout(() => {
                            vm.search.query = vm.product.name
                            vm.searchMethods().commitUpdatedValue()
                        }, 300)
                    },
                    commitUpdatedValue() {
                        if (vm.search.query.trim() !== vm.search.lastQuery) {
                            vm.search.lastQuery = vm.search.query.trim();
                            vm.searchMethods().search();
                        }
                    },
                    onSearchInput() {
                        vm.$emit('input', vm.product)
                        /*_.assign(this.orderProduct.product, {
                            name: this.searchValue
                        })
                        this.$emit('input', this.searchValue)*/
                    }
                }
            },

            /**
             * Actions
             */

            resetOrderProductProduct(){}
        }
    }
</script>

<style scoped>

    /* search input */

    .search-input__item {
        display: flex;
        flex-direction: column;
    }
    .search-input__item span {
        line-height: 150%;
        font-size: 13px;
    }
    .search-input__item span em {
        font-style: initial;
        color: red;
    }
    .search-input__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
        padding-top: 15px;
        margin-top: 15px;
        border-top: 1px solid var(--bg-color--8);
    }
    .search-input__settings .settings__info {
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