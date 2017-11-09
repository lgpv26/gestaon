<template>
    <div id="request-panel" ref="requestPanel">
        <div class="board" ref="board">
            <div class="board-section" v-for="(boardSection, index) in boardSections" ref="boardSections"
                 :style="{ width: ((boardSection.size * boardOptions.columnWidth) + ((boardSection.size + 1) * boardOptions.gutterSize)) + 'px' }" :key="index" :class="{dragging: isDraggingBoardColumn}">
                <div class="board-header-section" >
                    <div class="summary">
                        <span>0 pedidos nesta coluna</span>
                    </div>
                    <div class="title-section">
                        <h3>{{ boardSection.name }}</h3>
                        <span class="push-both-sides"></span>
                        <ul>
                            <li @click="expandColumn(index)">E</li>
                            <li @click="collapseColumn(index)">D</li>
                        </ul>
                    </div>
                </div>
                <div class="board-cards-container" :style="{'margin-left': boardOptions.gutterSize + 'px', 'margbin-bottom': boardOptions.gutterSize + 'px'}">
                    <div class="column-card" v-for="card in boardSection.cards" :style="{ width: boardOptions.columnWidth + 'px', 'margin-top': boardOptions.gutterSize + 'px', 'margin-right': boardOptions.gutterSize + 'px'}">
                        <h3 class="card-title">{{ card.request.client.name }}</h3>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import dragula from 'dragula';
    import { mapState, mapGetters, mapActions } from 'vuex';

    export default {
        data(){
            return {
                boardSections: [
                    {
                        name: 'Fila de espera',
                        size: 3,
                        cards: [
                            { request: { client: { name: 'THIAGO YOITHI' } } },
                            { request: { client: { name: 'ACIMAR ROCHA' } } },
                            { request: { client: { name: 'MAILON RUAN' } } }
                        ]
                    },
                    {
                        name: 'Com o entregador',
                        size: 2,
                        cards: [
                            { request: { client: { name: 'THAIS THIEMI' } } },
                            { request: { client: { name: 'DANIEL ROCHA' } } }
                        ]
                    },
                    {
                        name: 'Entregue',
                        size: 1,
                        cards: [
                            { request: { client: { name: 'TÂNIA MARA' } } }
                        ]
                    }
                ],
                boardOptions: {
                    columnWidth: 250,
                    gutterSize: 10
                },
                dragula: {
                    boardColumns: null,
                    cardsColumns: null
                },
                isDraggingBoardColumn: false
            }
        },
        computed: {
            ...mapState('auth', [
                'user', 'token', 'company'
            ])
        },
        methods: {
            expandColumn(index){
                if(this.boardSections[index].size === 3) return;
                this.boardSections[index].size ++;
            },
            collapseColumn(index){
                if(this.boardSections[index].size === 1) return;
                this.boardSections[index].size --;
            },
            removeDragulaInstance(){
                /*if(this.dragula.boardColumns){
                    this.dragula.boardColumns.destroy();
                }*/
            },
            mountDragulaInstance(){
                const vm = this;
                /*vm.removeDragulaInstance();
                vm.dragula.boardColumns = dragula([vm.$refs.board], {
                    direction: 'horizontal',
                    mirrorContainer: vm.$refs.board,
                    moves: function (el, container, handle) {
                        return _.first(el.getElementsByClassName('board-header-section')).contains(handle);
                    }
                });
                vm.dragula.boardColumns.on('drag', (el, source) => {
                    vm.isDraggingBoardColumn = true;
                    el.classList.add("dragging-this-one");
                });
                vm.dragula.boardColumns.on('dragend', (el) => {
                    vm.isDraggingBoardColumn = false;
                });

                vm.dragula.cardsColumns = dragula(vm.$refs.cardsColumns, {
                    direction: 'vertical',
                    mirrorContainer: vm.$refs.board
                });
                vm.dragula.cardsColumns.on('dragend', (el) => {
                    console.log();
                });*/
            }
        },
        mounted(){
            this.mountDragulaInstance();
        },
        destroyed(){
            this.removeDragulaInstance();
        }
    }
</script>

<style>
    #request-panel {
        position: absolute;
        z-index: 999;
        height: 100%;
    }
    #request-panel > .board {
        margin: 0 0 0 10px;
        display: flex;
        flex-direction: row;
        height: 100%;
    }
    #request-panel > .board > .board-section {
        margin: 10px 10px 10px 0;
        padding: 0;
        background: rgba(21,23,28,.5);
        overflow: hidden;
        flex-shrink: 0;
    }
    #request-panel > .board > .board-section.dragging {
        opacity: .9
    }
    #request-panel > .board > .board-section > .board-header-section {
        cursor: -webkit-grab;
        cursor: -moz-grab;
        cursor: grab;
        padding: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #222;
        background: #2C313B;
    }
    #request-panel > .board > .board-section > .board-header-section > .title-section {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
    #request-panel > .board > .board-section > .board-header-section > .title-section ul li {
        display: inline;
        cursor: pointer;
        position: relative;
        z-index: 1000;
    }
    #request-panel > .board .board-cards-container {
        display: flex;
        flex-flow: row wrap;
    }
    #request-panel > .board .column-card {
        min-height: 120px;
        background: #3A3F4B;
        cursor: pointer;
        padding: 10px;
    }
    #request-panel > .board .column-card h3.card-title {
        font-size: 14px;
    }
</style>