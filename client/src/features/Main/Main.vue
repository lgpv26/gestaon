<template>
    <div class="body">
        <app-modals></app-modals>
        <app-device-details-window></app-device-details-window>
        <app-map-context-menu></app-map-context-menu>
        <transition name="settings-animation">
            <app-settings v-if="showSettings" :showSettings.sync="showSettings"></app-settings>
        </transition>
        <transition name="app-animation">
            <div class="app-content" v-show="!showSettings">
                <div id="left-column" class="left-column">
                    <header>
                        <h1>{{ shortCompanyName }}</h1>
                    </header>
                    <nav class="main-menu">
                        <ul>
                            <!--
                            <router-link to="/dashboard" exact tag="li"><i class="mi mi-dashboard"></i></router-link>
                            -->
                            <router-link to="/tracker" exact tag="li" v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Rastreamento'">
                                <icon-tracker class="icon"></icon-tracker>
                            </router-link>
                            <router-link to="/users" exact tag="li" v-if="user.type === 'admin'" v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Gerenciar usuários'">
                                <icon-groups class="icon"></icon-groups>
                            </router-link>
                            <router-link to="/companies" exact tag="li" v-if="user.type === 'admin'" v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Gerenciar empresas'">
                                <icon-companies class="icon"></icon-companies>
                            </router-link>
                            <li @click="showSettings = true" v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Configurações'">
                                <icon-edit class="icon"></icon-edit></li>
                            <li @click="logout" v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }" :title="'Sair do sistema'">
                                <icon-logout class="icon"></icon-logout>
                            </li>
                        </ul>
                    </nav>
                    <span class="push-both-sides"></span>
                    <div class="sidebar-widgets">
                    </div>
                </div>
                <div class="main-column">
                    <header id="main-column-header">
                        <div class="header-app-title">
                            <h3>Olá, {{ truncatedName }}!</h3>
                        </div>
                        <span class="push-both-sides"></span>
                        <div class="header-dropdown-menu" style="padding-right: 20px;">
                            <app-dropdown-menu :menuList="menuList">
                                <h3>menu</h3>
                            </app-dropdown-menu>
                        </div>
                    </header>
                    <main id="main">
                        <keep-alive include="app-tracker">
                            <router-view></router-view>
                        </keep-alive>
                    </main>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import Modals from "./Modals.vue";
    import DropdownMenuComponent from "../../components/Utilities/DropdownMenu.vue";
    import SettingsComponent from "./Settings/Settings.vue";
    import MeAPI from "../../api/me";
    import Vue from 'vue';
    import io from 'socket.io-client';
    import VueSocketio from 'vue-socket.io'
    import _ from 'lodash';
    import moment from 'moment';
    import config from '../../config';
    import DeviceDetails from './Tracker/DeviceDetailsWindow.vue';
    import MapContextMenu from './Tracker/MapContextMenu.vue';
    import Howler from 'howler';
    const alarmSound = require('../../assets/sounds/alarm.mp3');

    export default {
        name: 'app-main',
        components: {
            "app-modals": Modals,
            "app-settings": SettingsComponent,
            "app-dropdown-menu": DropdownMenuComponent,
            "app-device-details-window": DeviceDetails,
            "app-map-context-menu": MapContextMenu,
        },
        data(){
            return {
                accessTokenExpirationTimer: null,
                showSettings: false,
                menuList: [
                    {text: 'Add. empresa', type: 'system', action: this.addCompany, onlyAdmin: true},
                    {text: 'Configurações', type: 'system', action: this.toggleSettings, onlyAdmin: false},
                    {text: 'Sair', type: 'system', action: this.logout, onlyAdmin: false}
                ]
            }
        },
        computed: {
            ...mapState('auth', [
                'user', 'token', 'company'
            ]),
            shortCompanyName(){
                if(_.has(this.company, 'name')){
                    const words = _.upperCase(this.company.name).split(" ");
                    if(words.length === 1){
                        return words[0].substr(0, 2);
                    }
                    return words.map((n) => n[0]).join("");
                }
                return 'AG';
            },
            truncatedName(){
                return _.truncate(this.user.name, {
                    'length': 24,
                    'separator': ' ',
                    'omission': ' [...] '
                });
            }
        },
        methods: {
            ...mapMutations(['setSystemInitialized']),
            ...mapActions('auth', {
                logoutAction: 'logout',
                setAuthUser: 'setAuthUser',
                refreshToken: 'refreshToken',
                changeCompanyAction: 'changeCompany'
            }),
            ...mapActions('loading', [
                'setLoadingText','startLoading', 'stopLoading'
            ]),
            ...mapActions('tracker', [
                'loadDevices'
            ]),
            ...mapActions('toast', [
                'showToast'
            ]),
            logout(){
                const vm = this;
                clearInterval(vm.accessTokenExpirationTimer);
                vm.logoutAction().then((authenticated)=>{
                    if(!authenticated){
                        vm.$router.replace("/login");
                    }
                });
            },
            changeCompany(userCompany){
                const vm = this;
                if(vm.company.id === userCompany.company.id){
                    vm.showToast({
                        type: "warning",
                        message: "Você já está na empresa selecionada."
                    });
                    return true;
                }
                vm.setLoadingText("Mudando para a empresa " + userCompany.company.name + ".");
                vm.startLoading();
                setTimeout(() => {
                    vm.changeCompanyAction(userCompany.company.id).then(() => {
                        vm.stopLoading(); // tracker watch becomes resposible to reload devices
                        vm.$bus.$emit('system-initialized');
                    });
                }, 1000);
            },
            toggleSettings(){
                this.showSettings = !this.showSettings;
            },
            addCompany(){
                this.$modal.show('company-form', {
                    company: null
                });
            },
            countdownToRefreshToken(){
                const vm = this;
                let accessTokenSecondsLeft = parseInt(moment.duration(moment(vm.token.accessTokenExpiresAt).diff(moment())).asSeconds());
                if(vm.accessTokenExpirationTimer) clearInterval(vm.accessTokenExpirationTimer);
                vm.accessTokenExpirationTimer = setInterval(function(){
                    accessTokenSecondsLeft --;
                    // console.log("Seconds left to refreshToken: ", accessTokenSecondsLeft);
                    if(accessTokenSecondsLeft <= 30) {
                        console.log("Refreshing token...");
                        clearInterval(vm.accessTokenExpirationTimer);
                        vm.refreshToken().then(() => {
                            console.log("Token refreshed... Starting again.");
                            vm.countdownToRefreshToken();
                        });
                    }
                },1000);
            },
            log(msg, color){
                color = color || "black";
                let bgc = "White";
                switch (color) {
                    case "success":  color = "Green";      bgc = "LimeGreen";       break;
                    case "info":     color = "DodgerBlue"; bgc = "Turquoise";       break;
                    case "error":    color = "Red";        bgc = "Black";           break;
                    case "start":    color = "OliveDrab";  bgc = "PaleGreen";       break;
                    case "warning":  color = "Tomato";     bgc = "Black";           break;
                    case "end":      color = "Orchid";     bgc = "MediumVioletRed"; break;
                    default: color = color;
                }

                if (typeof msg == "object") {
                    console.log(msg);
                } else if (typeof color == "object") {
                    console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
                    console.log(color);
                } else {
                    console.log("%c" + msg, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");
                }
            },
            systemInitialized(){
                const vm = this;
                vm.$bus.$on('sound-play', () => {
                    new Howl({
                        src: [alarmSound]
                    }).play();
                });
            }
        },
        created(){
            const vm = this;

            /* start socket.io */

            const socket = io(config.socketServer + '?token=' + vm.token.accessToken);
            Vue.use(VueSocketio, socket);

            /* if user disconnected / reconnected from socket server */

            socket.on('reconnect_attempt', (attemptNumber) => {
                vm.setLoadingText("Tentando reconectar (" + attemptNumber + ").");
                vm.startLoading();
                console.log("Trying reconnection.");
            });

            socket.on('disconnect', (reason) => {
                vm.setLoadingText("Desconectado.");
                vm.startLoading();
                console.log("Disconnected from socket server. Reason: ", reason);
            });

            socket.on('reconnect', (reason) => {
                vm.stopLoading();
                console.log("Reconnected.");
            });

            /* initialize the refresh token timer */

            let accessTokenSecondsLeft = parseInt(moment.duration(moment(vm.token.accessTokenExpiresAt).diff(moment())).asSeconds());
            let refreshTokenSecondsLeft = parseInt(moment.duration(moment(vm.token.refreshTokenExpiresAt).diff(moment())).asSeconds());

            new Promise((resolve, reject) => { // deal with user token issues
                window.setAppLoadingText("Carregando sessão...");
                vm.setLoadingText("Carregando sessão...");
                if(accessTokenSecondsLeft > 30){
                    vm.log("Token set using Access Token.", "info");
                    vm.countdownToRefreshToken();
                    resolve("Token set using Access Token.");
                }
                else if(accessTokenSecondsLeft <= 0 && refreshTokenSecondsLeft > 30){
                    vm.refreshToken().then(() => {
                        vm.log("Token set using Refresh Token.", "info");
                        vm.countdownToRefreshToken();
                        resolve("Token set using Refresh Token.");
                    });
                }
                else{
                    vm.stopLoading();
                    console.log("Auto-logout possibly due to refresh token expiration.");
                    vm.logout();
                    reject(new Error("Logout due to Access and Refresh Token expiration."));
                }
            }).then(() => { // Connect to socket.io
                return new Promise((resolve, reject) => {
                    window.setAppLoadingText("Carregando tecnologia real-time...");
                    if(socket.connected){
                        vm.log("Socket connection succeeded.", "info");
                        setTimeout(() => {
                            resolve("Socket connection succeeded.");
                        }, 1000)
                    }
                    else {
                        socket.on('connect', () => {
                            vm.log("Socket connection succeeded.", "info");
                            setTimeout(() => {
                                resolve("Socket connection succeeded.");
                            }, 1000)
                        });
                    }
                });
            }).then(() => {
                return new Promise((resolve, reject) => {
                    window.setAppLoadingText("Carregando usuário...");
                    vm.setAuthUser().then((me) => {
                        vm.menuList = _.filter(vm.menuList, (menuItem) => {
                            if(menuItem.type === 'system'){
                                if(menuItem.onlyAdmin && vm.user.type !== 'admin') return false;
                                return true;
                            }
                        });
                        vm.user.userCompanies.forEach((userCompany) => {
                            vm.menuList.unshift({
                                text: userCompany.company.name,
                                type: 'company',
                                action: vm.changeCompany,
                                param: userCompany
                            });
                        });
                        vm.log("Authenticated user set.", "info");
                        resolve('Authenticated user set.');
                    }).catch((error) => {
                        vm.stopLoading();
                        console.log("Couldn't get authenticated user.");
                        vm.logout();
                    });
                });
            }).then(() => {
                if(window.isAppLoading()) {
                    window.removeAppLoading();
                }
                vm.stopLoading();
                vm.setSystemInitialized(true);
                vm.$bus.$emit('system-initialized');
                vm.systemInitialized();
            });

        }
    }
</script>

<style scoped>

    div.body div.app-content {
        width: 100%;
        height: 100%;
        display: flex;
        position: fixed;
        flex-direction: row;
        background: #26272E;
    }

    div.body div.app-settings {
        width: 100%;
        height: 100%;
        display: flex;
        position: fixed;
        z-index: 99;
        flex-direction: row;
        background: #26272E;
    }

    .settings-animation-enter-active {
      transition: all .15s ease-in;
    }
    .settings-animation-leave-active {
      transition: all .15s ease-in;
    }
    .settings-animation-enter, .settings-animation-leave-to {
      transform: scale(1.07) translateZ(0px);
      opacity: 0;
    }

    .app-animation-enter-active {
      transition: all .15s ease-in;
    }
    .app-animation-leave-active {
      transition: all .15s ease-in;
    }
    .app-animation-enter, .app-animation-leave-to {
      transform: scale(0.93) translateZ(0px);
      opacity: 0;
    }

    .router-animation-enter-active {
      transition: all .15s ease-in;
    }
    .router-animation-leave-active {
        transition: all 0s ease-out;
    }
    .router-animation-enter, .router-animation-leave-to {
      opacity: 0;
    }

    .left-column, .left-column header, .main-column header {
        background-color: #26272E;
    }

    .left-column {
        width: 64px;
        min-height: 100%;
        flex-direction: column;
        display: flex;
        flex-shrink: 0;
    }

    .left-column header {
        height: 64px;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .left-column header h1 {
        color: #FFF;
        text-transform: uppercase;
        font-weight: bold;
        align-self: center;
    }

    .left-column nav.main-menu ul {
        display: flex;
        flex-direction: column;
    }

    .left-column nav.main-menu ul li {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
        height: 48px;
        cursor: pointer;
        color: #CCC;
        border-bottom: 1px solid #252525;
        transition: all 0.3s;
        font-size: 18px;
        text-align: center;
    }

    .left-column nav.main-menu ul li.logout-from-app {
        color: #D46C63;
    }

    .left-column nav.main-menu ul li:hover {
        background: #212128;
    }

    .left-column nav.main-menu ul li.router-link-active {
        background: #212128;
        color: #61AFEF;
    }

    .left-column nav.main-menu ul li:last-child {
        border-bottom: 0 none;
    }

    .left-column div.sidebar-widgets {
        border-top: 1px solid #292929;
    }

    .main-column {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        flex-basis: 0;
        flex-shrink: 0;
    }

    .main-column header {
        display: flex;
        flex-direction: row;
        height: 64px;
        flex-shrink: 0;
        box-shadow: 0 5px 5px -5px #333;
    }

    .main-column header .header-app-title {
        display: flex;
        flex-direction: row;
        min-height: 64px;
        padding: 0 0 0 20px;
    }

    .main-column header .header-dropdown-menu {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }

    .main-column header h3 {
        align-self: center;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #CCC;
    }

    .main-column main {
        flex-grow: 1;
        display: flex;
        overflow: hidden;
    }

</style>
