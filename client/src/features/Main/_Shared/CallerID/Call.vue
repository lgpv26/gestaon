<template>
    <div class="call" ref="call">
        <div class="call__header">
            <div class="number__container">
                <a class="number clipboard" v-if="!call.isAnonymous && call.isValid" :data-clipboard-text="call.number">{{ utils.formatPhone(call.number) }}</a>
                <span class="number anonymous" v-else-if="false">Privado</span>
                <span class="number invalid" v-else-if="call.isAnonymous || !call.isValid">Não identificado</span>
                <span class="number" v-else>Número desconhecido</span>
            </div>
            <span class="push-both-sides"></span>
            <span class="time">{{ moment(call.dateCreated).format("DD/MM HH:mm") }}</span>
        </div>
        <div class="call__body" style="display: flex; flex-direction: row; justify-content: space-between;">
            <div class="call__column">
                <div class="section__details">
                    <!--<span class="time">{{ moment(call.dateCreated).format("DD/MM HH:mm") }}</span> - -->
                    <span class="destination">{{ call.destination }}</span>
                </div>
                <div class="section__clients">
                    <div class="section__client" v-if="client">
                        <div class="client existent-client">
                            <span style="font-weight: bold;">{{ client.name }}</span>
                        </div>
                    </div>
                    <div class="section__client" v-if="!client">
                        <div class="client new-client">
                            Cliente novo
                        </div>
                    </div>
                </div>
            </div>
            <div class="call__column">
                <!--<span class="buy-infos" style="font-size: 12px; color: var(&#45;&#45;font-color&#45;&#45;7)">{{ (false) ? "COMPROU" : "SEM COMPRAS" }}</span>-->
            </div>
        </div>
        <div class="call__footer" style="display: flex; flex-direction: row;">
            <div ref="autoCloseProgress" style="width: 34px;"></div>
            <span class="push-both-sides"></span>
            <!--<a href="javascript:void(0)" class="btn duplicate" @click="createRequestDraft(call)">
                <i class="mi mi-add-to-photos"></i> Duplicar
            </a>-->
            <a href="javascript:void(0)" class="btn start-service" style="float: right" @click="addRequest()">
                <i class="mi mi-center-focus-strong"></i> Iniciar
            </a>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import _ from 'lodash'
    import moment from 'moment'
    import shortid from 'shortid'

    import { mapGetters, mapActions, mapState } from 'vuex'

    import Clipboard from 'clipboard'
    import RequestHelper from '../../../../helpers/RequestHelper'
    import ProgressBar from 'progressbar.js'

    export default {
        components: {
        },
        mixins: [RequestHelper],
        props: ['call','client'],
        data(){
            return {
                open: false,
                callActiveTime: 0,
                intervalInstance: null,
                clipboardInstance: null,
                autoCloseProgressInstance: null
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapState('caller-id', ['calls']),
            ...mapState('morph-screen', ['isShowing']),
            ...mapGetters('morph-screen', ['activeMorphScreen'])
        },
        methods: {
            ...mapActions('morph-screen', ['createDraft']),
            ...mapActions('caller-id', ['setCall','loadCalls']),
            ...mapActions('toast',['showToast']),
            updateValue(modelName, field, id, value, modifier = false, ev = false) {
                let start, end
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    start = ev.target.selectionStart
                    end = ev.target.selectionEnd
                }
                switch (modifier) {
                    case "uppercase":
                        value = value.toUpperCase();
                        break;
                }
                // this.$store.dispatch(path, {where: id, data})
                this.stateHelper({
                    modelName,
                    action: 'update',
                    persist: true,
                    data: {
                        id: id,
                        [field]: value
                    }
                })
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    Vue.nextTick(() => {
                        ev.target.setSelectionRange(start,end);
                    })
                }
            },
            async addRequest() {
                const vm = this
                let card = await this.addCard()
                card = await this.clickCard(card.id)

                const windowId = card.windowId

                card = vm.$store.getters[`entities/cards`]()
                    .where('windowId',windowId)
                    .with('request.requestUIState')
                    .with('request.client')
                    .with('request.client.clientPhones')
                    .with('request.client.clientAddresses.address')
                    .with('request.requestOrder')
                    .with('request.requestOrder.requestOrderProducts')
                    .with('request.requestPayments')
                    .with('request.requestClientAddresses.clientAddress.address')
                    .with('request.requestClientPhones.clientPhone')
                    .first()

                const request = card.request

                await this.stateHelper({
                    modelName: 'requestUIState',
                    action: 'patch',
                    persist: false,
                    data: {
                        id: request.requestUIState.id,
                        isLoading: true
                    }
                })

                if(this.client){ // if client
                    const client = await this.$db.clients.where({ id: this.client.id }).first() // get client
                    let clientAddresses = await this.$db.clientAddresses.where({clientId: this.client.id}).toArray() // get clientAddresses
                    const clientPhones = await this.$db.clientPhones.where({clientId: this.client.id}).toArray() // get clientAddresses

                    await this.stateHelper({
                        modelName: 'clients',
                        action: 'put',
                        persist: true,
                        data: client
                    })

                    vm.removeClientFromRequest(request)

                    if(clientAddresses.length){

                        clientAddresses = await Promise.all(_.map(clientAddresses, (clientAddress) => {
                            return new Promise(async (resolve, reject) => {
                                if(clientAddress.addressId){
                                    const address = await vm.$db.addresses.where({id: clientAddress.addressId}).first()
                                    await vm.stateHelper({
                                        modelName: 'addresses',
                                        action: 'put',
                                        persist: true,
                                        data: address
                                    })
                                }
                                clientAddress =  await vm.stateHelper({
                                    modelName: 'clientAddresses',
                                    action: 'put',
                                    data: clientAddress
                                })
                                resolve(clientAddress)
                            })
                        }))

                        await this.stateHelper({
                            modelName: 'requestClientAddresses',
                            action: 'patch',
                            persist: true,
                            data: {
                                id: _.first(request.requestClientAddresses).id,
                                clientAddressId: _.first(clientAddresses).id
                            }
                        })

                        await this.stateHelper({
                            modelName: 'requestClientAddresses',
                            action: 'patch',
                            persist: true,
                            data: {
                                id: _.first(request.requestClientAddresses).id,
                                clientAddressId: _.first(clientAddresses).id
                            }
                        })


                    }

                    // fill with clientPhones

                    await Promise.all(_.map(clientPhones, async (clientPhone) => {
                        return await vm.stateHelper({
                            modelName: 'clientPhones',
                            action: 'put',
                            persist: true,
                            data: clientPhone
                        })
                    }))

                    // deal with clientPhones

                    if(clientPhones.length){
                        await this.stateHelper({
                            modelName: 'requestClientPhones',
                            action: 'patch',
                            persist: true,
                            data: {
                                id: _.first(request.requestClientPhones).id,
                                clientPhoneId: _.first(clientPhones).id
                            }
                        })
                    }
                    else {
                        const clientPhoneTmpId = `tmp/${shortid.generate()}`
                        await this.stateHelper({
                            modelName: 'clientPhones',
                            action: 'put',
                            persist: true,
                            data: {
                                id: clientPhoneTmpId,
                                clientId: client.id
                            }
                        })
                        await this.stateHelper({
                            modelName: 'requestClientPhones',
                            action: 'patch',
                            persist: true,
                            data: {
                                id: _.first(request.requestClientPhones).id,
                                clientPhoneId: clientPhoneTmpId
                            }
                        })
                    }

                    await this.stateHelper({
                        modelName: 'requestUIState',
                        action: 'patch',
                        persist: true,
                        data: {
                            id: request.requestUIState.id,
                            requestClientAddressForm: false
                        }
                    })

                    await this.stateHelper({
                        modelName: 'requests',
                        action: 'patch',
                        persist: true,
                        data: {
                            id: request.id,
                            clientId: client.id
                        }
                    })

                }
                else {
                    this.updateValue('clientPhones','number',_.first(card.request.client.clientPhones).id,vm.call.number)
                }

                await this.stateHelper({
                    modelName: 'requestUIState',
                    action: 'patch',
                    persist: false,
                    data: {
                        id: request.requestUIState.id,
                        isLoading: false
                    }
                })

                /*const vm = this
                const requestUIStateTmpId = `tmp/${shortid.generate()}`;
                const requestTmpId = `tmp/${shortid.generate()}`;
                const requestClientAddressTmpId = `tmp/${shortid.generate()}`;
                const requestClientPhoneTmpId = `tmp/${shortid.generate()}`;
                const windowTmpId = `tmp/${shortid.generate()}`;
                const cardTmpId = `tmp/${shortid.generate()}`;
                this.$store.dispatch("entities/windows/insert", {
                    data: {
                        id: windowTmpId,
                        zIndex: this.$store.getters["entities/windows/query"]().max("zIndex") + 1
                    }
                })
                this.$store.dispatch("entities/cards/insert", {
                    data: {
                        id: cardTmpId,
                        windowId: windowTmpId,
                        requestId: requestTmpId
                    }
                })
                this.$store.dispatch("entities/requestUIState/insert", {
                    data: {
                        id: requestUIStateTmpId,
                        windowId: windowTmpId,
                        requestId: requestTmpId,
                        activeTab: (this.client) ? 'order' : 'client',
                        isLoading: true
                    }
                })
                this.$store.dispatch("entities/requests/insert", {
                    data: {
                        id: requestTmpId,
                        clientId: null,
                        requestOrderId: null,
                        phoneLine: _.get(this.call,'destination',null),
                        status: "draft"
                    }
                });


                // post request create

                await Vue.nextTick()

                if(this.client && this.client.id){
                    const client = await this.$db.clients.where({ id: this.client.id }).first()
                    const clientPhones = await this.$db.clientPhones.where({clientId: this.client.id}).toArray()
                    const clientAddresses = await this.$db.clientAddresses.where({clientId: this.client.id}).toArray()
                    const clientAddress = _.first(clientAddresses)
                    if (clientAddress && clientAddress.addressId) {
                        const address = await this.$db.addresses.where({ id: clientAddress.addressId}).first()
                        this.$store.dispatch("entities/addresses/insert", { data: address })
                        this.$store.dispatch("entities/clients/insert", { data: client })
                        if(clientPhones.length){
                            this.$store.dispatch("entities/clientPhones/insert", { data: clientPhones })
                            const foundNumber = _.find(clientPhones, { number: this.call.number })
                            if(foundNumber){
                                this.$store.dispatch("entities/requestClientPhones/insert", {
                                    data: {
                                        id: requestClientPhoneTmpId,
                                        requestId: requestTmpId,
                                        clientPhoneId: foundNumber.id
                                    }
                                })
                            }
                        }
                        if(clientAddresses.length){
                            this.$store.dispatch("entities/clientAddresses/insert", {data: clientAddresses})
                            this.$store.dispatch("entities/requestClientAddresses/insert", {
                                data: {
                                    id: requestClientAddressTmpId,
                                    requestId: requestTmpId,
                                    clientAddressId: _.first(clientAddresses).id
                                }
                            })
                        }
                        this.$store.dispatch("entities/requests/update", {
                            where: requestTmpId,
                            data: {
                                clientId: this.client.id
                            }
                        })
                        this.searchShow = false
                        this.updateValue(
                            "entities/requestUIState/update",
                            "requestClientAddressForm",
                            requestUIStateTmpId,
                            false
                        )
                        this.updateValue(
                            "entities/requestUIState/update",
                            "isAddingClientAddress",
                            requestUIStateTmpId,
                            false
                        )
                    }

                    // add requestOrder

                    const clientRequests = await vm.$db.requests.where('clientId').equals(vm.client.id).toArray()
                    _.sortBy(clientRequests, (clientRequest) => {
                        return clientRequest.deliveryDate
                    })
                    const mostRecentClientRequest = _.last(clientRequests)
                    if(mostRecentClientRequest){
                        if(_.get(mostRecentClientRequest,'requestOrderId',false)){
                            _.assign(mostRecentClientRequest, {
                                requestOrder: await vm.$db.requestOrders.where('id').equals(mostRecentClientRequest.requestOrderId).first()
                            })
                            _.assign(mostRecentClientRequest.requestOrder, {
                                requestOrderProducts: await vm.$db.requestOrderProducts.where('requestOrderId').equals(mostRecentClientRequest.requestOrderId).toArray()
                            })
                        }
                        _.assign(mostRecentClientRequest, {
                            requestPayments: await vm.$db.requestPayments.where('requestId').equals(mostRecentClientRequest.id).toArray()
                        })

                        const requestOrderTmpId = `tmp/${shortid.generate()}`

                        vm.$store.dispatch("entities/requestOrders/insert", {
                            data: {
                                id: requestOrderTmpId,
                                promotionChannelId: mostRecentClientRequest.requestOrder.promotionChannelId
                            }
                        })
                        vm.$store.dispatch("entities/requests/update", {
                            where: requestTmpId,
                            data: {
                                requestOrderId: requestOrderTmpId
                            }
                        })
                        vm.$store.dispatch("entities/requestPayments/insert", {
                            data: _.map(mostRecentClientRequest.requestPayments, (requestPayment) => {
                                return {
                                    id: `tmp/${shortid.generate()}`,
                                    requestId: requestTmpId,
                                    paymentMethodId: requestPayment.paymentMethodId,
                                    amount: requestPayment.amount
                                }
                            })
                        })
                        vm.$store.dispatch("entities/requestOrderProducts/insert", {
                            data: _.map(mostRecentClientRequest.requestOrder.requestOrderProducts, (requestPayment) => {
                                return {
                                    id: `tmp/${shortid.generate()}`,
                                    requestOrderId: requestOrderTmpId,
                                    productId: requestPayment.productId,
                                    quantity: requestPayment.quantity,
                                    unitPrice: requestPayment.unitPrice,
                                    unitDiscount: requestPayment.unitDiscount
                                }
                            })
                        })
                    }
                    else {
                        console.log("Creating requestOrder")
                        const requestPaymentTmpId = `tmp/${shortid.generate()}`
                        const requestOrderTmpId = `tmp/${shortid.generate()}`
                        const requestOrderProductTmpId = `tmp/${shortid.generate()}`
                        vm.$store.dispatch("entities/requestPayments/insert", {
                            data: {
                                id: requestPaymentTmpId,
                                requestId: requestTmpId,
                                paymentMethodId: 1,
                                amount: _.get(
                                    vm.$store.getters["entities/products/find"](1),
                                    "price",
                                    false
                                )
                                    ? vm.$store.getters["entities/products/find"](1).price
                                    : 0
                            }
                        })
                        vm.$store.dispatch("entities/requestOrderProducts/insert", {
                            data: {
                                id: requestOrderProductTmpId,
                                requestOrderId: requestOrderTmpId,
                                productId: 1,
                                unitPrice: _.get(
                                    vm.$store.getters["entities/products/find"](1),
                                    "price",
                                    0
                                )
                            }
                        })
                        vm.$store.dispatch("entities/requestOrders/insert", {
                            data: {
                                id: requestOrderTmpId
                            }
                        })
                        vm.$store.dispatch("entities/requests/update", {
                            where: requestTmpId,
                            data: {
                                requestOrderId: requestOrderTmpId
                            }
                        })
                    }

                }
                else {
                    console.log("Creating client")
                    const clientTmpId = `tmp/${shortid.generate()}`
                    const addressTmpId = `tmp/${shortid.generate()}`
                    const clientAddressTmpId = `tmp/${shortid.generate()}`
                    const clientPhoneTmpId = `tmp/${shortid.generate()}`
                    const requestClientAddressTmpId = `tmp/${shortid.generate()}`
                    this.$store.dispatch("entities/clients/insert", {
                        data: {
                            id: clientTmpId
                        }
                    })
                    this.$store.dispatch("entities/clientPhones/insert", {
                        data: {
                            id: clientPhoneTmpId,
                            clientId: clientTmpId,
                            number: this.call.number
                        }
                    })
                    this.$store.dispatch("entities/addresses/insert", {
                        data: {
                            id: addressTmpId
                        }
                    })
                    this.$store.dispatch("entities/clientAddresses/insert", {
                        data: {
                            id: clientAddressTmpId,
                            clientId: clientTmpId,
                            addressId: addressTmpId
                        }
                    })
                    this.$store.dispatch("entities/requestClientAddresses/insert", {
                        data: {
                            id: requestClientAddressTmpId,
                            requestId: requestTmpId,
                            clientAddressId: clientAddressTmpId
                        }
                    })
                    this.$store.dispatch("entities/requests/update", {
                        where: requestTmpId,
                        data: {
                            clientId: clientTmpId
                        }
                    })
                }

                this.$store.dispatch("entities/requestUIState/update", {
                    where: requestUIStateTmpId,
                    data: {
                        isLoading: false
                    }
                })*/


            },
        },
        mounted(){
            const vm = this
            vm.clipboardInstance = new Clipboard('.clipboard')
            setTimeout(() => {
                if(!vm.$refs.call.classList.contains('appeared')){
                    vm.$refs.call.classList.add('appeared')
                }
            }, 100)
        },
        beforeDestroy(){
            this.clipboardInstance.destroy()
        }
    }
