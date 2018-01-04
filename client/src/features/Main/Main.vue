<template>
    <div class="body">
        <app-active-request-card></app-active-request-card>
        <app-morph-screen></app-morph-screen>
        <app-modals></app-modals>
        <app-device-details-window></app-device-details-window>
        <app-map-context-menu></app-map-context-menu>
        <transition name="settings-animation">
            <app-settings v-if="showSettings" :showSettings.sync="showSettings"></app-settings>
        </transition>
        <transition name="app-animation">
            <div id="content" class="app-content" v-show="!showSettings">
                <div id="left-column" class="left-column">
                    <header>
                        <div class="header__dropdown-menu">
                            <app-dropdown-menu :menuList="menuList" placement="bottom-start" :verticalOffset="-10">
                                <div class="dropdown-menu__company-name">
                                    <h3>{{ shortCompanyName }}</h3>
                                </div>
                            </app-dropdown-menu>
                        </div>
                    </header>
                    <nav class="main-menu">
                        <ul>
                            <!-- <router-link to="/dashboard" exact tag="li"><i class="mi mi-dashboard"></i></router-link> -->
                            <router-link to="/dashboard" exact tag="li" v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Atendimento'">
                                <menu-icon-dashboard class="icon"></menu-icon-dashboard>
                            </router-link>
                            <router-link to="/clients" exact tag="li" v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Ligações #Clientes'">
                                <menu-icon-sale class="icon"></menu-icon-sale>
                            </router-link>
                            <li v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Caixa / conferência'">
                                <menu-icon-cash-check class="icon"></menu-icon-cash-check></li>
                            <li v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Financeiro'">
                                <menu-icon-finance class="icon"></menu-icon-finance></li>
                            <li v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Nota fiscal'">
                                <menu-icon-nfe class="icon"></menu-icon-nfe></li>
                            <li v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Estoque'">
                                <menu-icon-stock class="icon"></menu-icon-stock></li>
                            <li v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Relatórios'">
                                <menu-icon-chart class="icon"></menu-icon-chart></li>
                            <li v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Lalala'">
                                <menu-icon-phone class="icon"></menu-icon-phone></li>
                            <li v-tippy="{ position: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Rastreamento'">
                                <menu-icon-track class="icon"></menu-icon-track></li>
                        </ul>
                    </nav>
                    <span class="push-both-sides"></span>
                    <div class="sidebar-widgets">
                    </div>
                </div>
                <div class="main-column">
                    <header class="main-column__header">
                        <div class="header__container" v-if="$route.name === 'dashboard'">
                            <div class="container__request-board">
                                <app-datetime-picker class="request-board__filter  filter--date" :offset="{ bottom: 15 }">
                                    <div class="filter-item__target">
                                        <span class="target__title">Data</span>
                                        <div class="target__amount">
                                            <div></div>
                                            <span>05</span>
                                        </div>
                                    </div>
                                </app-datetime-picker>
                                <app-select class="request-board__filter filter--type" :sections="requestBoardFilter.type"  :verticalOffset="15">
                                    <div class="filter-item__target">
                                        <span class="target__title">Tipo</span>
                                    </div>
                                    <template slot="section" slot-scope="sectionProps">
                                        <h3>{{ sectionProps.text }}</h3>
                                    </template>
                                    <template slot="item" slot-scope="itemProps">
                                        <span>{{itemProps.text }}</span>
                                    </template>
                                </app-select>
                                <app-select class="request-board__filter filter--users-in-charge" :items="requestBoardFilter.usersInCharge" :verticalOffset="15">
                                    <div class="filter-item__target">
                                        <span class="target__title">Responsável</span>
                                        <div class="target__amount">
                                            <div></div>
                                            <span>05</span>
                                        </div>
                                    </div>
                                    <template slot="item" slot-scope="itemProps">
                                        <span>{{itemProps.text }}</span>
                                    </template>
                                </app-select>
                                <app-select class="request-board__filter filter--filter" :sections="requestBoardFilter.filter" :verticalOffset="15">
                                    <div class="filter-item__target">
                                        <span class="target__title">Filtro</span>
                                        <div class="target__amount">
                                            <div></div>
                                            <span>05</span>
                                        </div>
                                    </div>
                                    <template slot="section" slot-scope="sectionProps">
                                        <h3>{{ sectionProps.text }}</h3>
                                    </template>
                                    <template slot="item" slot-scope="itemProps">
                                        <span>{{itemProps.text }}</span>
                                    </template>
                                </app-select>
                            </div>
                        </div>
                        <div class="header__container" v-else>
                            <div class="container__title">
                                <h3>Olá, {{ truncatedName }}!</h3>
                            </div>
                        </div>
                        <span class="push-both-sides"></span>
                        <app-search></app-search>
                        <div class="header__draft-menu" v-if="screens.length > 0" @click="showMorphScreen()">
                            <div class="count">
                                <span>{{ screens.length }}</span>
                            </div>
                            <icon-draft-list></icon-draft-list>
                        </div>
                    </header>
                    <main id="main">
                        <keep-alive include="app-dashboard">
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
    import { MorphScreen } from "./MorphScreen/index";
    import Search from "./_Shared/Search.vue";
    import ActiveRequestCard from "./Dashboard/RequestBoard/ActiveRequestCard.vue";
    import Modals from "./Dashboard/Modals.vue";
    import DropdownMenuComponent from "../../components/Utilities/DropdownMenu.vue";
    import SettingsComponent from "./Settings/Settings.vue";
    import MeAPI from "../../api/me";
    import DraftsAPI from "../../api/drafts";
    import Vue from 'vue';
    import io from 'socket.io-client';
    import VueSocketio from 'vue-socket.io'
    import _ from 'lodash';
    import moment from 'moment';
    import config from '../../config';
    import DeviceDetails from './Dashboard/Tracker/DeviceDetailsWindow.vue';
    import MapContextMenu from './Dashboard/Tracker/MapContextMenu.vue';
    import Howler from 'howler';

    const alarmSound = require('../../assets/sounds/alarm.mp3');

    export default {
        name: 'app-main',
        components: {
            "app-active-request-card": ActiveRequestCard,
            "app-modals": Modals,
            "app-morph-screen": MorphScreen,
            "app-settings": SettingsComponent,
            "app-dropdown-menu": DropdownMenuComponent,
            "app-device-details-window": DeviceDetails,
            "app-map-context-menu": MapContextMenu,
            "app-search": Search
        },
        data(){
            return {
                accessTokenExpirationTimer: null,
                showSettings: false,
                requestBoardFilter: {
                    usersInCharge: [
                        { text: "Thiago Yoithi" },
                        { text: "Acimar Rocha" },
                        { text: "Mailon Ruan" }
                    ],
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
                            text: "Tipo de cliente",
                            items: [
                                { text: "Todos" },
                                { text: "Varejo Disk" },
                                { text: "Atacado" },
                                { text: "Venda Automática" }
                            ]
                        },
                        {
                            text: "Tipo de operação",
                            items: [
                                { text: "Todos" },
                                { text: "Tarefa" },
                                { text: "Orçamento" }
                            ]
                        },
                    ]
                },
                menuList: [
                    {text: 'Add. empresa', type: 'system', action: this.addCompany, onlyAdmin: true},
                    {text: 'Configurações', type: 'system', action: this.toggleSettings, onlyAdmin: false},
                    {text: 'Sair', type: 'system', action: this.logout, onlyAdmin: false}
                ]
            }
        },
        computed: {
            ...mapState(['app']),
            ...mapState('auth', ['user','token','company']),
            ...mapState('morph-screen', ['screens']),
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
            ...mapMutations(['setApp','setSystemInitialized']),
            ...mapMutations('morph-screen', ['SHOW_MS', 'SET_ALL_MS_SCREENS']),
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
            ...mapActions('morph-screen', [
                'loadMorphScreenData'
            ]),
            ...mapActions('toast', [
                'showToast', 'showError'
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
            showMorphScreen(){
                this.SET_ALL_MS_SCREENS({
                    active: false
                });
                this.SHOW_MS(true);
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
            localStorage.debug = false;
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
                    }).catch((err) => {
                        reject(new Error("Refresh token expired or invalid."));
                    });
                }
                else{
                    vm.stopLoading();
                    console.log("Auto-logout possibly due to refresh token expiration.");
                    reject(new Error("Logout due to Access and Refresh Token expiration."));
                }
            }).catch((err) => {
                vm.showError(err);
                vm.logout();
            }).then(() => { // Connect to socket.io
                return new Promise((resolve, reject) => {
                    window.setAppLoadingText("Carregando tecnologia real-time...");
                    if(socket.connected){
                        vm.log("Socket connection succeeded.", "info");
                        resolve("Socket connection succeeded.");
                    }
                    else {
                        socket.on('connect', () => {
                            vm.log("Socket connection succeeded.", "info");
                            resolve("Socket connection succeeded.");
                        });
                    }
                });
            }).then(() => {
                return new Promise((resolve, reject) => {
                    window.setAppLoadingText("Carregando usuário...");
                    vm.setAuthUser().then((me) => {
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
                return vm.loadMorphScreenData(vm.company.id).catch((err) => {
                    console.log("The current user doesn't have any drafts created.");
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

<style>

    div.body #content {
        width: 100%;
        height: 100%;
        display: flex;
        position: fixed;
        flex-direction: row;
        background: var(--bg-color--5);
        transition: .3s all;

        -webkit-backface-visibility: hidden;
        -webkit-perspective: 1000;
        -webkit-transform: translate3d(0,0,0);
        -webkit-transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000;
        transform: translate3d(0,0,0);
        transform: translateZ(0);
    }

    div.body #content.unfocused {
        -webkit-filter: blur(1px);
        -moz-filter: blur(1px);
        -o-filter: blur(1px);
        -ms-filter: blur(1px);
        filter: blur(1px);
    }

    div.body div.app-settings {
        width: 100%;
        height: 100%;
        display: flex;
        position: fixed;
        z-index: 99;
        flex-direction: row;
        background: var(--bg-color--5);
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
        background-color: var(--bg-color--5);
    }

    .left-column {
        -webkit-box-shadow: var(--main-menu-shadow);
        box-shadow: var(--main-menu-shadow);
        position: relative;
        z-index: 9999;
        width: 60px;
        min-height: 100%;
        flex-direction: column;
        display: flex;
        flex-shrink: 0;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .left-column header {
        height: 60px;
        width: 100%;
        display: flex;
        justify-content: center;
        flex-shrink: 0;
    }

    .left-column header .header__dropdown-menu {
        display: flex;
        flex-direction: row;
    }

    .left-column header .header__dropdown-menu div.dropdown-menu__company-name {
        align-self: center;
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 32px;
        background-color: var(--bg-color--7)
    }

    .left-column header .header__dropdown-menu div.dropdown-menu__company-name h3 {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--base-color);
        font-size: 14px;
    }

    .left-column nav.main-menu ul {
        display: flex;
        flex-direction: column;
    }

    .left-column nav.main-menu ul li {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px;
        cursor: pointer;
        color: #CCC;
        border-bottom: 1px solid var(--bg-color--5);
        font-size: 18px;
        text-align: center;
    }

    .left-column nav.main-menu ul li.logout-from-app {
        color: #D46C63;
    }

    .left-column nav.main-menu ul li:hover {
        background: var(--bg-color--4);
    }

    .left-column nav.main-menu ul li.router-link-active {
        background: var(--bg-color--9);
    }

    .left-column nav.main-menu ul li.router-link-active .fill {
        fill: var(--font-color--10);
    }

    .left-column nav.main-menu ul li.router-link-active .fill--primary {
        fill: var(--font-color--secondary);
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
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .main-column__header {
        display: flex;
        flex-direction: row;
        height: 60px;
        flex-shrink: 0;
        box-shadow: var(--main-header-shadow);
        align-items: center;
        padding: 0 10px;
    }

    .main-column__header .container__request-board {
        display: flex;
        flex-direction: row;
        min-height: 60px;
        align-items: center;
    }

    .main-column__header .container__request-board .request-board__filter.filter--type .target__title {
        margin-right: 0;
    }

    .main-column__header .container__request-board .request-board__filter {
        display: flex;
        flex-direction: row;
        height: 32px;
        cursor: pointer;
        padding: 0 0 0 10px;
    }

    .main-column__header .container__request-board .request-board__filter:first-child {
        padding-left: 0;
    }

    .main-column__header .container__request-board .request-board__filter h3 {
        color: var(--secondary-color--d);
    }

    .main-column__header .header__draft-menu {
        width: 32px;
        height: 32px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        margin-left: 10px;
    }

    .main-column__header .header__draft-menu .count {
        bottom: -2px;
        left: -2px;
        position: absolute;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        background-color: var(--terciary-color);
    }

    .main-column__header .header__draft-menu .count span {
        font-size: 10px;
        font-weight: 800;
        color: var(--font-color--10);
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
        margin-right: 8px;
        font-weight: 600;
        color: var(--base-color--d)
    }

    .filter-item__target .target__amount {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .filter-item__target .target__amount > div {
        width: 3px;
        height: 3px;
        border-radius: 3px;
        margin-right: 2px;
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

    .main-column__header .container__title {
        display: flex;
        flex-direction: row;
        padding: 0 0 0 10px;
        justify-content: center;
        align-self: center;
    }

    .main-column__header .container__title > h3 {
        font-size: 14px;
    }

    .main-column main {
        flex-grow: 1;
        display: flex;
        overflow: hidden;
    }

</style>
