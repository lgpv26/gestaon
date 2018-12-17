<template>
    <div id="app">
        <!-- loading -->
        <app-loading></app-loading>
        <div id="router-view">
            <!-- routes -->
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import Dexie from 'dexie'
    import store from './vuex/store'
    import { mapState, mapMutations, mapActions } from 'vuex'
    import LoadingComponent from "./components/Utilities/Loading.vue"
    import { version } from '../package.json'

    export default {
        store,
        components: {
            "app-loading": LoadingComponent
        },
        data: function(){
            return {
            }
        },
        computed: {
            ...mapState([
                'app',
                'dimensions'
            ])
        },
        methods: {
            ...mapMutations([
                'SET_WINDOW_DIMENSIONS',
                'SET_APP_VERSION'
            ]),
            ...mapActions('request-queue',['initializeRequestQueue']),
            setWindowDimensions() {
                this.SET_WINDOW_DIMENSIONS({
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.clientHeight
                })
            }
        },
        created(){
            this.SET_APP_VERSION(version)
            Vue.prototype.$db = new Dexie('gestaon')
            this.$db.version(1).stores(
                {
                    clients: 'id, name',
                    clientPhones: 'id, clientId, name, number',
                    clientAddresses: 'id, clientId, addressId, name, number, complement',
                    addresses: 'id, name, neighborhood, state, city, cep, country',
                    searchClients: 'id, name, address, number, complement, neighborhood, city, state',
                    searchAddresses: 'id, name, address, neighborhood, city, state, cep, country',
                    users: 'id, name, email, type',
                    products: 'id, name, price, quantity',
                    paymentMethods: 'id, name, rule, tax, taxUnit, autoPay, hasDeadline',
                    promotionChannels: 'id, name',
                    clientGroups: 'id, name',
                    customFields: 'id, name'
                }
            )
            this.initializeRequestQueue()
        },
        mounted(){
            this.$nextTick(() => {
                window.addEventListener('resize', this.setWindowDimensions)
                this.setWindowDimensions()
            })
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.setWindowDimensions)
        }
    }
</script>

<style lang="scss">
</style>
