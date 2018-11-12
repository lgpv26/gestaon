<template>
    <div class="app-windows">
        <!--<a class="btn btn--primary" @click="add()">Adicionar</a>
        <a class="btn btn--primary" @click="remove()">Remover</a>
        <a class="btn btn--primary" @click="getAll()">Pegar todos</a>-->
        <div class="windows__container">
            <app-window v-for="window in $store.getters['entities/windows/query']().withAllRecursive().get()" :window="window"></app-window>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex'
    import Window from './Window'
    import _ from 'lodash'
    import shortid from 'shortid'

    export default {
        data(){
            return {
            }
        },
        components: {
            'app-window': Window
        },
        computed: {

        },
        methods: {
            ...mapActions('morph-screen', ['createDraft']),
            ...mapMutations('morph-screen', ['ADD_DRAFT', 'SET_MS', 'SHOW_MS', 'SET_SEARCH_DATA']),
            ...mapActions('toast', ['showError']),
            remove(){
                console.log("Remove")
            },
            getAll(){
                console.log("Get All", this.$store.getters['entities/windows/all']())
            }
        }
    }
</script>

<style lang="scss" scoped>
    .app-windows {
        position: absolute;
        z-index: 500001;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        .windows__container {
            pointer-events: initial;
            .window {
                width: 420px;
                height: 300px;
                background-color: #990000;
            }
        }
        .btn {
            width: 200px;
            margin-left: 10px;
            margin-top: 10px;
            float: left;
            pointer-events: initial;
        }
    }
</style>
