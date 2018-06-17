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
                            <app-switch style="float: right;" :value="activeStep === 'order'" :disabled="!isOrderFormAllowed" @changed="changeStep('order')"></app-switch>
                        </div>
                    </form>
                    <div v-if="false" class="separator"></div>
                    <!-- Task form -->
                    <form v-if="false" :class="{'active': activeStep === 'task'}">
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
        <div class="footer" v-if="activeStep === 'order' || activeStep === 'task'">
            <div class="left-side">
                <app-payment-methods-form></app-payment-methods-form>
            </div>
            <span class="push-both-sides"></span>
            <div class="right-side">
                <div class="account-selection">
                    <app-select v-if="false" :items="accountsSelect" title="Conta" :verticalOffset="8" v-model="accountId" @change="sync($event,'accountId')">
                        <input type="text" style="cursor: pointer;" readonly :value="selectedAccountName" placeholder="ESCOLHA UMA CONTA" />
                        <icon-dropdown style="position: absolute; top: 6px; right: 5px;"></icon-dropdown>
                        <template slot="item" slot-scope="itemProps">
                            <span>{{itemProps.text }}</span>
                        </template>
                    </app-select>
                    <app-account-select v-model="accountId" @change="sync($event,'accountId')"
                        :popoverProps="{ placement: 'top-start', verticalOffset: 10, useScroll: true, triggererStyle: { position: 'relative' }}">
                        <input type="text" style="cursor: pointer;" readonly :value="selectedAccountName" placeholder="ESCOLHA UMA CONTA" />
                        <icon-dropdown style="position: absolute; top: 6px; right: 5px;"></icon-dropdown>
                        <template slot="item" slot-scope="itemProps">
                            <span>{{itemProps.text }}</span>
                        </template>
                    </app-account-select>
                </div>
                <span class="push-both-sides"></span>
                <div class="subtotal-container">
                    <span>Total a pagar</span>
                    <div class="amounts">
                        <h3 class="total">{{ formatedTotalLeftToPay }} / </h3>
                        <h3 class="current" :class="{ left: totalLeftToPay < totalToPay, exact: totalLeftToPay === totalToPay, over: totalLeftToPay > totalToPay }">
                            {{ formatedTotalToPay }}
                        </h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions">
            <a @click="$emit('remove')">Excluir Rascunho</a>
            <span class="push-both-sides"></span>
            <a style="margin-right: 20px;" @click="$emit('close')">Voltar</a>
            <span style="margin-right: 20px;">(Preencha os campos obrigatórios <em>*</em> para salvar)</span>

            <a class="btn btn--primary persistence allowed" v-if="activeStep === 'client'" @click="persistClient({client,companyId: company.id})">Salvar Cliente</a>
            <a class="btn btn--primary persistence allowed" v-else-if="activeStep !== 'client'" @click="persistRequest({request: form, companyId: company.id})">Salvar Pedido</a>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import utils from '@/utils/index'
    import _ from 'lodash'
    import DraftMixin from '../DraftMixin'

    import AccountSelectComponent from '../_Shared/AccountSelect.vue'
    import PaymentMethodsForm from './PaymentMethodsForm.vue'

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
            'app-account-select': AccountSelectComponent,
            'app-client-summary': ClientSummary,
            'app-payment-methods-form': PaymentMethodsForm,
            'app-client-form': ClientForm,
            'app-order-form': OrderForm,
            'app-task-form': TaskForm
        },
        mixins: [DraftMixin],
        data(){
            return {
                scrollbar: null,
                formPath: 'request',
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
            ...mapState('data/accounts', ['accounts']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapGetters('draft/request', ['isClientSummaryAvailable']),
            ...mapFields([
                'form',
                'form.clientAddressId',
                'form.clientPhoneId',
                'form.accountId',
                'form.activeStep',
                'form.client',
                'form.order',
                'form.order.orderProducts',
                'form.requestPayments'
            ]),
            ...mapMultiRowFields({
                requestPaymentRows: 'form.requestPayments'
            }),
            selectedAccountName(){
                const selectedAccount = _.find(this.accounts, {id: this.accountId})
                if(selectedAccount){
                    return selectedAccount.name
                }
                return ''
            },
            accountsSelect(){
                return _.map(this.accounts, (account) => {
                    return {
                        value: account.id,
                        text: account.name
                    }
                })
            },
            isOrderFormAllowed(){
                if(!this.client.name || (this.client.id && this.clientAddressId && this.clientPhoneId)){
                    return true
                }
                return false
            },
            totalToPay(){
                return _.sumBy(this.orderProducts, (orderProduct) => {
                    return (orderProduct.unitPrice - orderProduct.unitDiscount) * orderProduct.quantity
                })
            },
            totalLeftToPay(){
                return _.sumBy(this.requestPayments, (requestPayment) => {
                    return requestPayment.amount
                })
            },
            formatedTotalToPay(){
                const sum = _.sumBy(this.orderProducts, (orderProduct) => {
                    return (orderProduct.unitPrice - orderProduct.unitDiscount) * orderProduct.quantity
                })
                return utils.formatMoney(sum, 2,'R$ ','.',',')
            },
            formatedTotalLeftToPay(){
                const sum = _.sumBy(this.requestPayments, (requestPayment) => {
                    return requestPayment.amount
                })
                return utils.formatMoney(sum, 2,'R$ ','.',',')
            }
        },
        methods: {
            ...mapActions('draft/request', ['runRequestPersistence','runClientPersistence','setRequest','setClient','addOrderProduct','addRequestPayment']),
            ...mapActions('toast', ['showToast','showError']),
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
                if(!this.requestPayments.length){
                    this.addRequestPayment()
                    this.sync(this.requestPayments,'requestPayments')
                }
            },
            persistClient(){
                const vm = this
                vm.runClientPersistence({
                    client: vm.client,
                    companyId: vm.company.id
                }).then((client) => {
                    vm.showToast({
                        type: 'success',
                        message: "Cliente salvo com sucesso!"
                    })
                    const emitData = {
                        draftId: vm.activeMorphScreen.draft.draftId,
                        clientId: parseInt(client.id)
                    }
                    console.log("Emitting draft/request.client.select", emitData)
                    vm.$socket.emit('draft/request.client.select', emitData)
                }).catch((err) => {
                    vm.showToast({
                        type: 'error',
                        message: err
                    })
                })
            },
            persistRequest(){
                const vm = this

                let error = false

                vm.requestPayments.forEach((requestPayment) => {
                    if(!error && !_.get(requestPayment, 'paymentMethod.id', false)){
                        error = "Selecione uma forma de pagamento por linha!"
                    }
                })

                vm.orderProducts.forEach((orderProduct) => {
                    if(!error && !parseInt(orderProduct.quantity)){
                        error = "Os produtos devem possuir uma quantidade mínima de 1 item!"
                    }
                })

                if(!error && (vm.totalLeftToPay !== vm.totalToPay)){
                    error = "O valor a pagar deve coincidir com o valor total do pedido!"
                }

                if(error){
                    vm.showToast({
                        type: 'error',
                        message: error
                    })
                    return false
                }

                vm.runRequestPersistence({
                    draftId: vm.activeMorphScreen.draft.draftId,
                    request: vm.form,
                    companyId: vm.company.id
                }).then((response) => {
                    if(response.success){
                        vm.showToast({
                            type: 'success',
                            message: "Pedido salvo com sucesso!"
                        })
                        vm.$emit('close', {
                            screen: vm.activeMorphScreen,
                            remove: true
                        })
                    }
                    else {
                        vm.showError(response.error.message)
                    }
                }).catch((err) => {
                    vm.showToast({
                        type: 'error',
                        message: err
                    })
                })
            }
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
                display: flex;
                flex-direction: column;
                .subtotal-container {
                    text-align: right;
                    flex: 1;
                    .amounts {
                        display: flex;
                        flex-direction: row;
                        align-items: flex-end;
                        justify-content: flex-end;
                        h3.current {
                            font-size: 40px;
                            white-space: nowrap;
                        }
                        h3.left {
                            color: var(--font-color--terciary)
                        }
                        h3.exact {
                            color: var(--font-color--secondary)
                        }
                        h3.over {
                            color: var(--font-color--terciary)
                        }
                        h3.total {
                            position: relative;
                            top: -8px;
                            margin-right: 10px;
                            font-size: 15px;
                            white-space: nowrap;
                        }
                    }
                }
                .account-selection {
                    min-width: 320px;
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
