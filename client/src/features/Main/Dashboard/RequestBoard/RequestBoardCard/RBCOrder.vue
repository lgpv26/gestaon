<template>
    <div>
        <div class="rbc-order" v-if="hasRequestOrderProducts">
            <div class="tooltip-content">
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: center; padding-right: 10px;">Qnt.</th>
                            <th>Produto</th>
                            <th style="padding-left: 10px; text-align: right">Desconto unit.</th>
                            <th style="padding-left: 10px; text-align: right">Valor unit.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="requestOrderProduct in requestOrderProducts">
                            <td style="text-align: center; padding-right: 10px;">{{ requestOrderProduct.quantity }}</td>
                            <td>{{ requestOrderProduct.product.name }}</td>
                            <td style="text-align: right">- {{ utils.formatMoney(requestOrderProduct.unitDiscount,2,'R$ ','.',',') }}</td>
                            <td style="text-align: right">{{ utils.formatMoney(requestOrderProduct.unitPrice,2,'R$ ','.',',') }}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="padding-top: 5px; text-align: right">{{ utils.formatMoney(orderSubtotal,2,'R$ ','.',',') }}</td>
                        </tr>
                    </tbody>
                    <tbody v-if="hasRequestPaymentMethods">
                        <tr>
                            <td colspan="4" style="padding-top: 10px;"></td>
                        </tr>
                        <tr v-for="requestPaymentMethod in requestPaymentMethods">
                            <td colspan="3" style="text-align: right">{{ requestPaymentMethod.paymentMethod.name }}</td>
                            <td colspan="1" style="text-align: right">{{ utils.formatMoney(requestPaymentMethod.amount,2,'R$ ','.',',') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="tooltip-actions">
                <a href="javascript:void(0)" @click="runRequestRecoverance({ request: card.request, companyId: company.id })">Editar <icon-edit></icon-edit></a>
            </div>
        </div>
        <div class="rbc-order" v-else>
            Nenhum produto neste pedido...
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import RequestsAPI from '@/api/requests'
    import Vue from 'vue'
    import _ from 'lodash'
    import utils from '@/utils'

    export default {
        props: ['card'],
        data(){
            return {}
        },
        computed:{
            ...mapState('auth', ['company']),
            orderSubtotal(){
                return _.sumBy(this.card.request.requestOrder.requestOrderProducts, (requestOrderProduct) => {
                    return (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) * requestOrderProduct.quantity
                })
            },
            hasRequestOrderProducts(){
                const requestOrderProducts = _.get(this.card, 'request.requestOrder.requestOrderProducts', false)
                if(requestOrderProducts && requestOrderProducts.length){
                    return requestOrderProducts
                }
                return false
            },
            requestOrderProducts(){
                return this.card.request.requestOrder.requestOrderProducts
            },
            hasRequestPaymentMethods(){
                const requestPaymentMethods = _.get(this.card, 'request.requestPaymentMethods', false)
                if(requestPaymentMethods && requestPaymentMethods.length){
                    return requestPaymentMethods
                }
                return false
            },
            requestPaymentMethods(){
                return this.card.request.requestPaymentMethods
            }
        },
        methods: {
            ...mapActions('draft/request',['runRequestRecoverance']),
            runRecoverance(){
                RequestsAPI.recoverance(this.card.request.id, {
                    companyId: this.company.id
                })
            }
        },
    }
</script>

<style>
    .rbc-order {
        display: flex;
        flex-direction: column;
        color: var(--font-color--10)
    }
    .tooltip-content {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
        text-align: left;
        min-width: 260px;
    }
    .tooltip-content table th {
        font-size: 12px;
        font-weight: normal;
        color: var(--font-color--8)
    }
    .tooltip-content table td {
        font-size: 12px;
        font-weight: 600;
        color: var(--font-color--8);
    }
    .tooltip-content span {
        font-size: 12px;
        font-weight: 600;
        color: var(--font-color--8);
    }
    .tooltip-actions {
        display: flex;
        flex-direction: row;
    }
    .tooltip-actions a {
        font-weight: 600;
        border-bottom: 0;
        color: var(--font-color--10);
    }
</style>