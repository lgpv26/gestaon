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
    import _ from 'lodash'
    import ResizeSensor from 'css-element-queries/src/ResizeSensor'

    export default {
        props: {
        },
        data(){
            return {
                viewportEl: null,
                contentEl: null,
                trackEl: null,
                scrollEl: null,
                resizeObserver: null
            }
        },
        computed: {
        },
        methods: {
            setElements(){
                this.viewportEl = this.$refs.scrollable.firstElementChild
                this.contentEl = this.viewportEl.firstElementChild
                this.trackEl = this.$refs.track
                this.scrollEl = _.first(this.trackEl.getElementsByClassName('track__scroll'))
            },
            scrolled(ev){
                if(!this.scrollEl.style.top){
                    this.scrollEl.style.top = 0 + 'px'
                }
                const amountToScroll = 20
                if(ev.deltaY > 0){ // scroll down
                    if(this.scrollDistanceToBottom() >= 0){ // if before bottom limit
                        if(this.scrollDistanceToBottom() >= amountToScroll){ // scroll only if the available space is bigger than the amount
                            this.scrollEl.style.top = Math.abs(parseFloat(this.scrollEl.style.top)) + amountToScroll + 'px'
                        }
                        else { // fit to bottom if the available space is lesser than the amount
                            this.scrollEl.style.top = this.trackEl.offsetHeight - this.scrollEl.offsetHeight + 'px'
                        }
                    }
                    else { // if over bottom limit, fit to bottom
                        this.scrollEl.style.top = this.trackEl.offsetHeight - this.scrollEl.offsetHeight + 'px'
                    }
                }
                else if(ev.deltaY < 0) { // scroll up
                    if(this.scrollDistanceToTop() >= 0){ // if before top limit
                        if(this.scrollDistanceToTop() >= amountToScroll){ // scroll only if the available space is bigger than the amount
                            this.scrollEl.style.top = Math.abs(parseFloat(this.scrollEl.style.top)) - amountToScroll + 'px'
                        }
                        else { // fit to top if the available space is lesser than the amount
                            this.scrollEl.style.top = 0 + 'px'
                        }
                    }
                    else { // if over top limit, fit to top
                        this.scrollEl.style.top = 0 + 'px'
                    }
                }
                this.contentEl.style.top = - (this.scrollDistanceToTop() / (this.trackEl.offsetHeight - this.scrollEl.offsetHeight) * (this.contentEl.offsetHeight - this.viewportEl.offsetHeight)) + 'px'
                this.emitUpdatedEvent()
            },
            scrollMouseDown(ev){
                const vm = this
                const viewportPositionOnScreen = {
                    x: vm.getElPositionInScreen(vm.viewportEl).x,
                    y: vm.getElPositionInScreen(vm.viewportEl).y
                }
                const mouseMoveEventListener = (mouseMoveEv) => {
                    const status = new function(){
                        this.body = {
                            cursorY: mouseMoveEv.clientY
                        }
                        this.scroll = {
                            height: vm.scrollEl.offsetHeight,
                            cursorY: ev.offsetY
                        }
                        this.viewport ={
                            height: vm.viewportEl.offsetHeight,
                            divY: viewportPositionOnScreen.y,
                            divX: viewportPositionOnScreen.x,
                        }
                        this.content ={
                            height: vm.contentEl.offsetHeight
                        }
                    }
                    let scrollOffsetToTop = 0
                    if((status.body.cursorY - status.scroll.cursorY) < status.viewport.divY){
                        ev.target.style.top = '0px'
                    }
                    else if((status.body.cursorY - status.scroll.cursorY) - status.viewport.divY > vm.viewportEl.clientHeight - status.scroll.height){
                        scrollOffsetToTop = vm.viewportEl.clientHeight - status.scroll.height
                        ev.target.style.top = scrollOffsetToTop + 'px'
                    }
                    else { // if scroll moved
                        scrollOffsetToTop = (status.body.cursorY - status.scroll.cursorY - status.viewport.divY)
                        ev.target.style.top = scrollOffsetToTop + 'px'
                    }
                    vm.contentEl.style.top = - (scrollOffsetToTop / (status.viewport.height - status.scroll.height)) * (vm.contentEl.offsetHeight - vm.viewportEl.offsetHeight) + 'px'
                    vm.emitUpdatedEvent()
                }
                const mouseUpEventListener = () => {
                    document.removeEventListener('mousemove', mouseMoveEventListener)
                    document.removeEventListener('mouseup', mouseUpEventListener)
                }
                document.addEventListener('mousemove', mouseMoveEventListener)
                document.addEventListener('mouseup', mouseUpEventListener)
            },
            updateScroll(){
                const vm = this
                const contentAndViewportHeightDifference = Math.round(vm.viewportEl.offsetHeight / vm.contentEl.offsetHeight * 100) / 100
                if(!parseFloat(vm.contentEl.style.top)){ // set top 0 if no top is set
                    vm.contentEl.style.top = 0 + 'px'
                }
                if(vm.contentEl.offsetHeight > vm.viewportEl.offsetHeight && Math.abs(parseFloat(vm.contentEl.style.top)) + vm.viewportEl.offsetHeight >= vm.contentEl.offsetHeight){
                    vm.contentEl.style.top = - (vm.contentEl.offsetHeight - vm.viewportEl.offsetHeight) + 'px'
                }
                if(contentAndViewportHeightDifference >= 1 || contentAndViewportHeightDifference <= 0){
                    vm.trackEl.classList.add('disabled')
                    vm.contentEl.style.top = 0 + 'px'
                    vm.scrollEl.style.height = vm.trackEl.offsetHeight + 'px'
                }
                else {
                    vm.trackEl.classList.remove('disabled')
                    vm.scrollEl.style.top = (Math.abs(parseFloat(vm.contentEl.style.top)) / vm.contentEl.offsetHeight) * vm.trackEl.offsetHeight + 'px'
                    vm.scrollEl.style.height = contentAndViewportHeightDifference * vm.viewportEl.offsetHeight + 'px'
                }
                vm.emitUpdatedEvent()
            },
            emitUpdatedEvent(){
                const vm = this
                vm.$emit('updated', {
                    scrollElement: vm.scrollEl,
                    trackElement: vm.trackEl,
                    contentElement: vm.contentEl,
                    viewportElement: vm.viewportEl
                });
            },
            scrollDistanceToTop(){
                return this.scrollEl.offsetTop
            },
            scrollDistanceToBottom(){
                const distanceToBeReversed = (this.scrollEl.offsetTop + this.scrollEl.offsetHeight) - this.trackEl.offsetHeight
                return distanceToBeReversed - (distanceToBeReversed * 2)
            },
            getElPositionInScreen(el){
                let xPos = 0, yPos = 0
                while (el) {
                    if (el.tagName.toLowerCase() === "body") {
                        let xScroll = el.scrollLeft || document.documentElement.scrollLeft
                        let yScroll = el.scrollTop || document.documentElement.scrollTop
                        xPos += (el.offsetLeft - xScroll + el.clientLeft)
                        yPos += (el.offsetTop - yScroll + el.clientTop)
                    } else {
                        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft)
                        yPos += (el.offsetTop - el.scrollTop + el.clientTop)
                    }
                    el = el.offsetParent
                }
                return { x: xPos, y: yPos }
            },
            updateResizeListeners(){
                const vm = this
                vm.$nextTick(() => {
                    if(this.resizeSensor) this.resizeSensor.detach()
                    this.resizeSensor = new ResizeSensor(vm.viewportEl, () => {
                        vm.updateScroll()
                    })
                })
            }
        },
        mounted(){
            this.setElements()
            this.updateResizeListeners()
        },
        beforeDestroy(){
            this.resizeSensor.detach()
        }
    }
</script>
<style>
    .app-scrollable {
        position: relative;
        display: flex;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
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
    .scrollable__track.disabled {
    }
    .scrollable__track > .track__scroll {
        position: absolute;
        top: 0;
        width: 100%;
        opacity: .7;
        background-color: var(--primary-color);
    }
    .scrollable__track.disabled > .track__scroll {
        background-color: transparent;
    }
</style>