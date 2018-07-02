<template>
    <table class="payment-methods" style="width: 100%; text-align: left;">
        <thead>
        <tr>
            <th>Forma de pagamento</th>
            <!--<th style="text-align: left; width: 80px;">Parcela</th>-->
            <th style="text-align: left; width: 150px;">Vencimento</th>
            <th style="text-align: left; width: 150px;">Número</th>
            <th style="text-align: right; width: 150px;">Valores</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(requestPaymentRow,index) in requestPaymentRows" class="payment-method">
            <td>
                <app-payment-method-select :popoverProps="{placement: 'top-start', verticalOffset: 10}" v-model="requestPaymentRow.paymentMethod" @change="changeRequestPaymentRowPaymentMethod($event,index)"></app-payment-method-select>
            </td>
            <!--<td>PARCELA</td>-->
            <td>
                <app-datetime-selector v-if="requestPaymentRow.paymentMethod.hasDeadline" v-model="requestPaymentRow.deadlineDatetime"
                    @input="changeRequestPaymentRowDeadline($event,index)" :config="datetimeSelectorConfig" placeholder="-- SELECIONAR --"></app-datetime-selector>
                <span v-else>---</span>
            </td>
            <td>
                <input type="text" v-model="requestPaymentRow.code" v-if="requestPaymentRow.paymentMethod.id === config.system.IDMappings.paymentMethods.bill"
                @input="inputRequestPaymentRow($event,'code',index)" style="text-transform: initial" />
                <span v-else>---</span>
            </td>
            <td><money type="text" v-model="requestPaymentRow.amount" @input.native="inputRequestPaymentRow($event,'amount',index)" style="text-align: right;"></money></td>
            <td class="actions">
                <app-switch v-if="requestPaymentRow.paymentMethod.id !== config.system.IDMappings.paymentMethods.bill" v-model="requestPaymentRow.paid"
                    @change="toggleRequestPaymentRowPaid($event, index)" :title="'Marcar como recebido'"
                    v-tippy="{ placement: 'right', theme: 'light', zIndex: 99999999, inertia: true, arrow: true, animation: 'perspective' }"></app-switch>
                <app-switch :value="false" :disabled="true" v-else></app-switch>
                <a href="javascript:void(0)" @click="remove(requestPaymentRow.id, index)" style="margin-left: 10px;">
                    <icon-remove></icon-remove>
                </a>
            </td>
        </tr>
        <tr>
            <td colspan="6" style="padding-top: 15px;">
                <div style="display: flex; flex-direction: row;">
                    <a class="btn btn--border-only" @click="add()" style="display: inline-flex; padding: 0 7px; color: var(--font-color--d-secondary);">Adicionar pagamento</a>
                    <app-client-credit v-if="client.id" v-model="form.clientCredit" :clientId="client.id" :popoverProps="{verticalOffset: 10, horizontalOffset: -5, placement: 'top-start'}">
                        <div class="client-credit-triggerer">
                            <span style="margin-right: 8px;">
                                Notinhas pendentes
                                <!--
                                Crédito utilizado:
                                <strong style="color: var(--font-color--terciary)">{{ utils.formatMoney(form.clientCredit.limitInUse,2,'R$ ','.',',') }}</strong> de
                                <strong>{{ utils.formatMoney(form.clientCredit.creditLimit,2,'R$ ','.',',') }}</strong>
                                -->
                            </span>
                        </div>
                    </app-client-credit>
                </div>
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
    import shortid from 'shortid'
    import DraftMixin from '../DraftMixin'
    import PaymentMethodSelectComponent from '../_Shared/PaymentMethodSelect.vue'
    import ClientCreditComponent from '../_Shared/ClientCredit.vue'

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
            'app-payment-method-select': PaymentMethodSelectComponent,
            'app-client-credit': ClientCreditComponent
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
                form: {
                    clientCredit: {
                        limitInUse: 0,
                        creditLimit: 0
                    }
                },
                formPath: 'request'
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapFields([
                'form.requestPayments',
                'form.client'
            ]),
            ...mapMultiRowFields({
                requestPaymentRows: 'form.requestPayments'
            }),
        },
        methods: {
            ...mapActions('draft/request', ['addRequestPayment', 'removeRequestPayment']),
            toggleRequestPaymentRowPaid(value,index){
                this.requestPayments[index].paid = value
                this.sync(value,'requestPayments[' + index + '].paid')
            },
            inputRequestPaymentRow(ev,field,index){
                if(ev.isTrusted){
                    this.sync(this.requestPayments[index][field],'requestPayments[' + index + '].' + field)
                }
            },
            changeRequestPaymentRowPaymentMethod(paymentMethod, index){
                this.sync(paymentMethod,'requestPayments[' + index + '].paymentMethod')
            },
            changeRequestPaymentRowDeadline(deadlineDatetime, index){
                deadlineDatetime = moment(deadlineDatetime)
                if(deadlineDatetime.isValid()){
                    this.sync(deadlineDatetime.toDate(),'requestPayments[' + index + '].deadlineDatetime')
                }
            },
            add(){
                this.addRequestPayment()
                this.sync(this.requestPayments,'requestPayments')
            },
            remove(requestPaymentId, index){
                this.removeRequestPayment(requestPaymentId)
                this.syncKeyRemove(index, 'requestPayments')
            },
        },
        mounted(){
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
            height: auto;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            padding-bottom: 0;
        }
    }
    .client-credit-triggerer {
        height: 100%;
        display: flex;
        align-items: center;
        background: var(--bg-color);
        margin-left: 10px;
        border-radius: 5px;
        padding: 0 7px;
        cursor: pointer;
    }
    .client-credit-triggerer:hover {
        background: var(--bg-color--4);
    }
</style>
