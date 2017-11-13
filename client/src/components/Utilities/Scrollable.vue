<template>
    <div class="app-scrollable" ref="scrollable" @mousewheel="scrolled($event)">
        <slot></slot>
        <!--
        <div class="board-section__scrollbar" :style="{ width: boardOptions.gutterSize + 'px', height: mainContentArea.height - boardOptions.headerHeight - (boardOptions.gutterSize * 2) + 'px' }">
        -->
        <div class="scrollable__track" ref="track">
            <div class="track__scroll" @mousedown="scrollMouseDown($event)">
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';

    export default {
        props: {
        },
        data(){
            return {
                viewportEl: null,
                contentEl: null,
                trackEl: null,
                scrollEl: null
            }
        },
        computed: {
        },
        methods: {
            setElements(){
                this.viewportEl = this.$refs.scrollable.firstElementChild;
                this.contentEl = this.viewportEl.firstElementChild;
                this.trackEl = this.$refs.track;
                this.scrollEl = this.trackEl.firstElementChild;
            },
            scrolled(ev){
                if(!this.scrollEl.style.top){
                    this.scrollEl.style.top = 0 + 'px';
                }
                if(ev.deltaY > 0){ // scroll down
                    this.scrollEl.style.top = Math.abs(parseFloat(this.scrollEl.style.top)) + 10 + 'px';
                }
                else { // scroll up
                    this.scrollEl.style.top = Math.abs(parseFloat(this.scrollEl.style.top)) - 10 + 'px';
                }
            },
            scrollMouseDown(ev){
                const vm = this;

                const viewportPositionOnScreen = {
                    x: vm.getElPositionInScreen(vm.viewportEl).x,
                    y: vm.getElPositionInScreen(vm.viewportEl).y
                };

                const mouseMoveEventListener = (mouseMoveEv) => {
                    const status = new function(){
                        this.body = {
                            cursorY: mouseMoveEv.clientY
                        };
                        this.scroll = {
                            height: vm.scrollEl.offsetHeight,
                            cursorY: ev.offsetY
                        };
                        this.viewport ={
                            height: vm.viewportEl.offsetHeight,
                            divY: viewportPositionOnScreen.y,
                            divX: viewportPositionOnScreen.x,
                        };
                        this.content ={
                            height: vm.contentEl.offsetHeight
                        };
                    };
                    let scrollOffsetToTop = 0;
                    if((status.body.cursorY - status.scroll.cursorY) < status.viewport.divY){
                        ev.target.style.top = '0px';
                    }
                    else if((status.body.cursorY - status.scroll.cursorY) - status.viewport.divY > vm.viewportEl.clientHeight - status.scroll.height){
                        scrollOffsetToTop = vm.viewportEl.clientHeight - status.scroll.height;
                        ev.target.style.top = scrollOffsetToTop + 'px';
                    }
                    else { // if scroll moved
                        scrollOffsetToTop = (status.body.cursorY - status.scroll.cursorY - status.viewport.divY);
                        ev.target.style.top = scrollOffsetToTop + 'px';
                        // console.log((boardSectionViewport.offsetHeight / boardSectionCards.offsetHeight) * boardSectionCards.offsetHeight + 'px')
                    }
                    vm.contentEl.style.top = - (scrollOffsetToTop / (status.viewport.height - status.scroll.height)) * (vm.contentEl.offsetHeight - vm.viewportEl.offsetHeight) + 'px';
                };
                const mouseUpEventListener = () => {
                    document.removeEventListener('mousemove', mouseMoveEventListener);
                    document.removeEventListener('mouseup', mouseUpEventListener);
                };
                document.addEventListener('mousemove', mouseMoveEventListener);
                document.addEventListener('mouseup', mouseUpEventListener);
            },
            updateScroll(){
                setTimeout(() => {
                    const vm = this;
                    vm.setElements();
                    const contentAndViewportHeightDifference = Math.round(vm.viewportEl.offsetHeight / vm.contentEl.offsetHeight * 100) / 100;

                    if(contentAndViewportHeightDifference > 1 || contentAndViewportHeightDifference < 0){
                        vm.scrollEl.style.height = vm.trackEl.offsetHeight + 'px';
                    }
                    else {
                        vm.scrollEl.style.height = contentAndViewportHeightDifference * vm.viewportEl.offsetHeight + 'px'
                    }
                    /*
                    if(!vm.contentEl.style.top){
                        vm.contentEl.style.top = 0;
                    }
                    if(Math.abs(parseFloat(vm.contentEl.style.top)) + vm.viewportEl.offsetHeight > vm.contentEl.offsetHeight){
                        console.log("caiu aqui");
                        const overAmount = Math.abs(parseFloat(vm.contentEl.style.top)) + vm.viewportEl.offsetHeight - vm.contentEl.offsetHeight;
                        vm.contentEl.style.top = - (Math.abs(parseFloat(vm.contentEl.style.top)) - overAmount) + 'px';
                    }
                    */
                }, 0);
            },
            getElPositionInScreen(el){
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
            this.updateScroll();
        },
        updated(){
            this.updateScroll();
        }
    }
</script>
<style>
    .app-scrollable {
        position: relative;
        display: flex;
    }
    .scrollable__track {
        position: absolute;
        float: right;
        background: rgba(0,0,0,.2);
        cursor: pointer;
        overflow: hidden;
        width: 10px;
        right: 0;
        top: 0;
        bottom: 0;
    }
    .scrollable__track > .track__scroll {
        position: absolute;
        top: 0;
        width: 100%;
        opacity: .5;
        background-color: #990000;
    }
</style>