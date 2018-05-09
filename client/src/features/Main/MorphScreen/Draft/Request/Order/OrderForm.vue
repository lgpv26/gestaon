<template>
    <div style="display: flex; flex-grow: 1; flex-direction: row">
            <div class="form__main-column" style="display: flex; flex-direction: column; margin-right: 10px;">
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
                        <app-promotion-channel-select v-model="promotionChannelId" @change="sync($event,'promotionChannelId')">
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
                            <span v-if="useSuggestedDeadlineDatetime">{{ suggestedDeadlineDatetime }}</span>
                            <app-datetime-selector class="input--borderless" v-model="deadlineDatetime" @input="inputDeadlineDatetime($event)"
                                v-else :config="datetimeSelectorConfig" placeholder="..."></app-datetime-selector>
                            <span class="push-both-sides"></span>
                            <a href="javascript:void(0)" v-if="!useSuggestedDeadlineDatetime" style="white-space: nowrap; margin-left: 10px;" @click="toggleSuggestedTime">SUGERIDO</a>
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
                        <app-user-select v-model="responsibleUserId" @change="sync($event,'responsibleUserId','request')">
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
            </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import { createHelpers } from 'vuex-map-fields'
    import _ from 'lodash';
    import moment from 'moment';
    import Highcharts from 'highcharts';
    import OrderProductsForm from './OrderProductsForm.vue';
    import EmployeeInput from './EmployeeInput.vue';
    import StorageInput from './StorageInput.vue';
    import DraftMixin from '../../DraftMixin'

    import PromotionChannelSelectComponent from '../../_Shared/PromotionChannelSelect.vue'
    import UserSelectComponent from '../../_Shared/UserSelect.vue'

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
                activeTab: 'chart',
                productChart: null,
                datetime: null,
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
        computed: {
            ...mapState('data/promotion-channels', ['promotionChannels']),
            ...mapState('data/users', ['users']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapFields([
                'form.deadlineDatetime',
                'form.useSuggestedDeadlineDatetime',
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
            suggestedDeadlineDatetime(){
                const deadlineDatetime = moment(this.deadlineDatetime)
                if(deadlineDatetime.isValid()){
                    return deadlineDatetime.format("DD/MM/YYYY HH:mm:ss")
                }
                else {
                    return "Carregando..."
                }
            }
        },
        methods: {
            activateTab(tab){
                this.activeTab = tab;
            },
            inputDeadlineDatetime(value){
                const deadlineDatetime = moment(value)
                if(!this.useSuggestedDeadlineDatetime && deadlineDatetime.isValid()){
                    this.sync(deadlineDatetime.toDate(), 'deadlineDatetime', 'request')
                }
            },
            toggleSuggestedTime(){
                if(this.useSuggestedDeadlineDatetime){
                    this.useSuggestedDeadlineDatetime = false
                    this.deadlineDatetime = null
                    this.syncMultiple([
                        { value: this.deadlineDatetime, path: 'deadlineDatetime', customBaseFormPath: 'request' },
                        { value: this.useSuggestedDeadlineDatetime, path: 'useSuggestedDeadlineDatetime', customBaseFormPath: 'request' },
                    ])
                }
                else {
                    this.useSuggestedDeadlineDatetime = true
                    this.syncMultiple([
                        { value: null, path: 'deadlineDatetime', customBaseFormPath: 'request' },
                        { value: this.useSuggestedDeadlineDatetime, path: 'useSuggestedDeadlineDatetime', customBaseFormPath: 'request' },
                    ])
                }
            }
        },
        mounted(){
            const vm = this
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
            vm.suggestedTimeInterval = setInterval(() => {
                if(vm.useSuggestedDeadlineDatetime){
                    vm.deadlineDatetime = moment().add(20, 'minutes').toDate()
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

    div.ms-form form .form__side-column {
        width: 400px;
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