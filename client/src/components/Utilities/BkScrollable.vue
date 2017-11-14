<template>
    <div class="app-scrollable" ref="scrollable">
        <slot></slot>
        <!--
        <div class="board-section__scrollbar" :style="{ width: boardOptions.gutterSize + 'px', height: mainContentArea.height - boardOptions.headerHeight - (boardOptions.gutterSize * 2) + 'px' }">
        -->
        <div class="scrollable__track" ref="track">
            <div class="track__scroll" @mousedown="boardSectionScrollbar(boardSection, index).onScrollableMouseDown($event)" @mouseup="boardSectionScrollbar(boardSection, index).onScrollableMouseUp($event)" @mousemove="boardSectionScrollbar(boardSection, index).onScrollableMouseMove($event)">
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
            }
        },
        computed: {
            viewportEl(){
                return this.$refs.scrollable.firstElementChild;
            },
            contentEl(){
                return this.viewportEl.firstElementChild;
            },
            trackEl(){
                return this.$refs.track;
            },
            scrollEl(){
                return this.$refs.track.firstElementChild;
            },
            contentAndViewportHeightDifference(){
                return Math.round(this.viewportEl.offsetHeight / this.contentEl.offsetHeight * 100) / 100;
            }
        },
        updated(){
            const vm = this;

            if(vm.contentAndViewportHeightDifference > 1 || vm.contentAndViewportHeightDifference < 0){
                vm.scrollEl.style.height = boardSectionScrollbar.style.height;
            }
            else {
                vm.scrollEl.style.height = vm.contentAndViewportHeightDifference * vm.viewportEl.offsetHeight + 'px'
            }

            if(!vm.contentEl.style.top){
                vm.contentEl.style.top = 0;
            }
            if(Math.abs(parseFloat(vm.contentEl.style.top)) + vm.viewportEl.offsetHeight > vm.contentEl.offsetHeight){
                if(index === 0) {
                    const overAmount = Math.abs(parseFloat(vm.contentEl.style.top)) + vm.viewportEl.offsetHeight - vm.contentEl.offsetHeight;
                    vm.contentEl.style.top = - (Math.abs(parseFloat(vm.contentEl.style.top)) - overAmount) + 'px';
                }
            }
        }
        /* updated(){
            const vm = this;
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
        } */
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