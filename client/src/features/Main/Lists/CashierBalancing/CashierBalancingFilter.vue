<template>
    <ul class="filter-menu">
        <li class="datetime-selector">
            <a href="javascript:void(0)" class="clear-filter" v-if="selectedDays" @click="clearCreatedDateFilter()"><icon-remove></icon-remove></a>
            <a class="btn btn--border-only" :class="{'right-padding': selectedDays}" @click="openCreatedDateSelector()">
                Intervalo
                <div class="dot-separator primary" v-if="selectedDays" style="margin: 0 10px;"></div>
                <span class="primary" v-if="selectedDays">{{ selectedDays }} dia(s)</span>
            </a>
            <app-datetime-selector ref="createdDateSelector" class="input--borderless" :value="form.deliveryDate[0]"
                                   @input="onCreatedDateChange($event)" :config="filterDatetimeSelectorConfig" placeholder="..."></app-datetime-selector>
        </li>
        <li v-if="false">
            <app-select v-model="form.clientGroup" :popoverProps="{placement:'bottom-start'}" :items="clientGroupsSelectItems" :multiple="true" :verticalOffset="5" title="Grupo do cliente"
                        @change="onFilterChange($event)">
                <a class="btn btn--border-only">
                    Grupo
                    <div class="dot-separator secondary" v-if="form.clientGroup.length" style="margin: 0 10px;"></div>
                    <span class="secondary" v-if="form.clientGroup.length === 1">
                        {{ _.find(clientGroupsSelectItems, { value: _.first(form.clientGroup) }).text }}
                    </span>
                    <span class="secondary" v-else-if="form.clientGroup.length">
                        {{ form.clientGroup.length }}
                    </span>
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
            <app-select v-model="form.paymentMethod" :popoverProps="{placement:'bottom-start'}" :items="selectPaymentMethods" :multiple="true" :verticalOffset="5" title="Meio de pagamento"
                        @change="onFilterChange($event)">
                <a class="btn btn--border-only">
                    <icon-flag style="margin-right: 10px;"></icon-flag>
                    Meio de pagamento
                    <div class="dot-separator secondary" v-if="form.paymentMethod.length" style="margin: 0 10px;"></div>
                    <span class="secondary" v-if="form.paymentMethod.length === 1">
                        {{ _.find(selectPaymentMethods, { value: _.first(form.paymentMethod) }).text }}
                    </span>
                    <span class="secondary" v-else-if="form.paymentMethod.length">
                        {{ form.paymentMethod.length }}
                    </span>
                </a>
                <template slot="section" slot-scope="sectionProps">
                    <h3 style="text-align: left;">{{ sectionProps.text }}</h3>
                </template>
                <template slot="item" slot-scope="itemProps">
                    <span>{{itemProps.text }}</span>
                </template>
            </app-select>
        </li>
        <li v-if="false">
            <app-select v-model="form.product" :popoverProps="{placement:'bottom-start'}" :items="productsSelectItems" :multiple="true" :verticalOffset="5" title="Responsável"
                        @change="onFilterChange($event)">
                <a class="btn btn--border-only">
                    <icon-flag style="margin-right: 10px;"></icon-flag>
                    Produto
                    <div class="dot-separator primary" v-if="form.product.length" style="margin: 0 10px;"></div>
                    <span class="primary" v-if="form.product.length === 1">
                        {{ _.find(productsSelectItems, { value: _.first(form.product) }).text }}
                    </span>
                    <span class="primary" v-else-if="form.product.length">
                        {{ form.product.length }}
                    </span>
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
            <app-select v-model="form.responsibleUser" :popoverProps="{placement:'bottom-start'}" :items="selectUsers" :multiple="true" :verticalOffset="5" title="Responsável" @change="onFilterChange($event)">
                <a class="btn btn--border-only">
                    <icon-flag style="margin-right: 10px;"></icon-flag>
                    Responsável
                    <div class="dot-separator primary" v-if="form.responsibleUser.length" style="margin: 0 10px;"></div>
                    <span class="primary" v-if="form.responsibleUser.length === 1">
                        {{ _.find(selectUsers, { value: _.first(form.responsibleUser) }).text }}
                    </span>
                    <span class="primary" v-else-if="form.responsibleUser.length">
                        {{ form.responsibleUser.length }}
                    </span>
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
            <app-select v-model="form.status" :popoverProps="{placement:'bottom-start'}" :items="requestStatusListSelectItems" :multiple="true" :verticalOffset="5" title="Status"
                        @change="onFilterChange($event)">
                <a class="btn btn--border-only">
                    <icon-status style="margin-right: 10px;"></icon-status>
                    Status
                    <div class="dot-separator terciary" v-if="form.status.length" style="margin: 0 10px;"></div>
                    <span class="terciary" v-if="form.status.length === 1">
                        {{ _.find(requestStatusListSelectItems, { value: _.first(form.status) }).text }}
                    </span>
                    <span class="terciary" v-else-if="form.status.length">{{ form.status.length }}</span>
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
            <a class="btn btn--primary" v-if="!loading" style="color: #FFF;" @click="apply()">
                OK
            </a>
            <a class="btn btn--primary" v-else style="color: #FFF;">
                ...
            </a>
        </li>
    </ul>
