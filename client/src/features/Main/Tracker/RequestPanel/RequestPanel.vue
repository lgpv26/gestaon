<template>
    <div id="request-panel" ref="requestPanel">
        <div class="board">
            <div class="board-section" v-for="(boardSection, index) in boardSections" ref="boardSections"
                 :style="{ width: (boardSection.size * boardOptions.columnWidth) + 'px' }" :key="index" draggable="true"
                 @mousedown="onBoardSectionMouseDown($event)" @dragstart="onBoardSectionHeaderDrag($event)" @dragend="onBoardSectionHeaderDragEnd($event)" >
                <div class="board-section-header" >
                    <div class="summary">
                        <span>0 pedidos nesta coluna</span>
                    </div>
                    <div class="title-section">
                        <h3>{{ boardSection.name }}</h3>
                        <span class="push-both-sides"></span>
                        <ul>
                            <li>E</li>
                            <li>D</li>
                        </ul>
                    </div>
                </div>
                <div class="board-section-cards">
                    <div class="board-card">
                        sadasd
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
                },
                currentMouseDownTarget: false
            }
        },
        computed: {
            ...mapState('auth', [
                'user', 'token', 'company'
            ])
        },
        methods: {
            onBoardSectionMouseDown(ev){
                this.currentMouseDownTarget = ev.target;
            },
            onBoardSectionHeaderDrag(ev){
                const vm = this;
                const isDraggingBoardSection = _.some(this.$refs.boardSections, (boardSectionEl) => {
                    const el = boardSectionEl.querySelector(".board-section-header");
                    if(el.contains(vm.currentMouseDownTarget)){
                        return true;
                    }
                });
                if(isDraggingBoardSection){
                    ev.dataTransfer.setData('text/plain', 'handle');
                    ev.target.style.opacity = 0.3;
                }
                else {
                    ev.preventDefault();
                }
            },
            onBoardSectionHeaderDragEnd(ev){
                ev.target.style.opacity = 1;
            }
        },
        mounted(){
            /*const boardSectionHeaderEls = this.$refs.requestPanel.querySelectorAll(".board .board-section .board-section-header");
            if(boardSectionHeaderEls.length > 0) {
                boardSectionHeaderEls.forEach((boardSectionHeaderEl) => {
                    const boardSectionEl = boardSectionHeaderEl.parentElement;
                    boardSectionHeaderEl
                });
            }*/
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
        margin: 10px;
        display: flex;
        flex-direction: row;
    }
    #request-panel > .board > .board-section {
        margin: 0 10px 0 0;
        padding: 10px 0;
        background: #26272E;
    }
    #request-panel > .board > .board-section[draggable] {
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        /* Required to make elements draggable in old WebKit */
        -webkit-user-drag: element;
    }
    #request-panel > .board > .board-section:first-child {
        margin-left: 0;
    }
    #request-panel > .board > .board-section:last-child {
        margin-right: 0;
    }
    #request-panel > .board > .board-section > .board-section-header {
        cursor: -webkit-grab;
        cursor: -moz-grab;
        cursor: grab;
        padding: 0 10px;
        padding-bottom: 8px;
        margin-bottom: 8px;
        border-bottom: 1px solid #222;
    }
    #request-panel > .board > .board-section > .board-section-header > .title-section {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
    #request-panel > .board > .board-section > .board-section-header > .title-section ul li {
        display: inline;
        cursor: pointer;
        position: relative;
        z-index: 1000;
    }
    #request-panel > .board > .board-section.grabbing > .board-section-header {
        cursor: -webkit-grabbing;
        cursor: -moz-grabbing;
        cursor: grabbing;
    }
    #request-panel > .board > .board-section > .board-section-cards {
        padding: 0 10px;
    }
</style>