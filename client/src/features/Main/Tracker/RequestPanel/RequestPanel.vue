<template>
    <div id="request-panel">
        <div class="board">
            <div class="board-section" v-for="(boardSection, index) in boardSections" :style="{ width: (boardSection.size * boardOptions.columnWidth) + 'px' }" :key="index">
                <div class="board-section-header">
                    <div class="summary">
                        <span>0 pedidos nesta coluna</span>
                    </div>
                    <div class="title-section">
                        <h3>{{ boardSection.name }}</h3>
                        <span class="push-both-sides"></span>
                        <ul>
                            <li>Expandir</li>
                            <li>Diminuir</li>
                        </ul>
                    </div>
                </div>
                <div class="board-cards">
                    <div class="board-card">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex';

    export default {
        data(){
            return {
                boardSections: [
                    {
                        name: 'Fila de espera',
                        size: 1
                    },
                    {
                        name: 'Com o entregador',
                        size: 1
                    },
                    {
                        name: 'Entregue',
                        size: 1
                    }
                ],
                boardOptions: {
                    columnWidth: 262
                }
            }
        },
        computed: {
            ...mapState('auth', [
                'user', 'token', 'company'
            ])
        },
        methods: {
        }
    }
</script>

<style>
    #request-panel {
        position: absolute;
        z-index: 999;
        background: rgba(0,0,0,.3);
        height: 100%;
        overflow: auto;
    }
    #request-panel > .board {
        padding: 10px;
        margin: 10px;
        display: flex;
        flex-direction: row;
    }
    #request-panel > .board > .board-section {
        margin: 0 10px;
    }
    #request-panel > .board > .board-section:first-child {
        margin-left: 0;
    }
    #request-panel > .board > .board-section:last-child {
        margin-right: 0;
    }
</style>