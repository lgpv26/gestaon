<template>
    <div id="caller-id" :class="{ open: !isCallerIdDisabled && calls.length }" @mouseover="mouseOver($event)">
        <div class="container">
            <div ref="scrollbar">
                <div class="calls">
                    <div class="call__phone-number" v-for="(call, index) in calls" :key="call.id">
                        <app-call v-if="call.clients.length" v-for="client in call.clients" :key="client.id" :client="client" :call="call"></app-call>
                        <app-call v-if="!call.clients.length" :call="call"></app-call>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import moment from 'moment'
    import shortid from 'shortid'

    import CallsAPI from '../../../../api/calls'

    import { mapGetters, mapActions, mapState } from 'vuex'
    import Scrollbar from 'smooth-scrollbar'

    import Call from './Call.vue'
    import {createRequest} from '../../../../models/RequestModel'

    import Clipboard from 'clipboard'
    import ProgressBar from 'progressbar.js'

    export default {
        components: {
            'app-call': Call
        },
        data(){
            return {
                open: false,
                scrollbar: null,
                timeoutInstance: null,
                clipboardInstance: null,
                calls: []
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            /*...mapState('caller-id', ['calls']),*/
            ...mapState('morph-screen', ['isShowing']),
            ...mapState('caller-id', {
                isCallerIdDisabled: 'disabled'
            }),
            ...mapGetters('morph-screen', ['activeMorphScreen'])
        },
        methods: {
            ...mapActions('morph-screen', ['createDraft']),
            ...mapActions('caller-id', ['setCall','loadCalls']),
            ...mapActions('toast',['showToast']),
            mouseOver(){
                if(this.timeoutInstance){
                    clearTimeout(this.timeoutInstance)
                    this.timeoutInstance = null
                }
            },
            addCall(call){
                /*const vm = this
                const callClientIds = []
                const callObj = {}
                const callClients = []
                const diffInSeconds = moment().diff(moment(call.dateCreated), 'seconds')
                if(diffInSeconds < 120){ // if below 120 seconds
                    if(_.has(call,'clients') && call.clients.length){
                        _.forEach(call.clients,(client) => {
                            callClients.push(client)
                            callClientIds.push(client.id)
                        })
                    }
                    _.assign(callObj, call, { clients: callClientIds })
                    vm.$store.dispatch('entities/calls/insert', {
                        data: callObj
                    })
                    vm.$store.dispatch('entities/clients/insertOrUpdate', {
                        data: callClients
                    })
                }*/
                this.calls.unshift(call)
            }
        },
        created(){
            const vm = this
            vm.calls = []
            CallsAPI.getList({ companyId: vm.company.id }).then(({data}) => {
                /*_.forEach(data,(call) => {
                    vm.addCall(call)
                })*/
                vm.calls = data
            })
            /**
             * On new call
             * @param ev = { success:Boolean, evData:Draft }
             */
            vm.$options.sockets['caller-id.new'] = (ev) => {
                console.log("Received caller-id.new", ev)
                if(ev.success){
                    vm.open = true
                    vm.addCall(ev.evData)
                    if(vm.calls.length > 20){
                        vm.calls.pop()
                    }
                }
            }
        },
        mounted(){
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            })
        },
        beforeDestroy(){
            this.scrollbar.destroy()
        }
    }
</script>
<style scoped lang="scss">
    #caller-id {
        position: absolute;
        z-index: 500000;
        top: 60px;
        bottom: 0;
        right: -320px;
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
