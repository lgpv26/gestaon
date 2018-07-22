<template>
    <div style="display: flex; flex-grow: 1; flex-direction: row">
            <div class="form__main-column" style="display: flex; flex-direction: column;">
                <div class="form-groups">
                    <app-order-products-form></app-order-products-form>
                </div>
                <span class="push-both-sides"></span>
                <div class="form-groups">
                    <div class="form-group" style="flex-grow: 1; flex-direction: column; align-items: flex-start">
                        <label style="font-weight: 600; font-size: 12px; margin-bottom: 5px;">
                            Canal de divulgação
                        </label>
                        <span class="push-both-sides"></span>
                        <app-promotion-channel-select :popoverProps="{placement:'top-start', verticalOffset: 5}" v-model="promotionChannelId" @change="sync($event,'promotionChannelId')">
                            <div class="select-triggerer">
                                <span>{{ selectedPromotionChannelName }}</span>
                                <icon-dropdown></icon-dropdown>
                            </div>
                        </app-promotion-channel-select>
                    </div>
                    <div class="form-group" style="flex-grow: 1; flex-direction: column; align-items: flex-start;">
                        <label style="font-weight: 600; font-size: 12px; margin-bottom: 5px; white-space: nowrap">
                            Hora da entrega
                        </label>
                        <div class="input-container">
                            <span v-if="useSuggestedDeliveryDate">{{ suggestedDeliveryDate }}</span>
                            <app-datetime-selector class="input--borderless" v-model="deliveryDate" @input="inputDeliveryDate($event)"
                                v-else :config="datetimeSelectorConfig" placeholder="..."></app-datetime-selector>
                            <span class="push-both-sides"></span>
                            <a href="javascript:void(0)" v-if="!useSuggestedDeliveryDate" style="white-space: nowrap; margin-left: 10px;" @click="toggleSuggestedTime">SUGERIDO</a>
                            <a href="javascript:void(0)" v-else style="white-space: nowrap; margin-left: 10px;" @click="toggleSuggestedTime">AGENDADO</a>
                        </div>
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group" style="flex-grow: 1; flex-direction: column; align-items: flex-start">
                        <label style="font-weight: 600; font-size: 12px; margin-bottom: 5px;">
                            Observação do pedido
                        </label>
                        <input type="text" style="width: initial;" class="input--borderless" placeholder="..." v-model="obs" @input="sync(obs,'obs','request')"/>
                    </div>
                    <div class="form-group" style="flex-grow: 1; flex-direction: column; align-items: flex-start">
                        <label style="font-weight: 600; font-size: 12px;">
                            Responsável
                        </label>
                        <span class="push-both-sides"></span>
                        <app-user-select :popoverProps="{placement:'top-start', verticalOffset: 5}" v-model="responsibleUserId" @change="sync($event,'responsibleUserId','request')">
                            <div class="select-triggerer">
                                <span>{{ selectedResponsibleUserName }}</span>
                                <icon-dropdown></icon-dropdown>
                            </div>
                        </app-user-select>
                    </div>
                </div>
            </div>
            <div class="form__side-column" style="display: flex; flex-direction: column;">
                <div class="reports">
                    <div class="side-column__tabs">
                        <ul>
                            <li v-if="false" :class="{ active: activeTab === 'chart' }" @click="activateTab('chart')">Gráfico</li>
                            <li :class="{ active: activeTab === 'history' }" @click="activateTab('history')">Histórico de compras</li>
                        </ul>
                    </div>
                    <div class="form-groups">
                        <div class="form-group">
                            <div class="tab--product-chart" ref="productChart" v-show="activeTab === 'chart'"></div>
                            <div class="tab--request-history" v-show="activeTab === 'history'">
                                <div v-if="client.id">
                                    <div class="history__summary" style="display: flex; flex-direction: column; margin-bottom: 15px;">
                                        <div class="summary__titles" style="display: flex; flex-direction: row;">
                                            Cliente desde
                                            <span class="push-both-sides"></span>
                                            Média de compra(s)
                                        </div>
                                        <div class="summary__values" style="display: flex; flex-direction: row;">
                                            <h3 style="color: var(--font-color--d-secondary)" v-if="client.id">{{ moment(client.dateCreated).format('DD/MM/YYYY HH:mm:ss') }}</h3>
                                            <h3 style="color: var(--font-color--d-terciary)" v-else>---</h3>
                                            <span class="push-both-sides"></span>
                                            <h3 style="color: var(--font-color--primary)" v-if="averageDaysBetweenRequests">{{ averageDaysBetweenRequests }} dias</h3>
                                            <h3 style="color: var(--font-color--terciary)" v-else>---</h3>
                                        </div>
                                    </div>
                                    <table style="width: 100%;">
                                        <thead>
                                            <tr>
                                                <th style="text-align: left; padding-bottom: 5px;">Comprou</th>
                                                <th style="text-align: left; padding-bottom: 5px;">Qt.</th>
                                                <th style="text-align: left; padding-bottom: 5px;">Total</th>
                                                <th style="text-align: right; padding-bottom: 5px;">Pago</th>
                                            </tr>
                                        </thead>
                                        <tbody v-for="(requestHistoryItem, index) in requestHistory" :key="index">
                                            <tr style="cursor: pointer;" @click="selectRequestHistoryItem(requestHistoryItem)">
                                                <td>{{ moment(requestHistoryItem.deliveryDate).format("DD/MM/YYYY HH:mm") }}</td>
                                                <td>{{ requestHistoryItem.productQuantity }}</td>
                                                <td>{{ utils.formatMoney(requestHistoryItem.orderTotal,2,'R$ ','.',',') }}</td>
                                                <td :class="{paid: requestHistoryItem.paid, 'unpaid': !requestHistoryItem.paid}" style="text-align: right; padding-right: 12px;"><icon-check></icon-check></td>
                                            </tr>
                                            <tr style="margin-top: 10px;" v-if="requestHistoryItem.id === selectedRequestHistoryItem">
                                                <td colspan="4">
                                                    <div class="request-history__container">
                                                        <div style="display: flex; flex-direction: column; align-items: center; width: 32px; margin-top: 12px;">
                                                            <div style="width: 10px; height: 10px; border-radius: 100%; border: 2px solid var(--border-color--primary);"></div>
                                                            <div style="display: flex; flex-direction: column; align-items: center;">
                                                                <div style="width: 2px; background-color: var(--bg-color--primary);" :style="{ height: 46 + ((requestHistoryItem.products.length - 1) * 20) + 'px'}"></div>
                                                                <div style="width: 10px; height: 10px; border-radius: 100%; border: 2px solid var(--border-color--primary);"></div>
                                                            </div>
                                                        </div>
                                                        <div class="history-lists">
                                                            <table style="margin-bottom: 15px;">
                                                                <thead>
                                                                    <tr>
                                                                        <th style="width: 25px;"><icon-stock></icon-stock></th>
                                                                        <th style="width: 50%">Produtos</th>
                                                                        <th style="text-align: right;">Valor</th>
                                                                        <th style="width: 30px;"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr v-for="requestOrderProduct in requestHistoryItem.products" :key="requestOrderProduct.id">
                                                                        <td>{{ requestOrderProduct.quantity }}</td>
                                                                        <td style="color: #FFF; width: 24px;">{{ requestOrderProduct.product.name }}</td>
                                                                        <td style="color: #FFF; text-align: right;">
                                                                            {{ utils.formatMoney(requestOrderProduct.quantity * (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount),2,"R$ ",'.',',') }}
                                                                        </td>
                                                                        <td></td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <table style="margin-bottom: 12px;">
                                                                <thead>
                                                                    <tr>
                                                                        <th style="width: 47%;">
                                                                            <div style="display: flex;">
                                                                                <div style="width: 25px;">
                                                                                    <icon-credit-card></icon-credit-card>
                                                                                </div>
                                                                                <span style="font-weight: 800; color: #FFF;">Pagamento</span>
                                                                            </div>
                                                                        </th>
                                                                        <th>Venc.</th>
                                                                        <th style="text-align: right;">Valor</th>
                                                                        <th style="text-align: right; width: 30px"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr v-for="requestPayment in requestHistoryItem.payments" :key="requestPayment.id" @mouseover="requestPayment.showPayButton = true" @mouseleave="requestPayment.showPayButton = false">
                                                                        <td style="color: #FFF; width: 24px;">
                                                                            <span style="color: #FFF;">{{ requestPayment.paymentMethod.name }}</span>
                                                                        </td>
                                                                        <td style="color: #FFF;">
                                                                            <span v-if="requestPayment.deadlineDatetime">{{ moment(requestPayment.deadlineDatetime).format('DD/MM/YYYY') }}</span>
                                                                            <span v-else>---</span>
                                                                        </td>
                                                                        <td style="color: #FFF; text-align: right; position: relative">
                                                                            <div v-if="requestPayment.showPayButton" style="cursor: pointer; position: absolute; background-color: #FFF; left: 0; right: 0; bottom: 0; top: 0; border-radius: 3px; display: flex; justify-content: center; align-items: center; color: var(--font-color--primary); font-weight: 600;" @click="payBill(requestPayment)">
                                                                                Pagar
                                                                            </div>
                                                                            {{ utils.formatMoney(requestPayment.amount,2,"R$ ",'.',',') }}
                                                                        </td>
                                                                        <td style="text-align: right;" class="request-payment__check" :class="{paid: !requestPayment.paymentMethod.hasDeadline || requestPayment.billPaymentDate, unpaid: requestPayment.paymentMethod.hasDeadline && !requestPayment.billPaymentDate}"><icon-check></icon-check></td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <!--
                                                            <div style="display: flex; flex-direction: row; margin-top: 8px;">
                                                                <span class="push-both-sides"></span>
                                                                <a class="btn btn--edit">Editar pedido</a>
                                                            </div>
                                                            -->
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div class="limit-in-use">
                                        <span>Limite utilizado</span>
                                        <h3>{{ utils.formatMoney(limitInUse,2,'R$ ','.',',') }}</h3>
                                    </div>
                                </div>
                                <div v-else>
                                    <span>Sem cliente selecionado.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex';
    import { createHelpers } from 'vuex-map-fields'
    import _ from 'lodash';
    import Vue from 'vue'
    import moment from 'moment';
    import OrderProductsForm from './OrderProductsForm.vue';
    import EmployeeInput from './EmployeeInput.vue';
    import DraftMixin from '../../DraftMixin'

    import PromotionChannelSelectComponent from '../../_Shared/PromotionChannelSelect.vue'
    import UserSelectComponent from '../../_Shared/UserSelect.vue'

    import ClientsAPI from '../../../../../../api/clients'
    import BillsAPI from '../../../../../../api/bills'

    import { Portuguese } from 'flatpickr/dist/l10n/pt'

    const { mapFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-order-products-form': OrderProductsForm,
            'app-employee-input': EmployeeInput,
            'app-promotion-channel-select': PromotionChannelSelectComponent,
            'app-user-select': UserSelectComponent
        },
        mixins: [DraftMixin],
        data(){
            return {
                activeTab: 'history',
                productChart: null,
                datetime: null,
                averageDaysBetweenRequests: null,
                requestHistory: [],
                selectedRequestHistoryItem: null,
                datetimeSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y H:i:S',
                    dateFormat: 'Z',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: true
                },
                formPath: 'request.order',
            }
        },
        sockets: {
            ['draft/request.client.select'](ev){
                if(ev.success){
                    if(_.has(ev, 'evData.client.id')){
                        this.getClientRequestList(ev.evData.client.id)
                    }
                }
            },
            ['draft.load'](ev){
                if(ev.success){
                    if(_.has(ev, 'evData.data.request.client.id')){
                        this.getClientRequestList(ev.evData.data.request.client.id)
                    }
                }
            }
        },
        computed: {
            ...mapState('data/promotion-channels', ['promotionChannels']),
            ...mapState('data/users', ['users']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapFields([
                'form.client',
                'form.deliveryDate',
                'form.useSuggestedDeliveryDate',
                'form.obs',
                'form.order.promotionChannelId',
                'form.responsibleUserId',
            ]),
            selectedPromotionChannelName(){
                const promotionChannel = _.find(this.promotionChannels, {id: this.promotionChannelId})
                if(promotionChannel){
                    return promotionChannel.name
                }
                else {
                    return "-- NENHUM --"
                }
            },
            selectedResponsibleUserName(){
                const responsibleUser = _.find(this.users, {id: this.responsibleUserId})
                if(responsibleUser){
                    return responsibleUser.name
                }
                else {
                    return "-- NENHUM --"
                }
            },
            suggestedDeliveryDate(){
                const deliveryDate = moment(this.deliveryDate)
                if(deliveryDate.isValid()){
                    return deliveryDate.format("DD/MM/YYYY HH:mm:ss")
                }
                else {
                    return "Carregando..."
                }
            },
            limitInUse(){
                const vm = this
                return Math.round(_.sumBy(vm.requestHistory, (requestHistoryItem) => {
                    return _.sumBy(requestHistoryItem.payments, (requestPayment) => {
                        if(requestPayment.paymentMethod.hasDeadline && !requestPayment.billPaymentDate){
                            return parseFloat(requestPayment.amount)
                        }
                    })
                }))
            }
        },
        methods: {
            ...mapActions('toast', ['showToast','showError']),
            getClientRequestList(clientId){
                const vm = this
                ClientsAPI.getRequestHistory(clientId, {
                    companyId: 1
                }).then(({data}) => {
                    vm.averageDaysBetweenRequests = data.daysAverage
                    vm.requestHistory = _.map(data.requestHistory, (requestHistoryItem) => {
                        return {
                            id: requestHistoryItem.id,
                            showPayButton: false,
                            deliveryDate: requestHistoryItem.deliveryDate,
                            paid: _.every(requestHistoryItem.requestPayments, (requestPayment) => {
                                if(requestPayment.paymentMethod.hasDeadline){
                                    return !!requestPayment.billPaymentDate
                                }
                                return true
                            }),
                            productQuantity: _.sumBy(requestHistoryItem.requestOrder.requestOrderProducts,(requestOrderProduct) => {
                                return requestOrderProduct.quantity
                            }),
                            orderTotal: _.sumBy(requestHistoryItem.requestOrder.requestOrderProducts,(requestOrderProduct) => {
                                return requestOrderProduct.quantity * (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount)
                            }),
                            products: requestHistoryItem.requestOrder.requestOrderProducts,
                            payments: _.map(requestHistoryItem.requestPayments, (requestPayment) => {
                                return _.assign(requestPayment, {
                                    showPayButton: false
                                })
                            })
                        }
                    })
                }).catch((err) => {
                    console.log("Erro", err)
                })
            },
            payBill(requestPayment){
                const vm = this
                if(requestPayment.paymentMethod.hasDeadline){
                    BillsAPI.markAsPaid(requestPayment.id, {
                        companyId: 1
                    }).then((response) => {
                        if(response.success){
                            vm.getClientRequestList(vm.client.id)
                            vm.showToast({
                                type: 'success',
                                message: "Notinha marcado como pago!"
                            })
                        }
                        else {
                            vm.showError(response.error.message)
                        }
                    }).catch((err) => {
                        vm.showError("Ops... " + err.toString())
                    })
                }
                else {
                    vm.showError("Somente pagamentos com vencimento podem ser pagos por aqui")
                }
            },
            selectRequestHistoryItem(requestHistoryItem){
                if(this.selectedRequestHistoryItem === requestHistoryItem.id) this.selectedRequestHistoryItem = null
                else this.selectedRequestHistoryItem = requestHistoryItem.id
            },
            activateTab(tab){
                this.activeTab = tab;
            },
            inputDeliveryDate(value){
                const deliveryDate = moment(value)
                if(!this.useSuggestedDeliveryDate && deliveryDate.isValid()){
                    this.sync(deliveryDate.toDate(), 'deliveryDate', 'request')
                }
            },
            toggleSuggestedTime(){
                if(this.useSuggestedDeliveryDate){
                    this.useSuggestedDeliveryDate = false
                    this.deliveryDate = null
                    this.syncMultiple([
                        { value: this.deliveryDate, path: 'deliveryDate', customBaseFormPath: 'request' },
                        { value: this.useSuggestedDeliveryDate, path: 'useSuggestedDeliveryDate', customBaseFormPath: 'request' },
                    ])
                }
                else {
                    this.useSuggestedDeliveryDate = true
                    this.syncMultiple([
                        { value: null, path: 'deliveryDate', customBaseFormPath: 'request' },
                        { value: this.useSuggestedDeliveryDate, path: 'useSuggestedDeliveryDate', customBaseFormPath: 'request' },
                    ])
                }
            }
        },
        mounted(){
            const vm = this
            /*
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
            }
            Highcharts.setOptions(Highcharts.theme);
            vm.productChart = Highcharts.chart(vm.$refs.productChart, {
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
            })
            */
            vm.suggestedTimeInterval = setInterval(() => {
                if(vm.useSuggestedDeliveryDate){
                    vm.deliveryDate = moment().add(20, 'minutes').toDate()
                }
            }, 1000)
        },
        beforeDestroy(){
            if(this.suggestedTimeInterval){
                clearInterval(this.suggestedTimeInterval)
            }
        }
    }