</template>
<script>
    import {  mapGetters, mapState, mapActions } from 'vuex';

    import utils from '../../../../utils/index';
    import moment from 'moment';
    import _ from 'lodash';

    import { Portuguese } from 'flatpickr/dist/l10n/pt'

    import User from "../../../../vuex/models/User"
    import PaymentMethod from "../../../../vuex/models/PaymentMethod"

    export default {
        components: {
        },
        props: ['loading'],
        data(){
            return {
                form: {
                    deliveryDate: [[]],
                    deliveryDateToSend: [[]],
                    clientGroup: [],
                    paymentMethod: [],
                    product: [],
                    responsibleUser: [],
                    status: []
                },
                selectedDays: 0,
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
            ...mapState('data/accounts',['accounts']),
            ...mapState('data/client-groups',['clientGroups']),
            ...mapState('data/payment-methods',['paymentMethods']),
            ...mapState('data/request-status',['requestStatusList']),
            ...mapState('data/products',['products']),

            ...mapGetters('data/request-status',['requestStatusListSelectItems']),
            ...mapGetters('data/users',['usersSelectItems']),
            ...mapGetters('data/client-groups',['clientGroupsSelectItems']),
            ...mapGetters('data/payment-methods',['paymentMethodsSelectItems']),
            ...mapGetters('data/products',['productsSelectItems']),
            selectUsers() {
                return _.map(User.all(), user => {
                    return {
                        value: user.id,
                        text: user.name
                    };
                });
            },
            selectPaymentMethods() {
                return _.map(PaymentMethod.all(), paymentMethod => {
                    return {
                        value: paymentMethod.id,
                        text: paymentMethod.name
                    };
                });
            },
        },
        methods: {
            ...mapActions('toast',['showToast']),
            onFilterChange(){
                console.log(this.form.responsibleUser, this.selectUsers)
                this.$emit('clean-selection')
                this.apply()
            },
            onCreatedDateChange(value){
                const values = value.split(" ")

                if(values.length > 1){

                    value = [_.first(values),_.last(values)]

                    this.form.deliveryDateToSend = value
                    this.selectedDays = moment(value[1]).diff(moment(value[0]), 'days') + 1
                }
                else if(value.trim() !== ''){
                    this.form.deliveryDateToSend = value
                    this.selectedDays = 1
                }
                else {
                    this.form.deliveryDateToSend = [[]]
                    this.selectedDays = 0
                }
                this.onFilterChange()
            },
            getStatus(status){
                switch(status){
                    case "pending":
                        return "Pendente"
                    case "sent":
                        return "Enviado"
                    case "canceled":
                        return "Cancelado"
                    case "finished":
                        return "Finalizado"
                    default:
                        return "---"
                }
            },
            clearCreatedDateFilter(){
                this.selectedDays = 0
                this.form.deliveryDate = [[]]
            },
            openCreatedDateSelector(){
                this.$refs.createdDateSelector.fp.open()
            },
            apply(params = {}){
                const filterData = utils.removeReactivity(this.form)
                if(!filterData.deliveryDateToSend[0] || !filterData.deliveryDateToSend[0].length){
                    _.assign(filterData,{
                        deliveryDate: null
                    })
                }
                else if(!_.isArray(filterData.deliveryDateToSend)){
                    _.assign(filterData,{
                        deliveryDate: filterData.deliveryDateToSend
                    })
                }
                else {
                    const values = filterData.deliveryDateToSend
                    if(values.length > 1){
                        filterData.deliveryDate = [[_.first(values),_.last(values)]]
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
                this.$emit('search', {
                    filterData,
                    params
                })
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