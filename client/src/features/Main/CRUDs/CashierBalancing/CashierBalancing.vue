<template>
    <div class="page--crud">
        <div>
            <h3 class="title">CAIXA - FECHAMENTO DIÁRIO</h3>
            <ul class="filter-menu">
                <li class="datetime-selector">
                    <a href="javascript:void(0)" class="clear-filter" v-if="selectedDays" @click="clearCreatedDateFilter()"><icon-remove></icon-remove></a>
                    <a class="btn btn--border-only" :class="{'right-padding': selectedDays}" @click="openCreatedDateSelector()">
                        Intervalo
                        <div class="dot-separator primary" v-if="selectedDays" style="margin: 0 10px;"></div>
                        <span class="primary" v-if="selectedDays">{{ selectedDays }} dia(s)</span>
                    </a>
                    <app-datetime-selector ref="createdDateSelector" class="input--borderless" v-model="form.dateCreated[0]" @on-change="onFilterChange($event)" @input="onCreatedDateChange($event)" :config="filterDatetimeSelectorConfig" placeholder="..."></app-datetime-selector>
                </li>
                <li>
                    <app-select v-model="form.clientGroup" :items="selectClientGroups" :multiple="true" :verticalOffset="5" title="Grupo do cliente"
                        @change="onFilterChange($event)">
                        <a class="btn btn--border-only">
                            Grupo
                            <div class="dot-separator secondary" v-if="form.clientGroup.length" style="margin: 0 10px;"></div>
                            <span class="secondary" v-if="form.clientGroup.length">{{ form.clientGroup.length }}</span>
                        </a>
                        <template slot="section" slot-scope="sectionProps">
                            <h3 style="text-align: left;">{{ sectionProps.text }}</h3>
                        </template>
                        <template slot="item" slot-scope="itemProps">
                            <span>{{itemProps.text }}</span>
                        </template>
                    </app-select>
                </li>
                <li>
                    <app-select v-model="form.paymentMethod" :items="selectPaymentMethods" :multiple="true" :verticalOffset="5" title="Meio de pagamento"
                        @change="onFilterChange($event)">
                        <a class="btn btn--border-only">
                            <icon-flag style="margin-right: 10px;"></icon-flag>
                            Meio de pagamento
                            <div class="dot-separator secondary" v-if="form.paymentMethod.length" style="margin: 0 10px;"></div>
                            <span class="secondary" v-if="form.paymentMethod.length">{{ form.paymentMethod.length }}</span>
                        </a>
                        <template slot="section" slot-scope="sectionProps">
                            <h3 style="text-align: left;">{{ sectionProps.text }}</h3>
                        </template>
                        <template slot="item" slot-scope="itemProps">
                            <span>{{itemProps.text }}</span>
                        </template>
                    </app-select>
                </li>
                <li>
                    <app-select v-model="form.responsibleUser" :items="selectUsers" :multiple="true" :verticalOffset="5" title="Responsável"
                        @change="onFilterChange($event)">
                        <a class="btn btn--border-only">
                            <icon-flag style="margin-right: 10px;"></icon-flag>
                            Responsável
                            <div class="dot-separator primary" v-if="form.responsibleUser.length" style="margin: 0 10px;"></div>
                            <span class="primary" v-if="form.responsibleUser.length">{{ form.responsibleUser.length }}</span>
                        </a>
                        <template slot="section" slot-scope="sectionProps">
                            <h3 style="text-align: left;">{{ sectionProps.text }}</h3>
                        </template>
                        <template slot="item" slot-scope="itemProps">
                            <span>{{itemProps.text }}</span>
                        </template>
                    </app-select>
                </li>
                <li>
                    <app-select v-model="form.status" :items="selectStatus" :multiple="true" :verticalOffset="5" title="Status"
                        @change="onFilterChange($event)">
                        <a class="btn btn--border-only">
                            <icon-status style="margin-right: 10px;"></icon-status>
                            Status
                            <div class="dot-separator terciary" v-if="form.status.length" style="margin: 0 10px;"></div>
                            <span class="terciary" v-if="form.status.length">{{ form.status.length }}</span>
                        </a>
                        <template slot="section" slot-scope="sectionProps">
                            <h3 style="text-align: left;">{{ sectionProps.text }}</h3>
                        </template>
                        <template slot="item" slot-scope="itemProps">
                            <span>{{itemProps.text }}</span>
                        </template>
                    </app-select>
                </li>
            </ul>
            <app-grid ref="grid" v-model="selectedItems" :columns="columns" :items.sync="items" :total="totalItems" :loading="loadingList"
                @input="onGridInput($event)" @scroll="onGridScroll($event)">
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
                <template slot="actions" slot-scope="slotProps">
                    <a href="javascript:void(0)" :class="{active: slotProps.item.paid}" style="width: 32px; margin-right: 10px;">
                        <icon-check></icon-check>
                    </a>
                    <a href="javascript:void(0)" style="width: 32px; margin-right: 10px;">
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
                        <span>No horário:</span>
                        <app-datetime-selector class="input--borderless" v-model="deadlineDatetime" :config="datetimeSelectorConfig" placeholder="..."
                        @input="inputDeadlineDatetime($event)"></app-datetime-selector>
                    </div>
                    <div class="group">
                        <span>Com selecionados:</span>
                        <a>Marcar como pago</a>
                    </div>
                    <a class="btn btn--primary">Confirmar</a>
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
    import GridComponent from '../../../../components/Utilities/Grid.vue'
    import { Portuguese } from 'flatpickr/dist/l10n/pt'

    export default {
        components: {
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
                        text: 'Ações',
                        name: 'actions',
                        html: `<icon-status style="margin-right: 10px;"></icon-status>`
                    }
                ],
                form: {
                    dateCreated: [[]],
                    clientGroup: [],
                    paymentMethod: [],
                    responsibleUser: [],
                    status: []
                },
                loadingList: true,
                selectedDays: 0,
                deadlineDatetime: null,
                datetimeSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y H:i:S',
                    dateFormat: 'Z',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: true
                },
                filterDatetimeSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y H:i:S',
                    dateFormat: 'Z',
                    mode: 'range',
                    locale: Portuguese,
                    enableTime: false,
                    clickOpens: false,
                    defaultDate: [new Date(), new Date()]
                },
            }
        },
        computed: {
            ...mapState('auth',['company']),
            ...mapState('data/users',['users']),
            ...mapState('data/client-groups',['clientGroups']),
            ...mapState('data/payment-methods',['paymentMethods']),
            selectedItemsTotalAmount(){
                return _.sumBy(this.selectedItems, (selectedItem) => {
                    return parseFloat(selectedItem.amount)
                })
            },
            selectUsers(){
                return _.map(this.users, (user) => {
                    return {
                        value: user.id,
                        text: user.name
                    }
                })
            },
            selectClientGroups(){
                return _.map(this.clientGroups, (clientGroup) => {
                    return {
                        value: clientGroup.id,
                        text: clientGroup.name
                    }
                })
            },
            selectPaymentMethods(){
                return _.map(this.paymentMethods, (paymentMethod) => {
                    return {
                        value: paymentMethod.id,
                        text: paymentMethod.name
                    }
                })
            },
            selectStatus(){
                return [
                    {
                        value: 'pending',
                        text: 'PENDENTE'
                    },
                    {
                        value: 'finished',
                        text: 'FINALIZADO'
                    }
                ]
            }
        },
        methods: {
            onGridInput(ev){
                console.log(ev)
            },
            onFilterChange(ev){
                this.applyFilter()
            },
            onGridScroll(ev){
                this.applyFilter({
                    offset: Math.ceil(ev.from),
                    limit: Math.ceil(ev.to - ev.from)
                })
            },
            onCreatedDateChange(value){
                const values = value.split(" ")
                if(values.length > 1){
                    value = [_.first(values),_.last(values)]
                    this.selectedDays = moment(value[1]).diff(moment(value[0]), 'days') + 1
                }
                else if(value.trim() !== ''){
                    this.selectedDays = 1
                }
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
            clearCreatedDateFilter(){
                this.selectedDays = 0
                this.form.dateCreated = [[]]
            },
            openCreatedDateSelector(){
                this.$refs.createdDateSelector.fp.open()
            },
            search(filterData = {}, params = {}){

                /*this.items = []*/

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
                        return {
                            id: row.id,
                            amount: row.amount,
                            formattedAmount: utils.formatMoney(row.amount, 2,'R$ ','.',','),
                            date: moment(row.dateCreated).format("DD/MM/YYYY HH:mm"),
                            paid: row.paid,
                            name: row.request.client.name,
                            clientGroup: row.request.client.clientGroup.name,
                            paymentMethod: row.paymentMethod.name,
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
            applyFilter(params = {}){
                const filterData = utils.removeReactivity(this.form)
                if(!filterData.dateCreated[0] || !filterData.dateCreated[0].length){
                    _.assign(filterData,{
                        dateCreated: null
                    })
                }
                else {
                    const values = filterData.dateCreated[0].split(" ")
                    if(values.length > 1){
                        filterData.dateCreated = [[_.first(values),_.last(values)]]
                    }
                }
                if(!filterData.clientGroup.length){
                    _.assign(filterData,{
                        clientGroup: null
                    })
                }
                if(!filterData.responsibleUser.length){
                    _.assign(filterData,{
                        responsibleUser: null
                    })
                }
                if(!filterData.paymentMethod.length){
                    _.assign(filterData,{
                        paymentMethod: null
                    })
                }
                if(!filterData.status.length){
                    _.assign(filterData,{
                        status: null
                    })
                }

                this.selectedItems = []

                this.search(filterData,params)

                /*const base64DecodedFilterData = atob(base64EncodedFilterData)
                console.log(JSON.parse(base64DecodedFilterData))*/
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