<template>
    <form :class="{'active': order.active}">
        <div class="form__content" v-show="order.active">
            <div class="form__main-column" style="margin-right: 10px;">
                <div class="form-groups">
                    <div class="form-group" style="padding: 0; background: transparent;">
                        <div class="form-group__header">
                            <h3 style="margin-right: 10px;">Venda</h3><icon-local></icon-local>
                            <span class="push-both-sides"></span>
                            <span style="margin-right: 10px;">Canal de divulgação</span>
                            <a class="btn btn--border-only">Tele-Entrega</a>
                        </div>
                        <div class="form-group__content">
                            <table class="order-products" style="width: 100%; text-align: left;">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th class="content-size" style="text-align: right;">Quant.</th>
                                        <th style="text-align: right; width: 120px;">Valor Un.</th>
                                        <th style="text-align: right; width: 120px;">Desconto Un.</th>
                                        <th style="text-align: right; width: 120px;">Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input type="text" placeholder="ESCOLHA UM PRODUTO" /></td>
                                        <td class="content-size"><input type="text" style="text-align: center;" /></td>
                                        <td style="width: 120px;"><money  style="text-align: right;"/></td>
                                        <td style="width: 120px;"><money type="text" style="text-align: right;" /></td>
                                        <td style="width: 120px;"><money type="text" style="text-align: right;" /></td>
                                        <td style="text-align: center;"><icon-remove></icon-remove></td>
                                    </tr>
                                    <tr>
                                        <td><input type="text" /></td>
                                        <td class="content-size"><input type="text" style="text-align: center;" /></td>
                                        <td style="width: 120px;"><input type="text"  style="text-align: right;"/></td>
                                        <td style="width: 120px;"><input type="text" style="text-align: right;" /></td>
                                        <td style="width: 120px;"><input type="text" style="text-align: right;" /></td>
                                        <td style="text-align: center;"><icon-add></icon-add></td>
                                    </tr>
                                    <tr>
                                        <td colspan="3"></td>
                                        <td style="text-align: right; font-size: 16px; font-weight: 600;">R$ XX,XX</td>
                                        <td style="text-align: right; font-size: 18px; font-weight: 600; color: var(--font-color--secondary)">R$ XX,XX</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form__side-column">
                <div class="form-groups">
                    <div class="form-group">
                        <div class="product-chart" ref="productChart"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!order.active">Incluir uma <span style="color: var(--secondary-color)">venda</span> neste atendimento</span>
            <span class="push-both-sides"></span>
            <h3>VENDA</h3> <app-switch style="float: right;" v-model="order.active" @changed="commitSocketChanges('order.active')"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import Highcharts from 'highcharts';

    export default {
        components: {
        },
        props: ['order'],
        data(){
            return {
                form: {
                    orderProducts: [
                        {},
                        {}
                    ]
                },
                products: [
                    {
                        name: 'GÁS LP 13KG'
                    }
                ]
            }
        },
        computed: {
        },
        methods: {
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            }
        },
        mounted(){
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
            const productChart = Highcharts.chart(this.$refs.productChart, {
                chart: {
                    type: 'column',
                    height: 240
                },
                title: false,
                subtitle: false,
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: false
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            formatter(){
                                return this.y.toFixed(2).replace('.', ',');
                            }
                        }
                    }
                },
                tooltip: {
                    headerFormat: null,
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },
                series: [{
                    name: 'Data',
                    colorByPoint: true,
                    data: [{
                        name: 'Jan/2018',
                        y: 70
                    }, {
                        name: 'Fev/2018',
                        y: 71
                    }, {
                        name: 'Mar/2018',
                        y: 75
                    }, {
                        name: 'Abr/2018',
                        y: 78
                    }, {
                        name: 'Mai/2018',
                        y: 82
                    }, {
                        name: 'Jun/2018',
                        y: 80
                    }, {
                        name: '',
                        y: 82
                    }]
                }]
            });
        }
    }
</script>

<style scoped>
    div.ms-form form .form__side-column {
        width: 400px;
    }
    .form__main-column .form-group__header {
        background-image: none;
        padding-bottom: 0;
    }
    .order-products td, .order-products th {
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