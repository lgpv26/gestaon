<template>
    <div class="container__request-board__filter">
        <div class="request-board__filter  filter--date" :offset="{ bottom: 15 }" data-toggle>
            <div class="filter-item__target">
                <span class="target__title">Data</span>
                <div class="target__amount">
                    <div></div>
                    <app-datetime-selector class="input--borderless" v-model="dateCreated" :config="datetimeSelectorConfig" @on-change="onFilterChange($event)" placeholder="..."></app-datetime-selector>
                </div>
            </div>
        </div>
        <app-select class="request-board__filter" v-model="requestBoardFilter.form.clientGroups" :title="'Grupo do cliente'"
            @unselect="onFilter('clientGroups')" @select="onFilter('clientGroups')" :items="selectClientGroups" :multiple="true" :verticalOffset="15">
            <div class="filter-item__target">
                <span class="target__title">Grupo</span>
                <div class="target__amount" v-if="requestBoardFilter.form.clientGroups.length">
                    <div></div>
                    <span>{{ requestBoardFilter.form.clientGroups.length }}</span>
                </div>
            </div>
            <template slot="section" slot-scope="sectionProps">
                <h3>{{ sectionProps.text }}</h3>
            </template>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-select>
        <app-select class="request-board__filter" v-model="requestBoardFilter.form.responsibleUsers" :title="'Responsável'"
                    @unselect="onFilter('responsibleUsers')" @select="onFilter('responsibleUsers')" :multiple="true" :items="selectUsers" :verticalOffset="15">
            <div class="filter-item__target">
                <span class="target__title">Responsável</span>
                <div class="target__amount" v-if="requestBoardFilter.form.responsibleUsers.length">
                    <div></div>
                    <span>{{ requestBoardFilter.form.responsibleUsers.length }}</span>
                </div>
            </div>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-select>
        <app-select class="request-board__filter" v-model="requestBoardFilter.form.promotionChannels"
                    @unselect="onFilter('promotionChannels')" @select="onFilter('promotionChannels')" :title="'Canal de divulgação'" :multiple="true" :items="selectPromotionChannels" :verticalOffset="15">
            <div class="filter-item__target">
                <span class="target__title">Canal</span>
                <div class="target__amount" v-if="requestBoardFilter.form.promotionChannels.length">
                    <div></div>
                    <span>{{ requestBoardFilter.form.promotionChannels.length }}</span>
                </div>
            </div>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-select>
        <app-select class="request-board__filter" v-model="requestBoardFilter.form.status"
                    @unselect="onFilter('status')" @select="onFilter('status')"  :title="'Status do pedido'" :multiple="true" :items="selectStatus" :verticalOffset="15">
            <div class="filter-item__target">
                <span class="target__title">Status</span>
                <div class="target__amount" v-if="requestBoardFilter.form.status.length">
                    <div></div>
                    <span>{{ requestBoardFilter.form.status.length }}</span>
                </div>
            </div>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-select>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import Vue from 'vue'
    import _ from 'lodash';
    import utils from '@/utils'
    import { createHelpers } from 'vuex-map-fields'

    import { Portuguese } from 'flatpickr/dist/l10n/pt'
    const { mapFields, mapMultiRowFields } = createHelpers({
        getterType: 'request-board/getField',
        mutationType: 'request-board/updateField',
    })

    export default {
        components: {

        },
        data(){
            return {
                requestBoardFilter: {
                    users: [],
                    filter: [
                        {
                            text: "Status",
                            items: [
                                { text: "Pendente" },
                                { text: "Em andamento" }
                            ]
                        },
                        {
                            text: "Canal",
                            items: [
                                { text: "Tele-entrega" },
                                { text: "Comércio" },
                                { text: "WhatsApp" },
                                { text: "Tele-marketing" },
                            ]
                        },
                    ],
                    type: [
                        {
                            text: "Grupo do cliente",
                            items: [
                                { text: "Todos" },
                                { text: "Varejo Disk" },
                                { text: "Atacado" },
                                { text: "Venda Automática" }
                            ]
                        }
                    ],
                    form: {
                        responsibleUsers: [],
                        clientGroups: [],
                        promotionChannels: [],
                        status: [],
                    }
                },
                datetimeSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y',
                    dateFormat: 'Z',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: false
                },
            }
        },
        computed: {
            ...mapState('data/users', ['users']),
            ...mapState('data/client-groups', ['clientGroups']),
            ...mapState('data/promotion-channels', ['promotionChannels']),
            ...mapFields([
                'filters.dateCreated',
            ]),
            selectClientGroups(){
                return _.map(this.clientGroups, (clientGroup) => {
                    return {
                        text: clientGroup.name,
                        value: clientGroup.id
                    }
                })
            },
            selectUsers(){
                return _.map(this.users, (user) => {
                    return {
                        text: user.name,
                        value: user.id
                    }
                })
            },
            selectPromotionChannels(){
                return _.map(this.promotionChannels, (promotionChannel) => {
                    return {
                        text: promotionChannel.name,
                        value: promotionChannel.id
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
            ...mapMutations('request-board', ['SET_FILTER']),
            onFilterChange(ev){
                /*setImmediate(() => {
                    this.dateCreated
                })*/
            },
            onFilter(type){
                switch(type){
                    case 'clientGroups':
                        this.SET_FILTER({
                            type: 'clientGroups',
                            data: this.requestBoardFilter.form.clientGroups
                        })
                        break;
                    case 'promotionChannels':
                        this.SET_FILTER({
                            type: 'promotionChannels',
                            data: this.requestBoardFilter.form.promotionChannels
                        })
                        break;
                    case 'responsibleUsers':
                        this.SET_FILTER({
                            type: 'responsibleUsers',
                            data: this.requestBoardFilter.form.responsibleUsers
                        })
                        break;
                    case 'status':
                        this.SET_FILTER({
                            type: 'status',
                            data: this.requestBoardFilter.form.status
                        })
                        break;
                }
            }
        },
        mounted(){
        }
    }
</script>

<style lang="scss">
    .container__request-board__filter {
        display: flex;
        flex-direction: row;
        min-height: 60px;
        align-items: center;

        .request-board__filter {
            display: flex;
            flex-direction: row;
            height: 32px;
            cursor: pointer;
            padding: 0 0 0 10px;
        }

        .request-board__filter:first-child {
            padding-left: 0;
        }

        .request-board__filter h3 {
            color: var(--secondary-color--d);
            margin-bottom: 8px;
            text-transform: uppercase;
        }

    }

    .request-board__filter .filter-item__target {
        background-color: var(--bg-color);
        display: flex;
        flex-direction: row;
        height: 32px;
        padding: 0 20px;
        border-radius: 20px;
        border: 1px solid var(--bg-color--10);
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .filter-item__target .target__title {
        font-weight: 600;
        color: var(--base-color--d)
    }

    .filter-item__target .target__amount {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-left: 8px;
    }

    .filter-item__target .target__amount > input {
        font-weight: bold;
        color: var(--primary-color);
        width: 72px;
    }

    .filter-item__target .target__amount > div {
        width: 3px;
        height: 3px;
        border-radius: 3px;
        margin-right: 5px;
        background-color: var(--secondary-color);
    }

    .filter-item__target .target__amount > span {
        color: var(--secondary-color);
        font-weight: bold;
    }

    .filter--filter .filter-item__target .target__amount > div {
        background-color: var(--terciary-color);
    }
    .filter--filter .filter-item__target .target__amount > span {
        color: var(--terciary-color);
    }

    .filter--date .filter-item__target .target__amount > div {
        background-color: var(--primary-color);
    }
    .filter--date .filter-item__target .target__amount > span {
        color: var(--primary-color);
    }
</style>