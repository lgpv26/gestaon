<template>
    <div class="app-windows">
        <!--<a class="btn btn--primary" @click="add()">Adicionar</a>
        <a class="btn btn--primary" @click="remove()">Remover</a>
        <a class="btn btn--primary" @click="getAll()">Pegar todos</a>-->
        <div class="windows__container">
            <app-window v-for="window in showingWindows" :key="window.id" :window="window"></app-window>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex'

    import Window from '../../../../vuex/models/Window'
    import WindowComponent from './Window'

    export default {
        data(){
            return {
            }
        },
        components: {
            'app-window': WindowComponent
        },
        computed: {
            ...mapState("request-board", ["isLoading"]),
            showingWindows(){
                return this.$store.getters[`entities/windows`]()
                    .with('card.request.card')
                    .with('card.request.requestUIState')
                    .with('card.request.client.clientGroup')
                    .with('card.request.client.clientPhones')
                    .with('card.request.client.clientAddresses.address')
                    .with('card.request.requestOrder.promotionChannel')
                    .with('card.request.requestOrder.requestOrderProducts.product')
                    .with('card.request.requestPayments.paymentMethod')
                    .with('card.request.requestClientAddresses.clientAddress.address')
                    .with('card.request.requestClientPhones.clientPhone')
                    .get()
            }
        },
        methods: {
            ...mapActions('morph-screen', ['createDraft']),
            ...mapMutations('morph-screen', ['ADD_DRAFT', 'SET_MS', 'SHOW_MS', 'SET_SEARCH_DATA']),
            ...mapActions('toast', ['showError'])
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
