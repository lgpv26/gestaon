/* CSS imports */

import './assets/fonts/montserrat.css'

import 'material-icons/css/material-icons.min.css'
import 'izitoast/dist/css/iziToast.min.css'
import 'smooth-scrollbar/dist/smooth-scrollbar.css'
import './assets/styles/reset.css'
import './assets/styles/main.css'
import './assets/styles/dark-theme.css'

import './utils/resize-listener'

/* Vue imports */

import Vue from 'vue'
import Resource from 'vue-resource'
import Router from 'vue-router'
import { TheMask } from 'vue-the-mask'
import VueModal from 'vue-js-modal'
import VueTimeago from 'vue-timeago'
import VueResize from 'vue-resize'
import VueTippy from 'vue-tippy'

import ElementPtBr from 'element-ui/lib/locale/lang/pt-br'
import ElementLocale from 'element-ui/lib/locale'

import VueMoney from 'v-money'
import App from './App.vue'

/* App imports */

import routes from './routes'
import store from './vuex/store'

/* Plugins imports */

import moment from 'moment'
import _ from 'lodash'

/* Resource Configs */

Vue.use(Resource)

/* Vue Plugins */

Vue.use(VueTimeago, {
    name: 'timeago', // component name, `timeago` by default
    locale: 'pt-BR',
    locales: {
        // you will need json-loader in webpack 1
        'pt-BR': require('vue-timeago/locales/pt-BR.json')
    }
})

Vue.use(VueResize)

Vue.use(VueModal)

Vue.use(VueTippy)

Vue.use(VueMoney, {
    decimal: ',',
    thousands: '.',
    prefix: 'R$ ',
    suffix: '',
    precision: 2,
    masked: false
})

/* Mask */

Vue.component('app-mask', TheMask);

/* Element eleme */

ElementLocale.use(ElementPtBr);
import {DatePicker, TimeSelect, TimePicker, Slider} from 'element-ui'

Vue.component('app-slider', Slider);
Vue.component(DatePicker.name, DatePicker);
Vue.component(TimeSelect.name, TimeSelect);
Vue.component(TimePicker.name, TimePicker);

/* Router Configs*/

Vue.use(Router);

/* Components */

import PanelLoadingComponent from './components/Utilities/PanelLoading.vue';
Vue.component("app-panel-loading", PanelLoadingComponent);
import SelectComponent from './components/Inputs/Select.vue';
Vue.component("app-select", SelectComponent);
import DropdownMenuComponent from './components/Utilities/DropdownMenu.vue';
Vue.component("app-dropdown-menu", DropdownMenuComponent);
import SwitchComponent from './components/Forms/Switch.vue';
Vue.component("app-switch", SwitchComponent);
import PermissionComponent from './components/Utilities/Permission.vue';
Vue.component("app-permission", PermissionComponent);
import ScrollableComponent from './components/Utilities/Scrollable.vue';
Vue.component("app-scrollable", ScrollableComponent);
import DatetimePickerComponent from './components/Inputs/DatetimePicker.vue';
Vue.component("app-datetime-picker", DatetimePickerComponent);
import CheckboxInputComponent from './components/Inputs/CheckboxInput.vue';
Vue.component("app-checkbox", CheckboxInputComponent)
import PopoverComponent from './components/Utilities/Popover.vue'
Vue.component("app-popover", PopoverComponent)

/* icons from src/assets/svgs */

require.context('./assets/svgs/icons/', true, /\.svg$/).keys().forEach((svgFile) => {
    const svgFilePath = svgFile.split('.')[1].replace('/','');
    const svgFileName = _.last(svgFilePath.split('/'));
    Vue.component('icon-' + svgFileName, require('./assets/svgs/icons/' + svgFilePath + '.svg'));
});

