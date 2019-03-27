/* CSS imports */

import "./assets/fonts/montserrat.css";

import "material-icons/css/material-icons.min.css";
import "izitoast/dist/css/iziToast.min.css";
import "smooth-scrollbar/dist/smooth-scrollbar.css";
import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/themes/dark.css";
/*import 'flatpickr/dist/themes/airbnb.css'*/
import "./assets/styles/reset.css";
import "./assets/styles/main.css";
import "./assets/styles/dark-theme.css";

import "./utils/resize-listener";

/* Vue imports */

import Vue from "vue";
import Resource from "vue-resource";
import Router from "vue-router";
import VueTheMask, { TheMask } from "vue-the-mask";
import VueModal from "vue-js-modal";
import VueTimeago from "vue-timeago";
import VueResize from "vue-resize";
import VueTippy from "vue-tippy";
import VueStatic from "vue-static";
import VueWorker from "vue-worker";
import VuePerfectScrollbar from "vue-perfect-scrollbar";
import VueTextareaAutosize from 'vue-textarea-autosize'
import VueHighlight from 'vue-highlight-text/public/directive.min'
import VueGravatar from 'vue-gravatar'
import VueSocketIO from 'vue-socket.io'

import DexieRelationships from "dexie-relationships";

import ElementPtBr from "element-ui/lib/locale/lang/pt-br";
import ElementLocale from "element-ui/lib/locale";

import VueMoney from "v-money";
import App from "./App.vue";

/* App imports */

import config from "./config";
import utils from "./utils/index";
import routes from "./routes";
import store from "./vuex/store";

import OAuthAPI from "./api/oauth";

/* Plugins imports */

import moment from "moment";
import _ from "lodash";
import SocketIO from "socket.io-client";

// or import all icons if you don't care about bundle size
import "vue-awesome/icons";
import Icon from "vue-awesome/components/Icon";

/* Set Vue */
Vue.set(Vue.prototype, "_", _)
Vue.set(Vue.prototype, "moment", moment)
Vue.set(Vue.prototype, "config", config)
Vue.set(Vue.prototype, "utils", utils)
Vue.set(Vue.prototype, "modelDefinitions", {
    offlineDBModels: {
        addresses: "id, name, address, cep, city, neighborhood, state, status, dateCreated, dateUpdated",
        users: "id, name, email, type, status, dateUpdated, dateCreated, dateRemoved",
        products: "id, name, price, quantity, dateUpdated, dateCreated, dateRemoved",
        paymentMethods: "id, name, rule, tax, taxUnit, autoPay, hasDeadline, dateUpdated, dateCreated, dateRemoved",
        promotionChannels: "id, name, dateUpdated, dateCreated, dateRemoved",
        clientGroups: "id, name, dateUpdated, dateCreated, dateRemoved",
        customFields: "id, name, dateUpdated, dateCreated, dateRemoved",

        requestChats: "id, requestId, userId, type, data, status, dateUpdated, dateCreated, dateRemoved",

        clients: "id, companyId, name, obs, creditLimit, limitInUse, clientGroupId, legalDocument, dateUpdated, dateCreated, dateRemoved, status, origin",
        clientPhones: "id, name, number, clientId, dateUpdated, dateCreated, dateRemoved",
        clientAddresses: "id, addressId, clientId, complement, dateCreated, dateUpdated, dateRemoved, name, number, status",

        requests: "id, clientId, phoneLine, obs, dateCreated, dateUpdated, dateRemoved, deliveryDate, deliveredDate, deliveredBy, finishedBy, requestOrderId, status, userId",
        requestClientAddresses: "id, clientAddressId, dateCreated, dateRemoved, dateUpdated, lat, lng, requestId, status, type",
        requestClientPhones: "id, requestId, clientPhoneId, type, dateUpdated, dateCreated, dateRemoved, status",
        requestOrders: "id, promotionChannelId, obs, status, dateUpdated, dateCreated, dateRemoved",
        requestOrderProducts: "id, unitPrice, unitDiscount, quantity, requestOrderId, productId, dateUpdated, dateCreated, dateRemoved",
        requestPayments: "id, requestId, paymentMethodId, amount, code, paid, deadlineDatetime, dateUpdated, dateCreated, dateRemoved",
    },
    searchModels: {
        searchClients: "id, name, address, number, complement, neighborhood, city, state",
        searchAddresses: "id, name, address, neighborhood, city, state, cep, country"
    },
    stateModels: {
        STATE_cards: "id, windowId, type, requestId, orderSubtotal, clientName, status, responsibleUserId, clientAddress",
        STATE_requestUIState: "id, activeTab, isAddingClientAddress, requestClientAddressForm, requestId, showRequestChat, showClientOrderTimeline, requestString, requestOrderString, hasRequestOrderChanges, hasRequestChanges, isLoading",
        STATE_windows: "id, show, zIndex",

        STATE_addresses: "id, name, address, cep, city, dateCreated, dateUpdated, neighborhood, state, status",

        STATE_clients: "id, companyId, name, obs, creditLimit, limitInUse, clientGroupId, legalDocument, dateUpdated, dateCreated, dateRemoved, status, origin",
        STATE_clientPhones: "id, name, number, clientId, dateUpdated, dateCreated, dateRemoved",
        STATE_clientAddresses: "id, addressId, clientId, complement, dateCreated, dateUpdated, dateRemoved, name, number, status",

        STATE_requests: "id, clientId, phoneLine, obs, dateCreated, dateUpdated, dateRemoved, deliveryDate, deliveredDate, deliveredBy, finishedBy, requestOrderId, status, userId, requestUIState",
        STATE_requestClientAddresses: "id, clientAddressId, dateCreated, dateRemoved, dateUpdated, lat, lng, requestId, status, type",
        STATE_requestClientPhones: "id, requestId, clientPhoneId, type, dateUpdated, dateCreated, dateRemoved, status",
        STATE_requestOrders: "id, promotionChannelId, obs, status, dateUpdated, dateCreated, dateRemoved",
        STATE_requestOrderProducts: "id, unitPrice, unitDiscount, quantity, requestOrderId, productId, dateUpdated, dateCreated, dateRemoved",
        STATE_requestPayments: "id, requestId, paymentMethodId, amount, code, paid, deadlineDatetime, dateUpdated, dateCreated, dateRemoved",

        STATE_requestChats: "id, requestId, userId, type, data, status, dateUpdated, dateCreated, dateRemoved",
    }
})

