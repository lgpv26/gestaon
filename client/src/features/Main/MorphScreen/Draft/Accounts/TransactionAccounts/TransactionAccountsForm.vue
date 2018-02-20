<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <div class="transaction-accounts-column">
                <div class="transaction-accounts-column__header">
                    <div style="width: 50%;">
                        <h3>Conta</h3>
                    </div>
                    <div style="width: 50%;">
                        <h3>Saldo inicial</h3>
                    </div>
                </div>
                <div class="transaction-accounts-column__body">
                    <div>
                        <div style="width: 50%">
                            Compra de GLP
                        </div>
                        <div style="width: 50%">
                            R$ 10.000,00
                        </div>
                    </div>
                    <div>
                        <div style="width: 50%">
                            Compra de GLP
                        </div>
                        <div style="width: 50%">
                            R$ 10.000,00
                        </div>
                    </div>
                </div>
                <div class="transaction-accounts-column__footer">
                    <div>
                        <div class="dot-at-right" style="width: 40%;">
                            <input type="text" placeholder="Ex: 0 30 ou 6x" />
                            <div class="dot"></div>
                        </div>
                        <div style="width: 40%;">
                            <input type="text" placeholder="Ex: 3% ou -2,00" />
                        </div>
                        <div style="width: 20%; text-align: center;">
                            <icon-check></icon-check>
                        </div>
                    </div>
                </div>
            </div>
            <div class="transaction-accounts-column payment-methods">
                <div class="transaction-accounts-column__header">
                    <div style="width: 50%;">
                        <h3>Meio de pagamento</h3>
                    </div>
                    <div style="width: 24%;">
                        <h3>Prazo</h3>
                    </div>
                    <div style="width: 13%;">
                        <h3>Taxa</h3>
                    </div>
                    <div style="width: 13%; text-align: center;">
                        <h3>BA</h3>
                    </div>
                </div>
                <div class="transaction-accounts-column__body">
                    <div v-for="paymentMethod in form.paymentMethods">
                        <div style="width: 50%;">
                            {{ paymentMethod.name }}
                        </div>
                        <div style="width: 24%;">
                            0 dias
                        </div>
                        <div style="width: 13%;">
                            {{ paymentMethod.tax }} %
                        </div>
                        <div style="width: 13%; text-align: center;">
                            <icon-check></icon-check>
                        </div>
                    </div>
                </div>
                <div class="transaction-accounts-column__footer">
                    <div>
                        <div class="dot-at-right" style="width: 50%;">
                            <input type="text" v-model="transactionAccounts.paymentMethodForm.name" placeholder="ADICIONAR NOVO" />
                            <div class="dot"></div>
                        </div>
                        <div class="dot-at-right" style="width: 24%;">
                            <input type="text" v-model="transactionAccounts.paymentMethodForm.deadline" placeholder="Ex: 0 30 ou 6x" />
                            <div class="dot"></div>
                        </div>
                        <div style="width: 13%;">
                            <input type="text" v-model="transactionAccounts.paymentMethodForm.tax" placeholder="Ex: 3% ou -2,00" />
                        </div>
                        <div style="cursor: pointer; width: 13%; text-align: center;" @click="addPaymentMethod()">
                            <icon-add></icon-add>
                        </div>
                    </div>
                </div>
            </div>
            <div class="transaction-accounts-column">
                <div class="transaction-accounts-column__header">
                    <h3>Centro de custos</h3><span class="push-both-sides"></span><icon-cog></icon-cog>
                </div>
                <div class="transaction-accounts-column__body">
                    <ul>
                        <li>
                            Compra de GLP
                        </li>
                        <li>
                            Compra de Água Mineral
                        </li>
                        <li>
                            Acessórios para GLP
                        </li>
                        <li>
                            Compra de Conveniência
                        </li>
                    </ul>
                </div>
                <div class="transaction-accounts-column__footer">
                    <input type="text" placeholder="NOVO CENTRO DE CUSTO" /> <icon-check></icon-check>
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!isCurrentStepActive">Contas de <span style="color: var(--font-color--d-secondary)">bancos</span> e <span style="color: var(--font-color--d-secondary)">outros</span></span>
            <span class="push-both-sides"></span>
            <h3 :class="{active: isCurrentStepActive}">Bancos e outros</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @changed="onCurrentStepChanged($event)"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '@/utils'

    import PaymentMethodsAPI from '@/api/payment-methods'

    export default {
        components: {
        },
        props: ['task','activeStep','transactionAccounts'],
        data(){
            return {
                form: {
                    accounts: [],
                    paymentMethods: [],
                    costCenters: []
                }
            }
        },
        watch: {
            paymentMethods: {
                handler: function(paymentMethods) {
                    this.form.paymentMethods = utils.removeReactivity(paymentMethods)
                },
                deep: true
            }
        },
        computed: {
            ...mapState('auth',['company']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('data/payment-methods', ['paymentMethods']),
            isCurrentStepActive(){
                return this.activeStep === 'transaction-accounts'
            }
        },
        methods: {
            addPaymentMethod(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log('Emitting draft:accounts:transaction-accounts:payment-method-add', emitData)
                this.$socket.emit('draft:accounts:transaction-accounts:payment-method-add', emitData)
                /*
                PaymentMethodsAPI.createOne(utils.removeReactivity(this.transactionAccounts.paymentMethodForm), {
                    companyId: this.company.id
                }).then((result) => {
                    console.log("Result", result)
                })
                */
            },

            resetPaymentMethodForm(){

            },

            /* real time */

            onCurrentStepChanged(value){
                (this.activeStep === 'transaction-accounts') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'transaction-accounts');
                this.commitSocketChanges('activeStep');
            },
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            }
        },
        mounted(){
            this.form.paymentMethods = utils.removeReactivity(this.paymentMethods)
        }
    }
