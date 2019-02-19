<template>
    <app-perfect-scrollbar class="section__content">
        <div class="section__content">
            <div class="columns">
                <div class="left-side">
                    <div class="box">
                        <table style="margin: 3px 0 12px 0;">
                            <thead>
                                <tr>
                                    <th style="width: 300px;">Nome</th>
                                    <th style="text-align: center; padding-right: 8px;">Qnt.</th>
                                    <th style="text-align: right; padding-right: 8px;">Valor Un.</th>
                                    <th style="text-align: right; padding-right: 8px;">Desc.</th>
                                    <th style="text-align: right; padding-right: 8px;">Subtotal</th>
                                    <th style="width: 20px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="requestOrderProduct in request.requestOrder.requestOrderProducts" :key="requestOrderProduct.id">
                                    <td style="padding-right: 8px;">
                                        <app-select :items="getSelectProducts" :value="requestOrderProduct.id" @input="selectOrderProduct(requestOrderProduct,$event)" :popoverProps="{verticalOffset: 0, horizontalOffset: -15, placement: 'bottom-start'}">
                                            <input type="text" class="select readonly" style="margin-bottom: 0;" readonly
                                                   :value="(_.has(requestOrderProduct,'product.name')) ? requestOrderProduct.product.name : '-- SELECIONE --'"/>
                                            <template slot="item" slot-scope="slotProps">
                                                <span>{{ slotProps.text }}</span>
                                            </template>
                                        </app-select>
                                    </td>
                                    <td style="padding-right: 8px;">
                                        <input class="input" type="text"
                                               @input.number="updateValue('entities/requestOrderProducts/update','quantity',requestOrderProduct.id,parseInt($event.target.value))"
                                               :value="requestOrderProduct.quantity"
                                               style="width: 50px; margin-bottom: 0; text-align: center;" />
                                    </td>
                                    <td style="padding-right: 8px;">
                                        <money class="input"
                                               @input.number.native="updateMoneyValue('entities/requestOrderProducts/update','unitPrice',requestOrderProduct.id,$event)"
                                               :value="requestOrderProduct.unitPrice"
                                               style="margin-bottom: 0; text-align: right;"></money>
                                    </td>
                                    <td style="padding-right: 8px;">
                                        <money class="input"
                                               @input.number.native="updateMoneyValue('entities/requestOrderProducts/update','unitDiscount',requestOrderProduct.id,$event)"
                                               :value="requestOrderProduct.unitDiscount"
                                               style="margin-bottom: 0; text-align: right;"></money>
                                    </td>
                                    <td style="padding-right: 8px;">
                                        <money class="input readonly" disabled
                                               :value="requestOrderProduct.quantity * (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount)"
                                               style="margin-bottom: 0; text-align: right;"></money>
                                    </td>
                                    <td>
                                        <div style="display: flex; flex-direction: row;">
                                            <a style="margin: 5px 0 0 0" :class="{ disabled: request.requestOrder.requestOrderProducts.length <= 1 }"
                                                @click="removeRequestOrderProduct(requestOrderProduct.id)">
                                                <i class="mi mi-close" style="font-size: 18px"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 15px; padding-right: 8px;">
                                        <a class="button" @click="addRequestOrderProduct()">INCLUIR PRODUTO</a>
                                    </td>
                                    <td style="padding-top: 15px; padding-right: 8px;" colspan="2"></td>
                                    <td style="padding-top: 15px; padding-right: 8px; text-align: right;"></td>
                                    <td style="padding-top: 15px; padding-right: 8px; text-align: right;">{{ getOrderTotalPrice }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="box">
                        <table style="margin: 3px 0 12px 0;">
                            <thead>
                            <tr>
                                <th>Forma de pagamento</th>
                                <th style="width: 100px; text-align: center; padding-right: 8px;">Código</th>
                                <th style="width: 100px; text-align: right; padding-right: 8px;">Vencimento</th>
                                <th style="width: 100px; text-align: center;">Recebido</th>
                                <th style="width: 100px; text-align: right; padding-right: 8px;">Valor</th>
                                <th style="width: 20px;"></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="requestPayment in request.requestPayments" :key="requestPayment.id">
                                <td style="padding-right: 8px;">
                                    <app-select :items="getSelectPaymentMethods" :value="requestPayment.id" @input="updateValue('entities/requestPayments/update','paymentMethodId',requestPayment.id,$event)" :popoverProps="{verticalOffset: 0, horizontalOffset: -15, placement: 'bottom-start'}">
                                        <input type="text" class="select readonly" style="margin-bottom: 0;" readonly :value="(_.has(requestPayment,'paymentMethod.name')) ? requestPayment.paymentMethod.name : '-- SELECIONE --'" />
                                        <template slot="item" slot-scope="slotProps">
                                            <span>{{ slotProps.text }}</span>
                                        </template>
                                    </app-select>
                                </td>
                                <td style="padding-right: 8px;">
                                    <input v-if="_.get(requestPayment,'paymentMethod.hasDeadline', false)" :value="requestPayment.code" @input="updateValue('entities/requestPayments/update', 'code', requestPayment.id, $event.target.value, 'uppercase', $event)" type="text" class="input" style="margin-bottom: 0; text-align: center;" placeholder="#######" />
                                    <input v-else type="text" class="input readonly" style="margin-bottom: 0; text-align: center;" disabled value="---" placeholder="---" />
                                </td>
                                <td style="padding-right: 8px;">
                                    <app-datetime-selector v-if="_.get(requestPayment,'paymentMethod.hasDeadline', false)" class="input no-margin-bottom align-right" :value="requestPayment.deadlineDatetime" @input="updateValue('entities/requestPayments/update','deadlineDatetime',requestPayment.id,$event)" :config="datetimeSelectorConfig" placeholder="##/##/####">
                                    </app-datetime-selector>
                                    <input v-else type="text" class="input readonly" disabled style="margin-bottom: 0; text-align: right;" value="---" />
                                </td>
                                <td>
                                    <div style="display: flex; flex-direction: row; justify-content: center; margin-top: 7px;">
                                        <app-switch :value="requestPayment.paid" @input="updateValue('entities/requestPayments/update','paid',requestPayment.id,$event)"></app-switch>
                                    </div>
                                </td>
                                <td style="padding-right: 8px;">
                                    <money class="input" style="margin-bottom: 0; text-align: right;" :value="requestPayment.amount" @input.native="updateMoneyValue('entities/requestPayments/update','amount',requestPayment.id,$event)"></money>
                                </td>
                                <td>
                                    <div style="display: flex; flex-direction: row;">
                                        <a style="margin: 5px 0 0 0" :class="{ disabled: request.requestPayments.length <= 1 }"
                                           @click="removeRequestPayment(requestPayment.id)">
                                            <i class="mi mi-close" style="font-size: 18px"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 15px; padding-right: 8px;">
                                    <a class="button" @click="addRequestPayment()">INCLUIR PAGAMENTO</a>
                                </td>
                                <td colspan="4" style="padding-top: 15px; padding-right: 8px; text-align: right;">
                                    {{ getOrderTotalPrice }} - {{ getOrderPaymentsTotalPrice }} = {{ getOrderLeftPrice }}
                                </td>
                            </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
                <div class="right-side">
                    <div><span></span></div>
                    <div class="box" style="padding: 10px 12px;">
                        <div class="box__item" style="display: flex; flex-direction: column;">
                            <h3>Data da entrega</h3>
                            <div style="display: flex; flex-direction: row; align-items: center;">
                                <app-datetime-selector class="input" :value="request.deliveryDate" @input="onDeliveryDateChange($event)" :config="deliveryDateSelectorConfig" placeholder="EM 20 MINUTOS"></app-datetime-selector>
                                <a class="btn btn--square" v-if="request.deliveryDate" @click="onDeliveryDateChange(null)" href="javascript:void(0)" style="margin-top: 5px; margin-left: 8px;"><i class="mi mi-clear"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="box" style="padding: 10px 12px;">
                        <div class="box__item" style="display: flex; flex-direction: column;">
                            <h3>Canal de divulgação</h3>
                            <app-select :items="getSelectPromotionChannels" :value="request.requestOrder.promotionChannelId" @input="updateValue('entities/requestOrders/update','promotionChannelId',request.requestOrder.id,$event)" :popoverProps="{verticalOffset: 0, horizontalOffset: -15, placement: 'bottom-start'}">
                                <input type="text" class="readonly select" :value="(_.has(request,'requestOrder.promotionChannel.name')) ? request.requestOrder.promotionChannel.name : '-- SELECIONE --'"/>
                                <template slot="item" slot-scope="slotProps">
                                    <span>{{ slotProps.text }}</span>
                                </template>
                            </app-select>

                        </div>
                    </div>
                    <div class="box">
                        <h3>Obs. do pedido</h3>
                        <textarea-autosize
                                class="input"
                                style="flex-shrink: 0;"
                                :min-height="30"
                                :max-height="350"
                                :value="request.obs"
                                @input.native="updateValue('entities/requests/update','obs',request.id,$event.target.value.toUpperCase(),'uppercase',$event)"
                        ></textarea-autosize>
                    </div>
                </div>
            </div>
        </div>
    </app-perfect-scrollbar>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex'
    import _ from 'lodash'
    import shortid from 'shortid'
    import Vue from 'vue'
    import ClientSearchComponent from '../_Shared/Search/ClientSearch'
    import { Portuguese } from 'flatpickr/dist/l10n/pt'

    export default {
        props: ['request'],
        components: {
            'app-client-search': ClientSearchComponent
        },
        data(){
            return {
                datetimeSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y',
                    dateFormat: 'Z',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: true
                },
                deliveryDateSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y H:i',
                    dateFormat: 'Z',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: true
                },
                moneyMask: {
                    decimal: ',',
                    thousands: '.',
                    precision: 2,
                },

                searchShow: false,
                searchTimeout: null,
                searchValue: null,
                searchItems: [],

                users: [],
                products: [],
                clientGroups: [],
                promotionChannels: [],

                deliveryDate: null,

                activeTab: 'client',

                price: 0,

                originalRequestOrder: null,
                lastRequestOrder: null,
                changeCheckInterval: null
            }
        },
        watch: {
            getOrderTotalPrice() {
                const orderTotalPrice = _.sumBy(this.request.requestOrder.requestOrderProducts, (requestOrderProduct) => {
                    return (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) * requestOrderProduct.quantity
                })
                if(this.request.requestPayments.length === 1){
                    this.updateValue('entities/requestPayments/update','amount',_.first(this.request.requestPayments).id,this.utils.getMoneyAsDecimal(orderTotalPrice))
                }
            }
        },
        computed: {
            ...mapState(['system']),
            getOrderTotalPrice(){
                return this.utils.formatMoney(_.sumBy(this.request.requestOrder.requestOrderProducts, (requestOrderProduct) => {
                    return (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) * requestOrderProduct.quantity
                }), 2, 'R$ ', '.', ',')
            },
            getOrderPaymentsTotalPrice(){
                return this.utils.formatMoney(_.sumBy(this.request.requestPayments, (requestPayment) => {
                    return parseFloat(requestPayment.amount)
                }), 2, 'R$ ', '.', ',')
            },
            getOrderLeftPrice(){
                const orderTotalPrice = _.sumBy(this.request.requestOrder.requestOrderProducts, (requestOrderProduct) => {
                    return (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) * requestOrderProduct.quantity
                })
                const orderPaymentsTotalPrice = _.sumBy(this.request.requestPayments, (requestPayment) => {
                    return parseFloat(requestPayment.amount)
                })
                return this.utils.formatMoney(parseFloat(orderTotalPrice) - parseFloat(orderPaymentsTotalPrice), 2, 'R$ ', '.', ',')
            },
            getSelectProducts(){
                return _.map(this.$store.getters['entities/products/all'](), (product) => {
                    return {
                        value: product.id,
                        text: product.name
                    }
                })
            },
            getSelectPaymentMethods(){
                return _.map(this.$store.getters['entities/paymentMethods/all'](), (paymentMethod) => {
                    return {
                        value: paymentMethod.id,
                        text: paymentMethod.name
                    }
                })
            },
            getSelectPromotionChannels(){
                return _.map(this.$store.getters['entities/promotionChannels/all'](), (promotionChannel) => {
                    return {
                        value: promotionChannel.id,
                        text: promotionChannel.name
                    }
                })
            }
        },
        methods: {
            updateValue(path, field, id, value, modifier = false, ev = false) {
                const data = {};
                let start, end
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    start = ev.target.selectionStart
                    end = ev.target.selectionEnd
                }
                switch (modifier) {
                    case "uppercase":
                        data[field] = value.toUpperCase();
                        break;
                    default:
                        data[field] = value;
                }
                this.$store.dispatch(path, {where: id, data})
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    Vue.nextTick(() => {
                        ev.target.setSelectionRange(start,end);
                    })
                }
            },
            updateMoneyValue(path, field, id, event){
                if(event.isTrusted){
                    const data = {}
                    data[field] = this.utils.getMoneyAsDecimal(event.target.value)
                    this.$store.dispatch(path, {
                        where: id,
                        data
                    })
                }
            },

            onDeliveryDateChange(value){
                this.updateValue('entities/requests/update','deliveryDate',this.request.id,value)
            },

            /* Order Product */
            selectOrderProduct(requestOrderProduct, productId){
                this.updateValue('entities/requestOrderProducts/update','productId',requestOrderProduct.id,productId)
                const product = this.$store.getters['entities/products/find'](productId)
                this.$store.dispatch('entities/requestOrderProducts/update',{
                    where: requestOrderProduct.id,
                    data: {
                        productId: product.id,
                        unitPrice: product.price
                    }
                })
            },
            addRequestOrderProduct(){
                this.$store.dispatch('entities/requestOrderProducts/insert', {
                    data: {
                        id: `tmp/${shortid.generate()}`,
                        requestOrderId: this.request.requestOrder.id
                    }
                })
            },
            removeRequestOrderProduct(requestOrderProductId){
                if(this.request.requestOrder.requestOrderProducts.length <= 1){
                    return;
                }
                this.$store.dispatch('entities/requestOrderProducts/delete', requestOrderProductId)
            },

            addRequestPayment(){
                this.$store.dispatch('entities/requestPayments/insert',{
                    data: {
                        id: `tmp/${shortid.generate()}`,
                        requestId: this.request.id
                    }
                })
            },
            removeRequestPayment(requestPaymentId){
                if(this.request.requestPayments.length <= 1){
                    return;
                }
                this.$store.dispatch('entities/requestPayments/delete', requestPaymentId)
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '../window.scss';
    @import './request.scss';

    .deadline-datetime.input {
        margin-bottom: 0!important;
    }

    .request__window {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        .request__search {
            height: 50px;
            border-top: 1px solid var(--border-color--0);
            border-bottom: 1px solid var(--border-color--0);
            flex-shrink: 0;
            position: relative;
            display: flex;
            background-color: var(--bg-color--2);
            margin-bottom: 5px;
            input {
                height: 50px;
                padding: 10px 8px;
                font-size: 12px;
                width: 100%;
                outline: 0;
                &:hover, &:focus, &:active {}
            }
            a {
                position: absolute;
                top: 12px;
                right: 8px;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                i {
                    font-size: 18px;
                }
            }
        }
        .request__main {
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            position: relative;
            .request__body {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                .request__section {
                    display: flex;
                    background-color: var(--bg-color--2);
                    flex-direction: column;
                    margin-bottom: 5px;
                    flex-shrink: 0;
                    .section__content {
                        display: none;
                        .columns {
                            flex-grow: 1;
                            display: flex;
                            flex-direction: row;
                        }
                    }
                    .section__summary {
                        height: 50px;
                        align-items: center;
                        background-color: var(--bg-color--2);
                        display: flex;
                        flex-direction: row;
                        padding: 8px;
                        cursor: pointer;
                        flex-shrink: 0;
                        h3 {
                            font-weight: 400
                        }
                        .summary-radio {
                            margin: 0 0 0 0;
                            .v-input {
                                margin: 0;
                                padding: 0;
                                .v-radio {
                                    margin: 0;
                                }
                            }
                        }
                        &:hover {
                            background-color: var(--bg-color--3)
                        }
                    }
                    &:last-child {
                        margin-bottom: 0;
                    }
                    &.active  {
                        display: flex;
                        flex-grow: 1;
                        flex-shrink: unset;
                        .section__content {
                            display: flex;
                            background-color: var(--bg-color--2);
                            flex-grow: 1;
                        }
                    }
                }
                table {
                    width: 100%;
                    text-align: left;
                    margin: 8px;
                }
                .left-side {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    div.box {
                        margin: 8px 8px 0 8px;
                        padding: 10px 12px;
                        display: flex;
                        flex-direction: column;
                        background-color: var(--bg-color--5);
                        flex-shrink: 0;
                        h3 {
                            margin-bottom: 8px;
                        }
                        &:last-child {
                            margin-bottom: 8px;
                        }
                    }
                }
                .right-side {
                    display: flex;
                    flex-direction: column;
                    width: 240px;
                    flex-shrink: 0;
                    div.box {
                        margin: 8px 8px 0 0;
                        padding: 10px 12px;
                        display: flex;
                        flex-direction: column;
                        background-color: var(--bg-color--5);
                        flex-shrink: 0;
                        .box__item {
                            display: flex;
                            flex-direction: row;
                        }
                        &:last-child {
                            margin-bottom: 8px;
                        }
                    }
                }
            }
            .request__footer {
                display: flex;
                flex-direction: row;
                height: 40px;
                flex-shrink: 0;
                background-color: var(--bg-color--6)
            }
            .request__search-result {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: var(--bg-color--2);
                .search-result__item {
                    display: flex;
                    flex-direction: column;
                    padding: 10px 8px;
                    border-bottom: 1px solid var(--border-color--0);
                    cursor: pointer;
                    transition: .5s all;
                    .name {
                        color: var(--font-color--primary);
                        margin-bottom: 5px;
                    }
                    &:hover {
                        background-color: var(--bg-color--1);
                    }
                }
            }
        }
    }
</style>