Vue.set(Vue.prototype, "$socket", SocketIO(config.socketServer, {
    autoConnect: false
}))

/* Resource Configs */

Vue.use(Resource);

/* Workers */

Vue.use(VueWorker);

/* Socket.io */

/*Vue.use(new VueSocketIO({
    debug: true,
    connection: SocketIO(config.socketServer, {
        autoConnect: false
    }), //options object is Optional
    vuex: {
        store,
        actionPrefix: "SOCKET_",
        mutationPrefix: "SOCKET_"
    }
}))*/

/* Vue Plugins */

Vue.use(VueTimeago, {
    name: "timeago", // component name, `timeago` by default
    locale: "pt-BR",
    locales: {
        // you will need json-loader in webpack 1
        "pt-BR": require("vue-timeago/locales/pt-BR.json")
    }
});

Vue.directive('highlight', VueHighlight)

Vue.use(VueTextareaAutosize)

Vue.use(VueTheMask);

Vue.use(VueResize);

Vue.use(VueModal);

Vue.use(VueTippy);

Vue.use(VueTextareaAutosize)

Vue.component("v-icon", Icon)

Vue.use(VueStatic, {
    namespaced: true
});

Vue.use(VueMoney, {
    decimal: ",",
    thousands: ".",
    prefix: "R$ ",
    suffix: "",
    precision: 2,
    masked: false
});

import Dexie from "dexie";

Vue.prototype.$db = new Dexie("offline-db");
Vue.prototype.$statedb = new Dexie("state-db");

/* Mask */

Vue.component("app-mask", TheMask);
Vue.component("app-perfect-scrollbar", VuePerfectScrollbar);

/* Element eleme */

ElementLocale.use(ElementPtBr);
import { DatePicker, TimeSelect, TimePicker, Slider } from "element-ui";

Vue.component("app-slider", Slider);
Vue.component(DatePicker.name, DatePicker);
Vue.component(TimeSelect.name, TimeSelect);
Vue.component(TimePicker.name, TimePicker);

Vue.component('app-gravatar', VueGravatar);

/* Router Configs*/

Vue.use(Router);

/* Components */

import FlatPickrComponent from "vue-flatpickr-component";
Vue.component("app-datetime-selector", FlatPickrComponent);
import PanelLoadingComponent from "./components/Utilities/PanelLoading.vue";
Vue.component("app-panel-loading", PanelLoadingComponent);
import SelectComponent from "./components/Inputs/Select.vue";
Vue.component("app-select", SelectComponent);
import DropdownMenuComponent from "./components/Utilities/DropdownMenu.vue";
Vue.component("app-dropdown-menu", DropdownMenuComponent);
import SwitchComponent from "./components/Forms/Switch.vue";
Vue.component("app-switch", SwitchComponent);
import PermissionComponent from "./components/Utilities/Permission.vue";
Vue.component("app-permission", PermissionComponent);
import ScrollableComponent from "./components/Utilities/Scrollable.vue";
Vue.component("app-scrollable", ScrollableComponent);
/*import DatetimePickerComponent from './components/Inputs/DatetimePicker.vue';
Vue.component("app-datetime-picker", DatetimePickerComponent);*/
import CheckboxInputComponent from "./components/Inputs/CheckboxInput.vue";
Vue.component("app-checkbox", CheckboxInputComponent);
import PopoverComponent from "./components/Utilities/Popover.vue";
Vue.component("app-popover", PopoverComponent);

