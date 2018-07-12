<template>
    <div id="request-panel" ref="requestPanel">
        <app-draggable class="board" ref="board" :value="sections" :options="sectionDraggableOptions"
            @input="onSectionDraggableInput($event)" @start="onSectionDragStart" @end="onSectionDragEnd" :move="onSectionMove">
            <app-request-board-section ref="sections" v-for="section in sections" :key="section.id" :data-id="section.id" :class="{dragging: isDraggingSection}"
                    :scrollables="scrollables" :options="boardOptions" :section="section"
                    @updateScrolls="updateScrolls()">
            </app-request-board-section>
        </app-draggable>
        <a class="add-section" @click="addSection()">
            <request-board-icon-add-section></request-board-icon-add-section>
        </a>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import DraggableComponent from 'vuedraggable';

    import Vue from 'vue'
    import _ from 'lodash'
    import moment from 'moment'
    import utils from '../../../../utils'
    import { createHelpers } from 'vuex-map-fields'

    import RequestBoardSection from './RequestBoardSection.vue'

    const { mapFields } = createHelpers({
        getterType: 'request-board/getField',
        mutationType: 'request-board/updateField',
    })

    export default {
        components: {
            'app-draggable': DraggableComponent,
            'app-request-board-section': RequestBoardSection
        },
        data(){
            return {
                boardOptions: {
                    columnWidth: 320,
                    gutterSize: 10,
                    headerHeight: 50,
                    cardHeight: 140
                },
                sectionDraggableOptions: {
                    handle: '.board-section__header',
                    forceFallback: true
                },
                scrollables: [],
                isDraggingSection: false,
                lastMove: {
                    from: null,
                    to: null
                }
            }
        },
        computed: {
            ...mapFields([
                'filters',
                'filters.deliveryDate',
            ]),
            ...mapState(['mainContentArea']),
            ...mapState('auth', ['user', 'token', 'company']),
            ...mapState('morph-screen', { isShowingMorphScreen: 'isShowing' }),
            ...mapState('request-board', ['sections']),
            ...mapGetters('request-board', [])
        },
        watch: {
            sections: {
                handler(){
                    this.updateScrolls()
                },
                deep: true
            },
            filters: {
                handler(newFilterValue){
                    const filterData = utils.removeReactivity(newFilterValue)
                    this.load(filterData)
                },
                deep: true
            }
        },
        sockets: {
            requestBoardLoad(ev){
                console.log("Received requestBoardLoad", ev)
                if(ev.success){
                    const vm = this
                    vm.SET_SECTIONS([])
                    ev.evData.sections.forEach((section) => {
                        vm.ADD_SECTION(section)
                    })
                    this.REAPLY_FILTERS()
                }
                else {
                    console.log("ERROR", ev.error)
                }
            },
            requestBoardSectionCreate(ev){
                console.log("Received requestBoardSectionCreate", ev)
                if(ev.success) {
                    this.ADD_SECTION(ev.evData)
                }
                else {
                    console.log("ERROR", ev.error)
                }
            },
            requestBoardSectionRemove(ev){
                console.log("Received requestBoardSectionRemove", ev)
                if(ev.success){
                    this.REMOVE_SECTION(ev.evData.sectionId)
                }
                else {
                    console.log("ERROR", ev.error)
                }
            },
            requestBoardSectionMove(ev){
                console.log("Received requestBoardSectionMove", ev)
                if(ev.success) {
                    this.SET_SECTION({
                        sectionId: ev.evData.id,
                        section: {
                            position: ev.evData.position
                        }
                    })
                    Vue.nextTick(() => {
                        this.SORT_SECTIONS()
                    })
                }
                else {
                    console.log("ERROR", ev.error)
                }
            },
            requestBoardCardCreate(request){
                console.log("Received requestBoardCardCreate", request)
                const card = request.data.card
                const start = moment(this.deliveryDate).startOf("day")
                const finish = moment(this.deliveryDate).endOf("day")
                if(moment(card.deliveryDate).isBetween(start, finish, null, '[]')){
                    this.ADD_REQUEST(card)
                }
            },
            requestBoardCardUpdate(ev){
                console.log("Received requestBoardCardUpdate", ev)
                if(ev.success){
                    const card = ev.evData
                    const start = moment(this.deliveryDate).startOf("day")
                    const finish = moment(this.deliveryDate).endOf("day")
                    if(moment(card.deliveryDate).isBetween(start, finish, null, '[]')){
                        this.updateCard({
                            cardId: card.id,
                            card: card
                        })
                    }
                    else {
                        this.removeCard(card.id)
                    }
                }
            },
            requestBoardCardMove(ev){
                console.log("Received requestBoardCardMove", ev)
                if(ev.success){
                    this.moveCard(ev.evData.card)
                }
            },
            requestBoardCardRemove(ev){
                console.log("Received requestBoardCardRemove", ev)
                if(ev.success){
                    this.removeCard(ev.evData.removedCardId)
                }
            },
        },
        methods: {
            ...mapMutations('morph-screen', []),
            ...mapMutations('request-board', [
                'REAPLY_FILTERS','SORT_SECTIONS',
                'REMOVE_SECTION','ADD_SECTION','SET_SECTIONS','SET_SECTION',
                'RESET_REQUESTS','ADD_REQUEST','SET_SECTION_REQUESTS','MOVE_CARD'
            ]),
            ...mapActions('request-board', [
                'moveCard','updateCard','removeCard','updateCardUnreadChatItemCount'
            ]),

            /* Sections */

            addSection(){
                console.log("Emitting request-board:section-create")
                this.$socket.emit('request-board:section-create')
            },

            /**
             * When sections changes its positions
             */
            onSectionDraggableInput(sections){
                // vuex state should be updated through mutations
                this.SET_SECTIONS(sections)
                Vue.nextTick(() => {
                    const prevSection = this.sections[this.lastMove.to - 1]
                    const currSection = this.sections[this.lastMove.to]
                    const nextSection = this.sections[this.lastMove.to + 1]
                    // is in middle
                    if(nextSection && prevSection){
                        console.log("middle", (prevSection.position + nextSection.position) / 2)
                        this.$socket.emit('request-board:section-move', {
                            sectionId: currSection.id,
                            location: 'middle',
                            position: (prevSection.position + nextSection.position) / 2
                        })
                    }
                    // is first
                    else if(nextSection && !prevSection){
                        console.log("first")
                        this.$socket.emit('request-board:section-move', {
                            sectionId: currSection.id,
                            location: 'first'
                        })
                    }
                    // is last
                    else if(!nextSection && prevSection){
                        console.log("last")
                        this.$socket.emit('request-board:section-move', {
                            sectionId: currSection.id,
                            location: 'last'
                        })
                    }
                })
            },
            onSectionMove(ev){
                this.lastMove.from = ev.draggedContext.index
                this.lastMove.to = ev.draggedContext.futureIndex
            },
            onSectionDragStart(ev){
                const viewport = _.first(ev.item.getElementsByClassName('board-section__viewport'));
                viewport.style.display = 'none';
                const draggingElement = _.last(ev.from.getElementsByClassName('board-section'));
                const draggingElementViewport = _.first(draggingElement.getElementsByClassName('board-section__viewport'));
                draggingElementViewport.style.display = 'none';
            },
            onSectionDragEnd(ev){
                this.$nextTick(() => {
                    this.scrollables.forEach(({ scrollable }) => {
                        scrollable.updateResizeListeners()
                    })
                });
                const viewport = _.first(ev.item.getElementsByClassName('board-section__viewport'));
                viewport.style.display = 'initial';
            },
            load(filterData = { deliveryDate: moment().startOf('day').toISOString() }){
                const emitData = {
                    filter: btoa(JSON.stringify(filterData))
                }
                console.log("Emitted request-board:load", emitData)
                this.$socket.emit('request-board:load', emitData)
            },

            /* In-component utilities */

            updateScrolls(){
                this.$nextTick(() => {
                    this.scrollables.forEach(({ scrollable }) => {
                        scrollable.updateScroll()
                    })
                });
            }
        },
        mounted(){
            const vm = this
            vm.load()
            vm.$options.sockets['request-board:chat'] = (ev) => {
                if (ev.success) {
                    vm.updateCardUnreadChatItemCount({
                        cardId: ev.evData.cardId,
                        unreadChatItemCount: ev.evData.unreadChatItemCount
                    })
                }
                console.log("Received request-board:chat", ev)
            }
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
        pointer-events: none;
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
        pointer-events: initial;
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
        pointer-events: initial;
    }

    #request-panel > .add-section:hover .colorizable {
        fill: var(--bg-color--primary)
    }
</style>