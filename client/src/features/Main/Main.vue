<template>
    <div class="body" v-if="system.initialized">
        <app-caller-id></app-caller-id>
        <app-morph-screen></app-morph-screen>
        <app-windows></app-windows>
        <app-modals></app-modals>
        <transition name="app-animation">
            <div id="content" class="app-content" v-show="!showSettings">
                <div id="left-column" class="left-column">
                    <header>
                        <div class="header__dropdown-menu">
                            <app-dropdown-menu :menuList="menuList" placement="bottom-start" :verticalOffset="-10">
                                <div class="dropdown-menu__company-name">
                                    <app-gravatar style="width: 32px; height: 32px; border-radius: 32px;" :email="user.email" :title="user.name"
                                                  v-tippy="{ placement: 'bottom-start', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }">
                                    </app-gravatar>
                                </div>
                                <template slot="header">
                                    <h3 style="font-size: 14px; padding: 10px 12px;">{{ user.name }}</h3>
                                </template>
                            </app-dropdown-menu>
                        </div>
                    </header>
                    <app-menu></app-menu>
                    <span class="push-both-sides"></span>
                    <app-connected-users></app-connected-users>
                </div>
                <div class="main-column" :style="{ width: dimensions.window.width - 60 + 'px' }">
                    <header class="main-column__header">
                        <div class="header__container" v-if="$route.name === 'dashboard'">
                            <app-request-board-filter ref="requestBoardFilter"></app-request-board-filter>
                        </div>
                        <div class="header__container" v-else>
                            <div class="container__title">
                                <h3>Olá, {{ truncatedName }}!</h3>
                            </div>
                        </div>
                        <a href="javascript:void(0)" v-if="false" class="btn btn--primary" style="margin-left: 12px;" @click="customMethod()">Test button</a>
                        <span class="push-both-sides"></span>
                        <ul class="header__menu">
                            <li @click="checkAllState()"><i class="mi mi-notifications-none"></i></li>
                            <li @click="addCard()">
                                <i class="mi mi-add-circle-outline"></i>
                            </li>
                            <li v-if="!isCallerIdDisabled" @click="isCallerIdDisabled ? activateCallerId() : disableCallerId()"
                            >
                                <i class="mi mi-phone-in-talk"></i>
                            </li>
                            <li v-else @click="isCallerIdDisabled ? activateCallerId() : disableCallerId()">
                                <i class="mi mi-call-end"></i>
                            </li>
                        </ul>
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
    import { mapMutations, mapState, mapActions } from "vuex"
    import PromiseQueue from 'p-queue'
    import { MorphScreen } from "./MorphScreen/index"
    import RequestBoardFilterComponent from "./Dashboard/RequestBoard/RequestBoardFilter.vue"
    import SearchComponent from "./_Shared/Search.vue"
    import CallerIDComponent from "./_Shared/CallerID/CallerID.vue"
    import MenuComponent from "./_Shared/Menu.vue"
    import Modals from "./Dashboard/Modals.vue"
    import DropdownMenuComponent from "../../components/Utilities/DropdownMenu.vue"
    import Windows from "./_Shared/Windows/Windows.vue"
    import ConnectedUsersComponent from "./_Shared/Sidebar/ConnectedUsers.vue"

    import Request from "../../vuex/models/Request"

    import _ from "lodash"
    import shortid from "shortid"
    import Vue from 'vue'
    import ss from "socket.io-stream"

    import SessionHandler from "./SessionHandler"
    import DataImporter from "../../helpers/DataImporter"
    import RequestHelper from "../../helpers/RequestHelper"

    export default {
        name: "app-main",
        components: {
            "app-windows": Windows,
            "app-modals": Modals,
            "app-morph-screen": MorphScreen,
            "app-dropdown-menu": DropdownMenuComponent,
            "app-search": SearchComponent,
            "app-menu": MenuComponent,
            "app-caller-id": CallerIDComponent,
            "app-request-board-filter": RequestBoardFilterComponent,
            "app-connected-users": ConnectedUsersComponent,
        },
        mixins: [SessionHandler, RequestHelper, DataImporter],
        data() {
            return {
                requestQueueInitialized: false,
                isFirstInitialization: true,
                requestInterval: null,
                showSettings: false,
                stream: null,
                requestQueueSyncAcumulator: [],
                menuList: [
                    /*{text: 'Add. empresa', type: 'system', action: this.addCompany, onlyAdmin: true},*/
                    /*{text: 'Configurações', type: 'system', action: this.toggleSettings, onlyAdmin: false},*/
                    { text: "Sair", type: "system", action: this.logout, onlyAdmin: false }
                ]
            };
        },
        computed: {
            ...mapState(["app", "system", "lastDataSyncedDate", "lastRequestsLoadedDate"]),
            ...mapState("auth", ["user", "tokens", "company"]),
            ...mapState("morph-screen", ["screens"]),
            ...mapState("caller-id", {
                isCallerIdDisabled: "disabled"
            }),
            ...mapState(["dimensions"]),
            truncatedName() {
                return _.truncate(this.user.name, {
                    length: 24,
                    separator: " ",
                    omission: " [...] "
                });
            }
        },
        methods: {
            ...mapMutations(["setApp", "setSystemInitialized"]),
            //...mapMutations('request-queue',["REMOVE_PROCESSED_QUEUE_ITEMS"]),
            ...mapActions(["setLastDataSyncedDate","setLastRequestsLoadedDate","setIsSearchReady"]),
            ...mapActions("auth", {
                logoutAction: "logout",
                setAuthUser: "setAuthUser",
                refreshToken: "refreshToken",
                changeCompanyAction: "changeCompany"
            }),
            ...mapActions("data/users", {
                loadAllUsers: "loadAll"
            }),
            ...mapActions("data/accounts", {
                loadAllAccounts: "loadAll"
            }),
            ...mapActions("data/client-groups", {
                loadAllClientGroups: "loadAll"
            }),
            ...mapActions("data/payment-methods", {
                loadAllPaymentMethods: "loadAll"
            }),
            ...mapActions("data/promotion-channels", {
                loadAllPromotionChannels: "loadAll"
            }),
            ...mapActions("data/products", {
                loadAllProducts: "loadAll"
            }),
            ...mapActions("loading", ["setLoadingText", "startLoading", "stopLoading"]),
            ...mapActions("tracker", ["loadDevices"]),
            ...mapActions("morph-screen", ["showMorphScreen", "loadMorphScreenData"]),
            ...mapActions("caller-id", ["activateCallerId", "disableCallerId"]),
            ...mapActions("toast", ["showToast", "showError"]),
            ...mapActions("presence", ["setConnectedUsers"]),
            ...mapActions("elasticlunr", ["setLunrIndex"]),
            ...mapActions('request-queue',{
                'initializeRequestQueue': 'initializeRequestQueue',
                'clearRequestProcessingQueue': 'clearRequestProcessingQueue',
                'resetRequestQueueState': 'resetState'
            }),
            ...mapActions('chat-queue',{
                'initializeChatQueue': 'initializeChatQueue',
                'clearChatProcessingQueue': 'clearChatProcessingQueue',
                'resetChatQueueState': 'resetState'
            }),
            toggleCallerIdFunctionality() {
                console.log(this.isCallerIdDisabled);
                if (this.isCallerIdDisabled) {
                    this.activateCallerId();
                } else {
                    this.disableCallerId();
                }
            },
            checkAllState(){
                console.log(this.$store.getters[`entities/cards`]().get())
                console.log(this.$store.getters[`entities/windows`]().get())
                console.log(this.$store.getters[`entities/requests`]().get())
                console.log(this.$store.getters[`entities/requestUIState`]().get())
                console.log(this.$store.getters[`entities/clients`]().get())
                console.log(this.$store.getters[`entities/clientAddresses`]().get())
                console.log(this.$store.getters[`entities/clientPhones`]().get())
                console.log(this.$store.getters[`entities/requestOrders`]().get())
                console.log(this.$store.getters[`entities/requestOrderProducts`]().get())
                console.log(this.$store.getters[`entities/requestPayments`]().get())
            },
            changeCompany(userCompany) {
                const vm = this;
                if (vm.company.id === userCompany.company.id) {
                    vm.showToast({
                        type: "warning",
                        message: "Você já está na empresa selecionada."
                    });
                    return true;
                }
                vm.setLoadingText(
                    "Mudando para a empresa " + userCompany.company.name + "."
                );
                vm.startLoading();
                setTimeout(() => {
                    vm.changeCompanyAction(userCompany.company.id).then(() => {
                        vm.stopLoading(); // tracker watch becomes resposible to reload devices
                        vm.$bus.$emit("system-initialized");
                    });
                }, 1000);
            },
            registerSoundEventListeners() {
                new Howl({
                    src: [alarmSound]
                }).play();
            },
            pushToRequestQueueSyncAcumulator(ev){
                this.requestQueueSyncAcumulator.push(ev)
            },
            async onRequestQueueSync(ev){
                const vm = this
                console.log("request-queue:sync", ev)
                if(ev.success){
                    const firstRequest = _.first(ev.evData.processedQueue).data
                    /*if(moment(firstRequest.dateUpdated).isBefore(moment(this.lastRequestsLoadedDate))){
                        console.log("Already updated with recent content")
                        return
                    }*/
                    ev.evData.processedQueue.forEach(function(processedItem){
                        // did the processedItem pass the validation?
                        if(!processedItem.success){
                            processedItem.stop = true
                        }
                        if(processedItem.stop) return

                        const request = processedItem.data
                        if (request.action === "update-status") {
                            const originalRequest = Request.query()
                                .with("card")
                                .with("client.clientAddresses.address")
                                .with("client.clientPhones")
                                .with("requestClientAddresses.clientAddress.address")
                                .with("requestOrder.requestOrderProducts")
                                .with("requestPayments")
                                .with("requestClientAddresses")
                                .with("requestClientPhones")
                                .with("requestUIState")
                                .find(request.requestId)

                            const changedRequest = _.assign(JSON.parse(JSON.stringify(originalRequest)), {
                                status: request.status,
                                dateUpdated: request.dateUpdated
                            })

                            Request.update({
                                where: request.requestId,
                                data: {
                                    status: request.status,
                                    dateUpdated: request.dateUpdated
                                }
                            })
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: 'cards',
                                where: (record) => {
                                    return record.requestId === request.requestId
                                },
                                data: {
                                    status: request.status
                                }
                            })
                            //vm.REMOVE_PROCESSED_QUEUE_ITEMS(request.requestId)
                            vm.$store.dispatch("entities/update", {
                                entity: 'requestUIState',
                                where: originalRequest.requestUIState.id,
                                data: {
                                    requestString: Request.getComparationObj(changedRequest),
                                    hasRequestChanges: _.isEqual(Request.getComparationObj(originalRequest),Request.getComparationObj(changedRequest))
                                }
                            })
                        }
                        else if (request.action === "update-user") {
                            const originalRequest = Request.query()
                                .with("card")
                                .with("client.clientAddresses.address")
                                .with("client.clientPhones")
                                .with("requestClientAddresses.clientAddress.address")
                                .with("requestOrder.requestOrderProducts")
                                .with("requestPayments")
                                .with("requestClientAddresses")
                                .with("requestUIState")
                                .find(request.requestId)

                            const changedRequest = _.assign(JSON.parse(JSON.stringify(originalRequest)), {
                                userId: request.userId,
                                dateUpdated: request.dateUpdated
                            })

                            Request.update({
                                where: request.requestId,
                                data: {
                                    userId: request.userId,
                                    dateUpdated: request.dateUpdated
                                }
                            })
                            vm.$store.dispatch("entities/insertOrUpdate", {
                                entity: 'cards',
                                where: (record) => {
                                    return record.requestId === request.requestId
                                },
                                data: {
                                    responsibleUserId: request.userId
                                }
                            })
                            //vm.REMOVE_PROCESSED_QUEUE_ITEMS(request.requestId)
                            vm.$store.dispatch("entities/update", {
                                entity: 'requestUIState',
                                where: originalRequest.requestUIState.id,
                                data: {
                                    requestString: Request.getComparationObj(changedRequest),
                                    hasRequestChanges: _.isEqual(Request.getComparationObj(originalRequest),Request.getComparationObj(changedRequest))
                                }
                            })
                        }
                        else {
                            Request.load(vm, request, {
                                ignoreOfflineDBInsertion: false
                            }).catch((err) => {
                                console.log("Error occurred", err)
                            })
                        }
                    })
                }
            },
            onRequestChatItemSend(ev){
                //console.log("Request chaat", ev)
            },
            async onSystemInitialized() {
                const vm = this
                console.log("System initialized")

                if(vm.isFirstInitialization){
                    console.log("Escutando eventos request-queue:sync e request-chat:itemSend")
                    vm.isFirstInitialization = false

                    Vue.nextTick(async () => {
                        await vm.$refs.requestBoardFilter.loadCards()

                        if(!vm.requestQueueInitialized){
                            vm.requestQueueInitialized = true
                            vm.initializeRequestQueue(vm.$socket)
                            vm.initializeChatQueue(vm.$socket)
                        }

                        vm.requestQueueSyncAcumulator.forEach((requestQueueSyncEv,index) => {
                            console.log("Sincronizando",index,requestQueueSyncEv)
                            vm.onRequestQueueSync(requestQueueSyncEv)
                        })
                        vm.$socket.removeListener("request-queue:sync", vm.pushToRequestQueueSyncAcumulator)
                        vm.$socket.on("request-queue:sync", vm.onRequestQueueSync)

                        /*this.$socket.on("request-chat:send", (ev) => {
                            console.log("request-chat:send", ev)
                            if(ev.evData.op === "send" && ev.evData.success){
                                if(this.user.id !== ev.evData.data.userId){
                                    this.$store.dispatch("entities/requestChats/insert", {
                                        data: {
                                            id: ev.evData.data.id,
                                            userId: ev.evData.data.userId,
                                            requestId: ev.evData.data.requestId,
                                            type: 'message',
                                            data: ev.evData.data.data,
                                            dateUpdated: ev.evData.data.dateUpdated,
                                            dateCreated: ev.evData.data.dateCreated,
                                            status: 'synced'
                                        }
                                    })
                                }
                                else {
                                    this.$store.dispatch("entities/requestChats/delete", ev.evData.data.tmpId)
                                    this.$store.dispatch("entities/requestChats/insert", {
                                        data: {
                                            id: ev.evData.data.id,
                                            userId: ev.evData.data.userId,
                                            requestId: ev.evData.data.requestId,
                                            type: 'message',
                                            data: ev.evData.data.data,
                                            dateUpdated: ev.evData.data.dateUpdated,
                                            dateCreated: ev.evData.data.dateCreated,
                                            status: 'synced'
                                        }
                                    })
                                }
                            }

                        })*/
                    })

                }
            },
            customMethod(){
                this.importFromLastDataSyncedDate()
            }
        },
        mounted() {
            this.isFirstInitialization = true
            this.$bus.$on("sound-play", this.registerSoundEventListeners)
            this.stream = ss.createStream()
        },
        beforeDestroy() {
            this.$bus.$off("sound-play", this.registerSoundEventListeners);
        }
    };
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
        transition: all 0.15s ease-in;
    }
    .settings-animation-leave-active {
        transition: all 0.15s ease-in;
    }
    .settings-animation-enter,
    .settings-animation-leave-to {
        transform: scale(1.07) translateZ(0px);
        opacity: 0;
    }

    .app-animation-enter-active {
        transition: all 0.15s ease-in;
    }
    .app-animation-leave-active {
        transition: all 0.15s ease-in;
    }
    .app-animation-enter,
    .app-animation-leave-to {
        transform: scale(0.93) translateZ(0px);
        opacity: 0;
    }

    .router-animation-enter-active {
        transition: all 0.15s ease-in;
    }
    .router-animation-leave-active {
        transition: all 0s ease-out;
    }

    .router-animation-enter,
    .router-animation-leave-to {
        opacity: 0;
    }

    .left-column {
        background-color: var(--bg-color--2);
    }

    .left-column header, .main-column header {
        background-color: var(--bg-color--5);
    }

    .left-column {
        /* -webkit-box-shadow: var(--main-menu-shadow);
        box-shadow: var(--main-menu-shadow); */
        -webkit-box-shadow: none;
        box-shadow: none;
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
        background-color: var(--bg-color--7);
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
        padding: 0 0 0 10px;
        .header__menu {
            display: flex;
            flex-direction: row;
            height: 100%;
            li {
                width: 60px;
                display: flex;
                align-items: center;
                justify-content: center;

                font-size: 24px;
                margin-left: 1px;
                background-color: var(--bg-color--10);
                cursor: pointer;
                &:hover {
                    background-color: var(--bg-color--9);
                }
                &:active {
                    background-color: var(--bg-color--primary);
                    i {
                        color: var(--font-color--10);
                    }
                }
                i {
                    position: relative;
                    top: -1px;
                    color: var(--font-color--7);
                }
            }
        }
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
