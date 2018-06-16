<template>
    <app-popover v-bind="popoverProps">
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div style="display: flex; flex-direction: column; width: 380px;">
                <div class="credit-limit-container">
                    <h3>Limite de crédito</h3>
                    <div class="form">
                        <money v-model="form.creditLimit"></money>
                        <a class="btn btn--primary" @click="save()">Salvar</a>
                    </div>
                </div>
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
        </template>
    </app-popover>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import Vue from 'vue'

    import ClientsAPI from '../../../../../api/clients'

    export default {
        props: ['clientId', 'popoverProps'],
        data(){
            return {
                bills: [],
                form: {
                    limitInUse: 0,
                    creditLimit: 0
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
                const vm = this
                ClientsAPI.changeCreditLimit(vm.clientId,{
                    creditLimit: vm.form.creditLimit
                },{
                    companyId: vm.company.id
                }).then(() => {
                    const clientCreditInfo = utils.removeReactivity(vm.form)
                    vm.$emit('input', clientCreditInfo)
                    vm.$emit('change', clientCreditInfo)
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
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

    h3 {
        font-size: 16px;
        text-transform: uppercase;
        color: var(--font-color--d-secondary);
        margin-bottom: 10px;
    }
</style>
