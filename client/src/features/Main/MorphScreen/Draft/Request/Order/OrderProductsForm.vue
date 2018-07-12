<template>
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
                <tr v-for="(orderProductRow, index) in orderProductRows" :key="orderProductRow.id">
                    <td v-if="false"><app-product-input v-model="orderProductRow.product" @input="inputOrderProductRowProduct($event,index)"></app-product-input></td>
                    <td>
                        <app-product-select :popoverProps="{ placement: 'bottom-start' }" v-model="orderProductRow.product" @change="inputOrderProductRowProduct($event,index)">
                            <input type="text" v-if="!_.find(products,{id: orderProductRow.product.id})" style="cursor: pointer" readonly placeholder="Selecione um produto" />
                            <input type="text" v-else style="cursor: pointer" readonly :value="_.find(products,{id: orderProductRow.product.id}).name" placeholder="Selecione um produto" />
                        </app-product-select>
                    </td>
                    <td class="content-size"><input v-model="orderProductRow.quantity" @input="inputOrderProductRow($event,'quantity',index)" type="text" style="text-align: center;" /></td>
                    <td><money v-model="orderProductRow.unitPrice" @input.native="inputOrderProductRow($event,'unitPrice',index)" type="text" style="text-align: right;"></money></td>
                    <td><money v-model="orderProductRow.unitDiscount" @input.native="inputOrderProductRow($event,'unitDiscount',index)" type="text" style="text-align: right;"></money></td>
                    <td><money :value="(orderProductRow.unitPrice - orderProductRow.unitDiscount) * orderProductRow.quantity" readonly style="text-align: right;"></money></td>
                    <td style="text-align: center; cursor: pointer; width: 30px;">
                        <div style="display: flex; flex-direction: row; margin-top: -4px;">
                            <div style="cursor: pointer; margin-right: 8px;">
                                <icon-mini-chart></icon-mini-chart>
                            </div>
                            <div style="cursor: pointer; margin-top: -1px;" v-if="orderProducts.length > 1" @click="remove(orderProductRow.id, index)">
                                <icon-remove></icon-remove>
                            </div>
                            <div style="cursor: not-allowed; opacity: .3; margin-top: -1px;" v-else>
                                <icon-remove></icon-remove>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <a class="btn btn--border-only" @click="add()" style="display: inline-flex; padding: 0 7px; color: var(--font-color--d-secondary);">Adicionar produto</a>
                    </td>
                    <td style="text-align: right; font-weight: 800;">{{ discountPrice }}</td>
                    <td style="text-align: right; font-weight: 800; color: var(--font-color--secondary)">{{ utils.formatMoney(subtotalPrice, 2,'R$ ','.',',') }}</td>
                    <td></td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import _ from 'lodash'
    import config from '../../../../../../config'
    import ProductSelect from '../../_Shared/ProductSelect.vue'
    import ProductInput from './ProductInput.vue'
    import utils from '../../../../../../utils/index'

    import DraftMixin from '../../DraftMixin'

    const { mapFields, mapMultiRowFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-product-select': ProductSelect,
            'app-product-input': ProductInput,
        },
        mixins: [DraftMixin],
        data(){
            return {
                subtotal: 0,
                formPath: 'request.order'
            }
        },
        computed: {
            ...mapState('data/products',['products']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapMultiRowFields({
                orderProductRows: 'form.order.orderProducts',
                requestPaymentRows: 'form.requestPayments'
            }),
            ...mapFields(['form.order.orderProducts','form.requestPayments']),
            discountPrice(){
                const sum = _.sumBy(this.orderProducts, (orderProduct) => {
                    return orderProduct.unitDiscount * orderProduct.quantity
                })
                return utils.formatMoney(sum, 2,'R$ ','.',',')
            },
            subtotalPrice(){
                return _.sumBy(this.orderProducts, (orderProduct) => {
                    return (orderProduct.unitPrice - orderProduct.unitDiscount) * orderProduct.quantity
                })

            }
        },
        methods: {
            ...mapActions('draft/request',['addOrderProduct','removeOrderProduct']),
            inputOrderProductRow(ev,field,index){
                if(ev.isTrusted){
                    // verify payments
                    if(this.requestPayments.length === 1 && _.first(this.requestPayments).paymentMethod.id === config.system.IDMappings.paymentMethods.default){
                        this.requestPaymentRows[0].amount = this.subtotalPrice
                        this.syncMultiple([
                            {
                                value: this.subtotalPrice,
                                path: 'requestPayments[0].amount',
                                customBaseFormPath: 'request'
                            },
                            {
                                value: this.orderProducts[index][field],
                                path: 'orderProducts[' + index + '].' + field
                            }
                        ])
                    }
                    else {
                        this.sync(this.orderProducts[index][field],'orderProducts[' + index + '].' + field)
                    }
                }
            },
            inputOrderProductRowProduct(product,index){
                this.orderProductRows[index].unitPrice = product.price
                this.orderProductRows[index].quantity = 1
                this.orderProductRows[index].product = product

                // verify payments
                if(this.requestPayments.length === 1 && _.first(this.requestPayments).paymentMethod.id === config.system.IDMappings.paymentMethods.default){
                    this.requestPaymentRows[0].amount = this.subtotalPrice
                    this.syncMultiple([
                        {
                            value: this.subtotalPrice,
                            path: 'requestPayments[0].amount',
                            customBaseFormPath: 'request'
                        },
                        {
                            value: this.orderProducts[index].unitPrice,
                            path: 'orderProducts[' + index + '].unitPrice'
                        },
                        {
                            value: this.orderProducts[index].quantity,
                            path: 'orderProducts[' + index + '].quantity'
                        },
                        {
                            value: this.orderProducts[index].product,
                            path: 'orderProducts[' + index + '].product'
                        }
                    ])
                }
                else {
                    this.syncMultiple([
                        {
                            value: this.orderProducts[index].unitPrice,
                            path: 'orderProducts[' + index + '].unitPrice'
                        },
                        {
                            value: this.orderProducts[index].quantity,
                            path: 'orderProducts[' + index + '].quantity'
                        },
                        {
                            value: this.orderProducts[index].product,
                            path: 'orderProducts[' + index + '].product'
                        }
                    ])
                }
            },
            add(){
                this.addOrderProduct()
                this.sync(this.orderProducts,'orderProducts')
            },
            remove(orderProductId, index){
                this.removeOrderProduct(orderProductId)
                this.syncKeyRemove(index, 'orderProducts')
                if(this.requestPayments.length === 1 && _.first(this.requestPayments).paymentMethod.id === config.system.IDMappings.paymentMethods.default){
                    this.requestPaymentRows[0].amount = this.subtotalPrice
                    this.sync(this.subtotalPrice,'requestPayments[0].amount','request')
                }
            },
        }
    }
</script>

<style scoped>
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
</style>