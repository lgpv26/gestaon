<template>
    <div class="app-window" v-show="window.show" :style="{'z-index': window.zIndex}" ref="window" @mousedown="focus()">
        <div class="resizable-edge" style="position: absolute; background-color: transparent; right: -8px; width: 30px; height: 15px; bottom: -8px; z-index: 3;"></div>
        <div class="resizable-edge" style="position: absolute; background-color: transparent; right: -8px; bottom: -5px; height:25px; width: 15px; z-index: 3;"></div>
        <div class="window__header">
            <h3 class="window__title">ATENDIMENTO</h3>
            <span>{{ window.id }}</span>
            <!--<span class="window__spacer">-</span>
            <span class="window__author">Gisele</span>
            <span class="window__spacer">às</span>
            <span class="window__time">10:00</span>-->
            <span class="push-both-sides"></span>
            <a class="chat-button" v-if="false" @click="chat()">
                <i class="mi mi-chat"></i>
            </a>
            <a class="close-button" @click="close()">
                <i class="mi mi-close"></i>
            </a>
        </div>
        <form class="window__body" v-if="window.show" autocomplete="off">
            <app-request ref="request" :request="window.card.request"></app-request>
        </form>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex'
    import interact from 'interactjs'
    import _ from 'lodash'
    import Request from './Request/Request.vue'

    export default {
        props: ['window'],
        data(){
            return {
                windowInteractInstance: null,
            }
        },
        components: {
            'app-request': Request
        },
        methods: {
            focus(){
                this.$store.dispatch('entities/windows/update', {
                    id: this.window.id,
                    zIndex: this.$store.getters['entities/windows/query']().max('zIndex') + 1
                })
            },
            chat(){
                this.$refs.request.toggleChat()
            },
            close(){
                this.$store.dispatch('entities/windows/update', {
                    id: this.window.id,
                    show: false
                })
            }
        },
        mounted(){
            const vm = this
            if(!vm.windowInteractInstance){
                vm.windowInteractInstance = interact(vm.$refs.window).draggable({
                    allowFrom: '.window__header',
                    ignoreFrom: '.close-button, .chat-button',
                    onmove(event){
                        let target = event.target,
                            // keep the dragged position in the data-x/data-y attributes
                            x = (parseFloat(target.getAttribute('data-x')) || 20) + event.dx,
                            y = (parseFloat(target.getAttribute('data-y')) || 20) + event.dy;

                        // translate the element
                        target.style.left = x + 'px'
                        target.style.top = y + 'px'

                        // update the posiion attributes
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    },
                    onend  : function (event) {
                        vm.$store.dispatch('entities/windows/update', {
                            where: vm.window.id,
                            data: {
                                x: (parseFloat(event.target.getAttribute('data-x')) || 20) + event.dx,
                                y: (parseFloat(event.target.getAttribute('data-y')) || 20) + event.dy
                            }
                        })
                    }
                }).resizable({
                    edges: { left: false, right: '.resizable-edge', bottom: '.resizable-edge', top: false },
                    restrictSize: {
                        min: { width: 960, height: 540 },
                    }
                }).on('resizemove', function (event) {
                    let target = event.target,
                        x = (parseFloat(target.getAttribute('data-x')) || 20),
                        y = (parseFloat(target.getAttribute('data-y')) || 20);
                    // update the element's style
                    target.style.width  = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';

                    // translate when resizing from top or left edges
                    x += event.deltaRect.left;
                    y += event.deltaRect.top;

                    target.style.left = x + 'px'
                    target.style.top = y + 'px'

                    target.setAttribute('data-x', x)
                    target.setAttribute('data-y', y)
                })

                let target = this.$refs.window

                // translate the element
                target.style.left = this.window.x + 'px'
                target.style.top = this.window.y + 'px'

                // update the posiion attributes
                target.setAttribute('data-x', this.window.x);
                target.setAttribute('data-y', this.window.y);
            }
        },
        beforeDestroy(){
            if(this.windowInteractInstance){
                this.windowInteractInstance.unset()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .app-window {
        position: absolute;
        width: 960px;
        height: 540px;
        background-color: var(--bg-color--2);
        display: flex;
        flex-direction: column;
        box-shadow: var(--popover-shadow);
        pointer-events: initial;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        top: 20px;
        left: 20px;
        .window {
            width:100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        .window__header {
            display: flex;
            flex-shrink: 0;
            flex-direction: row;
            height: 30px;
            align-items: center;
            background-color: var(--bg-color--5);
            &:hover {
                background-color: var(--bg-color--8);
            }
            h3, span {
                position: relative;
                top: -1px;
            }
            span {
                color: var(--font-color--7);
                font-size: 12px;
            }
            span.window__spacer {
                margin: 0 5px;
            }
            span.window__author, span.window__time {
                color: var(--font-color--primary);
                font-weight: 600;
            }
            .window__title {
                color: var(--font-color--terciary);
                margin-left: 8px;
                margin-right: 5px;
                font-size: 12px;
            }
            .close-button, .chat-button {
                height: 30px;
                width: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: var(--bg-color--9);
                color: var(--font-color--7);
                margin-left: 1px;
                i {
                    font-weight: 900;
                    font-size: 18px;
                    position: relative;
                    top: -1px;
                }
                &:hover {
                    background-color: var(--bg-color--10);
                }
            }
            .chat-button i {
                font-size: 16px;
            }
        }
        .window__body {
            display: flex;
            flex-grow: 1;
            background-color: var(--bg-color--6);
        }
    }
</style>
