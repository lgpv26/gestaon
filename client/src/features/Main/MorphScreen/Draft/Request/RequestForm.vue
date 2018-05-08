<template>
    <div class="app-request-form">
        <div class="container__body">
            <div ref="scrollbar">
                <div class="ms-form">
                    <div class="ms-form__spinner" v-if="false">
                        <span>Salvando...</span>
                    </div>
                    <div class="form__instruction" v-if="!activeStep">
                        <div class="instruction__container">
                            <div class="container__area">
                                <small>O que vamos fazer?</small>
                                <span>Monte o atendimento de forma ágil usando os painéis abaixo</span>
                            </div>
                            <img-request-form></img-request-form>
                        </div>
                    </div>
                    <div class="separator" v-if="!activeStep"></div>
                    <!-- Client form -->
                    <form :class="{'active': activeStep === 'client'}">
                        <div class="form__content" v-show="activeStep === 'client'">
                            <app-client-form></app-client-form>
                        </div>
                        <app-client-summary v-if="isClientSummaryAvailable" @step="changeStep($event)"></app-client-summary>
                        <div class="form__header" v-else>
                            <span v-if="activeStep !== 'client'">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
                            <span class="push-both-sides"></span>
                            <h3 :class="{active: activeStep === 'client'}">Cliente</h3>
                            <app-switch style="float: right;" :value="activeStep === 'client'" @change="changeStep('client')"></app-switch>
                        </div>
                    </form>
                    <div class="separator"></div>
                    <!-- Order form -->
                    <form :class="{'active': activeStep === 'order'}">
                        <div class="form__content" v-show="activeStep === 'order'">
                            <app-order-form></app-order-form>
                        </div>
                        <div class="form__header">
                            <span v-if="activeStep !== 'order'">Incluir uma <span style="color: var(--secondary-color)">venda</span> neste atendimento</span>
                            <span class="push-both-sides"></span>
                            <h3 :class="{active: activeStep === 'order'}">Venda</h3>
                            <app-switch style="float: right;" :value="activeStep === 'order'" @changed="changeStep('order')"></app-switch>
                        </div>
                    </form>
                    <div class="separator"></div>
                    <!-- Task form -->
                    <form :class="{'active': activeStep === 'task'}">
                        <div class="form__content" v-show="activeStep === 'task'">
                            <!--<app-task-form @step-change="onStepChange($event)" :task.sync="form.task"></app-task-form>-->
                        </div>
                        <div class="form__header">
                            <span v-if="activeStep !== 'task'">Incluir uma <span style="color: var(--terciary-color)">tarefa</span> neste atendimento</span>
                            <span class="push-both-sides"></span>
                            <h3 :class="{active: activeStep === 'task'}">Tarefa</h3> <app-switch style="float: right;" :value="activeStep === 'task'" @changed="changeStep('task')"></app-switch>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="footer">
            <div class="left-side">
                <table class="payment-methods" style="width: 100%; text-align: left;">
                    <thead>
                        <tr>
                            <th>Forma de pagamento</th>
                            <th style="text-align: left; width: 80px;">Parcela</th>
                            <th style="text-align: left; width: 150px;">Vencimento</th>
                            <th style="text-align: right; width: 150px;">Valores</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(requestPaymentMethodRow,index) in requestPaymentMethodRows">
                            <td><app-payment-method-select :items="paymentMethodItems" v-model="requestPaymentMethodRow.id"><input type="text" readonly /></app-payment-method-select></td>
                            <td>PARCELA</td>
                            <td><input type="text" v-model="requestPaymentMethodRow.deadline" readonly /></td>
                            <td><money type="text" v-model="requestPaymentMethodRow.amount" style="text-align: right;"></money></td>
                            <td>
                                <div style="cursor: pointer; margin-top: -1px;">
                                    <icon-remove></icon-remove>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="5">
                                <a class="btn btn--border-only" @click="add()" style="display: inline-flex; margin-top: 15px; padding: 0 7px; color: var(--font-color--d-secondary);">Adicionar pagamento</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <span class="push-both-sides"></span>
            <div class="right-side">
                <div class="subtotal-container">
                    <span>Total a pagar</span>
                    <h3>R$ 0,00</h3>
                </div>
                <div class="subtotal-icon">
                    <icon-log></icon-log>
                </div>
            </div>
        </div>
        <div class="actions">
            <a>Excluir Rascunho</a>
            <span class="push-both-sides"></span>
            <a style="margin-right: 20px;" @click="$emit('close')">Voltar</a>
            <span style="margin-right: 20px;">(Preencha os campos obrigatórios <em>*</em> para salvar)</span>

            <a class="btn btn--primary persistence allowed" v-if="activeStep === 'client'" @click="persistenceClient(client)">Salvar Cliente</a>
            <a class="btn btn--primary persistence allowed" v-else-if="activeStep !== 'client'">Salvar Pedido</a>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import utils from '@/utils/index'
    import _ from 'lodash'
    import DraftMixin from '../DraftMixin'
    import PaymentMethodsAPI from '@/api/payment-methods'
    import PaymentMethodSelectComponent from '../_Shared/PaymentMethodSelect.vue'

    import ClientForm from './Client/ClientForm.vue'
    import ClientSummary from './Client/ClientSummary.vue'
    import OrderForm from './Order/OrderForm.vue'
    import TaskForm from './Task/TaskForm.vue'
    import Scrollbar from 'smooth-scrollbar'

    import { Portuguese } from 'flatpickr/dist/l10n/pt'

    const { mapFields, mapMultiRowFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-payment-method-select': PaymentMethodSelectComponent,
            'app-client-summary': ClientSummary,
            'app-client-form': ClientForm,
            'app-order-form': OrderForm,
            'app-task-form': TaskForm
        },
        mixins: [DraftMixin],
        data(){
            return {
                scrollbar: null,
                formPath: 'request',
                paymentMethodItems: [],
                datetimeSelectorConfig: {
                    dateFormat: 'd/m/Y H:i',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: true
                },
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapGetters('draft/request', ['isClientSummaryAvailable']),
            ...mapFields([
                'form.activeStep',
                'form.client',
                'form.order.orderProducts',
                'form.requestPaymentMethods'
            ]),
            ...mapMultiRowFields({
                requestPaymentMethodRows: 'form.requestPaymentMethods'
            }),
        },
        methods: {
            ...mapActions('draft/request', ['persistenceClient','setRequest','addOrderProduct','addRequestPaymentMethod']),
            ...mapActions('toast', ['showToast']),
            ...mapActions('loading', ['stopLoading']),
            changeStep(step){
                let activeStep = null
                if(this.activeStep !== step){
                    if (this.activeStep !== 'client' && step === 'client') {
                        activeStep = 'client'
                    }
                    if (this.activeStep !== 'order' && step === 'order') {
                        activeStep = 'order'
                    }
                    if (this.activeStep !== 'task' && step === 'task') {
                        activeStep = 'task'
                    }
                }
                this.activeStep = activeStep
                this.sync(this.activeStep, 'activeStep')
            },
            loadData(data){
                this.setRequest(data.request)
                if(!this.orderProducts.length){
                    this.addOrderProduct()
                }
                if(!this.requestPaymentMethods.length){
                    this.addRequestPaymentMethod()
                }
            }
        },
        created(){
            const vm = this
            PaymentMethodsAPI.getList({ companyId: this.company.id }).then(({data}) => {
                vm.paymentMethodItems = _.map(data, (paymentMethod) => {
                    return {
                        value: paymentMethod.id,
                        text: paymentMethod.name
                    }
                })
            })
        },
        mounted(){
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            })
        },
        updated(){
            this.scrollbar.update()
        }
    }
</script>

<style lang="scss">

    .app-request-form {
        display: flex;
        flex: 1;
        flex-direction: column;
        .footer {
            padding: 20px 20px;
            border-bottom: 1px solid #333;
            display: flex;
            flex-direction: row;
            flex-shrink: 0;
            .left-side {
                flex-grow: 1;
                max-width: 800px;
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
            }
            .right-side {
                width: 200px;
                display: flex;
                flex-direction: row;
                .subtotal-container {
                    text-align: right;
                    flex: 1;
                    h3 {
                        font-size: 40px;
                    }
                }
                .subtotal-icon {
                    margin-left: 15px;
                    svg {
                        position: relative;
                        top: 34px;
                    }
                }
            }
        }
        .actions {
            display: flex;
            flex-direction: row;
            height: 50px;
            padding: 0 20px;
            align-items: center;
            flex-shrink: 0;

            span em {
                background-color: transparent;
                color: var(--font-color--danger)
            }

            a {
                font-size: 14px;
                text-transform: uppercase;
                color: var(--font-color--5);
                font-weight: initial;
                cursor: pointer;
                position: relative;
                top: 1px;
            }

            a.persistence.allowed {
                color: #FFF;
            }
        }
    }

</style>
