<template>
    <div class="board-section" :style="{ width: sectionWidth }">
        <div class="board-section__header" :style="{ height: options.headerHeight + 'px' }">
            <div class="header__section-title">
                <h3>{{ section.name + ' ' + section.position }}</h3>
                <span class="push-both-sides"></span>
                <ul style="display: flex; flex-direction: row">
                    <li @click="collapseSection(section)" style="width: 21px; height: 16px;">
                        <icon-section-collapse></icon-section-collapse>
                    </li>
                    <li @click="expandSection(section)" style="width: 21px; height: 16px;">
                        <icon-section-expand></icon-section-expand>
                    </li>
                    <li @mouseover="setLastHoveredSection(section)" class="section-title__settings-button" style="width: 15px; height: 16px;">
                        <app-dropdown-menu :menuList="sectionMenuList" :params="sectionMenuParams" :closeOnSelect="true">
                            <a href="javascript:void(0)" style="display: flex; height: 16px;">
                                <icon-section-settings></icon-section-settings>
                            </a>
                        </app-dropdown-menu>
                    </li>
                </ul>
            </div>
        </div>
        <div class="scrollable-content">
            <app-scrollable ref="scrollable" @updated="onSectionScrollUpdated($event)">
                <div class="board-section__viewport" :style="{ 'width': sectionWidth, 'height': sectionHeight }">
                    <app-draggable class="board-section__cards" :data-section-id="section.id" :value="section.cards" :options="cardDraggableOptions"
                        :style="{'padding-bottom': options.gutterSize + 'px', 'padding-left': options.gutterSize + 'px'}"
                        @input="onCardDraggableInput($event, section)" @start="onCardDragStart($event, section)" @end="onCardDragEnd($event, section)"
                        @change="onCardPositionChange($event, section)">
                        <div class="request-card" v-for="card in section.cards" v-show="card.state.showCard" @mousedown="onMouseDown(section)" :key="card.id" :style="{ height: options.cardHeight + 'px', width: options.columnWidth + 'px', 'margin-top': options.gutterSize + 'px', 'margin-right': options.gutterSize + 'px'}">
                            <app-request-board-card class="request-card__main" :card="card" :isDragging="isDraggingCard" @click="requestCardClicked(card, $event)"></app-request-board-card>
                        </div>
                    </app-draggable>
                    <div class="drag-space-hider" :style="{ width: '100%', position: 'absolute', top: 0, height: dragSpaceHiderHeight }"></div>
                </div>
            </app-scrollable>
        </div>
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
        props: ['section', 'options', 'scrollables'],
        data(){
            return {
                cardDraggableOptions: {
                    handle: '.request-card__main',
                    scroll: false,
                    forceFallback: false,
                    ghostClass: 'ghost',
                    group: 'cards'
                },
                lastHoveredSection: null,
                lastSectionMove: null,
                lastCardMove: {
                    sectionId: null,
                    from: null,
                    to: null
                },
                sectionMenuParams: {},
                sectionMenuList: [
                    {
                        text: 'Remover seção',
                        type: 'system',
                        param: {},
                        action: this.removeSection
                    }
                ],
                isDraggingBoardColumn: false,
                isDraggingCard: false
            }
        },
        computed: {
            ...mapState(['mainContentArea']),
            ...mapState('auth', ['user', 'token', 'company']),
            ...mapState('morph-screen', { isShowingMorphScreen: 'isShowing' }),
            ...mapState('request-board', ['sections']),
            ...mapGetters('request-board', []),
            sectionWidth(){
                return this.options.gutterSize + ((this.section.size * this.options.columnWidth) + ((this.section.size + 1) * this.options.gutterSize)) + 'px'
            },
            sectionHeight(){
                return this.mainContentArea.height - this.options.headerHeight - (this.options.gutterSize * 2) + 'px'
            },
            dragSpaceHiderHeight(){
                const numberOfVisibleSectionCards = _.sumBy(this.section.cards, (card) => {
                    if(card.state.showCard) return 1
                    else return 0
                })
                let baseHeight = this.options.gutterSize + (Math.floor((numberOfVisibleSectionCards / this.section.size)) * (this.options.cardHeight + this.options.gutterSize))
                if(this.isDraggingCard) baseHeight -= (this.options.cardHeight + this.options.gutterSize)
                return baseHeight + 'px'
            }
        },
        methods: {
            ...mapMutations('morph-screen', []),
            ...mapMutations('request-board', ['REAPLY_FILTERS','RESET_REQUESTS','ADD_SECTION','SET_SECTIONS','REMOVE_SECTION','SET_SECTION','ADD_REQUEST','SET_SECTION_REQUESTS']),

            /* Sections */

            setLastHoveredSection(section){
                this.sectionMenuParams.lastHoveredSection = section
            },
            removeSection(params){
                this.$socket.emit('request-board:section-remove', {
                    sectionId: params.lastHoveredSection.id
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

            /* Request / Cards */

            onMouseDown(section){
                this.lastSectionMove = section.id
            },

            onCardDragStart(ev, section){
                /*this.lastSectionMove.from = JSON.parse(JSON.stringify(section))
                console.log(this.lastSectionMove.from)*/
                this.isDraggingCard = true
                const boardCardContainer = _.first(ev.item.getElementsByClassName('request-board-card__container'));
                boardCardContainer.style.display = 'none';
                const tippies = Array.from(document.querySelectorAll('[data-card-tippy]'), el => el._tippy)
                tippies.forEach((tippy) => {
                    if(tippy){
                        tippy.hide()
                        tippy.disable()
                    }
                })
            },
            onCardDragEnd(ev, section){
                this.isDraggingCard = false
                const boardCardContainer = _.first(ev.item.getElementsByClassName('request-board-card__container'));
                boardCardContainer.style.display = 'flex';
                const tippies = Array.from(document.querySelectorAll('[data-card-tippy]'), el => el._tippy)
                tippies.forEach((tippy) => {
                    if(tippy){
                        tippy.enable()
                    }
                })
            },
            /**
             * When cards changes its positions, its vuex state should be updated through mutations
             */
            onCardDraggableInput(sectionCards, section){
                this.SET_SECTION_REQUESTS({
                    sectionId: section.id,
                    requests: sectionCards
                })
            },
            onCardPositionChange(ev, section){
                const vm = this
                let card, fromIndex, toIndex
                if(_.has(ev,'moved')){ // when moved to same section
                    fromIndex = ev.moved.oldIndex
                    toIndex = ev.moved.newIndex
                    card = ev.moved.element
                    this.emitCardPositionChange(section, card, toIndex, fromIndex)
                }
                else if(_.has(ev,'added')){ // when moved to a different section
                    toIndex = ev.added.newIndex
                    card = ev.added.element
                    this.emitCardPositionChange(section, card, toIndex, null)
                }
                this.REAPLY_FILTERS()
            },
            emitCardPositionChange(toSection, card, toIndex, fromIndex = null){
                const prevCard = toSection.cards[toIndex - 1]
                const currCard = toSection.cards[toIndex]
                const nextCard = toSection.cards[toIndex + 1]

                let position

                if (nextCard && prevCard) {
                    console.log("middle", nextCard)
                    this.$socket.emit('request-board:card-move', {
                        cardId: card.id,
                        location: 'middle',
                        toSection: toSection.id,
                        prevCard: prevCard.id,
                        nextCard: nextCard.id
                    })
                }
                // is first
                else if (nextCard && !prevCard) {
                    console.log("first")
                    this.$socket.emit('request-board:card-move', {
                        cardId: currCard.id,
                        toSection: toSection.id,
                        prevCard: null,
                        nextCard: nextCard.id,
                        location: 'first'
                    })
                }
                // is last or is the only card
                else if (!nextCard && prevCard) {
                    console.log("last")
                    this.$socket.emit('request-board:card-move', {
                        cardId: currCard.id,
                        toSection: toSection.id,
                        prevCard: prevCard.id,
                        nextCard: null,
                        location: 'last'
                    })
                }
                else if (!nextCard && !prevCard) {
                    console.log("last and only")
                    this.$socket.emit('request-board:card-move', {
                        cardId: currCard.id,
                        toSection: toSection.id,
                        prevCard: null,
                        nextCard: null,
                        location: 'last-and-only'
                    })
                }
            }
        },
        mounted(){
            this.$refs.scrollable['id'] = _.uniqueId('scrollable#')
            this.scrollables.push({
                id: this.$refs.scrollable['id'],
                scrollable: this.$refs.scrollable
            })
        },
        beforeDestroy(){
            const scrollableIndex = _.findIndex(this.scrollables, { id: this.$refs.scrollable.id })
            if(scrollableIndex !== -1){
                this.scrollables.splice(scrollableIndex, 1)
            }
        }
    }
</script>

<style>
    .board-section {
        margin: 10px 10px 10px 0;
        padding: 0;
        background: rgba(21,23,28,.5);
        overflow: hidden;
        flex-shrink: 0;
    }
    .board-section > .board-section__header {
        cursor: -webkit-grab;
        cursor: -moz-grab;
        cursor: grab;
        padding: 10px 10px 8px;
        height: 50px;
        background: var(--bg-color--2);
    }
    .board-section > .board-section__header {
        display: flex;
        color: var(--base-color);
    }
    .board-section > .board-section__header > .header__section-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
    .board-section > .board-section__header > .header__section-title > h3 {
        color: var(--font-color--8);
        flex-grow: 1;
        font-size: 14px;
    }
    .board-section > .board-section__header > .header__section-title > ul > li {
        cursor: pointer;
        margin-right: 5px;
    }
    .board-section > .board-section__header > .header__section-title ul li svg {
        pointer-events: none;
    }
    .board-section > .board-section__header > .header__section-title ul li .fill,
    .board-section > .board-section__header > .header__section-title ul li .colorizable {
        fill: var(--font-color--2)
    }
    .board-section > .board-section__header > .header__section-title ul li .stroke
    {
        stroke: var(--font-color--2)
    }
    .board-section > .board-section__header > .header__section-title ul li:hover .fill,
    .board-section > .board-section__header > .header__section-title ul li:hover .colorizable {
        fill: var(--font-color--primary)
    }
    .board-section > .board-section__header > .header__section-title ul li:hover .stroke
    {
        stroke: var(--font-color--primary)
    }
    .board-section > .board-section__header > .header__section-title ul li.section-title__settings-button {
        margin-right: 0;
    }
    .board-section > .board-section__header > .header__section-title ul li.section-title__settings-button svg {
        position: relative;
        top: 1px;
    }
    .board-section__viewport {
        position: relative;
        overflow: hidden;
        float: left;
    }
    .board-section__viewport .board-section__cards {
        display: flex;
        flex-flow: row wrap;
        min-height: 100%;
        align-content: flex-start;
        width: 100%;
        position: absolute;
    }
    .board-section__viewport::-webkit-scrollbar {
        background-color: rgba(0,0,0,.2);
        width: 10px;
    }
    .board-section__viewport::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,.7);
        width: 10px;
    }

    /* card */

    .request-card {
        display: flex;
        position: relative;
        z-index: 9;
    }
    .request-card > .request-card__main {
        cursor: pointer;
        flex-grow:1;
    }
    .request-card.ghost > .request-card__main {
        border: 2px dashed rgba(255,255,255,.1);
        opacity: .8;
    }

</style>