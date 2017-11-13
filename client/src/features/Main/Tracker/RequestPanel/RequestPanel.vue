<template>
    <div id="request-panel" ref="requestPanel">
        <app-draggable class="board" ref="board" v-model="boardSections" :options="{ handle: '.board-section__header', forceFallback: true }">
            <div class="board-section" v-for="(boardSection, index) in boardSections" ref="boardSections"
                 :style="{ width: boardOptions.gutterSize + ((boardSection.size * boardOptions.columnWidth) + ((boardSection.size + 1) * boardOptions.gutterSize)) + 'px' }"
                 :key="index" :class="{dragging: isDraggingBoardColumn}">
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
                            <app-draggable class="board-section__cards" v-model="boardSection.cards" :options="{ scroll: false, forceFallback: true, ghostClass: 'ghost', group: 'cards' }"
                                :style="{'padding-bottom': boardOptions.gutterSize + 'px', 'margin-left': boardOptions.gutterSize + 'px'}"
                                :move="onMove"  @start="isDraggingCard=true" @end="isDraggingCard=false" >
                                <div class="request-card" v-for="card in boardSection.cards" :style="{ height: boardOptions.cardHeight, width: boardOptions.columnWidth + boardOptions.gutterSize + 'px', 'padding-top': boardOptions.gutterSize + 'px', 'padding-right': boardOptions.gutterSize + 'px'}">
                                    <div class="request-card__main" :style="{ height: boardOptions.cardHeight + 'px' }">
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
    import { mapState, mapGetters, mapActions } from 'vuex';
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
            ...mapState('auth', [
                'user', 'token', 'company'
            ])
        },
        methods: {
            mainContentContainerResized(){
                console.log("Resized");
            },
            addRequest(index){
                this.boardSections[index].cards.push({
                    request: {
                        client: { name: 'PEDIDO ' + (this.boardSections[index].cards.length + 1) }
                    }
                })
            },
            expandColumn(index){
                if(this.boardSections[index].size === 3) return;
                this.boardSections[index].size ++;
            },
            collapseColumn(index){
                if(this.boardSections[index].size === 1) return;
                this.boardSections[index].size --;
            },
            onMove(ev, originalEv){
                console.log("moving");
            },
            boardSectionScrollbar(boardSection, boardSectionIndex){
                const vm = this;
                /*
                const boardSectionHeader = _.first(boardSection.el.getElementsByClassName('board-section__header'));
                const boardSectionViewport = _.first(boardSection.el.getElementsByClassName('board-section__viewport'));
                const boardSectionScrollbar = _.first(boardSection.el.getElementsByClassName('board-section__scrollbar'));
                const boardSectionCards = _.first(boardSection.el.getElementsByClassName('board-section__cards'));
                return {
                    onScrollableMouseDown(ev){
                        const boardSectionDraggable = ev.target;

                        boardSection.scrollbar = boardSection.scrollbar || {};
                        boardSection.scrollbar.viewport = {
                            x: vm.getElPositionInScreen(boardSectionViewport).x,
                            y: vm.getElPositionInScreen(boardSectionViewport).y
                        };

                        boardSection.scrollbar.mouseMoveEventListener = (mouseMoveEv) => {

                            // ev.offsetY - Posição vertical do ponteiro do mouse dentro do draggable
                            const status = new function(){
                                this.body = {
                                    cursorY: mouseMoveEv.clientY
                                };
                                this.draggable = {
                                    height: boardSectionDraggable.offsetHeight,
                                    cursorY: ev.offsetY
                                };
                                this.viewport ={
                                    height: boardSectionViewport.offsetHeight,
                                    divY: boardSection.scrollbar.viewport.y,
                                    divX: boardSection.scrollbar.viewport.x,
                                };
                                this.content ={
                                    height: boardSectionCards.offsetHeight
                                };
                            };
                            let draggableOffsetToTop = 0;
                            if((status.body.cursorY - status.draggable.cursorY) < status.viewport.divY){
                                ev.target.style.top = '0px';
                            }
                            else if((status.body.cursorY - status.draggable.cursorY) - status.viewport.divY > boardSectionViewport.clientHeight - status.draggable.height){
                                draggableOffsetToTop = boardSectionViewport.clientHeight - status.draggable.height;
                                ev.target.style.top = draggableOffsetToTop + 'px';
                            }
                            else { // if draggable moved
                                draggableOffsetToTop = (status.body.cursorY - status.draggable.cursorY - status.viewport.divY);
                                ev.target.style.top = draggableOffsetToTop + 'px';
                                // console.log((boardSectionViewport.offsetHeight / boardSectionCards.offsetHeight) * boardSectionCards.offsetHeight + 'px')
                            }
                            boardSectionCards.style.top = - (draggableOffsetToTop / (status.viewport.height - status.draggable.height)) * (boardSectionCards.offsetHeight - boardSectionViewport.offsetHeight) + 'px';
                        };
                        boardSection.scrollbar.mouseUpEventListener = () => {
                            document.removeEventListener('mousemove', boardSection.scrollbar.mouseMoveEventListener);
                            document.removeEventListener('mouseup', boardSection.scrollbar.mouseUpEventListener);
                        };
                        document.addEventListener('mousemove', boardSection.scrollbar.mouseMoveEventListener);
                        document.addEventListener('mouseup', boardSection.scrollbar.mouseUpEventListener);
                    },
                    onScrollableMouseUp(ev){
                    },
                    onScrollableMouseMove(ev){
                        /*if(boardSection.scrollbar.isHolding){
                            console.log("segurando e movendo");
                        }
                    }
                }
                */

            },
            updateScrolls(){
                const vm = this;
                /*
                vm.boardSections.forEach((boardSection, index) => {
                    boardSection.el = vm.$refs.boardSections[index];
                    const boardSectionHeader = _.first(boardSection.el.getElementsByClassName('board-section__header'));
                    const boardSectionViewport = _.first(boardSection.el.getElementsByClassName('board-section__viewport'));
                    const boardSectionScrollbar = _.first(boardSection.el.getElementsByClassName('board-section__scrollbar'));
                    const scrollbarScrollable = _.first(boardSectionScrollbar.getElementsByClassName('scrollbar__scrollable'));
                    const boardSectionCards = _.first(boardSection.el.getElementsByClassName('board-section__cards'));
                    setTimeout(() => {
                        let contentAndViewportHeightDifference = Math.round(boardSectionViewport.offsetHeight / boardSectionCards.offsetHeight* 100) / 100;
                        if(contentAndViewportHeightDifference > 1 || contentAndViewportHeightDifference < 0){
                            scrollbarScrollable.style.height = boardSectionScrollbar.style.height;
                        }
                        else {
                            scrollbarScrollable.style.height = contentAndViewportHeightDifference * boardSectionViewport.offsetHeight + 'px'
                        }

                        if(!boardSectionCards.style.top){
                            boardSectionCards.style.top = 0;
                        }
                        if(Math.abs(parseFloat(boardSectionCards.style.top)) + boardSectionViewport.offsetHeight > boardSectionCards.offsetHeight){
                            if(index === 0) {
                                const overAmount = Math.abs(parseFloat(boardSectionCards.style.top)) + boardSectionViewport.offsetHeight - boardSectionCards.offsetHeight;
                                console.log(overAmount);
                                boardSectionCards.style.top = - (Math.abs(parseFloat(boardSectionCards.style.top)) - overAmount) + 'px';
                            }
                        }

                    }, 0);
                });
                */
            },
            getElPositionInScreen(el) {
                let xPos = 0;
                let yPos = 0;

                while (el) {
                    if (el.tagName == "BODY") {
                        // deal with browser quirks with body/window/document and page scroll
                        let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                        let yScroll = el.scrollTop || document.documentElement.scrollTop;

                        xPos += (el.offsetLeft - xScroll + el.clientLeft);
                        yPos += (el.offsetTop - yScroll + el.clientTop);
                    } else {
                        // for all other non-BODY elements
                        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
                    }

                    el = el.offsetParent;
                }
                return {
                    x: xPos,
                    y: yPos
                };
            }
        },
        mounted(){
            const vm = this;
            setTimeout(() => {
                vm.updateScrolls();
            }, 0)
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
        min-height: 200px;
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