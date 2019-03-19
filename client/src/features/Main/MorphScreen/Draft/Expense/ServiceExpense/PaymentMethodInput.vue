<template>
    <div class="product-input">
        <app-select :items="selectPaymentMethods" title="Escolha" :verticalOffset="8" showInput="true" v-model="selectedPaymentMethod">
            <input type="text" style="cursor: pointer;" readonly :value="selectedPaymentMethodName" placeholder="ESCOLHA UM" />
            <icon-dropdown style="position: absolute; top: 6px; right: 5px;"></icon-dropdown>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-select>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '../../../../../../utils/index';

    export default {
        props: ['value'],
        watch: {
            selectedPaymentMethod(selectedPaymentMethod){
                this.$emit('input', selectedPaymentMethod.value);
            }
        },
        data(){
            return {
                selectedPaymentMethod: null,
                selectPaymentMethods: [
                    {
                        value: 1,
                        text: 'À VISTA'
                    },
                    {
                        value: 2,
                        text: 'CARTÃO DE CRÉDITO'
                    },
                    {
                        value: 3,
                        text: 'CARTÃO DE DÉBITO'
                    },
                    {
                        value: 4,
                        text: 'ELO CRÉDITO'
                    },
                    {
                        value: 5,
                        text: 'CARTÃO 2X'
                    }
                ]
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            selectedPaymentMethodName(){
                if(this.selectedPaymentMethod){
                    const selectedPaymentMethod = _.find(this.selectPaymentMethods, { value: this.selectedPaymentMethod });
                    if(selectedPaymentMethod) return selectedPaymentMethod.text;
                }
            }
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            /**
             * Form model
             */

        },
        mounted(){
        }
    }
</script>

<style scoped>

</style>