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
                :items="requestBoardRequestStatusListItems"
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
    import Vue from 'vue'

    import shortid from 'shortid'
    import PromiseQueue from 'p-queue'
    import RequestBoardAPI from "../../../../api/request-board"

    import ClientGroup from "../../../../vuex/models/ClientGroup"
    import PromotionChannel from "../../../../vuex/models/PromotionChannel"
    import User from "../../../../vuex/models/User"
    import Request from "../../../../vuex/models/Request"
    import Card from "../../../../vuex/models/Card"

    import RequestHelper from '../../../../helpers/RequestHelper'

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
            requestBoardRequestStatusListItems(){
                return _.filter(this.requestStatusListSelectItems,(requestStatusListSelectItem) => {
                    return requestStatusListSelectItem.value !== "finished" && requestStatusListSelectItem.value !== "canceled"
                })
            },
            selectClientGroups() {
                return _.map(ClientGroup.all(), clientGroup => {
                    return {
                        value: clientGroup.id,
                        text: clientGroup.name
                    };
                });
            },
            selectUsers() {
                return _.map(_.filter(User.query().orderBy('name').get(), (user) => {
                    return user.status !== 'deactivated'
                }), user => {
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
        mixins: [RequestHelper],
        methods: {
            ...mapMutations(["SET_SYSTEM_REQUESTS_LOADED"]),
            ...mapMutations("request-board", ["SET_FILTER","SET_DELIVERY_DATE"]),
            ...mapActions("request-board", ["setIsLoading"]),
            ...mapActions(["setSystemRequestsLoaded","setLastRequestsLoadedDate"]),
            onDeliveryDateFilterClick(){
                this.$refs.deliveryDate.fp.open()
            },
            async loadRequests(){
                const vm = this
                vm.SET_SYSTEM_REQUESTS_LOADED(false)
                const useIndexedDBData = true
                let response
                vm.setIsLoading(true)
                if(useIndexedDBData){
                    response = {
                        data: await vm.getRequestsFromIndexedDB()
                    }
                    console.log("Getting requests from IndexedDB", response)
                }
                else {
                    response = await RequestBoardAPI.getRequests({
                        date: vm.moment(vm.filters.deliveryDate).toISOString()
                    })
                    console.log("Getting requests from requestBoardAPI", response)
                }

                return Promise.all([
                    vm.$db.STATE_cards.toArray().then((cards) => {
                        vm.$store.dispatch("entities/insertOrUpdate", {
                            entity: 'cards',
                            ignoreOfflineDBInsertion: true,
                            data: cards
                        })
                        return cards
                    }),
                    vm.$db.STATE_requestUIState.toArray().then((requestUIState) => {
                        vm.$store.dispatch("entities/insertOrUpdate", {
                            entity: 'requestUIState',
                            ignoreOfflineDBInsertion: true,
                            data: requestUIState
                        })
                        return requestUIState
                    }),
                    vm.$db.STATE_windows.toArray().then((windows) => {
                        vm.$store.dispatch("entities/insertOrUpdate", {
                            entity: 'windows',
                            ignoreOfflineDBInsertion: true,
                            data: windows
                        })
                        return windows
                    })
                ]).then(() => {
                    response.data = _.filter(response.data,(request) => {
                        return request.status !== 'finished' && request.status !== 'canceled'
                    })
                    const promises = _.map(response.data, (request) => {
                        return Request.load(vm, request, {
                            ignoreOfflineDBInsertion: true
                        }).catch((err) => {
                            console.log("Error loading requests", err)
                        })
                    })

                    // Once everything got from server, start to fill Vuex ORM with STATE_ db data
                    return Promise.all(promises).then((requests) => {
                        const retrievingDraftPromises = []
                        _.forOwn(vm.modelDefinitions.stateModels, (fields, stateModelName) => {
                            const modelName = stateModelName.replace("STATE_", "")
                            retrievingDraftPromises.push(vm.$db[stateModelName].toArray().then(data => {
                                if(data.length){
                                    vm.$store.dispatch("entities/insertOrUpdate", {
                                        entity: modelName,
                                        data: data
                                    })
                                }
                                return Promise.resolve()
                            }))
                        })
                        return Promise.all(retrievingDraftPromises).then(() => {
                            // verify changes
                            requests.forEach((requestId) => {
                                const processedRequest = Request.query()
                                    .with("card")
                                    .with("client.clientAddresses.address")
                                    .with("client.clientPhones")
                                    .with("requestClientAddresses.clientAddress.address")
                                    .with("requestOrder.requestOrderProducts")
                                    .with("requestPayments")
                                    .with("requestClientAddresses")
                                    .with("requestClientPhones")
                                    .with("requestUIState")
                                    .find(requestId)
                                if(_.isEqual(Request.getComparationObj(processedRequest), processedRequest.requestUIState.requestString)){
                                    vm.$store.dispatch("entities/requestUIState/update",{
                                        where: processedRequest.requestUIState.id,
                                        data: {
                                            hasRequestChanges: false
                                        }
                                    })
                                }
                                else {
                                    console.log(Request.getComparationObj(processedRequest))
                                    console.log(processedRequest.requestUIState.requestString)
                                    vm.$store.dispatch("entities/requestUIState/update",{
                                        where: processedRequest.requestUIState.id,
                                        data: {
                                            hasRequestChanges: true
                                        }
                                    })
                                }
                            })
                            console.log("system:ready event emitted")
                            vm.$socket.emit("system:ready")
                            vm.SET_SYSTEM_REQUESTS_LOADED(true)
                            vm.setLastRequestsLoadedDate(vm.moment().valueOf())
                            vm.setIsLoading(false)
                        })
                    })
                })
            },
            onDeliveryDateChange(value){
                const vm = this
                vm.SET_DELIVERY_DATE(value)
                vm.loadCards(value)
            },
            async getRequestsFromIndexedDB(){
                const vm = this
                /* get requests */
                const requests = await vm.$db.requests.where('deliveryDate').between(
                    this.moment(this.filters.deliveryDate).startOf('day').toISOString(),
                    this.moment(this.filters.deliveryDate).endOf('day').toISOString()
                ).toArray()

                return Promise.all(_.map(requests, async (request) => {

                    return new Promise(async resolve => {
                        // client
                        if(_.get(request,'clientId',false)){
                            _.assign(request, {
                                client: await vm.$db.clients.where('id').equals(request.clientId).first()
                            })

                            // clientAddresses
                            const clientAddresses = await vm.$db.clientAddresses.where('clientId').equals(request.clientId).toArray()
                            _.assign(request.client, {
                                clientAddresses: await Promise.all(_.map(clientAddresses, async (clientAddress) => {
                                    // address
                                    if(_.get(clientAddress,'addressId',false)){
                                        _.assign(clientAddress, {
                                            address: await vm.$db.addresses.where('id').equals(clientAddress.addressId).first()
                                        })
                                    }
                                    return clientAddress
                                }))
                            })

                            // clientPhones
                            _.assign(request.client, {
                                clientPhones: await vm.$db.clientPhones.where('clientId').equals(request.clientId).toArray()
                            })

                        }
                        // requestOrder
                        if(_.get(request,'requestOrderId',false)){
                            _.assign(request, {
                                requestOrder: await vm.$db.requestOrders.where('id').equals(request.requestOrderId).first()
                            })
                            // promotionChannel
                            if(_.get(request,'requestOrder.promotionChannelId',false)) {
                                _.assign(request.requestOrder, {
                                    promotionChannel: await vm.$db.promotionChannels.where('id').equals(request.requestOrder.promotionChannelId).first()
                                })
                            }
                            // requestOrderProducts
                            _.assign(request.requestOrder, {
                                requestOrderProducts: await vm.$db.requestOrderProducts.where('requestOrderId').equals(request.requestOrderId).toArray()
                            })
                        }
                        // requestClientPhones
                        const requestClientPhones = await vm.$db.requestClientPhones.where('requestId').equals(request.id).toArray()
                        _.assign(request, {
                            requestClientPhones: await Promise.all(_.map(requestClientPhones, async (requestClientPhone) => {
                                // clientAddress
                                if(_.get(requestClientPhone,'clientPhoneId',false)) {
                                    const clientPhone = await vm.$db.clientPhones.where('id').equals(requestClientPhone.clientPhoneId).first()
                                    _.assign(requestClientPhone, {
                                        clientPhone
                                    })
                                }
                                return requestClientPhone
                            }))
                        })
                        // requestClientAddresses
                        const requestClientAddresses = await vm.$db.requestClientAddresses.where('requestId').equals(request.id).toArray()
                        _.assign(request, {
                            requestClientAddresses: await Promise.all(_.map(requestClientAddresses, async (requestClientAddress) => {
                                // clientAddress
                                if(_.get(requestClientAddress,'clientAddressId',false)) {
                                    const clientAddress = await vm.$db.clientAddresses.where('id').equals(requestClientAddress.clientAddressId).first()
                                    // address
                                    if(_.get(clientAddress,'addressId',false)){
                                        _.assign(clientAddress, {
                                            address: await vm.$db.addresses.where('id').equals(clientAddress.addressId).first()
                                        })
                                    }
                                    _.assign(requestClientAddress, {
                                        clientAddress
                                    })
                                }
                                return requestClientAddress
                            }))
                        })

                        // requestPayments
                        const requestPayments = await vm.$db.requestPayments.where('requestId').equals(request.id).toArray()
                        _.assign(request, {
                            requestPayments: await Promise.all(_.map(requestPayments, async (requestPayment) => {
                                // requestPaymentMethod
                                if(_.get(requestPayment,'paymentMethodId',false)) {
                                    _.assign(requestPayment, {
                                        paymentMethod: await vm.$db.paymentMethods.where('id').equals(requestPayment.paymentMethodId).first()
                                    })
                                }
                                return requestPayment
                            }))
                        })

                        resolve(request)
                    })

                }))

            }
        },
        mounted() {
            if(!this.moment(this.filters.deliveryDate).isSame(this.moment(), 'day')){
                this.SET_DELIVERY_DATE(this.moment().toISOString())
            }


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
