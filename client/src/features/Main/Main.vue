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
                            <app-dropdown-menu
                                    :menuList="menuList"
                                    placement="bottom-start"
                                    :verticalOffset="-10"
                            >
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
                <div
                        class="main-column"
                        :style="{ width: dimensions.window.width - 60 + 'px' }"
                >
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
                        <ul class="header__menu">
                            <li><i class="mi mi-notifications-none"></i></li>
                            <li @click="addRequest()">
                                <i class="mi mi-add-circle-outline"></i>
                            </li>
                            <li
                                    v-if="!isCallerIdDisabled"
                                    @click="
                  isCallerIdDisabled ? activateCallerId() : disableCallerId()
                "
                            >
                                <i class="mi mi-phone-in-talk"></i>
                            </li>
                            <li
                                    v-else
                                    @click="
                  isCallerIdDisabled ? activateCallerId() : disableCallerId()
                "
                            >
                                <i class="mi mi-call-end"></i>
                            </li>
                        </ul>
                        <!--
                                    <app-search></app-search>
                                    <div class="header__draft-menu" v-if="screens.length > 0" @click="showMorphScreen()">
                                        <div class="count">
                                            <span>{{ screens.length }}</span>
                                        </div>
                                        <icon-draft-list></icon-draft-list>
                                    </div>
                                    -->
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
    import { mapMutations, mapState, mapActions } from "vuex";
    import { MorphScreen } from "./MorphScreen/index";
    import RequestBoardFilterComponent from "./Dashboard/RequestBoard/RequestBoardFilter.vue";
    import SearchComponent from "./_Shared/Search.vue";
    import CallerIDComponent from "./_Shared/CallerID/CallerID.vue";
    import MenuComponent from "./_Shared/Menu.vue";
    import Modals from "./Dashboard/Modals.vue";
    import DropdownMenuComponent from "../../components/Utilities/DropdownMenu.vue";
    import Windows from "./_Shared/Windows/Windows.vue";
    import ConnectedUsersComponent from "./_Shared/Sidebar/ConnectedUsers.vue";

    import Card from "../../vuex/models/Card";
    import Request from "../../vuex/models/Request";

    import _ from "lodash";
    import shortid from "shortid";
    import moment from "moment";

    import SessionHandler from "./SessionHandler";

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
            "app-connected-users": ConnectedUsersComponent
        },
        mixins: [SessionHandler],
        data() {
            return {
                requestInterval: null,
                showSettings: false,
                menuList: [
                    /*{text: 'Add. empresa', type: 'system', action: this.addCompany, onlyAdmin: true},*/
                    /*{text: 'Configurações', type: 'system', action: this.toggleSettings, onlyAdmin: false},*/
                    { text: "Sair", type: "system", action: this.logout, onlyAdmin: false }
                ]
            };
        },
        computed: {
            ...mapState(["app", "system", "lastDataSyncedDate"]),
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
            ...mapActions(["setLastDataSyncedDate"]),
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
            ...mapActions("request-queue", ["initializeRequestQueue","clearProcessingQueue"]),
            toggleCallerIdFunctionality() {
                console.log(this.isCallerIdDisabled);
                if (this.isCallerIdDisabled) {
                    this.activateCallerId();
                } else {
                    this.disableCallerId();
                }
            },
            async addRequest() {
                const windowTmpId = `tmp/${shortid.generate()}`;
                const cardTmpId = `tmp/${shortid.generate()}`;
                const requestUIStateTmpId = `tmp/${shortid.generate()}`;
                const requestPaymentTmpId = `tmp/${shortid.generate()}`;
                const requestOrderTmpId = `tmp/${shortid.generate()}`;
                const requestOrderProductTmpId = `tmp/${shortid.generate()}`;
                const requestClientAddressTmpId = `tmp/${shortid.generate()}`;
                const requestTmpId = `tmp/${shortid.generate()}`;
                const clientTmpId = `tmp/${shortid.generate()}`;
                const addressTmpId = `tmp/${shortid.generate()}`;
                const clientAddressTmpId = `tmp/${shortid.generate()}`;
                const clientPhoneTmpId = `tmp/${shortid.generate()}`;
                this.$store.dispatch("entities/windows/insert", {
                    data: {
                        id: windowTmpId,
                        zIndex:
                        this.$store.getters["entities/windows/query"]().max("zIndex") + 1
                    }
                });
                this.$store.dispatch("entities/cards/insert", {
                    data: {
                        id: cardTmpId,
                        windowId: windowTmpId,
                        requestId: requestTmpId
                    }
                });
                this.$store.dispatch("entities/requestUIState/insert", {
                    data: {
                        id: requestUIStateTmpId,
                        windowId: windowTmpId,
                        requestId: requestTmpId
                    }
                });
                this.$store.dispatch("entities/requestPayments/insert", {
                    data: {
                        id: requestPaymentTmpId,
                        requestId: requestTmpId,
                        paymentMethodId: 1,
                        amount: _.get(
                            this.$store.getters["entities/products/find"](6),
                            "price",
                            false
                        )
                            ? this.$store.getters["entities/products/find"](6).price
                            : 0
                    }
                });
                this.$store.dispatch("entities/requestOrderProducts/insert", {
                    data: {
                        id: requestOrderProductTmpId,
                        requestOrderId: requestOrderTmpId,
                        productId: 1,
                        unitPrice: _.get(
                            this.$store.getters["entities/products/find"](6),
                            "price",
                            0
                        )
                    }
                });
                this.$store.dispatch("entities/requestOrders/insert", {
                    data: {
                        id: requestOrderTmpId
                    }
                });
                this.$store.dispatch("entities/clients/insert", {
                    data: {
                        id: clientTmpId
                    }
                });
                this.$store.dispatch("entities/clientPhones/insert", {
                    data: {
                        id: clientPhoneTmpId,
                        clientId: clientTmpId
                    }
                });
                this.$store.dispatch("entities/addresses/insert", {
                    data: {
                        id: addressTmpId
                    }
                });
                this.$store.dispatch("entities/clientAddresses/insert", {
                    data: {
                        id: clientAddressTmpId,
                        clientId: clientTmpId,
                        addressId: addressTmpId
                    }
                });
                this.$store.dispatch("entities/requestClientAddresses/insert", {
                    data: {
                        id: requestClientAddressTmpId,
                        requestId: requestTmpId,
                        clientAddressId: clientAddressTmpId
                    }
                });
                this.$store.dispatch("entities/requests/insert", {
                    data: {
                        id: requestTmpId,
                        clientId: clientTmpId,
                        requestOrderId: requestOrderTmpId,
                        status: "draft"
                    }
                });
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
            runRequestQueue() {},
            onSystemInitialized() {
                const vm = this;
                console.log("System initialized");
                vm.$socket.on("request-queue:sync", ev => {
                    console.log("request-queue:sync", ev);
                    if (ev.success) {
                        ev.evData.processedQueue.forEach(request => {
                            if (request.action === "update-status") {
                                Request.update({
                                    where: request.requestId,
                                    data: {
                                        status: request.status,
                                        dateUpdated: request.dateUpdated
                                    }
                                });
                            } else if (request.action === "update-user") {
                                Request.update({
                                    where: request.requestId,
                                    data: {
                                        userId: request.userId,
                                        dateUpdated: request.dateUpdated
                                    }
                                });
                            } else {
                                const requestId = _.get(request, "tmpId", request.id);
                                const cards = Card.query()
                                    .where("requestId", requestId)
                                    .with("request.requestUIState")
                                    .get();
                                const card = _.first(cards);
                                let windowTmpId = `tmp/${shortid.generate()}`;
                                let cardTmpId = `tmp/${shortid.generate()}`;
                                let requestUIStateTmpId = `tmp/${shortid.generate()}`;
                                if (!Number.isInteger(requestId) && card) {
                                    // remove previous card/request/
                                    this.$store.dispatch("entities/cards/delete", card.id);
                                    this.$store.dispatch("entities/windows/delete", card.windowId);
                                    this.$store.dispatch(
                                        "entities/requests/delete",
                                        card.requestId
                                    );
                                    this.$store.dispatch(
                                        "entities/requestUIState/delete",
                                        card.request.requestUIState.id
                                    );
                                } else if (card) {
                                    windowTmpId = card.windowId;
                                    cardTmpId = card.id;
                                    requestUIStateTmpId = card.request.requestUIState.id;
                                }
                                this.$store.dispatch("entities/requests/insertOrUpdate", {
                                    data: request
                                });
                                this.$store.dispatch("entities/windows/insert", {
                                    data: {
                                        id: windowTmpId,
                                        zIndex:
                                        this.$store.getters["entities/windows/query"]().max(
                                            "zIndex"
                                        ) + 1,
                                        show: false
                                    }
                                });
                                this.$store.dispatch("entities/cards/insert", {
                                    data: {
                                        id: cardTmpId,
                                        windowId: windowTmpId,
                                        requestId: request.id
                                    }
                                });
                                this.$store.dispatch("entities/requestUIState/insert", {
                                    data: {
                                        id: requestUIStateTmpId,
                                        windowId: windowTmpId,
                                        requestId: request.id
                                    }
                                });

                                const requestPayments = this.$store.getters['entities/requestPayments']().where('requestId',(requestId) => {
                                    return requestId === request.id
                                }).get()
                                requestPayments.forEach((requestPayment) => {
                                    vm.$store.dispatch('entities/requestPayments/delete', requestPayment.id)
                                })
                                this.$store.dispatch("entities/requestPayments/insertOrUpdate", {
                                    data: request.requestPayments
                                });

                                this.$store.dispatch("entities/requestPayments/insertOrUpdate", {
                                    data: request.requestPayments
                                });
                                this.$store.dispatch("entities/requestOrders/insertOrUpdate", {
                                    data: request.requestOrder
                                });

                                const requestOrderProducts = this.$store.getters['entities/requestOrderProducts']().where('requestOrderId',(requestOrderId) => {
                                    return requestOrderId === request.requestOrder.id
                                }).get()
                                requestOrderProducts.forEach((requestOrderProduct) => {
                                    vm.$store.dispatch('entities/requestOrderProducts/delete', requestOrderProduct.id)
                                })
                                this.$store.dispatch("entities/requestOrderProducts/insertOrUpdate", {
                                    data: request.requestOrder.requestOrderProducts
                                });

                                this.$store.dispatch("entities/clients/insertOrUpdate", {
                                    data: request.client
                                });
                                request.client.clientAddresses.forEach(clientAddress => {
                                    vm.$store.dispatch("entities/addresses/insertOrUpdate", {
                                        data: clientAddress.address
                                    });
                                });

                                const clientAddresses = this.$store.getters['entities/clientAddresses']().where('clientId',(clientId) => {
                                    return clientId === request.client.id
                                }).get()
                                clientAddresses.forEach((clientAddress) => {
                                    vm.$store.dispatch('entities/clientAddresses/delete', clientAddress.id)
                                })
                                this.$store.dispatch("entities/clientAddresses/insertOrUpdate", {
                                    data: request.client.clientAddresses
                                })

                                this.$store.dispatch(
                                    "entities/requestClientAddresses/insertOrUpdate",
                                    {
                                        data: request.requestClientAddresses
                                    }
                                );

                                const savedRequest = Request.query()
                                    .with("card")
                                    .with("client")
                                    .with("requestOrder.requestOrderProducts")
                                    .find(request.id);

                                Card.update({
                                    where: savedRequest.card.id,
                                    data: {
                                        clientName: savedRequest.client.name,
                                        orderSubtotal: _.sumBy(
                                            savedRequest.requestOrder.requestOrderProducts,
                                            requestOrderProduct => {
                                                return (
                                                    requestOrderProduct.quantity *
                                                    (requestOrderProduct.unitPrice -
                                                        requestOrderProduct.unitDiscount)
                                                );
                                            }
                                        )
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        created() {
            this.$bus.$on("sound-play", this.registerSoundEventListeners);
            this.runRequestQueue();
            this.clearProcessingQueue();
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

    .left-column,
    .left-column header,
    .main-column header {
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
