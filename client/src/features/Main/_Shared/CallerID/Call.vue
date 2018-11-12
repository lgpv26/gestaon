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
            <span class="time">{{ moment(call.createdAt).format("DD/MM HH:mm") }}</span>
        </div>
        <div class="call__body" style="display: flex; flex-direction: row; justify-content: space-between;">
            <div class="call__column">
                <div class="section__details">
                    <span class="time">{{ moment(call.createdAt).format("DD/MM HH:mm") }}</span> -
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
                <span class="buy-infos" style="font-size: 12px; color: var(--font-color--7)">{{ (false) ? "COMPROU" : "SEM COMPRAS" }}</span>
            </div>
        </div>
        <div class="call__footer" style="display: flex; flex-direction: row;">
            <div ref="autoCloseProgress" style="width: 34px;"></div>
            <span class="push-both-sides"></span>
            <a href="javascript:void(0)" class="btn duplicate" @click="createRequestDraft(call)">
                <i class="mi mi-add-to-photos"></i> Duplicar
            </a>
            <a href="javascript:void(0)" class="btn start-service" style="float: right" @click="createRequestDraft(call)">
                <i class="mi mi-center-focus-strong"></i> Iniciar
            </a>
        </div>

    </div>
</template>

<script>
    import _ from 'lodash'
    import moment from 'moment'
    import shortid from 'shortid'

    import ClientsAPI from '../../../../api/clients'

    import { mapGetters, mapActions, mapState } from 'vuex'

    import {createRequest} from '../../../../models/RequestModel'

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
            createRequestDraft(call){
                if(this.canCreateDraft) {
                    if (!call.clients.length) {
                        this.createRequestDraftToNewClient(call)
                    }
                    else {
                        ClientsAPI.getOne(_.first(call.clients).id, {
                            companyId: this.company.id
                        }).then(({data}) => {
                            this.createRequestDraftExistentClient(call, data)
                        })
                    }
                    // this.toggleCallerID()
                }
                else {
                    this.showToast({
                        type: 'error',
                        message: "Você só pode iniciar um atendimento a partir da tela inicial."
                    })
                }
            },
            createRequestDraftToNewClient(call){
                console.log(call.destination)
                const createDraftArgs = { body: {
                    type: 'request',
                    createdBy: this.user.id,
                    data: {
                        request: createRequest({
                            activeStep: 'client',
                            phoneLine: call.destination,
                            client: {
                                clientPhones: [
                                    {
                                        id: 'tmp/' + shortid.generate(),
                                        name: "PRINCIPAL",
                                        number: call.number
                                    }
                                ]
                            }
                        })
                    }
                }, companyId: this.company.id }
                this.createDraft(createDraftArgs)
            },
            createRequestDraftExistentClient(call, client){

                // mappings for request draft format

                if(_.get(client, 'clientCustomFields', []).length){
                    client.clientCustomFields = _.map(client.clientCustomFields, (clientCustomField) => {
                        return {
                            id: clientCustomField.customFieldId,
                            value: clientCustomField.value
                        }
                    })
                }

                const createDraftArgs = {
                    body: {
                        type: 'request',
                        createdBy: this.user.id,
                        data: {
                            request: createRequest({
                                activeStep: 'client',
                                phoneLine: call.destination,
                                client
                            })
                        }
                    },
                    companyId: this.company.id
                }

                // select first address and phone

                if(client.clientAddresses.length){
                    createDraftArgs.body.data.request.clientAddressId = client.clientAddresses[0].id
                }
                if(client.clientPhones.length){
                    const clientPhoneIndex = _.findIndex(client.clientPhones, {number: call.number})
                    if(clientPhoneIndex !== -1){
                        createDraftArgs.body.data.request.clientPhoneId = client.clientPhones[clientPhoneIndex].id
                    }
                    else {
                        createDraftArgs.body.data.request.clientPhoneId = client.clientPhones[0].id
                    }
                }

                //if two of them are selected, go directly to order tab

                if(_.get(createDraftArgs, 'body.data.request.clientAddressId', null) && _.get(createDraftArgs,'body.data.request.clientPhoneId', null)){
                    createDraftArgs.body.data.request.activeStep = 'order'
                }

                this.createDraft(createDraftArgs)
            }
        },
        mounted(){
            const vm = this
            vm.clipboardInstance = new Clipboard('.clipboard')
            vm.autoCloseProgressInstance = new ProgressBar.Circle(vm.$refs.autoCloseProgress, {
                color: 'var(--font-color--terciary)',
                strokeWidth: 12,
                trailWidth: 1,
                text: {
                    value: '?'
                }
            })
            vm.callActiveTime = moment().diff(moment(vm.call.createdAt), 'seconds')
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
            }, 1000)
        },
        beforeDestroy(){
            if(this.intervalInstance){
                clearInterval(this.intervalInstance)
            }
            this.clipboardInstance.destroy()
            this.autoCloseProgressInstance.destroy()
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
