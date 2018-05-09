<template>
    <table class="payment-methods" style="width: 100%; text-align: left;">
        <thead>
        <tr>
            <th>Forma de pagamento</th>
            <!--<th style="text-align: left; width: 80px;">Parcela</th>-->
            <th style="text-align: left; width: 150px;">Vencimento</th>
            <th style="text-align: right; width: 150px;">Valores</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(requestPaymentMethodRow,index) in requestPaymentMethodRows">
            <td>
                <app-payment-method-select v-model="requestPaymentMethodRow.paymentMethod" @change="changeRequestPaymentMethodRowPaymentMethod($event,index)"></app-payment-method-select>
            </td>
            <!--<td>PARCELA</td>-->
            <td><input type="text" v-model="requestPaymentMethodRow.deadline" readonly /></td>
            <td><money type="text" v-model="requestPaymentMethodRow.amount" style="text-align: right;"></money></td>
            <td>
                <a href="javascript:void(0)" @click="remove(requestPaymentMethodRow.id, index)" style="position: relative; margin-left: 5px; top: -2px;">
                    <icon-remove></icon-remove>
                </a>
                <a href="javascript:void(0)" style="position: relative; margin-left: 5px; top: -2px;">
                    <icon-check></icon-check>
                </a>
            </td>
        </tr>
        <tr>
            <td colspan="5">
                <a class="btn btn--border-only" @click="add()" style="display: inline-flex; margin-top: 15px; padding: 0 7px; color: var(--font-color--d-secondary);">Adicionar pagamento</a>
            </td>
        </tr>
        </tbody>
    </table>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import utils from '@/utils/index'
    import _ from 'lodash'
    import DraftMixin from '../DraftMixin'
    import PaymentMethodSelectComponent from '../_Shared/PaymentMethodSelect.vue'

    import ClientForm from './Client/ClientForm.vue'
    import ClientSummary from './Client/ClientSummary.vue'
    import OrderForm from './Order/OrderForm.vue'
    import TaskForm from './Task/TaskForm.vue'

    const { mapFields, mapMultiRowFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-payment-method-select': PaymentMethodSelectComponent
        },
        mixins: [DraftMixin],
        data(){
            return {
                scrollbar: null,
                formPath: 'request'
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapFields([
                'form.requestPaymentMethods'
            ]),
            ...mapMultiRowFields({
                requestPaymentMethodRows: 'form.requestPaymentMethods'
            }),
        },
        methods: {
            ...mapActions('draft/request', ['addRequestPaymentMethod', 'removeRequestPaymentMethod']),
            changeRequestPaymentMethodRowPaymentMethod(paymentMethod, index){
                this.sync(paymentMethod,'requestPaymentMethods[' + index + '].paymentMethod')
            },
            add(){
                this.addRequestPaymentMethod()
                this.sync(this.requestPaymentMethods,'requestPaymentMethods')
            },
            remove(requestPaymentMethodId, index){
                this.removeRequestPaymentMethod(requestPaymentMethodId)
                this.syncKeyRemove(index, 'requestPaymentMethods')
            },
        }
    }
</script>

<style lang="scss">
    table.payment-methods td, table.payment-methods th{
        padding-right: 10px;
        padding-left: 0;
        font-weight: initial;
        padding-bottom: 8px;
    }
    table.payment-methods td:last-child, table.payment-methods th:last-child {
        padding-right: 0;
    }
    table.payment-methods td.content-size, table.payment-methods th.content-size {
        width: 1px;
        white-space: nowrap;
    }
</style>
