<template>
    <div class="page--crud">
        <div>
            <h3 class="title">CAIXA - FECHAMENTO DIÁRIO</h3>
            <app-cashier-balancing-filter ref="filter" @clean-selection="selectedItems = []" @search="search($event)"></app-cashier-balancing-filter>
            <app-grid ref="grid" v-model="selectedItems" :columns="columns" :items.sync="items" :total="totalItems" :loading="loadingList"
                      @scroll="onGridScroll($event)">
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
                <!--
                <div class="summary__item">
                    <span>Tempo médio</span>
                    <h3>15 min</h3>
                </div>
                -->
                <template slot="paid" slot-scope="slotProps">
                    <a href="javascript:void(0)" :class="{active: slotProps.item.paid}" style="width: 32px">
                        <icon-check></icon-check>
                    </a>
                </template>
                <template slot="settled" slot-scope="slotProps">
                    <a href="javascript:void(0)" :class="{active: slotProps.item.settled}" style="width: 50px">
                        <icon-check></icon-check>
                    </a>
                </template>
                <template slot="actions" slot-scope="slotProps">
                    <a href="javascript:void(0)" @click="runRequestRecoverance({ requestId: card.request.id, companyId: company.id })" style="width: 32px;">
                        <icon-edit></icon-edit>
                    </a>
                </template>
            </app-grid>
            <div class="footer">
                <div class="left-side" style="padding-left: 0;">
                    <img :src="logoSrc" style="margin-left: 0" />
                </div>
                <span class="push-both-sides"></span>
                <div class="right-side">
                    <div class="group">
                        <span>Com selecionados:</span>
                        <app-select v-model="form.action" :items="actionsSelectItems" title="Ação">
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
                    <div class="group" v-if="form.action === 'settled'">
                        <span>No horário:</span>
                        <app-datetime-selector class="input--borderless" v-model="form.settledDatetime" :config="datetimeSelectorConfig" placeholder="HORÁRIO ATUAL"></app-datetime-selector>
                        <a href="javascript:void(0)" v-if="form.settledDatetime" @click="form.settledDatetime = null"><icon-remove></icon-remove></a>
                    </div>
                    <div class="group" v-if="form.action === 'settled'">
                        <span>Conta:</span>
                        <app-select v-model="form.account" :items="accountsSelectItems" title="Conta">
                            <a href="javascript:void(0)" v-if="!form.account">-- Selecione --</a>
                            <a href="javascript:void(0)" v-else>{{ _.find(accountsSelectItems, {value: form.account}).text }}</a>
                            <template slot="section" slot-scope="sectionProps">
                                <h3 style="text-align: left;">{{ sectionProps.text }}</h3>
                            </template>
                            <template slot="item" slot-scope="itemProps">
                                <span>{{itemProps.text }}</span>
                            </template>
                        </app-select>
                    </div>
                    <a class="btn btn--primary" @click="submit()">Confirmar</a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

    import utils from '../../../../utils/index';
    import moment from 'moment';
    import _ from 'lodash';

    import CashierBalancingAPI from '../../../../api/cashier-balancing'
    import CashierBalancingFilter from './CreditBillsFilter.vue'
    import GridComponent from '../../../../components/Utilities/Grid.vue'
    import { Portuguese } from 'flatpickr/dist/l10n/pt'

    export default {
        components: {
            'app-cashier-balancing-filter': CashierBalancingFilter,
            'app-grid': GridComponent
        },
        data(){
            return {
                logoSrc: require('../../../../assets/imgs/logo-2018.png'),
                totalItems: 0,
                totalAmount: 0,
                selectedItems: [],
                items: [],
                columns: [
                    {
                        text: 'Nº',
                        name: 'id',
                    },
                    {
                        text: 'Nome',
                        name: 'name'
                    },
                    {
                        text: 'Data/Hora',
                        name: 'date',
                    },
                    {
                        text: 'Grupo Cliente',
                        name: 'clientGroup',
                    },
                    {
                        text: 'Meio de Pagamento',
                        name: 'paymentMethod',
                    },
                    {
                        text: 'Valor',
                        name: 'formattedAmount',
                    },
                    {
                        text: 'Status',
                        name: 'status'
                    },
                    {
                        text: 'Recebido',
                        name: 'paid',
                        html: true
                    },
                    {
                        text: 'Acert.',
                        name: 'settled',
                        html: true
                    },
                    {
                        text: 'Ações',
                        name: 'actions',
                        html: true
                    }
                ],
                filterForm: {
                    dateCreated: [[]],
                    dateCreatedToSend: [[]],
                    clientGroup: [],
                    paymentMethod: [],
                    responsibleUser: [],
                    status: []
                },
                form: {
                    account: null,
                    action: null,
                    settledDatetime: null,
                    dateCreated: [[]],
                    dateCreatedToSend: [[]],
                    clientGroup: [],
                    paymentMethod: [],
                    responsibleUser: [],
                    status: []
                },
                loadingList: true,
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
                return _.sumBy(this.selectedItems, (selectedItem) => {
                    return parseFloat(selectedItem.amount)
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
                        value: 'paid'
                    },
                    {
                        text: 'Marcar como conferido',
                        value: 'settled'
                    }
                ]
            },
        },
        methods: {
            ...mapActions('draft/request',['runRequestRecoverance']),
            ...mapActions('toast',['showToast']),
            onGridScroll(ev){
                console.log("INICIOOU 1")
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
                    case "sent":
                        return "Enviado"
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
            search({ filterData = {}, params = {} }){
                const requestParams = {
                    /*offset: Math.ceil(ev.from),
                    limit: Math.ceil(ev.to - ev.from),*/
                    offset: 0,
                    limit: 30,
                    filter: btoa(JSON.stringify(filterData)),
                    companyId: this.company.id
                }

                _.assign(requestParams, params)

                this.loadingList = true
                CashierBalancingAPI.getList(requestParams).then(({data}) => {

                    this.items = _.map(data.list.rows, (row) => {
                        let settled = false
                        if(row.requestPaymentTransactions.length) {
                            row.requestPaymentTransactions.sort((a, b) => {
                                return new Date(a.dateCreated) - new Date(b.dateCreated)
                            })
                            if(_.last(row.requestPaymentTransactions).action === 'settle.origin' || _.last(row.requestPaymentTransactions).action === 'settle.destination'){
                                settled = true
                            }
                        }
                        return {
                            id: row.id,
                            amount: row.amount,
                            formattedAmount: utils.formatMoney(row.amount, 2,'R$ ','.',','),
                            date: moment(row.dateCreated).format("DD/MM/YYYY HH:mm"),
                            paid: row.paid,
                            name: row.request.client.name,
                            clientGroup: _.get(row,'request.client.clientGroup.name', '---'),
                            paymentMethod: row.paymentMethod.name,
                            settled,
                            requestId: row.requestId,
                            status: this.getStatus(row.request.status)
                        }
                    })
                    this.totalAmount = data.totalAmount
                    this.totalItems = data.list.count
                    this.loadingList = false

                }).catch(() => {
                    this.items = []
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
                if(vm.form.action === 'paid'){
                    CashierBalancingAPI.markAsPaid({
                        requestPaymentIds: _.map(vm.selectedItems, (selectedItem) => {
                            return selectedItem.id
                        }),
                        accountId: vm.form.account
                    }, {
                        companyId: vm.company.id
                    }).then((res) => {
                        vm.selectedItems = []
                        vm.$refs.filter.apply()
                    })
                }
                else if(vm.form.action === 'settled'){
                    if(!vm.form.account){
                        vm.showToast({
                            type: 'error',
                            message: "Você deve selecionar uma conta de destino!"
                        })
                        return
                    }
                    CashierBalancingAPI.markAsSettled({
                        settledDatetime: vm.form.settledDatetime,
                        requestPaymentIds: _.map(vm.selectedItems, (selectedItem) => {
                            return selectedItem.id
                        }),
                        accountId: vm.form.account
                    }, {
                        companyId: vm.company.id
                    }).then((res) => {
                        vm.selectedItems = []
                        vm.$refs.filter.apply()
                    })
                }
            }
        }
    }
</script>

<style scoped>
    .page--crud {
        display: flex;
        flex-grow: 1;
        justify-content: center;
        background-color: var(--bg-color--7)
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

    .page--crud >>> a .colorizable {
        fill: var(--font-color)
    }

    .page--crud >>> a.active .colorizable {
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
</style>