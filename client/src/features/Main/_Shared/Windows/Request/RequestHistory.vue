<template>
    <div class="request__history">
        <a href="javascript:void(0)" class="back" @click="$emit('close',true)"><i class="mi mi-undo"></i></a>
        <app-perfect-scrollbar class="scrollbar">
            <div class="header">
                <h3 style="display: flex; align-items: center;">
                    <a href="javascript:void(0)"
                       @click="getRequestHistory()"
                       style="margin-right: 8px; position: relative; top: 1px">
                        <i style="font-size: 24px" class="mi mi-refresh"></i>
                    </a>
                    Histórico de compras de {{ request.client.name }} - {{ requestHistoryCount }}
                </h3>
            </div>
            <div class="timeline" v-if="!isRequesting && total">
                <div class="entry" v-for="historyRequest in historyRequests" :key="historyRequest.id">
                    <div class="title">
                        <h3>{{ moment(historyRequest.deliveryDate).format("DD/MM/YYYY HH:mm") }}</h3><br/>
                        <p>Criado às: {{ moment(historyRequest.dateCreated).format("DD/MM/YYYY HH:mm") }}</p><br/>
                        <p>Entregador: {{ $store.getters['entities/users/find'](historyRequest.deliveredBy).name }}</p>
                        <p>Finalizado às: {{ moment(historyRequest.deliveredDate).format("DD/MM/YYYY HH:mm") }}</p>
                        <p>Finalizado por: {{ $store.getters['entities/users/find'](historyRequest.finishedBy).name }}</p>
                    </div>
                    <div class="body">
                        <div class="table" style="margin-bottom: 10px;">
                            <table style="width: 100%;">
                                <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Qnt.</th>
                                    <th style="text-align: center;">Preço</th>
                                    <th style="text-align: center;">Desconto</th>
                                    <th style="text-align: right">Subtotal</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="requestOrderProduct in historyRequest.requestOrder.requestOrderProducts">
                                    <td>{{ (requestOrderProduct.productId) ? $store.getters['entities/products/find'](requestOrderProduct.productId).name : "S/ PRODUTO" }}</td>
                                    <td style="text-align: center;">{{ requestOrderProduct.quantity }}</td>
                                    <td style="text-align: center;">{{ utils.formatMoney(requestOrderProduct.unitPrice, 2, 'R$ ', '.', ',') }}</td>
                                    <td style="text-align: center;">{{ utils.formatMoney(requestOrderProduct.unitDiscount, 2, 'R$ ', '.', ',') }}</td>
                                    <td style="text-align: right">
                                        {{ utils.formatMoney((requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) * requestOrderProduct.quantity, 2, 'R$ ', '.', ',') }}</td>
                                </tr>
                                <tr>
                                    <td colspan="5" style="text-align: right; font-weight: bold;">
                                        {{ utils.formatMoney(_.sumBy(historyRequest.requestOrder.requestOrderProducts, (requestOrderProduct) => ((parseFloat(requestOrderProduct.unitPrice) - parseFloat(requestOrderProduct.unitDiscount)) * parseFloat(requestOrderProduct.quantity))), 2, 'R$ ', '.', ',') }}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="table">
                            <table style="width: 100%;">
                                <thead>
                                <tr>
                                    <th>Meio de Pag.</th>
                                    <th style="text-align: center;">Código</th>
                                    <th style="text-align: center;">Vencimento</th>
                                    <th style="text-align: right;">Valor</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="requestPayment in historyRequest.requestPayments">
                                    <td>{{ $store.getters['entities/paymentMethods/find'](requestPayment.paymentMethodId).name }}</td>
                                    <td style="text-align: center;" v-if="requestPayment.paymentMethod.hasDeadline">
                                        {{ requestPayment.code }}
                                    </td>
                                    <td style="text-align: center;" v-else>---</td>
                                    <td style="text-align: center;" v-if="requestPayment.paymentMethod.hasDeadline">
                                        {{ moment(requestPayment.deadlineDatetime).format("DD/MM/YYYY") }}
                                    </td>
                                    <td style="text-align: center;" v-else>---</td>
                                    <td style="text-align: right;">{{ utils.formatMoney(requestPayment.amount, 2, 'R$ ', '.', ',') }}</td>
                                </tr>
                                <tr>
                                    <td colspan="4" style="text-align: right; font-weight: bold;">
                                        {{ utils.formatMoney(_.sumBy(historyRequest.requestPayments, (requestPayment) => parseFloat(requestPayment.amount)), 2, 'R$ ', '.', ',') }}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="isRequesting">
                Carregando...
            </div>
        </app-perfect-scrollbar>
    </div>
