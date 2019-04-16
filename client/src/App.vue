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
    import Vue from "vue"
    import Dexie from "dexie"
    import PromiseQueue from 'p-queue'
    import store from "./vuex/store"
    import shortid from "shortid"
    import { mapState, mapMutations, mapActions } from "vuex"

    import LoadingComponent from "./components/Utilities/Loading.vue"
    import { version } from "../package.json"

    import Card from "./vuex/models/Card"
    import Request from "./vuex/models/Request"

    export default {
        store,
        components: {
            "app-loading": LoadingComponent
        },
        data(){
            return {
                stateDBQueue: null
            }
        },
        computed: {
            ...mapState(["app", "dimensions"])
        },
        methods: {
            ...mapMutations(["SET_WINDOW_DIMENSIONS", "SET_APP_VERSION"]),
            setWindowDimensions() {
                this.SET_WINDOW_DIMENSIONS({
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.clientHeight
                });
            }
        },
        created() {
            const vm = this;
            vm.SET_APP_VERSION(version);
            Vue.prototype.$db = new Dexie("db");
            vm.$db.version(1).stores({
                ...vm.modelDefinitions.searchModels,
                ...vm.modelDefinitions.offlineDBModels,
                ...vm.modelDefinitions.stateModels
            })
            if(!vm.stateDBQueue){
                vm.stateDBQueue = new PromiseQueue({ concurrency: 1})
            }

            // Every VuexORM changes should be copied to STATE DB

            /*vm.$store.subscribe((mutation, state) => {
                if (
                    mutation.type.includes("entities") &&
                    !_.get(mutation.payload, "ignoreOfflineDBInsertion", false) &&
                    _.has(mutation, "payload.entity") &&
                    _.has(vm.$db, "STATE_" + mutation.payload.entity)
                ){
                    const entityAction = mutation.type.replace("entities/", "");
                    if (entityAction === "delete") {
                        vm.stateDBQueue.add(() => vm.$db["STATE_" + mutation.payload.entity].delete(
                            mutation.payload.where
                        ))
                        return true;
                    }
                    vm.stateDBQueue.add(() => vm.$db["STATE_" + mutation.payload.entity].bulkPut(
                        mutation.payload.result.data[mutation.payload.entity]
                    ))
                }
            })*/
        },
        mounted() {
            this.$nextTick(() => {
                window.addEventListener("resize", this.setWindowDimensions);
                this.setWindowDimensions();
            });
        },
        beforeDestroy() {
            window.removeEventListener("resize", this.setWindowDimensions);
        }
    };
</script>

<style lang="scss"></style>
