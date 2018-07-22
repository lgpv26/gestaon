<template>
    <div class="body" v-if="system.initialized">
        <app-caller-id></app-caller-id>
        <app-morph-screen></app-morph-screen>
        <app-modals></app-modals>
        <transition name="app-animation">
            <div id="content" class="app-content" v-show="!showSettings">
                <div id="left-column" class="left-column">
                    <header>
                        <div class="header__dropdown-menu">
                            <app-dropdown-menu :menuList="menuList" placement="bottom-start" :verticalOffset="-10">
                                <div class="dropdown-menu__company-name">
                                    <h3>{{ utils.getInitialsFromString(company.name) }}</h3>
                                </div>
                            </app-dropdown-menu>
                        </div>
                    </header>
                    <app-menu></app-menu>
                    <span class="push-both-sides"></span>
                    <app-connected-users></app-connected-users>
                </div>
                <div class="main-column" :style="{ width: (dimensions.window.width - 60) + 'px' }">
                    <header class="main-column__header">
                        <div class="header__container" v-if="$route.name === 'dashboard'">
                            <app-request-board-filter></app-request-board-filter>
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
    import { mapMutations, mapState, mapActions } from 'vuex';
    import { MorphScreen } from "./MorphScreen/index"
    import RequestBoardFilterComponent from "./Dashboard/RequestBoard/RequestBoardFilter.vue"
    import SearchComponent from "./_Shared/Search.vue"
    import CallerIDComponent from "./_Shared/CallerID.vue"
    import MenuComponent from "./_Shared/Menu.vue"
    import Modals from "./Dashboard/Modals.vue"
    import DropdownMenuComponent from "../../components/Utilities/DropdownMenu.vue"
    import ConnectedUsersComponent from "./_Shared/Sidebar/ConnectedUsers.vue"

    import _ from 'lodash'
    import moment from 'moment'

    import SessionHandler from './SessionHandler'

    export default {
        name: 'app-main',
        components: {
            "app-modals": Modals,
            "app-morph-screen": MorphScreen,
            "app-dropdown-menu": DropdownMenuComponent,
            "app-search": SearchComponent,
            "app-menu": MenuComponent,
            "app-caller-id": CallerIDComponent,
            "app-request-board-filter": RequestBoardFilterComponent,
            "app-connected-users": ConnectedUsersComponent
        },
        mixins: [SessionHandler],
        data(){
            return {
                showSettings: false,
                menuList: [
                    /*{text: 'Add. empresa', type: 'system', action: this.addCompany, onlyAdmin: true},*/
                    /*{text: 'Configurações', type: 'system', action: this.toggleSettings, onlyAdmin: false},*/
                    {text: 'Sair', type: 'system', action: this.logout, onlyAdmin: false}
                ]
            }
        },
        computed: {
            ...mapState(['app', 'system']),
            ...mapState('auth', ['user','tokens','company']),
            ...mapState('morph-screen', ['screens']),
            ...mapState(['dimensions']),
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
            ...mapActions('auth', {
                logoutAction: 'logout',
                setAuthUser: 'setAuthUser',
                refreshToken: 'refreshToken',
                changeCompanyAction: 'changeCompany'
            }),
            ...mapActions('data/users', {
                loadAllUsers: 'loadAll'
            }),
            ...mapActions('data/accounts', {
                loadAllAccounts: 'loadAll'
            }),
            ...mapActions('data/client-groups',{
                'loadAllClientGroups': 'loadAll'
            }),
            ...mapActions('data/payment-methods',{
                'loadAllPaymentMethods': 'loadAll'
            }),
            ...mapActions('data/promotion-channels',{
                'loadAllPromotionChannels': 'loadAll'
            }),
            ...mapActions('data/products',{
                'loadAllProducts': 'loadAll'
            }),
            ...mapActions('loading', [
                'setLoadingText','startLoading', 'stopLoading'
            ]),
            ...mapActions('tracker', [
                'loadDevices'
            ]),
            ...mapActions('morph-screen', [
                'showMorphScreen', 'loadMorphScreenData'
            ]),
            ...mapActions('toast', [
                'showToast', 'showError'
            ]),
            ...mapActions('presence', [
                'setConnectedUsers'
            ]),
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
                vm.startLoading()
                setTimeout(() => {
                    vm.changeCompanyAction(userCompany.company.id).then(() => {
                        vm.stopLoading(); // tracker watch becomes resposible to reload devices
                        vm.$bus.$emit('system-initialized')
                    });
                }, 1000);
            },
            registerSoundEventListeners(){
                new Howl({
                    src: [alarmSound]
                }).play()
            }
        },
        created(){
            this.$bus.$on('sound-play', this.registerSoundEventListeners)
        },
        beforeDestroy(){
            this.$bus.$off('sound-play', this.registerSoundEventListeners)
        }
    }
</script>

<style lang="scss">

    div.body #content {
        width: 100%;
        height: 100%;
        display: flex;
        position: fixed;
        flex-direction: row;

        -webkit-backface-visibility: hidden;
        -webkit-transform: translate3d(0, 0, 0);
        -webkit-transform: translateZ(0);
        transform: translateZ(0); /*for older browsers*/
        will-change: transform;
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
        background-color: var(--bg-color--2);
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
