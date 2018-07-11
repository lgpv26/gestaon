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
    import store from './vuex/store'
    import { mapState, mapMutations } from 'vuex'
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
            setWindowDimensions(event) {
                this.SET_WINDOW_DIMENSIONS({
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.clientHeight
                })
            }
        },
        created(){
            this.SET_APP_VERSION(version)
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

<style>
</style>
