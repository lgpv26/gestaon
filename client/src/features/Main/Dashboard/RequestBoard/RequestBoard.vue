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
            ...mapState('request-board', ['sections', 'requests']),
            ...mapGetters('request-board', ['sectionRequests'])
        },
        sockets: {
            requestBoardSections({data}){
                console.log("Received request-board:sections", data)
                if(data && data.length){
                    const vm = this
                    data.forEach((section) => {
                        vm.ADD_SECTION(section)
                    })
                }
            },
            requestBoardSectionCreate(response){
                console.log("Received request-board:section-create", response)
                this.ADD_SECTION(response.data)
            },
            requestBoardSectionMove(response){
                console.log(response)
                const section = response.data.section
                console.log(section.id, section.position)
                this.SET_SECTION({
                    sectionId: section.id,
                    section: {
                        position: section.position
                    }
                })
                Vue.nextTick(() => {
                    this.SORT_SECTIONS()
                })
            }
        },
        methods: {
            ...mapMutations('morph-screen', []),
            ...mapMutations('request-board', ['SORT_SECTIONS','RESET_REQUESTS','ADD_SECTION','SET_SECTIONS','SET_SECTION','ADD_REQUEST','SET_SECTION_REQUESTS']),

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



            /*this.ADD_SECTION({
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
                                    name: "TESTE CLIENTE " + i
                                },
                                task: randomTask
                            }
                        })
                    }
                }
            })
            */
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