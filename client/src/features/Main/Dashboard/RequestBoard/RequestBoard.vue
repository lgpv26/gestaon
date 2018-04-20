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
    import Scrollbar from 'smooth-scrollbar';
    import Vue from 'vue'
    import _ from 'lodash';
    import utils from '@/utils'

    import RequestBoardSection from './RequestBoardSection.vue'

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
            }
        },
        sockets: {
            requestBoardLoad(ev){
                console.log("Received requestBoardLoad", ev)
                if(ev.success){
                    const vm = this
                    ev.evData.sections.forEach((section) => {
                        vm.ADD_SECTION(section)
                    })
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
                this.ADD_REQUEST(card)
            },
            requestBoardCardMove(response){
                console.log("Received requestBoardCardMove", response)

                /*const section = response.data.section
                this.SET_SECTION({
                    sectionId: section.id,
                    section: {
                        position: section.position
                    }
                })
                Vue.nextTick(() => {
                    this.SORT_SECTIONS()
                })*/
            },
        },
        methods: {
            ...mapMutations('morph-screen', []),
            ...mapMutations('request-board', ['SORT_SECTIONS','RESET_REQUESTS','REMOVE_SECTION','ADD_SECTION','SET_SECTIONS','SET_SECTION','ADD_REQUEST','SET_SECTION_REQUESTS']),

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
                    let position
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
                setImmediate(() => {
                    this.scrollables.forEach(({ scrollable }) => {
                        scrollable.updateResizeListeners()
                    })
                });
                const viewport = _.first(ev.item.getElementsByClassName('board-section__viewport'));
                viewport.style.display = 'initial';
            },

            /* In-component utilities */

            updateScrolls(){
                setImmediate(() => {
                    this.scrollables.forEach(({ scrollable }) => {
                        scrollable.updateScroll()
                    })
                });
            }
        },
        mounted(){
            const vm = this
            this.SET_SECTIONS([])
            console.log("Request Board")
            this.$socket.emit('request-board:load')
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