</script>

<style>
    .transaction-accounts-column {
        display: flex;
        flex-direction: column;
        max-width: 320px;
        flex-grow: 1;
        background: var(--bg-color--8);
        border: 1px solid var(--bg-color--9);
        border-radius: 5px;
        margin-right: 10px;
    }

    .transaction-accounts-column.payment-methods {
        max-width: 480px;
    }

    .transaction-accounts-column:last-child {
        margin-right: 0;
    }

    .transaction-accounts-column .transaction-accounts-column__header {
        margin: 0 10px;
        border-bottom: 2px solid var(--bg-color--9);
        display: flex;
        flex-direction: row;
        height: 50px;
        align-items: center;
    }

    .transaction-accounts-column .transaction-accounts-column__header h3 {
        font-size: 14px;
        color: var(--font-color--d-secondary);
    }

    .transaction-accounts-column .transaction-accounts-column__body {
        padding: 0 10px;
        margin-top: 7px;
        flex-grow: 1;
    }

    .transaction-accounts-column .transaction-accounts-column__body ul li {
        margin: 8px 0;
        color: var(--font-color--9);
        font-size: 12px;
    }

    .transaction-accounts-column .transaction-accounts-column__body > div {
        display: flex;
    }

    .transaction-accounts-column .transaction-accounts-column__body > div:first-child {
        margin-top: 8px;
    }

    .transaction-accounts-column .transaction-accounts-column__body > div > div {
        margin: 0 0 8px;
        color: var(--font-color--9);
        font-size: 12px;
    }

    .transaction-accounts-column .transaction-accounts-column__footer {
        display: flex;
        flex-direction: row;
        margin: 0 10px;
        padding: 15px 0;
        align-items: center;
    }
    .transaction-accounts-column .transaction-accounts-column__footer input {
        margin-right: 10px;
    }

    .transaction-accounts-column .transaction-accounts-column__footer > div {
        display: flex;
        flex-direction: row;
    }

    .transaction-accounts-column .transaction-accounts-column__footer > div > div.dot-at-right {
        margin-right: 20px;
        position: relative;
    }

    .transaction-accounts-column .transaction-accounts-column__footer > div > div.dot-at-right .dot {
        position: absolute;
        right: -12px;
        top: 10px;
        width: 4px;
        height: 4px;
        background-color: var(--font-color--secondary);
        border-radius: 100%;
    }

</style>