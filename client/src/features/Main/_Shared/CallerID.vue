<template>
    <div id="caller-id" :class="{ open }">
        <div class="opener" @click="openCallerID()">
            <icon-phone></icon-phone>
        </div>
        <div class="container">
            <div class="header" @click="openCallerID()">
                <h3>Últimas 10 ligações</h3>
            </div>
            <div ref="scrollbar">
                <div class="calls">
                    <div v-for="call in calls" class="call">
                        <span class="number">{{ utils.formatPhone(call.number) }}</span>
                        <span class="time">{{ moment(call.createdAt).format("DD/MM/YYYY HH:mm:ss") }}</span>
                        <div v-if="call.clients.length" v-for="client in call.clients">
                            <div class="client existent-client">
                                <span style="font-weight: bold;">{{ client.name }}</span>
                            </div>
                        </div>
                        <div class="client new-client" v-if="!call.clients.length">
                            Cliente novo
                        </div>
                        <a href="javascript:void(0)" class="start-service" style="float: right">Iniciar atendimento</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'

    import { mapActions, mapState } from 'vuex'
    import Scrollbar from 'smooth-scrollbar'

    export default {
        components: {
        },
        data(){
            return {
                open: false,
                scrollbar: null,
            }
        },
        computed: {
            ...mapState('auth', ['company']),
            ...mapState('caller-id', ['calls'])
        },
        methods: {
            ...mapActions('caller-id', ['setCall','loadCalls']),
            openCallerID(){
                this.open = !this.open
            }
        },
        created(){
            const vm = this
            vm.loadCalls({
                companyId: vm.company.id
            })
            /**
             * On new call
             * @param ev = { success:Boolean, evData:Draft }
             */
            vm.$options.sockets['caller-id.new'] = (ev) => {
                console.log("Received caller-id.new", ev)
                if(ev.success){
                    vm.open = true
                    vm.$bus.$emit('sound-play')
                    vm.setCall(ev.evData)
                }
            }
        },
        mounted(){
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            })
        }
    }
</script>
<style scoped lang="scss">
    #caller-id {
        position: absolute;
        z-index: 999999999999;
        top: 75px;
        bottom: 75px;
        right: -240px;
        display: flex;
        flex-direction: row;
        pointer-events: none;
        transition: .2s all;
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
            pointer-events: auto;
            transition: .2s all;
        }
        .opener:hover {
            width: 40px;
        }
        .container {
            height: 100%;
            width: 240px;
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
                pointer-events: auto;
                cursor: pointer;
            }
            .calls {
                flex-grow: 1;
                flex-shrink: 0;
                pointer-events: auto;
                display: flex;
                flex-direction: column;
                .call {
                    flex-shrink: 0;
                    pointer-events: auto;
                    background: rgb(30,30,30); /* For browsers that do not support gradients */
                    background: linear-gradient(to right, rgba(15,15,15,0), rgba(15,15,15,.6), rgba(15,15,15,1));
                    margin-bottom: 10px;
                    padding: 10px 20px 10px;
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    span.number {
                        font-size: 18px;
                        font-weight: 600;
                        color: var(--font-color--10)
                    }
                    span.time {
                        color: var(--font-color--7)
                    }
                    div.client {
                        margin: 10px 0;
                    }
                    a.start-service {
                        color: var(--font-color--primary)
                    }
                    a.start-service:hover {
                        color: var(--font-color--primary)
                    }
                }
                .call:last-child {
                    margin-bottom: 0;
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
