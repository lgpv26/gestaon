<template>
    <div class="client-address-types-input">
        <app-select :items="selectClientAddressTypes" title="Responśavel" :verticalOffset="8" showInput="true" v-model="selectedClientAddressTypes" :multiple="true">
            <input type="text" class="input--borderless" style="cursor: pointer;" :value="selectedAmount" readonly placeholder="ESCOLHA UM" />
            <icon-dropdown style="position: absolute; right: 0;"></icon-dropdown>
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
            selectedClientAddressTypes(selectedClientAddressTypes){
                this.$emit('input', selectedClientAddressTypes.value);
            }
        },
        data(){
            return {
                selectedClientAddressTypes: [],
                selectClientAddressTypes: [
                    {
                        text: 'ENTREGA',
                        value: 'delivery'
                    },
                    {
                        text: 'COBRANÇA',
                        value: 'bill'
                    },
                    {
                        text: 'FATURAMENTO',
                        value: 'invoice'
                    }
                ]
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            selectedAmount(){
                if(this.selectedClientAddressTypes.length > 0){
                    return this.selectedClientAddressTypes.length + " SELECIONADO(S)"
                }
                return "SELECIONE"
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
    input {
        height: initial;
    }
    .client-address-types-input {
        display: flex;
        align-items: center;
        width: 160px;
    }
</style>