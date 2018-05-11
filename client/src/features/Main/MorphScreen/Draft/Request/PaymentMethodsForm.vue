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
        <tr v-for="(requestPaymentMethodRow,index) in requestPaymentMethodRows" class="payment-method">
            <td>
                <app-payment-method-select v-model="requestPaymentMethodRow.paymentMethod" @change="changeRequestPaymentMethodRowPaymentMethod($event,index)"></app-payment-method-select>
            </td>
            <!--<td>PARCELA</td>-->
            <td>
                <app-datetime-selector v-if="requestPaymentMethodRow.paymentMethod.hasDeadline" v-model="requestPaymentMethodRow.deadlineDatetime"
                    @input="changeRequestPaymentMethodRowDeadline($event,index)" :config="datetimeSelectorConfig" placeholder="-- SELECIONAR --"></app-datetime-selector>
                <span v-else>---</span>
            </td>
            <td><money type="text" v-model="requestPaymentMethodRow.amount" @input.native="inputRequestPaymentMethodRow($event,'amount',index)" style="text-align: right;"></money></td>
            <td class="actions">
                <app-switch v-model="requestPaymentMethodRow.paid" @change="toggleRequestPaymentMethodRowPaid($event, index)" :title="'Marcar como pago '"
                    v-tippy="{ placement: 'right', theme: 'light', zIndex: 99999999, inertia: true, arrow: true, animation: 'perspective' }"></app-switch>
                <a href="javascript:void(0)" @click="remove(requestPaymentMethodRow.id, index)" style="margin-left: 10px;">
                    <icon-remove></icon-remove>
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
    import moment from 'moment'
    import DraftMixin from '../DraftMixin'
    import PaymentMethodSelectComponent from '../_Shared/PaymentMethodSelect.vue'

    import ClientForm from './Client/ClientForm.vue'
    import ClientSummary from './Client/ClientSummary.vue'
    import OrderForm from './Order/OrderForm.vue'
    import TaskForm from './Task/TaskForm.vue'

    import { Portuguese } from 'flatpickr/dist/l10n/pt'

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
                datetimeSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y H:i:S',
                    dateFormat: 'Z',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: true
                },
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
            toggleRequestPaymentMethodRowPaid(value,index){
                this.requestPaymentMethods[index].paid = value
                this.sync(value,'requestPaymentMethods[' + index + '].paid')
            },
            inputRequestPaymentMethodRow(ev,field,index){
                if(ev.isTrusted){
                    this.sync(this.requestPaymentMethods[index][field],'requestPaymentMethods[' + index + '].' + field)
                }
            },
            changeRequestPaymentMethodRowPaymentMethod(paymentMethod, index){
                this.sync(paymentMethod,'requestPaymentMethods[' + index + '].paymentMethod')
            },
            changeRequestPaymentMethodRowDeadline(deadlineDatetime, index){
                deadlineDatetime = moment(deadlineDatetime)
                if(deadlineDatetime.isValid()){
                    this.sync(deadlineDatetime.toDate(),'requestPaymentMethods[' + index + '].deadlineDatetime')
                }
            },
            add(){
                this.addRequestPaymentMethod()
                this.sync(this.requestPaymentMethods,'requestPaymentMethods')
            },
            remove(requestPaymentMethodId, index){
                this.removeRequestPaymentMethod(requestPaymentMethodId)
                this.syncKeyRemove(index, 'requestPaymentMethods')
            },
        },
        mounted(){
            console.log()
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
    a.paid >>> .colorizable {
        fill: var(--font-color--primary)
    }
    .payment-method {
        .actions {
            display: flex; flex-direction: row; align-items: center; justify-content: center; padding-bottom: 0;
        }
    }
</style>
