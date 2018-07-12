<template>
    <div class="product-input">
        <app-search v-if="!issetProduct" ref="search" :items="searchItems" :shouldStayOpen="isInputFocused" :query="query" :verticalOffset="5" :horizontalOffset="-20"
                    @itemSelected="onSearchProductSelect($event)" >
            <input type="text" class="search-input__field" placeholder="ENCONTRAR" v-model="searchValue" ref="searchInput"
                   @keydown="onSearchValueUpdate()" @focus="isInputFocused = true" @blur="isInputFocused = false"
                   @input="onSearchInput()" />
            <template slot="item" slot-scope="props">
                <div class="search-input__item">
                    <span class="detail__name">{{ props.item.product }}</span>
                    <span class="detail__supplier">{{ props.item.supplierName }}</span>
                </div>
            </template>
            <template slot="no-results">
                <span>Nenhum resulado encontrado...</span>
            </template>
        </app-search>
        <div style="flex-grow: 1; position: relative;" v-else>
            <input type="text" class="search-input__field" style="color: var(--font-color--primary)" v-model="product.name" @input="onSearchInput()" />
            <div style="position: absolute; right: 0; top: -3px; cursor: pointer;" @click="resetOrderProductProduct()">
                <icon-change></icon-change>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '../../../../../../utils/index';
    import ProductsAPI from '../../../../../../api/products';
    import SearchComponent from '../../../../../../components/Inputs/Search.vue';

    export default {
        components: {
            'app-search': SearchComponent
        },
        props: ['product','orderProduct'],
        data(){
            return {
                isInputFocused: false,
                searchItems: [],
                lastQuery: '',
                query: '',
                searchValue: ''
            }
        },
        watch: {
            'product.name': function(){
                if(_.has(this.product, 'name')) this.searchValue = this.product.name
            }
        },
        sockets: {

            /* draft order products */

            draftOrderProductProductSelect(orderProduct){
                if(this.orderProduct.id === orderProduct.orderProductId){
                    console.log("Received draftOrderProductProductSelect", orderProduct)
                    const tOrderProduct = utils.removeReactivity(orderProduct)
                    utils.assignToExistentKeys(this.orderProduct.product, tOrderProduct.product)
                    delete tOrderProduct.product
                    utils.assignToExistentKeys(this.orderProduct, tOrderProduct)
                }
            },
            draftOrderProductProductReset(data){
                console.log("Received draftOrderProductProductReset", data)
                // Object.assign(this.client, models.createAddressModel());
            }

        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            issetProduct(){
                return this.product && this.product.id
            }
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            /**
             * Product search
             */

            search(){
                const vm = this;
                ProductsAPI.search({
                    actingCities: ['MARINGA'],
                    q: vm.query,
                    companyId: vm.company.id
                }).then(({data}) => {
                    vm.searchItems = data;
                    vm.$refs.search.search();
                }).catch((err) => {
                    vm.searchItems = [];
                });
            },
            onSearchProductSelect(item){
                const vm = this;
                if(this.orderProduct){
                    const emitData = {
                        draftId: this.activeMorphScreen.draft.draftId,
                        productId: item.productId,
                        orderProductId: (this.orderProduct.id) ? this.orderProduct.id : null
                    };
                    console.log("Emitting draft:order-product-product-select", emitData)
                    this.$socket.emit('draft:order-product-product-select', emitData);
                    vm.searchItems = [];
                }

            },
            onSearchValueUpdate(){
                if(this.commitTimeout) clearTimeout(this.commitTimeout);
                this.commitTimeout = setTimeout(() => {
                    this.query = this.searchValue;
                    this.commitUpdatedValue();
                }, 300)
            },
            commitUpdatedValue(){
                if(this.query.trim() !== this.lastQuery){
                    this.lastQuery = this.query.trim();
                    this.search();
                }
            },
            onSearchInput(){
                _.assign(this.orderProduct.product, {
                    name: this.searchValue
                })
                this.$emit('input', this.searchValue)
            },

            /**
             * Actions
             */

            resetOrderProductProduct(){
                const emitData = {
                    orderProductId: (this.orderProduct.id) ? this.orderProduct.id : null,
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting draft:order-product-product-reset", emitData)
                this.$socket.emit('draft:order-product-product-reset', emitData);
            }
        },
        mounted(){
            if(_.has(this.product, 'name')) this.searchValue = this.product.name
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