require.context('./assets/svgs/header-icons/', true, /\.svg$/).keys().forEach((svgFile) => {
    const svgFilePath = svgFile.split('.')[1].replace('/','');
    const svgFileName = _.last(svgFilePath.split('/'));
    Vue.component('icon-' + svgFileName, require('./assets/svgs/header-icons/' + svgFilePath + '.svg'));
});

require.context('./assets/svgs/menu-icons/', true, /\.svg$/).keys().forEach((svgFile) => {
    const svgFilePath = svgFile.split('.')[1].replace('/','');
    const svgFileName = _.last(svgFilePath.split('/'));
    Vue.component('menu-icon-' + svgFileName, require('./assets/svgs/menu-icons/' + svgFilePath + '.svg'));
});

require.context('./assets/svgs/request-board-icons/', true, /\.svg$/).keys().forEach((svgFile) => {
    const svgFilePath = svgFile.split('.')[1].replace('/','');
    const svgFileName = _.last(svgFilePath.split('/'));
    Vue.component('request-board-icon-' + svgFileName, require('./assets/svgs/request-board-icons/' + svgFilePath + '.svg'));
});

require.context('./assets/svgs/section-icons/', true, /\.svg$/).keys().forEach((svgFile) => {
    const svgFilePath = svgFile.split('.')[1].replace('/','');
    const svgFileName = _.last(svgFilePath.split('/'));
    Vue.component('icon-' + svgFileName, require('./assets/svgs/section-icons/' + svgFilePath + '.svg'));
});

require.context('./assets/imgs/form-instructions/', true, /\.svg$/).keys().forEach((svgFile) => {
    const svgFilePath = svgFile.split('.')[1].replace('/','');
    const svgFileName = _.last(svgFilePath.split('/'));
    Vue.component('img-' + svgFileName, require('./assets/imgs/form-instructions/' + svgFilePath + '.svg'));
});

/*
require.context('./assets/svgs/menu-icons/', true, /\.svg$/).keys().forEach((svgFile) => {
    const svgFileName = svgFile.split('.')[1].replace('/','');
    console.log(svgFileName);
    Vue.component('menu-icon-' + svgFileName, require('./assets/svgs/menu-icons/' + svgFileName + '.svg'));
});
*/

/* Global configs */

moment.locale('pt-br');

const SlidingMarker = require('marker-animate-unobtrusive');
SlidingMarker.initializeGlobally();

Vue.http.interceptors.push((request, next) => {

    if(store.state.auth.authenticated) {
        request.params['token'] = store.state.auth.token.accessToken;
    }

    next();

});

const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
});

let token = localStorage.getItem("token");
if (token !== null) {
    token = JSON.parse(token);
    store.commit("auth/authenticate", token);
}

/* Login Guard */

router.beforeEach((to, from, next) => {
    if(!store.state.auth.authenticated && to.path !== "/login" && to.path !== "/register"){
        return next('/login');
        /*if(_.has(store.state.auth, "token.refreshToken") && moment(store.state.auth.refreshTokenExpiresAt).isAfter(moment())){
            oAuth2API.refreshToken(store.state.auth.refreshToken).then((result) => {
                const data = result.data;
                if(data.hasOwnProperty('accessToken')){
                    store.commit("auth/authenticate", data);
                    store.commit("auth/setAuthUser", data.user);
                    if(data.user.userCompanies.length > 0){
                        store.commit("auth/setSettings", data.user.userCompanies[0].settings);
                    }
                    else{
                        store.commit("auth/setSettings",{});
                    }
                }
                return result;
            }).then((result) => {
                document.title = to.meta.title;
                next();
            });
        }
        else {
            return next('/login');
        }*/
    }
    else if(store.state.auth.authenticated && to.path === "/login"){
        return next('/tracker');
    }
    document.title = to.meta.title;
    next();
});

/* Global Event Bus */

let EventBus = new Vue();

Object.defineProperties(Vue.prototype, {
    $bus: {
        get: function(){
            return EventBus;
        }
    }
});

new Vue({
    router,
    el: '#app',
    render: h => h(App)
});
