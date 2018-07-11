<template>
    <div class="page--crud">
        <div>
            <h3 class="title">CAIXA - FECHAMENTO DIÁRIO</h3>
            <app-cashier-balancing-filter ref="filter" :loading="loading" @clean-selection="selectedItems = []" @search="search($event)"></app-cashier-balancing-filter>
            <app-grid ref="grid" v-model="selectedItems" :columns="columns" :rows="rows" :total="totalItems" :loading="loading">
                <div class="summary">
                    <div class="summary__item">
                        <span>Itens da lista</span>
                        <h3>{{ totalItems }}</h3>
                    </div>
                    <div class="summary__item">
                        <span>Saldo acumulado</span>
                        <h3>{{ utils.formatMoney(totalAmount,2,'R$ ','.',',') }}</h3>
                    </div>
                    <span class="push-both-sides"></span>
                    <div class="summary__item border-left">
                        <span>Selecionados</span>
                        <h3>{{ selectedItems.length }}</h3>
                    </div>
                    <div class="summary__item" style="flex-direction: row; align-items: flex-start">
                        <span style="margin-right: 10px;">Valor</span>
                        <h3 style="color: var(--font-color--8); font-weight: 400; font-size: 28px; align-self: center;">{{ utils.formatMoney(selectedItemsTotalAmount, 2,'R$ ','.',',') }}</h3>
                    </div>
                </div>
                <template slot="received" slot-scope="slotProps">
                    <a href="javascript:void(0)" class="column-received" :class="{active: slotProps.row.payload.received}" style="width: 32px">
                        <icon-check></icon-check>
                    </a>
                </template>
                <template slot="actions" slot-scope="slotProps">
                    <a href="javascript:void(0)" class="edit-row" @click.stop="recover(slotProps.row.id)">
                        <icon-edit></icon-edit>
                    </a>
                </template>

                <!--<div class="summary__item">
                    <span>Tempo médio</span>
                    <h3>15 min</h3>
                </div>
                <template slot="received" slot-scope="slotProps">
                    <a href="javascript:void(0)" :class="{active: slotProps.item.received}" style="width: 32px">
                        <icon-check></icon-check>
                    </a>
                </template>
                <template slot="actions" slot-scope="slotProps">
                    <a href="javascript:void(0)" @click="runRequestRecoverance({ requestId: slotProps.item.requestId, companyId: company.id })" style="width: 32px;">
                        <icon-edit></icon-edit>
                    </a>
                </template>-->
            </app-grid>
            <div class="footer">
                <div class="left-side" style="padding-left: 0;">
                    <img :src="logoSrc" style="margin-left: 0" />
                </div>
                <span class="push-both-sides"></span>
                <div class="right-side">
                    <div class="group">
                        <span>Com selecionados:</span>
                        <app-select v-model="form.action" :items="actionsSelectItems" :popoverProps="{placement:'top-start', horizontalOffset: -15}" title="Ação">
                            <a href="javascript:void(0)" v-if="!form.action">-- Selecione --</a>
                            <a href="javascript:void(0)" v-else>{{ _.find(actionsSelectItems, {value: form.action}).text }}</a>
                            <template slot="section" slot-scope="sectionProps">
                                <h3 style="text-align: left;">{{ sectionProps.text }}</h3>
                            </template>
                            <template slot="item" slot-scope="itemProps">
                                <span>{{itemProps.text }}</span>
                            </template>
                        </app-select>
                    </div>
                    <div class="group" v-if="form.action === 'received'">
                        <span>No horário:</span>
                        <app-datetime-selector class="input--borderless" v-model="form.receivedDate" :config="datetimeSelectorConfig" placeholder="HORÁRIO ATUAL"></app-datetime-selector>
                        <a href="javascript:void(0)" v-if="form.receivedDate" @click="form.receivedDate = null"><icon-remove></icon-remove></a>
                    </div>
                    <a class="btn btn--primary" @click="submit()">Confirmar</a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

    import config from '../../../../config';
    import utils from '../../../../utils/index';
    import moment from 'moment';
    import _ from 'lodash';

    import CashierBalancingAPI from '../../../../api/cashier-balancing'
    import CashierBalancingFilter from './CashierBalancingFilter.vue'
    import { GridCore } from '../../../../components/Utilities/Grid/index'
    import { Portuguese } from 'flatpickr/dist/l10n/pt'
    import AccountSelectComponent from '../../MorphScreen/Draft/_Shared/AccountSelect.vue'

    export default {
        components: {
            'app-cashier-balancing-filter': CashierBalancingFilter,
            'app-grid': GridCore,
            'app-account-select': AccountSelectComponent
        },
        data(){
            return {
                logoSrc: require('../../../../assets/imgs/logo-2018.png'),
                totalItems: 0,
                totalAmount: 0,
                selectedItems: [],
                rows: [],
                columns: [
                    {
                        text: 'Nº',
                        name: 'id',
                        width: 50
                    },
                    {
                        text: 'Endereço',
                        name: 'clientAddress',
                        width: 320
                    },
                    {
                        text: 'Nome',
                        name: 'name'
                    },
                    {
                        text: 'Data/Entrega',
                        name: 'deliveryDate',
                        width: 140
                    },
                    {
                        text: 'Grupo',
                        name: 'clientGroup',
                    },
                    {
                        text: 'Pagamento',
                        name: 'paymentMethod',
                    },
                    {
                        text: 'Valor',
                        name: 'formattedAmount',
                        width: 120
                    },
                    {
                        text: 'Status',
                        name: 'status',
                        width: 120
                    },
                    {
                        text: 'Recebido',
                        name: 'received',
                        style: {
                            'justify-content': 'center'
                        },
                        width: 96
                    },
                    {
                        text: 'Ações',
                        name: 'actions',
                        style: {
                            'justify-content': 'center'
                        },
                        width: 72
                    }
                ],
                filterForm: {
                    deliveryDate: [[]],
                    deliveryDateToSend: [[]],
                    clientGroup: [],
                    paymentMethod: [],
                    responsibleUser: [],
                    status: []
                },
                form: {
                    account: null,
                    action: 'received',
                    receivedDate: null,
                    deliveryDate: [[]],
                    deliveryDateToSend: [[]],
                    clientGroup: [],
                    paymentMethod: [],
                    responsibleUser: [],
                    status: []
                },
                loading: true,
                datetimeSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y H:i:S',
                    dateFormat: 'Z',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: true
                }
            }
        },
        computed: {
            ...mapState('auth',['company']),
            ...mapState('data/users',['users']),
            ...mapState('data/accounts',['accounts']),
            ...mapState('data/client-groups',['clientGroups']),
            ...mapState('data/payment-methods',['paymentMethods']),
            ...mapState('data/request-status',['requestStatusList']),
            ...mapGetters('data/request-status',['requestStatusListSelectItems']),
            selectedItemsTotalAmount(){
                const vm = this
                return _.sumBy(vm.selectedItems, (selectedItem) => {
                    return parseFloat(selectedItem.payload.amount)
                })
            },
            accountsSelectItems(){
                return _.map(this.accounts, (account) => {
                    return {
                        value: account.id,
                        text: account.name
                    }
                })
            },
            actionsSelectItems(){
                return [
                    {
                        text: 'Marcar como recebido',
                        value: 'received'
                    }
                ]
            },
        },
        methods: {
            ...mapActions('draft/request',['runRequestRecoverance']),
            ...mapActions('toast',['showToast']),
            onGridScroll(ev){
                this.$refs.filter.apply({
                    offset: Math.ceil(ev.from),
                    limit: Math.ceil(ev.to - ev.from)
                })
            },
            getStatus(status){
                switch(status){
                    case "pending":
                        return "Pendente"
                        break;
                    case "in-displacement":
                        return "Em deslocamento"
                        break;
                    case "canceled":
                        return "Cancelado"
                        break;
                    case "finished":
                        return "Finalizado"
                        break;
                    default:
                        return "---"
                }
            },
            recover(requestId){
                this.runRequestRecoverance({ requestId, companyId: this.company.id })
            },
            search({ filterData = {}, params = {} } = {}){
                const requestParams = {
                    /*offset: Math.ceil(ev.from),
                    limit: Math.ceil(ev.to - ev.from),*/
                    offset: 0,
                    limit: 99999,
                    filter: btoa(JSON.stringify(filterData)),
                    companyId: this.company.id
                }

                _.assign(requestParams, params)

                this.loading = true
                CashierBalancingAPI.getList(requestParams).then(({data}) => {
                    console.log("getList",data)
                    this.rows = _.map(data.list.rows, (row) => {
                        return {
                            id: row.id,
                            columns: [
                                {
                                    column: 'id',
                                    text: row.id
                                },
                                {
                                    column: 'clientAddress',
                                    text(){
                                        const hasClientAddress = _.has(row,'request.requestClientAddresses[0].clientAddress.address')
                                        let clientAddress
                                        if(hasClientAddress){
                                            clientAddress = _.get(row,'request.requestClientAddresses[0].clientAddress')
                                            clientAddress = clientAddress.address.name + ', ' + ((clientAddress.number) ? clientAddress.number : 'SN')
                                        }
                                        else {
                                            clientAddress = '---'
                                        }
                                        return clientAddress
                                    },
                                    showTitle: true
                                },
                                {
                                    column: 'name',
                                    text: _.get(row,'request.client.name', '---'),
                                    showTitle: true
                                },
                                {
                                    column: 'clientGroup',
                                    text: _.get(row,'request.client.clientGroup.name', '---')
                                },
                                {
                                    column: 'deliveryDate',
                                    text: moment(row.request.deliveryDate).format("DD/MM HH:mm"),
                                },
                                {
                                    column: 'paymentMethod',
                                    text: row.paymentMethod.name
                                },
                                {
                                    column: 'formattedAmount',
                                    text: utils.formatMoney(row.amount, 2,'R$ ','.',','),
                                },
                                {
                                    column: 'status',
                                    text: this.getStatus(row.request.status),
                                },
                                {
                                    column: 'received',
                                    html: true,
                                    style: {
                                        'justify-content': 'center'
                                    }
                                },
                                {
                                    column: 'actions',
                                    html: true,
                                    style: {
                                        'justify-content': 'center'
                                    }
                                }
                            ],
                            payload: {
                                amount: row.amount,
                                received: row.received
                            }
                        }
                    })
                    this.totalAmount = data.totalAmount
                    this.totalItems = data.list.count
                    this.loading = false
                }).catch(() => {
                    this.selectedItems = []
                })
            },
            submit(){
                const vm = this
                if(!vm.form.action){
                    vm.showToast({
                        type: 'error',
                        message: "Você deve selecionar uma ação!"
                    })
                    return
                }
                if(!vm.selectedItems.length){
                    vm.showToast({
                        type: 'error',
                        message: "Você não selecionou nenhum item!"
                    })
                    return
                }
                if(vm.form.action === 'received'){
                    CashierBalancingAPI.markAsReceived({
                        receivedDate: vm.form.receivedDate,
                        requestPaymentIds: _.map(_.filter(vm.selectedItems, (selectedItem) => {
                            return selectedItem
                        }), (selectedItem) => {
                            return selectedItem.id
                        })
                    }, {
                        companyId: vm.company.id
                    }).then((res) => {
                        vm.selectedItems = []
                        vm.$refs.filter.apply()
                    })
                }
            }
        },
        mounted(){
            this.search()
        }
    }