</script>

<style lang="scss" scoped>

    .select-triggerer {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        position: relative;
        height: 24px;
        flex-grow: 1;
        align-items: center;
        justify-content: flex-end;
        span {
            padding-right: 20px;
            color: var(--font-color--8)
        }
        svg {
        }
    }

    .input-container {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        width: 100%;
        align-items: center;
    }

    .input-container span {
        color: var(--font-color--8)
    }

    /**
    Main column
     */

    .form__side-column .reports .form-group {
        border-top-left-radius: 0;
        margin-bottom: 10px;
        &:last-child {
            margin-bottom: 0;
        }
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

    .tab--request-history {
        table {
            th {
                text-align: left;
            }
            td {
                text-align: left
            }
        }
        .limit-in-use {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-end;
            margin-top: 20px;
            h3 {
                color: var(--font-color--terciary);
                font-size: 20px;
                font-weight: 400;
                margin-top: 5px;
            }
        }
        .summary__titles {
            margin-bottom: 5px;
        }
        .request-history__container {
            display: flex;
            justify-content: center;
            margin-top: 5px;
            margin-bottom: 15px;
            span {
                color: #FFF;
            }
            .history-lists {
                border-radius: 5px;
                align-self: center;
                padding: 8px 12px;
                width: 100%;
                background-color: var(--bg-color--primary);
                color: #FFF;
                display: flex;
                flex-direction: column;
                &> ul {
                    margin-bottom: 5px;
                    &:last-child {
                        margin-bottom: 0;
                    }
                }

                &> ul li {
                    margin-bottom: 5px;
                    &:last-child {
                        margin-bottom: 0;
                    }
                }

                .btn--edit {
                    background-color: #FFF;
                    color: var(--font-color--terciary)
                }

                .btn--pay {
                    background-color: #FFF;
                    color: var(--font-color--primary)
                }

                .btn--paid {
                    background-color: #FFF;
                    color: var(--font-color--5)
                }
            }

        }
    }

</style>

<style>
    .tab--request-history td.paid .colorizable {
        fill: var(--font-color--primary)
    }
    .tab--request-history td.unpaid .colorizable {
    }
    .tab--request-history .request-payment__check.paid .colorizable{
        fill: var(--font-color--secondary)
    }
    .tab--request-history .request-payment__check.unpaid .colorizable{
        fill: rgba(0,0,0,.1)
    }
</style>