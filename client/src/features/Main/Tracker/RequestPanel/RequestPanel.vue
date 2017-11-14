<template>
    <div id="request-panel" ref="requestPanel">
        <app-draggable class="board" ref="board" v-model="boardSections" :options="{ handle: '.board-section__header', forceFallback: true }"
            @start="onSectionDragStart" @end="onSectionDragEnd">
            <div class="board-section" v-for="(boardSection, index) in boardSections" :key="boardSection.name" ref="boardSections"
                 :style="{ width: boardOptions.gutterSize + ((boardSection.size * boardOptions.columnWidth) + ((boardSection.size + 1) * boardOptions.gutterSize)) + 'px' }"
                 :class="{dragging: isDraggingBoardColumn}">
                <div class="board-section__header" :style="{ height: boardOptions.headerHeight }">
                    <div class="summary">
                        <span>0 pedidos nesta coluna</span>
                    </div>
                    <div class="title-section">
                        <h3>{{ boardSection.name }}</h3>
                        <span class="push-both-sides"></span>
                        <ul>
                            <li @click="expandColumn(index)">E</li>
                            <li @click="collapseColumn(index)">D</li>
                            <li @click="addRequest(index)">+</li>
                        </ul>
                    </div>
                </div>
                <div class="scrollable-content">
                    <app-scrollable ref="scrollables">
                        <div class="board-section__viewport" :style="{ 'width': (boardOptions.gutterSize + ((boardSection.size * boardOptions.columnWidth) + ((boardSection.size + 1) * boardOptions.gutterSize))) - (boardOptions.gutterSize * 2) + 'px', 'height': mainContentArea.height - boardOptions.headerHeight - (boardOptions.gutterSize * 2) + 'px' }">
                            <app-draggable class="board-section__cards" v-model="boardSection.cards" :options="{ scroll: false, forceFallback: true, ghostClass: 'ghost', group: 'cards', draggable: '.request-card', fallbackTolerance: 10 }"
                                :style="{'padding-bottom': boardOptions.gutterSize + 'px', 'margin-left': boardOptions.gutterSize + 'px'}"
                                :move="onMove" @start="isDraggingCard=true" @end="isDraggingCard=false" >
                                <div class="request-card" v-for="card in boardSection.cards" :key="card.request.client.name" :style="{ height: boardOptions.cardHeight, width: boardOptions.columnWidth + boardOptions.gutterSize + 'px', 'padding-top': boardOptions.gutterSize + 'px', 'padding-right': boardOptions.gutterSize + 'px'}">
                                    <div class="request-card__main" @click="requestCardClicked(card, $event)" :style="{ height: boardOptions.cardHeight + 'px' }">
                                        <h3 class="card-title">{{ card.request.client.name }}</h3>
                                    </div>
                                </div>
                            </app-draggable>
                        </div>
                    </app-scrollable>
                </div>
            </div>
        </app-draggable>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import DraggableComponent from 'vuedraggable';
    import Scrollbar from 'smooth-scrollbar';
    import _ from 'lodash';

    export default {
        components: {
            'app-draggable': DraggableComponent
        },
        data(){
            return {
                boardSections: [
                    {
                        name: 'Fila de espera',
                        size: 2,
                        cards: [
                            { request: { client: { name: 'THIAGO YOITHI' } } },
                            { request: { client: { name: 'ACIMAR ROCHA' } } },
                            { request: { client: { name: 'GISELE TAKAHASHI' } } },
                            { request: { client: { name: 'MAILON RUAN' } } },
                            { request: { client: { name: 'LALÁ' } } },
                            { request: { client: { name: 'LOLÓ' } } },
                            { request: { client: { name: 'LELÉ' } } },
                            { request: { client: { name: 'LULU' } } },
                            { request: { client: { name: 'LILI' } } }
                        ],
                        contentHeight: 0,
                        scrollbar: null
                    },
                    {
                        name: 'Com o entregador',
                        size: 2,
                        cards: [
                            { request: { client: { name: 'THAIS THIEMI' } } },
                            { request: { client: { name: 'DANIEL ROCHA' } } }
                        ],
                        contentHeight: 0,
                        scrollbar: null
                    }
                ],
                boardOptions: {
                    columnWidth: 250,
                    gutterSize: 10,
                    headerHeight: 62,
                    cardHeight: 120
                },
                scrollbars: null,
                isDraggingBoardColumn: false,
                isDraggingCard: false
            }
        },
        computed: {
            ...mapState(['mainContentArea']),
            ...mapState('auth', ['user', 'token', 'company']),
            ...mapState('morph-screen', { isShowingMorphScreen: 'isShowing' })
        },
        methods: {
            ...mapMutations('morph-screen', ['showMorphScreen']),
            requestCardClicked(card, ev){
                if(!this.isDraggingBoardColumn && !this.isDraggingCard){
                    (!this.isShowingMorphScreen) ? this.showMorphScreen({
                        show: true,
                        sourceEl: ev.target
                    }) : this.showMorphScreen(false);
                }
            },
            addRequest(index){
                this.boardSections[index].cards.push({
                    request: {
                        client: { name: 'PEDIDO ' + (this.boardSections[index].cards.length + 1) }
                    }
                });
                this.updateScrolls();
            },
            expandColumn(index){
                if(this.boardSections[index].size === 3) return;
                this.boardSections[index].size ++;
            },
            collapseColumn(index){
                if(this.boardSections[index].size === 1) return;
                this.boardSections[index].size --;
            },
            onSectionDragStart(ev){
                const viewport = _.first(ev.item.getElementsByClassName('board-section__viewport'));
                viewport.style.display = 'none';
                const draggingElement = _.first(ev.from.getElementsByClassName('sortable-drag'));
                const draggingElementViewport = _.first(draggingElement.getElementsByClassName('board-section__viewport'));
                draggingElementViewport.style.display = 'none';
            },
            onSectionDragEnd(ev){
                const viewport = _.first(ev.item.getElementsByClassName('board-section__viewport'));
                viewport.style.display = 'initial';
            },
            onMove(ev, originalEv){
                this.updateScrolls();
            },
            updateScrolls(){
                setImmediate(() => {
                    this.boardSections.forEach((boardSection) => {
                        boardSection.scrollable.updateScroll();
                    });
                });
            }
        },
        mounted(){
            this.boardSections.forEach((boardSection, index) => {
                this.boardSections[index].scrollable = this.$refs.scrollables[index];
            });
        }
    }
