<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <div class="form__main-column" style="display: flex; flex-direction: column; margin-right: 10px;">
                <div class="form-groups">
                    <div class="form-group" style="padding: 0; background: transparent;">
                        <div class="form-group__content">
                            <table class="order-products" style="width: 100%; text-align: left;">
                                <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th class="content-size" style="text-align: center; width: 40px;">Qnt.</th>
                                    <th style="text-align: right; width: 90px;">Valor Un.</th>
                                    <th style="text-align: right; width: 120px;">Desc. Un.</th>
                                    <th style="text-align: right; width: 120px;">Subtotal</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><input type="text" style="text-align: center;" /></td>
                                    <td class="content-size"><input type="text" style="text-align: center;" /></td>
                                    <td><money style="text-align: right;"/></td>
                                    <td><money type="text" style="text-align: right;" /></td>
                                    <td><money type="text" style="text-align: right;" /></td>
                                    <td style="text-align: center; cursor: pointer; width: 30px;">
                                        <div style="display: flex; flex-direction: row; margin-top: -4px;">
                                            <div style="cursor: pointer; margin-right: 8px;">
                                                <icon-mini-chart></icon-mini-chart>
                                            </div>
                                            <div style="cursor: pointer; margin-top: -1px;">
                                                <icon-remove></icon-remove>
                                            </div>
                                            <div style="cursor: not-allowed; opacity: .3; margin-top: -1px;">
                                                <icon-remove></icon-remove>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="3">
                                        <a class="btn btn--border-only" style="display: inline-flex; padding: 0 7px; color: var(--font-color--d-secondary);">Adicionar produto</a>
                                    </td>
                                    <td style="text-align: right; font-weight: 800;">R$ XX,XX</td>
                                    <td style="text-align: right; font-weight: 800; color: var(--font-color--secondary)">R$ XX,XX</td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>
                            <div class="content__separator"></div>
                            <table class="order-payment-method" style="width: 100%; text-align: left;">
                                <thead>
                                <tr>
                                    <th>Forma de pagamento</th>
                                    <th style="text-align: right; width: 120px;">Desc. Extra</th>
                                    <th style="text-align: right; width: 120px;">Total a pagar</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><input type="text" style="text-align: center;" /></td>
                                    <td><money type="text" style="text-align: right;" /></td>
                                    <td><money type="text" style="text-align: right; color: var(--font-color--primary)" /></td>
                                    <td style="text-align: center; cursor: pointer; width: 30px; padding-right: 0;">
                                        <div style="display: flex; flex-direction: row; margin-top: -4px;">
                                            <div style="cursor: pointer; margin-top: -2px;" >
                                                <icon-remove></icon-remove>
                                            </div>
                                            <div style="cursor: not-allowed; opacity: .3; margin-top: -2px;">
                                                <icon-remove></icon-remove>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="1">
                                        <a class="btn btn--border-only" style="display: inline-flex; padding: 0 7px; color: var(--font-color--d-secondary);">Incluir pagamento</a>
                                    </td>
                                    <td style="text-align: right; font-weight: 600;">Saldo</td>
                                    <td style="text-align: right; font-weight: 800; color: var(--font-color--secondary)">R$ XX,XX</td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <span class="push-both-sides"></span>
                <div class="form-groups">
                    <div class="form-group" style="flex-grow: 1; flex-direction: row;">
                        <label style="margin-right: 10px; align-self: center; font-weight: 600; font-size: 12px;">
                            Observação do pedido
                        </label>
                        <input type="text" style="width: initial;" class="input--borderless" placeholder="..."
                               @input="commitSocketChanges('order.obs')"/>
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group" style="flex-grow: 1; flex-direction: row;">
                        <label style="margin-right: 10px; align-self: center; font-weight: 600; font-size: 12px;">
                            Canal de divulgação
                        </label>
                        <span class="push-both-sides"></span>
                        <app-divulgation-channel-input></app-divulgation-channel-input>
                    </div>
                </div>
            </div>
            <div class="form__side-column" style="display: flex; flex-direction: column;">
                <div class="reports">
                    <div class="side-column__tabs">
                        <ul>
                            <li :class="{ active: activeTab === 'chart' }" @click="activateTab('chart')">Gráfico</li>
                            <li :class="{ active: activeTab === 'history' }" @click="activateTab('history')">Histórico de compras</li>
                        </ul>
                    </div>
                    <div class="form-groups">
                        <div class="form-group">
                            <div class="product-chart" ref="productChart" v-show="activeTab === 'chart'"></div>
                            <div v-show="activeTab === 'history'">
                                <div class="history__summary" style="display: flex; flex-direction: column; margin-bottom: 15px;">
                                    <div class="summary__titles" style="display: flex; flex-direction: row;">
                                        Cliente desde
                                        <span class="push-both-sides"></span>
                                        Média de compra(s)
                                    </div>
                                    <div class="summary_values" style="display: flex; flex-direction: row;">
                                        <h3 style="color: var(--font-color--d-secondary)">02/05/2015</h3>
                                        <span class="push-both-sides"></span>
                                        <h3 style="color: var(--font-color--primary)">145 dias</h3>
                                    </div>
                                </div>
                                <table style="width: 100%;">
                                    <tbody>
                                    <tr style="vertical-align: baseline;">
                                        <td>03/08/2017</td>
                                        <td style="padding-bottom: 5px;">
                                            <ul style="display: flex; flex-direction: column">
                                                <li>GÁS LP 13KG</li>
                                                <li>GÁS LP 45KG</li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul style="display: flex; flex-direction: column">
                                                <li>1</li>
                                                <li>1</li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul style="display: flex; flex-direction: column">
                                                <li style="text-align: right;">R$ 78,00</li>
                                                <li style="text-align: right;">R$ 420,00</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr style="vertical-align: baseline;">
                                        <td>03/08/2017</td>
                                        <td>
                                            <ul style="display: flex; flex-direction: column">
                                                <li>GÁS LP 13KG</li>
                                                <li>GÁS LP 45KG</li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul style="display: flex; flex-direction: column">
                                                <li>1</li>
                                                <li>1</li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul style="display: flex; flex-direction: column">
                                                <li style="text-align: right;">R$ 78,00</li>
                                                <li style="text-align: right;">R$ 420,00</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="push-both-sides"></span>
                <div class="form-groups">
                    <div class="form-group" style="flex-grow: 1; flex-direction: row;">
                        <label style="margin-right: 10px; align-self: center; font-weight: 600; font-size: 12px;">
                            Responsável
                        </label>
                        <span class="push-both-sides"></span>
                        <app-employee-input></app-employee-input>
                    </div>
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!isCurrentStepActive">Lançar despesas com <span style="color: var(--font-color--terciary)">serviços</span></span>
            <span class="push-both-sides"></span>
            <h3 :class="{active: isCurrentStepActive}">Prestação de serviços</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @changed="onCurrentStepChanged($event)"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';

    import ProductInput from './ProductInput.vue';
    import PaymentMethodInput from './PaymentMethodInput.vue';
    import EmployeeInput from './EmployeeInput.vue';
    import StorageInput from './StorageInput.vue';
    import DivulgationChannelInput from './DivulgationChannelInput.vue';

    export default {
        components: {
            'app-product-input': ProductInput,
            'app-payment-method-input': PaymentMethodInput,
            'app-employee-input': EmployeeInput,
            'app-storage-input': StorageInput,
            'app-divulgation-channel-input': DivulgationChannelInput
        },
        props: ['serviceExpense','activeStep'],
        data(){
            return {
                activeTab: 'chart',
                productChart: null,
                form: {
                    paymentMethodId: null,
                    orderProducts: [
                        /*Object.assign(models.createOrderProductModel(), {
                            id: _.uniqueId("order-product#")
                        })*/
                    ],
                    orderPaymentMethods: [
                        {
                            id: _.uniqueId("payment-method#"),
                            paymentMethodId: null
                        }
                    ],
                    price: 0
                },
                searchProducts: []
            }
        },
        computed: {
            isCurrentStepActive(){
                return this.activeStep === 'transaction-accounts';
            }
        },
        methods: {

            /**
             * Real-time
             */

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

<style scoped>

    /**
    Main column
     */

    div.ms-form form .form__side-column {
        width: 400px;
    }
    .form__main-column .form-group__header {
        background-image: none;
        padding-bottom: 0;
    }
    .order-products td, .order-products th, table.order-payment-method td, table.order-payment-method th {
        padding-right: 10px;
        padding-left: 0;
        font-weight: initial;
        padding-bottom: 8px;
    }
    .order-products td:last-child, .order-products th:last-child {
        padding-right: 0;
    }
    .order-products td.content-size, .order-products th.content-size {
        width: 1px;
        white-space: nowrap;
    }
    .form__side-column .reports .form-group {
        border-top-left-radius: 0;
        margin-bottom: 10px;
    }
    .content__separator {
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 2px solid var(--bg-color--8);
    }

    /**
    Side column
     */

    .side-column__tabs ul {
        display: flex;
        flex-direction: row;
    }
    .side-column__tabs ul li {
        cursor: pointer;
        display: flex;
        height: 40px;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        margin-right: 2px;
        background-color: var(--bg-color--9);
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        font-weight: 600;
    }
    .side-column__tabs ul li.active {
        background-color: var(--bg-color--8);
        color: var(--font-color--7);
    }

</style>