</script>
<style scoped lang="scss">
    #caller-id {
        position: absolute;
        z-index: 500000;
        top: 60px;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        transition: .2s all;
        background: rgba(21,23,28,.5);
        .opener {
            cursor: pointer;
            height: 30px;
            width: 30px;
            box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
            background: rgba(255,255,255,1);
            border-top-left-radius: 30px;
            border-bottom-left-radius: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: .2s all;
        }
        .opener:hover {
            width: 40px;
        }
        .container {
            height: 100%;
            width: 320px;
            display: flex;
            flex-direction: column;
            .header {
                height: 30px;
                background: white;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                padding: 0 20px;
                flex-shrink: 0;
                margin-bottom: 10px;
                cursor: pointer;
            }
            .calls {
                flex-grow: 1;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                width: 100%;
                padding: 10px 22px 10px 10px;
                .call.appeared {
                    background-color: var(--bg-color--1);
                }
                .call {
                    flex-shrink: 0;
                    background-color: var(--bg-color--primary);
                    margin-bottom: 10px;
                    padding: 8px 12px;
                    display: flex;
                    flex-direction: column;
                    transition: 2s all;

                    .call__header {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                    }
                    .call__section {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                    }
                    .call__body {
                        margin-bottom: 10px;
                        .section__clients {
                            .section__client {
                                div {
                                    font-size: 12px;
                                    text-transform: uppercase;
                                    color: var(--font-color--7);
                                }
                            }
                        }
                    }
                    .call__footer {
                        .btn {
                            float: right;
                            height: 32px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background-color: var(--font-color--primary);
                            color: var(--font-color--10);
                            font-weight: 600;
                            i {
                                font-size: 16px;
                                margin-right: 5px
                            }
                            &.duplicate {
                                width: 105px;
                            }
                            &.start-service {
                                margin-left: 10px;
                                width: 86px;
                            }
                            &:hover {
                                background-color: #3A65BC;
                                color: var(--font-color--10);
                            }
                        }
                    }
                    span.destination {
                        color: var(--font-color--primary);
                        font-size: 12px;
                        font-weight: 600;
                    }
                    a.number {
                        cursor: copy;
                        width: auto;
                        align-self: flex-end;
                    }
                    a.number, span.number {
                        font-size: 18px;
                        font-weight: 600;
                        color: var(--font-color--10)
                    }
                    span.number.anonymous {
                        font-size: 18px;
                        font-weight: 600;
                        color: var(--font-color--terciary)
                    }
                    span.number.invalid {
                        font-size: 18px;
                        font-weight: 600;
                        color: var(--font-color--7)
                    }
                    span.time {
                        color: var(--font-color--7);
                        font-size: 12px;
                    }
                    a.start-service:hover {
                        color: var(--font-color--primary)
                    }
                }
            }
        }
    }
    #caller-id.open {
        right: 0;
        .opener {
            width: 40px;
        }
    }
</style>
