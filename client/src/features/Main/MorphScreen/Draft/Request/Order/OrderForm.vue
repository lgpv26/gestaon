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
                                    <tr v-for="(orderProduct, index) in form.orderProducts" :key="orderProduct.id">
                                        <td><app-product-input :orderProduct.sync="orderProduct" :product.sync="orderProduct.product" @input="onOrderProductInput($event, orderProduct, index)" /></td>
                                        <td class="content-size"><input v-model="orderProduct.quantity" type="text" style="text-align: center;" /></td>
                                        <td><money v-model="form.price"  style="text-align: right;"/></td>
                                        <td><money v-model="form.price" type="text" style="text-align: right;" /></td>
                                        <td><money v-model="form.price" type="text" style="text-align: right;" /></td>
                                        <td style="text-align: center; cursor: pointer; width: 30px;">
                                            <div style="display: flex; flex-direction: row; margin-top: -4px;">
                                                <div style="cursor: pointer; margin-right: 8px;">
                                                    <icon-mini-chart></icon-mini-chart>
                                                </div>
                                                <div style="cursor: pointer; margin-top: -1px;" @click="removeProduct(orderProduct.id)" v-if="form.orderProducts.length > 1">
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
                                            <a class="btn btn--border-only" @click="addProduct" style="display: inline-flex; padding: 0 7px; color: var(--font-color--d-secondary);">Adicionar produto</a>
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
                                    <tr v-for="(orderPaymentMethod, index) in form.orderPaymentMethods" :key="orderPaymentMethod.id">
                                        <td><app-payment-method-input v-model="form.paymentMethodId" /></td>
                                        <td><money v-model="form.price" type="text" style="text-align: right;" /></td>
                                        <td><money v-model="form.price" type="text" style="text-align: right; color: var(--font-color--primary)" /></td>
                                        <td style="text-align: center; cursor: pointer; width: 30px; padding-right: 0;">
                                            <div style="display: flex; flex-direction: row; margin-top: -4px;">
                                                <div style="cursor: pointer; margin-top: -2px;" @click="removePaymentMethod(orderPaymentMethod.id)" v-if="form.orderPaymentMethods.length > 1">
                                                    <icon-remove></icon-remove>
                                                </div>
                                                <div style="cursor: not-allowed; opacity: .3; margin-top: -2px;" v-else>
                                                    <icon-remove></icon-remove>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="1">
                                            <a class="btn btn--border-only" @click="addPaymentMethod" style="display: inline-flex; padding: 0 7px; color: var(--font-color--d-secondary);">Incluir pagamento</a>
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
                        v-model="order.obs" @input="commitSocketChanges('order.obs')"/>
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
            <span v-if="!isCurrentStepActive">Incluir uma <span style="color: var(--secondary-color)">venda</span> neste atendimento</span>
            <span class="push-both-sides"></span>
            <h3 :class="{active: isCurrentStepActive}">Venda</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @changed="onCurrentStepChanged($event)"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import Highcharts from 'highcharts';
    import ProductInput from './ProductInput.vue';
    import PaymentMethodInput from './PaymentMethodInput.vue';
    import EmployeeInput from './EmployeeInput.vue';
    import StorageInput from './StorageInput.vue';
    import DivulgationChannelInput from './DivulgationChannelInput.vue';
    import ProductsAPI from '@/api/products';
    import models from '@/models'

    export default {
        components: {
            'app-product-input': ProductInput,
            'app-payment-method-input': PaymentMethodInput,
            'app-employee-input': EmployeeInput,
            'app-storage-input': StorageInput,
            'app-divulgation-channel-input': DivulgationChannelInput
        },
        props: ['order','activeStep'],
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
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            isCurrentStepActive(){
                return this.activeStep === 'order';
            }
        },
        watch: {
            form: {
                handler: function(form) {
                    this.syncWithParentForm();
                },
                deep: true
            }
        },
        sockets: {

            /* draft order products */

            draftOrderProductAdd(orderProductId){
                console.log("Received draftOrderProductAdd", orderProductId);
                const orderProduct = models.createOrderProductModel()
                _.assign(orderProduct, {
                    id: orderProductId
                })
                this.form.orderProducts.push(orderProduct);
            },
            draftOrderProductRemove(orderProductId){
                console.log("Received draftOrderProductRemove", orderProductId);
                const orderProductIndex = _.findIndex(this.form.orderProducts, { id: orderProductId });
                if(orderProductIndex !== -1){
                    this.form.orderProducts.splice(orderProductIndex, 1);
                }
            }

        },
        methods: {
            addProduct(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                };
                console.log("Emitting draft:order-product-add", emitData);
                this.$socket.emit('draft:order-product-add', emitData);
            },
            addPaymentMethod(){
                this.form.orderPaymentMethods.push({
                    id: _.uniqueId("payment-method#"),
                    paymentMethodId: null
                })
            },
            removeProduct(orderProductId){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    id: orderProductId
                };
                console.log("Emitting draft:order-product-remove", emitData);
                this.$socket.emit('draft:order-product-remove', emitData);
            },
            removePaymentMethod(orderPaymentMethodId){
                let orderPaymentMethodIndex = _.findIndex(this.form.orderPaymentMethods, { id: orderPaymentMethodId });
                if(orderPaymentMethodIndex !== -1){
                    this.form.orderPaymentMethods.splice(orderPaymentMethodIndex, 1);
                }
            },
            activateTab(tab){
                this.activeTab = tab;
            },

            /**
             * Events
             */

            // order product

            onOrderProductInput(value, orderProduct, index){
                this.commitSocketChanges('order.orderProducts[' + index + ']')
            },

            /**
             * Real-time
             */

            commitTrustedSocketChanges(ev, mapping){
                if(ev.isTrusted){
                    setImmediate(() => {
                        this.commitSocketChanges(mapping);
                    });
                }
            },
            onCurrentStepChanged(value){
                (this.activeStep === 'order') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'order');
                this.commitSocketChanges('activeStep');
            },
            syncWithParentForm(){
                this.$emit('update:order', this.form);
            },
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            }

        },
        mounted(){
            this.syncWithParentForm();
            Highcharts.theme = {
                colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066',
                    '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
                chart: {
                    backgroundColor: 'transparent',
                    style: {
                        fontFamily: 'Montserrat, sans-serif'
                    },
                    plotBorderColor: '#606063',
                    spacing: [10, 0, 0, 0]
                },
                title: {
                    style: {
                        color: '#E0E0E3',
                        textTransform: 'uppercase',
                        fontSize: '20px'
                    }
                },
                subtitle: {
                    style: {
                        color: '#E0E0E3',
                        textTransform: 'uppercase'
                    }
                },
                xAxis: {
                    gridLineColor: '#707073',
                    labels: {
                        style: {
                            color: '#E0E0E3'
                        }
                    },
                    lineColor: '#707073',
                    minorGridLineColor: '#505053',
                    tickColor: '#707073',
                    title: {
                        style: {
                            color: '#A0A0A3'

                        }
                    }
                },
                yAxis: {
                    gridLineColor: '#707073',
                    labels: {
                        style: {
                            color: '#E0E0E3'
                        }
                    },
                    lineColor: '#707073',
                    minorGridLineColor: '#505053',
                    tickColor: '#707073',
                    tickWidth: 1,
                    title: {
                        style: {
                            color: '#A0A0A3'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    style: {
                        color: '#F0F0F0'
                    }
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            color: '#B0B0B3'
                        },
                        marker: {
                            lineColor: '#333'
                        }
                    },
                    boxplot: {
                        fillColor: '#505053'
                    },
                    candlestick: {
                        lineColor: 'white'
                    },
                    errorbar: {
                        color: 'white'
                    }
                },
                legend: {
                    itemStyle: {
                        color: '#E0E0E3'
                    },
                    itemHoverStyle: {
                        color: '#FFF'
                    },
                    itemHiddenStyle: {
                        color: '#606063'
                    }
                },
                credits: {
                    style: {
                        color: '#666'
                    }
                },
                labels: {
                    style: {
                        color: '#707073'
                    }
                },

                drilldown: {
                    activeAxisLabelStyle: {
                        color: '#F0F0F3'
                    },
                    activeDataLabelStyle: {
                        color: '#F0F0F3'
                    }
                },

                navigation: {
                    buttonOptions: {
                        symbolStroke: '#DDDDDD',
                        theme: {
                            fill: '#505053'
                        }
                    }
                },

                // scroll charts
                rangeSelector: {
                    buttonTheme: {
                        fill: '#505053',
                        stroke: '#000000',
                        style: {
                            color: '#CCC'
                        },
                        states: {
                            hover: {
                                fill: '#707073',
                                stroke: '#000000',
                                style: {
                                    color: 'white'
                                }
                            },
                            select: {
                                fill: '#000003',
                                stroke: '#000000',
                                style: {
                                    color: 'white'
                                }
                            }
                        }
                    },
                    inputBoxBorderColor: '#505053',
                    inputStyle: {
                        backgroundColor: '#333',
                        color: 'silver'
                    },
                    labelStyle: {
                        color: 'silver'
                    }
                },

                navigator: {
                    handles: {
                        backgroundColor: '#666',
                        borderColor: '#AAA'
                    },
                    outlineColor: '#CCC',
                    maskFill: 'rgba(255,255,255,0.1)',
                    series: {
                        color: '#7798BF',
                        lineColor: '#A6C7ED'
                    },
                    xAxis: {
                        gridLineColor: '#505053'
                    }
                },

                scrollbar: {
                    barBackgroundColor: '#808083',
                    barBorderColor: '#808083',
                    buttonArrowColor: '#CCC',
                    buttonBackgroundColor: '#606063',
                    buttonBorderColor: '#606063',
                    rifleColor: '#FFF',
                    trackBackgroundColor: '#404043',
                    trackBorderColor: '#404043'
                },

                // special colors for some of the
                legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
                background2: '#505053',
                dataLabelsColor: '#B0B0B3',
                textColor: '#C0C0C0',
                contrastTextColor: '#F0F0F3',
                maskColor: 'rgba(255,255,255,0.3)'
            };
            Highcharts.setOptions(Highcharts.theme);
            this.productChart = Highcharts.chart(this.$refs.productChart, {
                chart: {
                    height: 200
                },
                title: false,
                subtitle: false,
                xAxis: {
                    type: 'category',
                    labels:{
                        enabled: false
                    },
                    tickLength: 0,
                },
                yAxis: {
                    title: false
                },
                legend: {
                    enabled: true,
                    align: 'right'
                },
                tooltip: {
                    headerFormat: null,
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },
                series: [
                    {
                        type: 'spline',
                        name: 'Meta',
                        index: 10,
                        color: 'var(--border-color--secondary)',
                        data: [{
                            name: 'Jan/2018',
                            color: 'var(--border-color--terciary)',
                            x: 1,
                            y: 75
                        }, {
                            name: 'Fev/2018',
                            x: 2,
                            y: 50
                        }, {
                            name: 'Mar/2018',
                            color: 'var(--border-color--terciary)',
                            x: 3,
                            y: 80
                        }, {
                            name: 'Abr/2018',
                            x: 4,
                            y: 78
                        }, {
                            name: 'Mai/2018',
                            color: 'var(--border-color--terciary)',
                            x: 5,
                            y: 85
                        }, {
                            name: 'Jun/2018',
                            x: 6,
                            y: 80
                        }]
                    },
                    {
                        type: 'spline',
                        name: 'Meta atual',
                        index: 5,
                        dashStyle: 'Dot',
                        color: 'var(--border-color--terciary)',
                        data: [{
                            x: 6,
                            y: 80,
                            marker: {
                                enabled: false
                            }
                        }, {
                            name: 'Meta atual',
                            x: 7,
                            y: 90
                        }]
                    },
                    {
                        type: 'column',
                        name: 'Últimos preços',
                        index: 2,
                        color: 'var(--bg-color--primary)',
                        stacking: 'normal',
                        borderWidth: 0,
                        colorByPoint: false,
                        dataLabels: {
                            enabled: true,
                            inside: true,
                            shadow: false,
                            rotation: 270,
                            verticalAlign: "bottom",
                            color: '#FFF',
                            align: 'left',
                            y: -5,
                            formatter(){
                                return this.point.name;
                            }
                        },
                        data: [{
                            name: 'Jan/2018',
                            x: 1,
                            y: 70
                        }, {
                            name: 'Fev/2018',
                            x: 2,
                            y: 71
                        }, {
                            name: 'Mar/2018',
                            x: 3,
                            y: 75
                        }, {
                            name: 'Abr/2018',
                            x: 4,
                            y: 78
                        }, {
                            name: 'Mai/2018',
                            x: 5,
                            y: 82
                        }, {
                            name: 'Jun/2018',
                            x: 6,
                            y: 80
                        }, {
                            x: 7
                        }]
                    },
                    {
                        type: 'column',
                        name: 'Últimos preços',
                        index: 1,
                        stacking: 'normal',
                        color: 'transparent',
                        borderColor: 'rgba(255,255,255,.2)',
                        dashStyle: 'Dash',
                        enableMouseTracking: false,
                        showInLegend: false,
                        colorByPoint: false,
                        data: [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }, { x: 6 }, {
                            y: 90,
                            x: 7,
                            color: 'var(--bg-color--10)'
                        }]
                    }
                ]
            });
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