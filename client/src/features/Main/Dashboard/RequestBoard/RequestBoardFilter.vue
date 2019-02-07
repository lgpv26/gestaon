<template>
    <div class="container__request-board__filter">
        <div class="request-board__filter  filter--date" :offset="{ bottom: 15 }" data-toggle>
            <div class="filter-item__target" @click="onDeliveryDateFilterClick()">
                <span class="target__title">Data</span>
                <div class="target__amount">
                    <div></div>
                    <app-datetime-selector
                        ref="deliveryDate"
                        class="select"
                        :value="filters.deliveryDate"
                        :config="datetimeSelectorConfig"
                        @input="onDeliveryDateChange($event)"
                        placeholder="..."
                    ></app-datetime-selector>
                </div>
            </div>
        </div>
        <app-select class="request-board__filter" :value="filters.clientGroups" :popoverProps="{ placement: 'bottom-start' }" :title="'Grupo do cliente'" @unselect="SET_FILTER({ type: 'clientGroups', select: false, id: $event })" @select="SET_FILTER({ type: 'clientGroups', select: true, id: $event })" :items="selectClientGroups" :multiple="true" :verticalOffset="15">
            <div class="filter-item__target">
                <span class="target__title">Grupo</span>
                <div class="target__amount" v-if="filters.clientGroups.length">
                    <div></div>
                    <span v-if="filters.clientGroups.length === 1">
                        {{ _.find(selectClientGroups, { value: _.first(filters.clientGroups) }).text }}
                    </span>
                    <span v-else> {{ filters.clientGroups.length }} </span>
                </div>
            </div>
            <template slot="section" slot-scope="sectionProps">
                <h3>{{ sectionProps.text }}</h3>
            </template>
            <template slot="item" slot-scope="itemProps">
                <span>{{ itemProps.text }}</span>
            </template>
        </app-select>
        <app-select class="request-board__filter" :value="filters.responsibleUsers" :popoverProps="{ placement: 'bottom-start' }" :title="'Responsável'"
                @unselect="SET_FILTER({ type: 'responsibleUsers', select: false, id: $event })" @select="SET_FILTER({ type: 'responsibleUsers', select: true, id: $event })" :multiple="true" :items="selectUsers" :verticalOffset="15">
            <div class="filter-item__target">
                <span class="target__title">Responsável</span>
                <div class="target__amount" v-if="filters.responsibleUsers.length">
                    <div></div>
                    <span v-if="filters.responsibleUsers.length === 1">
                        {{ _.find(selectUsers, { value: _.first(filters.responsibleUsers) }).text }}
                    </span>
                    <span v-else> {{ filters.responsibleUsers.length }} </span>
                </div>
            </div>
            <template slot="item" slot-scope="itemProps">
                <span>{{ itemProps.text }}</span>
            </template>
        </app-select>
        <app-select
                class="request-board__filter"
                :value="filters.promotionChannels"
                :popoverProps="{ placement: 'bottom-start' }"
                @unselect="
        SET_FILTER({ type: 'promotionChannels', select: false, id: $event })
      "
                @select="
        SET_FILTER({ type: 'promotionChannels', select: true, id: $event })
      "
                :title="'Canal de divulgação'"
                :multiple="true"
                :items="selectPromotionChannels"
                :verticalOffset="15"
        >
            <div class="filter-item__target">
                <span class="target__title">Canal</span>
                <div class="target__amount" v-if="filters.promotionChannels.length">
                    <div></div>
                    <span v-if="filters.promotionChannels.length === 1">
            {{
              _.find(selectPromotionChannels, {
                value: _.first(filters.promotionChannels)
              }).text
            }}
          </span>
                    <span v-else> {{ filters.promotionChannels.length }} </span>
                </div>
            </div>
            <template slot="item" slot-scope="itemProps">
                <span>{{ itemProps.text }}</span>
            </template>
        </app-select>
        <app-select
                class="request-board__filter"
                :value="filters.status"
                :popoverProps="{ placement: 'bottom-start' }"
                @unselect="SET_FILTER({ type: 'status', select: false, id: $event })"
                @select="SET_FILTER({ type: 'status', select: true, id: $event })"
                :title="'Status do pedido'"
                :multiple="true"
                :items="requestStatusListSelectItems"
                :verticalOffset="15"
        >
            <div class="filter-item__target">
                <span class="target__title">Status</span>
                <div class="target__amount" v-if="filters.status.length">
                    <div></div>
                    <span v-if="filters.status.length === 1">
            {{
              _.find(requestStatusListSelectItems, {
                value: _.first(filters.status)
              }).text
            }}
          </span>
                    <span v-else> {{ filters.status.length }} </span>
                </div>
            </div>
            <template slot="item" slot-scope="itemProps">
                <span>{{ itemProps.text }}</span>
            </template>
        </app-select>
    </div>