</template>

<script>
    import ClientsAPI from '../../../../../api/clients'
    import { mapMutations, mapState, mapActions } from 'vuex'
    import _ from 'lodash'
    import Vue from 'vue'
    import shortid from 'shortid'

    export default {
        props: ['request','show'],
        components: {
        },
        data(){
            return {
                total: 0,
                isRequesting: false,
                historyRequests: []
            }
        },
        computed: {
            requestHistoryCount(){
                return `${this.total} PEDIDO(S)`
            }
        },
        methods: {
            getRequestHistory(){
                if(Number.isInteger(this.request.clientId)){
                    this.isRequesting = true
                    ClientsAPI.getRequestHistory(this.request.clientId, {companyId: 1, offset: 0, limit: 10}).then((response) => {
                        this.historyRequests = response.data.previousRequests
                        this.total = response.data.total
                        this.isRequesting = false
                        console.log("Request History", response.data)
                    })
                    return true
                }
                this.historyRequests = []
            }
        },
        created(){
        },
        mounted(){
            this.getRequestHistory()
        }
    }
</script>

<style lang="scss" scoped>
    .request__history {
        $gutter: 30px;
        $border-width: 3px;
        $dot-diameter: 18px;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 99;
        background-color: var(--bg-color--2);
        .scrollbar {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
        }
        div.header {
            padding: 20px 8px;
        }
        a.back {
            z-index: 1;
            position: absolute;
            right: 20px;
            top: 15px;
            i {
                font-size: 48px;
            }
        }
        .timeline {
            width:100%;
            padding: 100px 50px;
            position: relative;
            &:before {
                content: '';
                position: absolute;
                top: 0px;
                left:calc(33% + 15px); //$gutter/2
                bottom: 0px;
                width: $border-width;
                background: #ddd;
            }
            &:after {
                content: "";
                display: table;
                clear: both;
            }
        }

        .entry:last-child {
            .body {
                border-bottom: 0;
            }
        }

        .entry {
            clear: both;
            text-align: left;
            position: relative;
            .title {
                margin-bottom: .5em;
                float: left;
                width: 33%;
                padding-right: $gutter;
                text-align: right;
                position: relative;
                &:before {
                    content: '';
                    position: absolute;
                    width: $dot-diameter;
                    height: $dot-diameter;
                    border: $border-width solid salmon;
                    background-color:#fff;
                    border-radius:100%;
                    top: 12px;
                    right: -$dot-diameter + ($dot-diameter / 2);
                    z-index: 99;
                }
                h3 {
                    margin: 0;
                    font-size: 120%;
                }
                p {
                    margin: 0;
                    font-size: 100%;
                }
            }
            .body {
                margin: 0 0 3em;
                float: right;
                width: 66%;
                padding-left: 30px;
                padding-top: 2px;
                padding-bottom: 34px;
                border-bottom: 2px dashed #6c7077;
                p {
                    line-height: 1.4em;
                    &:first-child {
                        margin-top: 0;
                        font-weight: 400;
                    }
                }
                ul {
                    color:#aaa;
                    padding-left: 0;
                    list-style-type: none;
                    li:before {
                        content: "–";
                        margin-right: .5em;
                    }
                }
            }
        }

    }
</style>
