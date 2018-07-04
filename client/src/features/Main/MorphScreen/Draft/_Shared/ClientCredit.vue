<template>
    <app-popover v-bind="popoverProps" :visible="true" :group="'client-credit'" :groupLevel="0">
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div class="client-credit-container" :class="{open: open}">
                <div class="client-credit__summary">
                    <!--
                    <div class="credit-limit-container">
                        <h3>Limite de crédito</h3>
                        <div class="form">
                            <money v-model="form.creditLimit"></money>
                            <a class="btn btn--primary" @click="save()">Salvar</a>
                        </div>
                    </div>
                    -->
                    <div class="credit-bills-container">
                        <h3>Notinhas pendentes</h3>
                        <table v-if="bills.length">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Data de vencimento</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="bill in bills">
                                    <td>{{ bill.id }}</td>
                                    <td>00/00/2018 10:00</td>
                                    <td>Status</td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else>Este cliente não possui notinhas pendentes!</span>
                    </div>
                </div>
                <div class="client-credit__bill">
                    <h3>Notinha X</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Forma de pagamento</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="paymentMethod in billForm.paymentMethods">
                                <td><app-payment-method-select v-model="paymentMethod.id" :popoverProps="{placement: 'top', group: 'client-credit', groupLevel: 1}"></app-payment-method-select></td>
                                <td><money type="text" v-model="paymentMethod.amount" style="text-align: right;"></money></td>
                            </tr>
                        </tbody>
                    </table>
                    <a class="btn btn--primary" style="float: right">Salvar</a>
                </div>
            </div>
        </template>
    </app-popover>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import Vue from 'vue'

    import ClientsAPI from '../../../../../api/clients'
    import PaymentMethodSelectComponent from '../_Shared/PaymentMethodSelect.vue'

    export default {
        props: ['clientId', 'popoverProps'],
        components: {
            'app-payment-method-select': PaymentMethodSelectComponent
        },
        data(){
            return {
                bills: [],
                open: true,
                form: {
                    limitInUse: 0,
                    creditLimit: 0
                },
                billForm: {
                    paymentMethods: [
                        {
                            id: 0,
                            amount: 0
                        }
                    ]
                }
            }
        },
        watch: {
            clientId: {
                handler(clientId){
                    const vm = this
                    if(clientId){
                        ClientsAPI.getCreditInfo(clientId, {
                            companyId: vm.company.id
                        }).then((response) => {
                            vm.bills = response.data.bills
                            vm.form.limitInUse = response.data.limitInUse
                            vm.form.creditLimit = response.data.creditLimit
                            const clientCreditInfo = utils.removeReactivity(vm.form)
                            vm.$emit('input', clientCreditInfo)
                            vm.$emit('change', clientCreditInfo)
                        })
                    }
                },
                immediate: true
            }
        },
        computed: {
            ...mapState('auth',['company'])
        },
        methods: {
            save(){
                /*const vm = this
                ClientsAPI.changeCreditLimit(vm.clientId,{
                    creditLimit: vm.form.creditLimit
                },{
                    companyId: vm.company.id
                }).then(() => {
                    const clientCreditInfo = utils.removeReactivity(vm.form)
                    vm.$emit('input', clientCreditInfo)
                    vm.$emit('change', clientCreditInfo)
                })*/
            }
        }
    }
</script>

<style lang="scss" scoped>

    .client-credit-container {
        width: 380px;
        display: flex;
        flex-direction: column;
        h3 {
            font-size: 16px;
            text-transform: uppercase;
            color: var(--font-color--d-secondary);
            margin-bottom: 10px;
        }
    }

    .client-credit-container.open {
        width: 800px;
        display: flex;
        flex-direction: row;
    }

    .client-credit__summary {
        .credit-limit-container {
            flex-grow: 1;
            margin-bottom: 20px;
            input {
                margin-right: 8px;
                width: 120px;
            }
            .form {
                display: flex;
                flex-direction: row;
            }
        }

        .credit-limit-container:last-child {
            margin-bottom: 0
        }

        .credit-bills-container {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            table {
                th {
                    text-align: left;
                }
            }
        }
    }

    .client-credit__bill {
        border-left: 1px solid var(--border-color--2);
        padding-left: 20px;
        margin-left: 20px;
        flex-grow: 1;
        table {
            width: 100%;
            margin-bottom: 20px;
            th {
                text-align: left;
            }
        }
    }
</style>
