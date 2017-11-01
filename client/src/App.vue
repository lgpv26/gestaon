<template>
  <div id="app">
    <!-- loading -->
    <app-loading></app-loading>
    <!-- routes -->
    <router-view></router-view>
  </div>
</template>

<script>
    import store from './vuex/store'
    import { mapState } from 'vuex'
    import LoadingComponent from "./components/Utilities/Loading.vue"

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
                'app'
            ])
        },
        methods: {
        }
    }
</script>

<style>
</style>