</template>

<script>
    import { mapActions, mapMutations, mapState, mapGetters } from "vuex"

    import shortid from 'shortid'
    import PromiseQueue from 'p-queue'
    import RequestBoardAPI from "../../../../api/request-board"

    import ClientGroup from "../../../../vuex/models/ClientGroup"
    import PromotionChannel from "../../../../vuex/models/PromotionChannel"
    import User from "../../../../vuex/models/User"
    import Request from "../../../../vuex/models/Request"
    import Card from "../../../../vuex/models/Card"

    import { Portuguese } from "flatpickr/dist/l10n/pt"

    export default {
        components: {},
        data() {
            return {
                requestBoardFilter: {
                    users: [],
                    filter: [
                        {
                            text: "Status",
                            items: [{ text: "Pendente" }, { text: "Em andamento" }]
                        },
                        {
                            text: "Canal",
                            items: [
                                { text: "Tele-entrega" },
                                { text: "Comércio" },
                                { text: "WhatsApp" },
                                { text: "Tele-marketing" }
                            ]
                        }
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
                        status: []
                    }
                },
                datetimeSelectorConfig: {
                    altInput: true,
                    altFormat: "d/m/Y",
                    dateFormat: "Z",
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: false
                }
            };
        },
        computed: {
            ...mapGetters("data/request-status", ["requestStatusListSelectItems"]),
            ...mapState("request-board", ["filters"]),
            selectClientGroups() {
                return _.map(ClientGroup.all(), clientGroup => {
                    return {
                        value: clientGroup.id,
                        text: clientGroup.name
                    };
                });
            },
            selectUsers() {
                return _.map(User.all(), user => {
                    return {
                        value: user.id,
                        text: user.name
                    };
                });
            },
            selectPromotionChannels() {
                return _.map(PromotionChannel.all(), promotionChannel => {
                    return {
                        value: promotionChannel.id,
                        text: promotionChannel.name
                    };
                });
            }
        },
        methods: {
            ...mapMutations("request-board", ["SET_FILTER","SET_DELIVERY_DATE"]),
            ...mapActions("request-board", ["setIsLoading"]),
            extractOnlyModelFields(modelName,obj){
                const returnObj = {}
                this.modelDefinitions.offlineDBModels[modelName].split(',').forEach((column) => {
                    column = column.trim()
                    if(_.has(obj,column)){
                        returnObj[column] = obj[column]
                    }
                })
                return returnObj
            },
            fillOfflineDBWithSyncedData(modelName, action, data, replacementColumn = null){
                const vm = this
                if(action === 'put'){
                    return vm.$db[modelName].put(this.extractOnlyModelFields(modelName,data))
                }
                else if(action === 'bulkPut'){
                    data = _.map(data, (dataItem) => {
                        return this.extractOnlyModelFields(modelName, dataItem)
                    })
                    return vm.$db[modelName].bulkPut(data)
                }
                else if(action === 'bulkPutWithReplacement'){
                    return vm.$db[modelName].where({
                        [replacementColumn]: _.first(data)[replacementColumn]
                    }).toArray((itemsToDelete) => {
                        const ids = _.map(itemsToDelete, (itemToDelete) => itemToDelete.id)
                        return vm.$db[modelName].bulkDelete(ids).then(() => {
                            return this.fillOfflineDBWithSyncedData(modelName, 'bulkPut', data)
                        })
                    })
                }
            },
            onDeliveryDateFilterClick(){
                this.$refs.deliveryDate.fp.open()
            },
            onDeliveryDateChange(value){
                const vm = this
                console.log("Delivery date changed")
                vm.SET_DELIVERY_DATE(value)
                RequestBoardAPI.getRequests({
                    date: vm.moment(value).toISOString()
                }).then(response => {
                    console.log("After Request Board API request", response)
                    const promises = _.map(response.data, (request) => {
                        // guarantee the order of promises
                        const requestPromiseQueue = new PromiseQueue({ concurrency: 1})

                        // request

                        requestPromiseQueue.add(() => vm.fillOfflineDBWithSyncedData("requests", 'put', request).then((promise) => {
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: 'requests',
                                ignoreOfflineDBInsertion: true,
                                data: request
                            })
                            return promise
                        }))

                        Request.guaranteeDependencies(
                            request,
                            requestPromiseQueue,
                            vm.fillOfflineDBWithSyncedData,
                            true
                        )

                        return requestPromiseQueue.onIdle().then(() => {
                            const savedRequest = Request.query()
                                .with("card")
                                .with("client")
                                .with("requestClientAddresses.clientAddress.address")
                                .with("requestOrder.requestOrderProducts")
                                .find(request.id)
                            const getClientAddress = () => {
                                if (savedRequest.requestClientAddresses.length) {
                                    const firstClientAddress = _.first(savedRequest.requestClientAddresses).clientAddress;
                                    return _.truncate(_.startCase(_.toLower(firstClientAddress.address.name)), { length: 24, separator: "", omission: "..."}) +
                                        ", " +
                                        (firstClientAddress.number ? firstClientAddress.number : "S/N") +
                                        (firstClientAddress.complement ? " " + firstClientAddress.complement : "")
                                }
                                return "SEM ENDEREÇO";
                            }
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: 'cards',
                                data: _.assign(savedRequest.card, {
                                    clientName: savedRequest.client.name,
                                    clientAddress: getClientAddress(),
                                    orderSubtotal: _.sumBy(
                                        savedRequest.requestOrder.requestOrderProducts,
                                        requestOrderProduct => {
                                            return (
                                                requestOrderProduct.quantity * (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount)
                                            )
                                        }
                                    )
                                })
                            })
                            return Promise.resolve(request.id)
                        })
                    })
                    // Once everything got from server, start to fill Vuex ORM with STATE_ db data
                    Promise.all(promises).then((responses) => {
                        _.forOwn(vm.modelDefinitions.stateModels, (fields, stateModelName) => {
                            const modelName = stateModelName.replace("STATE_", "")
                            if(modelName !== 'cards' && modelName !== 'windows' && modelName !== 'requestUIState'){
                                vm.$db[stateModelName].toArray().then(data => {
                                    if(data.length){
                                        vm.$store.dispatch("entities/insertOrUpdate", {
                                            entity: modelName,
                                            data: data
                                        })
                                    }
                                    return data
                                })
                            }
                            /*else {
                                vm.$db[stateModelName].toArray().then(data => {
                                    if(data.length){
                                        /!*console.log(stateModelName, data)*!/
                                        vm.$store.dispatch("entities/insertOrUpdate", {
                                            entity: modelName,
                                            data: data
                                        })
                                    }
                                    return data
                                })
                            }*/
                        })
                        vm.setIsLoading(false)
                    })
                });
            }
        },
        mounted() {
            this.SET_DELIVERY_DATE(this.moment().toISOString())
        }
    };
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

            .select {
                margin-bottom: 0;
                padding: 5px 0;
                width: 74px;
                border-bottom: 0;
            }
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
        color: var(--base-color--d);
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