/* icons from src/assets/svgs */

require
    .context("./assets/svgs/icons/", true, /\.svg$/)
    .keys()
    .forEach(svgFile => {
        const svgFilePath = svgFile.split(".")[1].replace("/", "");
        const svgFileName = _.last(svgFilePath.split("/"));
        Vue.component(
            "icon-" + svgFileName,
            require("./assets/svgs/icons/" + svgFilePath + ".svg")
        );
    });

require
    .context("./assets/svgs/header-icons/", true, /\.svg$/)
    .keys()
    .forEach(svgFile => {
        const svgFilePath = svgFile.split(".")[1].replace("/", "");
        const svgFileName = _.last(svgFilePath.split("/"));
        Vue.component(
            "icon-" + svgFileName,
            require("./assets/svgs/header-icons/" + svgFilePath + ".svg")
        );
    });

require
    .context("./assets/svgs/menu-icons/", true, /\.svg$/)
    .keys()
    .forEach(svgFile => {
        const svgFilePath = svgFile.split(".")[1].replace("/", "");
        const svgFileName = _.last(svgFilePath.split("/"));
        Vue.component(
            "menu-icon-" + svgFileName,
            require("./assets/svgs/menu-icons/" + svgFilePath + ".svg")
        );
    });

require
    .context("./assets/svgs/request-board-icons/", true, /\.svg$/)
    .keys()
    .forEach(svgFile => {
        const svgFilePath = svgFile.split(".")[1].replace("/", "");
        const svgFileName = _.last(svgFilePath.split("/"));
        Vue.component(
            "request-board-icon-" + svgFileName,
            require("./assets/svgs/request-board-icons/" + svgFilePath + ".svg")
        );
    });

require
    .context("./assets/svgs/section-icons/", true, /\.svg$/)
    .keys()
    .forEach(svgFile => {
        const svgFilePath = svgFile.split(".")[1].replace("/", "");
        const svgFileName = _.last(svgFilePath.split("/"));
        Vue.component(
            "icon-" + svgFileName,
            require("./assets/svgs/section-icons/" + svgFilePath + ".svg")
        );
    });

require
    .context("./assets/imgs/form-instructions/", true, /\.svg$/)
    .keys()
    .forEach(svgFile => {
        const svgFilePath = svgFile.split(".")[1].replace("/", "");
        const svgFileName = _.last(svgFilePath.split("/"));
        Vue.component(
            "img-" + svgFileName,
            require("./assets/imgs/form-instructions/" + svgFilePath + ".svg")
        );
    });

/* Global configs */

moment.locale("pt-br");

const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
});

let tokens = localStorage.getItem("tokens");
if (tokens !== null) {
    tokens = JSON.parse(tokens);
    store.commit("auth/authenticate", tokens);
}

/* Login Guard */

router.beforeEach((to, from, next) => {
    console.log(to.path)
    if (!store.state.auth.authenticated && to.path !== "/login" && to.path !== "/register"){
        return next('/login')
    }
    document.title = to.meta.title
    next()
});

/* Request interceptors */

Vue.http.interceptors.push((request, next) => {
    if (store.state.auth.authenticated) {
        request.params["token"] = store.state.auth.tokens.accessToken
    }
    next(response => {
        if(_.get(response, "body.error.code", false) === "EXPIRED_TOKEN" && response.status === 401){
            console.log("AccessToken expirado, tentativa de renovação do token usando o refreshToken", store.state.auth.tokens.refreshToken)
            return OAuthAPI.refreshToken(store.state.auth.tokens.refreshToken).then(result => {
                store.dispatch("auth/refreshToken", { accessToken: result.data.accessToken, refreshToken: result.data.refreshToken })
                console.log("Refresh token adquirido com sucesso!", result)
                return Vue.http(request)
            }).catch(async err => {
                console.log("Não foi possível renovar o token, redirecionando para a tela de entrada")
                const authenticated = await store.dispatch("auth/logout")
                if (!authenticated) {
                    location.reload()
                }
            })
        }
    })
})

/* Global Event Bus */

let EventBus = new Vue();

Object.defineProperties(Vue.prototype, {
    $bus: {
        get: function() {
            return EventBus;
        }
    }
})

new Vue({
    router,
    el: "#app",
    render: h => h(App)
});
