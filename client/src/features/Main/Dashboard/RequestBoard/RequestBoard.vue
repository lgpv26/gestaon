<template>
    <div id="request-panel" ref="requestPanel">
        <app-draggable class="board" ref="board" :value="sections" @input="onDraggableInput($event)" :options="{ handle: '.board-section__header', forceFallback: true }"
            @start="onSectionDragStart" @end="onSectionDragEnd">
            <div class="board-section" v-for="(boardSection, index) in sections" :key="boardSection.name" ref="boardSections"
                 :style="{ width: boardOptions.gutterSize + ((boardSection.size * boardOptions.columnWidth) + ((boardSection.size + 1) * boardOptions.gutterSize)) + 'px' }"
                 :class="{dragging: isDraggingBoardColumn}">
                <div class="board-section__header" :style="{ height: boardOptions.headerHeight }">
                    <div class="header__section-title">
                        <h3>{{ boardSection.name }}</h3>
                        <span class="push-both-sides"></span>
                        <ul style="display: flex; flex-direction: row">
                            <li @click="collapseSection(boardSection)" style="width: 21px; height: 16px;">
                                <icon-section-collapse></icon-section-collapse>
                            </li>
                            <li @click="expandSection(boardSection)" style="width: 21px; height: 16px;">
                                <icon-section-expand></icon-section-expand>
                            </li>
                            <li @click="addRequest(index)" class="section-title__settings-button" style="width: 15px; height: 16px;">
                                <icon-section-settings></icon-section-settings>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="scrollable-content">
                    <app-scrollable ref="scrollables" @updated="onSectionScrollUpdated($event)">
                        <div class="board-section__viewport" :style="{ 'width': (boardOptions.gutterSize + ((boardSection.size * boardOptions.columnWidth) + ((boardSection.size + 1) * boardOptions.gutterSize))) + 'px', 'height': mainContentArea.height - boardOptions.headerHeight - (boardOptions.gutterSize * 2) + 'px' }">
                            <app-draggable class="board-section__cards" :value="boardSection.cards" @input="onDraggableCardInput($event, boardSection.id)" :options="{ handle: '.request-card__main', scroll: false, forceFallback: false, ghostClass: 'ghost', group: 'cards' }"
                                :style="{'padding-bottom': boardOptions.gutterSize + 'px', 'padding-left': boardOptions.gutterSize + 'px'}"
                                :move="onMove" @start="isDraggingCard=true" @end="isDraggingCard=false" >
                                <div class="request-card" v-for="card in boardSection.cards" :key="card.request.client.name" :style="{ height: boardOptions.cardHeight + 'px', width: boardOptions.columnWidth + 'px', 'margin-top': boardOptions.gutterSize + 'px', 'margin-right': boardOptions.gutterSize + 'px'}">
                                    <app-request-board-card class="request-card__main" :card="card" @click="requestCardClicked(card, $event)"></app-request-board-card>
                                </div>
                            </app-draggable>
                            <div class="drag-space-hider" :style="{ width: '100%', position: 'absolute', top: 0, height: boardOptions.gutterSize + (Math.floor((boardSection.cards.length / boardSection.size)) * (boardOptions.cardHeight + boardOptions.gutterSize)) + 'px' }">
                            </div>
                        </div>
                    </app-scrollable>
                </div>
            </div>
        </app-draggable>
        <a class="add-section" @click="addSection()">
            <request-board-icon-add-section></request-board-icon-add-section>
        </a>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import DraggableComponent from 'vuedraggable';
    import Scrollbar from 'smooth-scrollbar';
    import Vue from 'vue'
    import _ from 'lodash';
    import utils from '@/utils'

    import RequestBoardCard from './RequestBoardCard.vue'

    export default {
        components: {
            'app-draggable': DraggableComponent,
            'app-request-board-card': RequestBoardCard
        },
        data(){
            return {
                /*boardSections: [
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
                        ]
                    },
                    {
                        name: 'Com o entregador',
                        size: 2,
                        cards: [
                            { request: { client: { name: 'THAIS THIEMI' } } },
                            { request: { client: { name: 'DANIEL ROCHA' } } }
                        ]
                    }
                ],*/
                boardOptions: {
                    columnWidth: 320,
                    gutterSize: 10,
                    headerHeight: 62,
                    cardHeight: 140
                },
                scrollbars: null,
                isDraggingBoardColumn: false,
                isDraggingCard: false
            }
        },
        computed: {
            ...mapState(['mainContentArea']),
            ...mapState('auth', ['user', 'token', 'company']),
            ...mapState('morph-screen', { isShowingMorphScreen: 'isShowing' }),
            ...mapState('request-board', ['sections', 'requests']),
            ...mapGetters('request-board', ['sectionRequests'])
        },
        methods: {
            ...mapMutations('morph-screen', []),
            ...mapMutations('request-board', ['RESET_REQUESTS','ADD_SECTION','SET_SECTIONS','SET_SECTION','ADD_REQUEST','SET_SECTION_REQUESTS']),

            /* Sections */

            addSection(){
                this.ADD_SECTION({
                    id: _.uniqueId("section#"),
                    name: 'Nova seção #' + (this.sections.length + 1),
                    size: 1
                })
            },
            expandSection(section){
                if(section.size < 3){
                    this.SET_SECTION({
                        sectionId: section.id,
                        section: {
                            size: section.size + 1
                        }
                    })
                }
            },
            collapseSection(section){
                if(section.size > 1){
                    this.SET_SECTION({
                        sectionId: section.id,
                        section: {
                            size: section.size - 1
                        }
                    })
                }
            },
            onSectionScrollUpdated(els){
                const dragSpaceHiderEl = _.first(els.viewportElement.getElementsByClassName('drag-space-hider'));
                dragSpaceHiderEl.style.top = els.contentElement.style.top;
            },
            onSectionDragStart(ev){
                const viewport = _.first(ev.item.getElementsByClassName('board-section__viewport'));
                viewport.style.display = 'none';
                const draggingElement = _.last(ev.from.getElementsByClassName('board-section'));
                const draggingElementViewport = _.first(draggingElement.getElementsByClassName('board-section__viewport'));
                draggingElementViewport.style.display = 'none';
            },
            onSectionDragEnd(ev){
                const viewport = _.first(ev.item.getElementsByClassName('board-section__viewport'));
                viewport.style.display = 'initial';
            },

            /* Request / Cards */

            requestCardClicked(card, ev){
                /*
                if(!this.isDraggingBoardColumn && !this.isDraggingCard){
                    if(!this.isShowingMorphScreen){
                        this.showMorphScreen({
                            show: true,
                            sourceEl: ev.target,
                            sourceElBgColor: 'var(--bg-color--7)',
                            mimicBorderRadius: 0
                        })
                    } else {
                        this.showMorphScreen(false)
                    }
                }
                */
            },
            addRequest(index){
                this.boardSections[index].cards.push({
                    request: {
                        client: { name: 'PEDIDO ' + (this.boardSections[index].cards.length + 1) }
                    }
                });
                this.updateScrolls();
            },
            onMove(ev, originalEv){
                this.updateScrolls();
            },
            onDraggableInput(sections){
                this.SET_SECTIONS(sections)
            },
            onDraggableCardInput(sectionCards, sectionId){
                sectionCards = utils.removeReactivity(sectionCards)
                _.map(sectionCards, (sectionCard) => {
                    return _.assign(sectionCard, {
                        sectionId
                    })
                })
                this.SET_SECTION_REQUESTS({
                    sectionId,
                    requests: sectionCards
                })
            },

            /* In-component utilities */

            updateScrolls(){
                const vm = this;
                setImmediate(() => {
                    vm.$refs.scrollables.forEach((scrollable) => {
                        scrollable.updateScroll()
                    })
                });
            }
        },
        mounted(){
            const vm = this
            this.SET_SECTIONS([])
            this.ADD_SECTION({
                id: _.uniqueId("section#"),
                name: 'Fila de espera',
                size: 1
            })
            this.ADD_SECTION({
                id: _.uniqueId("section#"),
                name: 'Com o entregador',
                size: 1
            })
            Vue.nextTick(() => {
                if(vm.sections.length) {
                    const taskArray = [
                        {
                            text: "Rever a instalação do fogão"
                        },
                        {
                            text: "Assistência de regulador"
                        },
                        {
                            text: "Lalalala"
                        }
                    ]
                    for (let i = 1; i <= 5; i++) {
                        const randomIndex = _.random(vm.sections.length - 1)
                        const randomSection = vm.sections[randomIndex]

                        let randomTask

                        if(_.random(1) && taskArray.length){
                            const randomIndex = _.random(taskArray.length - 1)
                            randomTask = taskArray[randomIndex]
                            taskArray.splice(randomIndex, 1)
                        }

                        vm.ADD_REQUEST({
                            id: _.uniqueId("card#"),
                            sectionId: randomSection.id,
                            request: {
                                client: {
                                    name: "TESTE " + i
                                },
                                task: randomTask
                            }
                        })
                    }
                }
            })
        }
    }
