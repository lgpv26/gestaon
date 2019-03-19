<template>
    <div class="call">
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
    import ProgressBar from 'progressbar.js'

    export default {
        components: {
        },
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
            updateValue(path, field, id, value, modifier = false, ev = false) {
                const data = {};
                let start, end
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    start = ev.target.selectionStart
                    end = ev.target.selectionEnd
                }
                switch (modifier) {
                    case "uppercase":
                        data[field] = value.toUpperCase();
                        break;
                    default:
                        data[field] = value;
                }
                this.$store.dispatch(path, {where: id, data})
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    Vue.nextTick(() => {
                        ev.target.setSelectionRange(start,end);
                    })
                }
            },
            async addRequest() {
                const requestUIStateTmpId = `tmp/${shortid.generate()}`;
                const requestTmpId = `tmp/${shortid.generate()}`;
                const requestClientAddressTmpId = `tmp/${shortid.generate()}`;
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
                        requestId: requestTmpId
                    }
                })
                this.$store.dispatch("entities/requests/insert", {
                    data: {
                        id: requestTmpId,
                        clientId: null,
                        requestOrderId: null,
                        status: "draft"
                    }
                });

                Vue.nextTick(async () => {
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
                            /*this.$store.dispatch(
                                "entities/requestClientAddresses/update",
                                {
                                    where: _.first(this.request.requestClientAddresses).id,
                                    data: {
                                        clientAddressId: clientAddress.id
                                    }
                                }
                            )*/
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
                    }
                })

            },
        },
        mounted(){
            const vm = this
            vm.clipboardInstance = new Clipboard('.clipboard')
            /*vm.autoCloseProgressInstance = new ProgressBar.Circle(vm.$refs.autoCloseProgress, {
                color: 'var(--font-color--terciary)',
                strokeWidth: 12,
                trailWidth: 1,
                text: {
                    value: '?'
                }
            })
            vm.callActiveTime = moment().diff(moment(vm.call.dateCreated), 'seconds')
            vm.intervalInstance = setInterval(() => {
                vm.callActiveTime += 1
                if(vm.callActiveTime > 120){
                    clearInterval(vm.intervalInstance)
                    vm.$store.dispatch('entities/calls/delete', vm.call.id)
                }
                else {
                    vm.autoCloseProgressInstance.animate(vm.callActiveTime / 120, {
                        duration: 800
                    })
                }
                vm.autoCloseProgressInstance.setText(vm.callActiveTime)
            }, 1000)*/
        },
        beforeDestroy(){
            /*if(this.intervalInstance){
                clearInterval(this.intervalInstance)
            }*/
            this.clipboardInstance.destroy()
            /*this.autoCloseProgressInstance.destroy()*/
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
                .call {
                    flex-shrink: 0;
                    background: var(--bg-color--1);
                    margin-bottom: 10px;
                    padding: 8px 12px;
                    display: flex;
                    flex-direction: column;
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
