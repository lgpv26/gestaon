import _ from 'lodash'
import { Howl } from 'howler'
import Vue from 'vue'
import io from 'socket.io-client'
import VueSocketio from 'vue-socket.io'
import moment from 'moment'
import UsersAPI from '../../api/users'

import utils from '../../utils'
import config from '../../config'

const alarmSound = require('../../assets/sounds/alarm.mp3')

export default {
    data(){
        return {
        }
    },
    methods: {
        initializeSocketIO(){
            if (this.$socket) {
                this.$socket.destroy()
                delete this.$socket
                this.$socket = io(config.socketServer + '?token=' + this.tokens.accessToken)
                return
            }
            const socket = io(config.socketServer + '?token=' + this.tokens.accessToken)
            Vue.use(VueSocketio, socket)
        },
        disconnectSocketIO(){
            if (this.$socket) {
                this.$socket.removeListener('presence:load', this.onPresenceLoad)
                this.$socket.removeListener('connect', this.connect)
                this.$socket.destroy()
                delete this.$socket
                this.$socket = null
            }
        },
        socketMethods(){
            const vm = this
            return {
                reconnect(){
                    vm.stopLoading();
                    console.log("Reconnected.")
                },
                disconnect(reason){
                    vm.$socket.removeListener('presence:load', vm.onPresenceLoad)
                    vm.setLoadingText("Desconectado.")
                    vm.startLoading()
                    console.log("Disconnected from socket server. Reason: ", reason)
                },
                reconnectAttempt(attemptNumber){
                    vm.setLoadingText("Tentando reconectar (" + attemptNumber + ").")
                    vm.startLoading()
                    console.log("Trying reconnection.")
                }
            }
        },
        onPresenceLoad(ev){
            console.log("Received presence:load", ev)
            if(ev.success){
                this.setConnectedUsers(ev.evData)
            }
        },
        connect(){
            const vm = this
            vm.$socket.on("presence:load", vm.onPresenceLoad)
            new Promise((resolve) => {
                window.setAppLoadingText("Carregando usuário...")
                vm.setAuthUser().then(() => {
                    vm.menuList = _.filter(vm.menuList, (menuItem) => {
                        if(menuItem.type === 'system'){
                            if(menuItem.onlyAdmin && vm.user.type === 'admin'){
                                return true;
                            }
                            else if(!menuItem.onlyAdmin){
                                return true;
                            }
                        }
                    });
                    vm.user.userCompanies.forEach((userCompany) => {
                        vm.menuList.unshift({
                            text: userCompany.company.name,
                            type: 'company',
                            action: () => {
                                console.log("Feature yet to be implemented")
                            },
                            param: userCompany
                        })
                    });
                    console.log("Authenticated user set.")
                    resolve('Authenticated user set.')
                }).catch(() => {
                    vm.stopLoading()
                    console.log("Couldn't get authenticated user.")
                    vm.logout()
                })
            }).then(() => {
                return Promise.all([
                    vm.loadAllUsers({ companyId: vm.company.id }),
                    vm.loadAllClientGroups({ companyId: vm.company.id }),
                    vm.loadAllPaymentMethods({ companyId: vm.company.id }),
                    vm.loadAllPromotionChannels({ companyId: vm.company.id }),
                    vm.loadAllAccounts({ companyId: vm.company.id }),
                    vm.loadAllProducts({ companyId: vm.company.id }),
                    vm.loadMorphScreenData(vm.company.id)
                ])
            }).then(() => {
                if(window.isAppLoading()) {
                    window.removeAppLoading()
                }
                vm.stopLoading()
                vm.setSystemInitialized(true)
            })
        },
        logout(){
            const vm = this;
            vm.logoutAction().then((authenticated) => {
                if(!authenticated){
                    vm.$router.replace("/login")
                }
            });
        }
    },
    mounted(){
        const vm = this;
        localStorage.debug = false
        /* start socket.io */
        this.initializeSocketIO()
        /* if user disconnected / reconnected from socket server */
        this.$socket.on('reconnect_attempt', vm.socketMethods.reconnectAttempt)
        this.$socket.on('disconnect', vm.socketMethods.disconnect)
        this.$socket.on('connect', vm.connect)
    },
    beforeDestroy(){
        this.disconnectSocketIO()
    }
}