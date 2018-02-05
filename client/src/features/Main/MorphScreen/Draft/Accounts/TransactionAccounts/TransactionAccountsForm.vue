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
                    <input type="text" /> <icon-check></icon-check>
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
                    <div>
                        <div style="width: 50%;">
                            A VISTA
                        </div>
                        <div style="width: 24%;">
                            0 dias
                        </div>
                        <div style="width: 13%;">
                            0,0%
                        </div>
                        <div style="width: 13%; text-align: center;">
                            <icon-check></icon-check>
                        </div>
                    </div>
                </div>
                <div class="transaction-accounts-column__footer">
                    <input type="text" /> <icon-check></icon-check>
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

    export default {
        components: {
        },
        props: ['task','activeStep'],
        data(){
            return {
                form: {
                }
            }
        },
        computed: {
            isCurrentStepActive(){
                return this.activeStep === 'transaction-accounts';
            }
        },
        methods: {
            onCurrentStepChanged(value){
                (this.activeStep === 'transaction-accounts') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'transaction-accounts');
                this.commitSocketChanges('activeStep');
            },
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            }
        },
        mounted(){
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
</style>