</script>

<style>
    #request-panel {
        display: flex;
        flex-direction: row;
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
        padding: 10px 10px 8px;
        height: 50px;
        background: var(--bg-color);
    }
    #request-panel > .board .board-section > .board-section__header {
        display: flex;
        color: var(--base-color);
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title > h3 {
        color: var(--font-color--8);
        flex-grow: 1;
        font-size: 14px;
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li {
        cursor: pointer;
        margin-right: 5px;
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li svg {
        pointer-events: none;
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li .fill,
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li .colorizable {
        fill: var(--font-color--2)
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li .stroke
    {
        stroke: var(--font-color--2)
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li:hover .fill,
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li:hover .colorizable {
        fill: var(--font-color--primary)
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li:hover .stroke
    {
        stroke: var(--font-color--primary)
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li.section-title__settings-button {
        margin-right: 0;
    }
    #request-panel > .board .board-section > .board-section__header > .header__section-title ul li.section-title__settings-button svg {
        position: relative;
        top: 1px;
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
        display: flex;
        position: relative;
        z-index: 9;
    }
    #request-panel > .board .request-card > .request-card__main {
        cursor: pointer;
        flex-grow:1;
    }
    #request-panel > .board .request-card.ghost > .request-card__main {
        border: 2px dashed rgba(255,255,255,.1);
        opacity: .8;
    }
    #request-panel > .board .request-card > .request-card__main h3.card-title {
        color: var(--font-color--7);
        font-size: 14px;
    }

    #request-panel > .add-section {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 16px 0 0 10px;
        background-color: var(--bg-color);
        border-radius: 100%;
        box-shadow: var(--dial-button-shadow);
        cursor: pointer;
    }

    #request-panel > .add-section:hover .colorizable {
        fill: var(--bg-color--primary)
    }
</style>