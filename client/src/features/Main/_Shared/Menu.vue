<template>
    <nav class="main-menu">
        <ul>
            <!-- <router-link to="/dashboard" exact tag="li"><i class="mi mi-dashboard"></i></router-link> -->
            <router-link to="/dashboard" exact tag="li" :title="'Dashboard'"
                         v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }">
                <menu-icon-dashboard class="icon"></menu-icon-dashboard>
            </router-link>
            <!--
            <router-link to="/requests" exact tag="li" v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Atendimentos'">
                <menu-icon-sale class="icon"></menu-icon-sale>
            </router-link>
            <router-link to="/test" exact tag="li" v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Teste'">
                <menu-icon-sale class="icon"></menu-icon-sale>
            </router-link>
            -->
            <!--
            <router-link to="/credit-bills" exact tag="li" :title="'Notinhas'"
                         v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }">
                <menu-icon-finance class="icon"></menu-icon-finance></router-link>
                -->
            <router-link to="/cashier-balancing" exact tag="li" :title="'Caixa / Fechamento diário'"
                         v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }">
                <menu-icon-cash-check class="icon"></menu-icon-cash-check></router-link>
            <!--
            <router-link to="/clients" exact tag="li" :title="'Ligações'"
                         v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }">
                <menu-icon-phone class="icon"></menu-icon-phone>
            </router-link>
            <li v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Financeiro'">
                <menu-icon-finance class="icon"></menu-icon-finance></li>
            <li v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Nota fiscal'">
                <menu-icon-nfe class="icon"></menu-icon-nfe></li>
            <li v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Estoque'">
                <menu-icon-stock class="icon"></menu-icon-stock></li>
            <li v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Relatórios'">
                <menu-icon-chart class="icon"></menu-icon-chart></li>
            <li v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Lalala'">
                <menu-icon-phone class="icon"></menu-icon-phone></li>
            <li v-tippy="{ placement: 'right', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Rastreamento'">
                <menu-icon-track class="icon"></menu-icon-track></li>
            -->
        </ul>
    </nav>
</template>

<script>
    import _ from 'lodash'
    import shortid from 'shortid'

    import ClientsAPI from '@/api/clients'

    import { mapGetters, mapActions, mapState } from 'vuex'
    import Scrollbar from 'smooth-scrollbar'

    import {createRequest} from '@/models/RequestModel'

    export default {

    }
</script>
<style scoped lang="scss">
    nav.main-menu ul {
        display: flex;
        flex-direction: column;
    }

    nav.main-menu ul li {
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

    nav.main-menu ul li.logout-from-app {
        color: #D46C63;
    }

    nav.main-menu ul li:hover {
        background: var(--bg-color--4);
    }

    nav.main-menu ul li.router-link-active {
        background: var(--bg-color--9);
    }

    nav.main-menu ul li.router-link-active .fill {
        fill: var(--font-color--10);
    }

    nav.main-menu ul li.router-link-active .fill--primary {
        fill: var(--font-color--secondary);
    }

    nav.main-menu ul li:last-child {
        border-bottom: 0 none;
    }
</style>