</script>

<style>
    #request-panel {
        position: absolute;
        z-index: 999;
        height: 100%;
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently */
    }
    #request-panel > .board {
        margin: 0 0 0 10px;
        display: flex;
        flex-direction: row;
        height: 100%;
    }
    #request-panel > .board .board-section {
        margin: 10px 10px 10px 0;
        padding: 0;
        background: rgba(21,23,28,.5);
        overflow: hidden;
        flex-shrink: 0;
    }
    #request-panel > .board .board-section > .board-section__header {
        cursor: -webkit-grab;
        cursor: -moz-grab;
        cursor: grab;
        padding: 10px;
        padding-bottom: 8px;
        background: #2C313B;
    }
    #request-panel > .board .board-section > .board-section__header > .title-section {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
    #request-panel > .board .board-section > .board-section__header > .title-section ul li {
        display: inline;
        cursor: pointer;
        position: relative;
        z-index: 1000;
    }
    #request-panel > .board .board-section__viewport {
        position: relative;
        overflow: hidden;
        float: left;
    }
    #request-panel > .board .board-section__viewport .board-section__cards {
        display: flex;
        flex-flow: row wrap;
        min-height: 100%;
        align-content: flex-start;
        width: 100%;
        position: absolute;
    }
    #request-panel > .board .board-section__viewport::-webkit-scrollbar {
        background-color: rgba(0,0,0,.2);
        width: 10px;
    }
    #request-panel > .board .board-section__viewport::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,.7);
        width: 10px;
    }
    #request-panel > .board .request-card {
    }
    #request-panel > .board .request-card > .request-card__main {
        background: #3A3F4B;
        cursor: pointer;
        padding: 10px;
    }
    #request-panel > .board .request-card.ghost > .request-card__main {
        border: 2px dashed rgba(255,255,255,.1);
        opacity: .8;
    }
    #request-panel > .board .request-card > .request-card__main h3.card-title {
        font-size: 14px;
    }
</style>