</script>

<style lang="scss">
    .page--crud {
        display: flex;
        width: 100%;
        justify-content: center;
        background-color: var(--bg-color--7);

        a.column-received.active .colorizable {
            fill: var(--font-color--primary)
        }

        a.edit-row {
            padding: 0 5px;
        }

        a.edit-row .colorizable {
            fill: var(--font-color)
        }

        a.edit-row:hover .colorizable {
            fill: var(--font-color--primary)
        }

        /* title */

        h3.title {
            font-size: 16px;
            text-transform: uppercase;
            color: var(--font-color--7)
        }

        /* filter */

        ul.filter-menu {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            padding-bottom: 20px;
        }
        ul.filter-menu li {
            margin: 0 5px;
            position: relative;
        }
        ul.filter-menu >>> li.datetime-selector input {
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            position: absolute;
            overflow: hidden;
            z-index: -1;
        }
        ul.filter-menu li a {
            height: 32px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: var(--font-color--7)
        }
        ul.filter-menu li a.right-padding {
            padding-right: 30px;
        }
        ul.filter-menu li a.clear-filter {
            position: absolute;
            top: 10px;
            right: 10px;
        }
        ul.filter-menu li a .primary {
            color: var(--font-color--primary);
            font-weight: 600;
        }
        ul.filter-menu li a .dot-separator.primary {
            background-color: var(--border-color--primary)
        }
        ul.filter-menu li a .secondary {
            color: var(--font-color--secondary);
            font-weight: 600;
        }
        ul.filter-menu li a .dot-separator.secondary {
            background-color: var(--border-color--secondary)
        }
        ul.filter-menu li a .terciary {
            color: var(--font-color--terciary);
            font-weight: 600;
        }
        ul.filter-menu li a .dot-separator.terciary {
            background-color: var(--border-color--terciary)
        }

        /* summary */

        .summary {
            display: flex;
            flex-direction: row;
            flex-shrink: 0;
            padding: 20px 20px;
            border-top: 1px solid var(--bg-color--8);

            .summary__item {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                padding: 0 20px;
                border-right: 1px solid var(--bg-color--8)
            }

            .summary__item.border-left {
                border-left: 1px solid var(--bg-color--8)
            }

            .summary__item:last-child {
                border-right: 0
            }
        }

        /* footer */

        div.footer {
            padding: 40px 0;
            display: flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
        }

        div.footer a {
            text-transform: uppercase;
        }

        div.footer span {
            font-weight: 600;
        }

        div.footer .left-side {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding-left: 20px;
        }

        div.footer .left-side > * {
            margin: 0 5px;
        }

        div.footer .right-side {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding-right: 20px;
        }

        div.footer .right-side .group {
            border: 1px solid var(--bg-color--9);
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0 15px;
            border-radius: 10px;
            margin-right: 10px;
            height: 32px;
        }

        div.footer .right-side > a {
            height: 30px;
        }

        div.footer .right-side .group .dot-separator {
            margin: 0 10px;
        }

        div.footer .right-side .group span {
            margin-right: 10px;
            white-space: nowrap
        }

        div.footer .right-side > * {
            margin: 0 5px;
        }

        div.footer .right-side > *:last-child {
            margin: 0 0 0 5px;
        }
    }
    .page--crud > div {
        width: 96%;
        text-align: center;
        padding-top: 40px;
        display: flex;
        flex-direction: column;
    }
    .page--crud > div > h3 {
        padding-bottom: 30px;
    }
</style>