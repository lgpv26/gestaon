<template>
    <div class="product-input">
        <app-new-select :items="selectProducts" title="Escolha um Produto" :verticalOffset="8" showInput="true" v-model="selectedProduct">
            <input type="text" style="cursor: pointer;" readonly :value="selectedProductName" placeholder="ESCOLHA UM" />
            <icon-dropdown style="position: absolute; top: 6px; right: 5px;"></icon-dropdown>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-new-select>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import { Select } from "../../../../components/Inputs/Select/index";
    import _ from 'lodash';
    import utils from '../../../../utils';
    import ProductsAPI from '../../../../api/products';

    export default {
        components: {
            'app-new-select': Select
        },
        props: ['value'],
        watch: {
            selectedProduct(selectedProduct){
                this.$emit('input', selectedProduct.id);
            }
        },
        data(){
            return {
                selectedProduct: null,
                selectProducts: []
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            selectedProductName(){
                if(this.selectedProduct){
                    const selectedProduct = _.find(this.products, { id: this.selectedProduct });
                    if(selectedProduct) return selectedProduct.name;
                }
            }
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            /**
             * Form model
             */

            loadProducts(){
                const vm = this;
                ProductsAPI.getAll().then(({data}) => {
                    vm.products = data;
                    vm.selectProducts = _.map(data, (product) => {
                        return {
                            text: product.name,
                            value: product.id
                        }
                    });
                });
            }

        },
        mounted(){
            this.loadProducts();
        }
    }
</script>

<style scoped>

</style>