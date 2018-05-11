<template>
    <div class="ag-search" ref="search" @mouseleave="onMouseLeave($event)" @mouseover="onMouseOver($event)">
        <div class="search-input__target" @mousedown="onClickTarget($event)" ref="target">
            <slot></slot>
        </div>
        <transition name="fade">
            <div class="search-input__result-box" ref="container" v-show="isShowing"
                :style="{'margin-top':(verticalOffset)? verticalOffset + 'px' : '0', 'margin-left':(horizontalOffset)? horizontalOffset + 'px' : '0'}" >
                <a class="container__close-button" ref="closeButton">X</a>
                <slot name="no-results" v-if="!items || items.length <= 0 || forceNoResults"></slot>
                <div ref="scrollbar" style="overflow-y: auto; max-height: 180px;">
                    <div class="scrollable-content">
                        <div class="result-box__items" v-show="items && items.length > 0 && !forceNoResults">
                            <div v-for="item in items" v-if="!showOnly || item[showOnly]" :key="item.iterationId" class="items__item" ref="searchable" @click="searchItemSelected(item)">
                                <slot name="item" :item="item"></slot>
                            </div>
                        </div>
                    </div>
                </div>
                <slot name="settings"></slot>
            </div>
        </transition>
    </div>
</template>
<script>
    import Vue from 'vue';
    import _ from 'lodash';
    import Popper from 'popper.js';
    import MarkJS from 'mark.js';
    import Scrollbar from 'smooth-scrollbar';
    export default {
        data(){
            return {
                popperInstance: null,
                isShowing: false,
                closeTimeout: null,
                markJs: null,
                scrollbar: null
            }
        },
        props: ['items', 'shouldStayOpen', 'query', 'showOnly', 'verticalOffset', 'horizontalOffset', 'forceNoResults'],
        watch: {
            items(){
                this.items.map((item) => {
                    item.iterationId = _.uniqueId('i#');
                });
            },
            showOnly(){
                const vm = this;
                Vue.nextTick(() => {
                    if(vm.scrollbar){
                        vm.scrollbar.update();
                    }
                });
            },
            query(){
                if(this.query.trim() !== ''){
                    this.openSearch();
                }
            }
        },
        methods: {
            search(){
                const vm = this;
                Vue.nextTick(() => {
                    if(vm.$refs.searchable){
                        if(vm.markJs){
                            vm.markJs.unmark({
                                done(){
                                    vm.markJs.mark(vm.query, {
                                        element: 'em'
                                    });
                                }
                            });
                        }
                        else {
                            vm.markJs = new MarkJS(vm.$refs.searchable);
                            vm.markJs.mark(vm.query, {
                                element: 'em'
                            });
                        }
                    }
                    if(vm.popperInstance){
                        vm.popperInstance.update();
                    }
                    if(vm.scrollbar){
                        vm.scrollbar.update();
                    }
                });
            },
            searchItemSelected(item){
                this.$emit("itemSelected", item);
                this.closeSearch();
            },
            onMouseOver(ev){
                if(this.closeTimeout){
                    clearTimeout(this.closeTimeout);
                }
            },
            onMouseLeave(ev){
                if(this.shouldStayOpen) return;
                this.closeTimeout = setTimeout(() => {
                    this.closeSearch();
                }, 1200);
            },
            onClickTarget(ev){
                this.openSearch();
            },
            onClick(ev){
                const vm = this;
                if(vm.isShowing && (vm.$refs.target === ev.target || vm.$refs.target.contains(ev.target))){}
                else if(vm.isShowing && vm.$refs.container && ((vm.$refs.container !== ev.target && !vm.$refs.container.contains(ev.target)) ||
                    ev.target === vm.$refs.closeButton || vm.$refs.closeButton.contains(ev.target))){
                    vm.closeSearch();
                }

            },
            openSearch(){
                this.isShowing = true;
                Vue.nextTick(() => {
                    if(this.popperInstance) {
                        this.popperInstance.destroy();
                    }
                    this.popperInstance = new Popper(this.$refs.target, this.$refs.container, {
                        placement: 'bottom-start',
                        modifiers: {
                            flip: {
                                enabled: false
                            }
                        }
                    });
                });
            },
            closeSearch(){
                this.isShowing = false;
            },
            toggleSelect(){
                if(this.isShowing) return this.closeSearch();
                this.openSearch();
            }
        },
        mounted(){
            document.addEventListener('mousedown', this.onClick);
            if(this.markJs){
                this.markJs.unmark();
                this.markJs = null;
            }
            // initialize scrollbars
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar,{
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            });
        },
        beforeDestroy(){
            document.removeEventListener("mousedown", this.onClick);
        }
    }
</script>

<style scoped>

    .ag-search .fade-enter-active, .ag-search  .fade-leave-active {
        transition: opacity 0s
    }

    .ag-search .fade-enter, .ag-search  .fade-leave-to {
        opacity: 0
    }

    .ag-search {
        flex: 1 0;
        position: relative;
    }

    .ag-search .search-input__target {
        position: relative;
        color: var(--base-color);
        flex-shrink: 0;
    }
    .ag-search .search-input__result-box {
        flex-shrink: 0;
        transition: .0s opacity;
        width: 320px;
        position: absolute;
        z-index: 99999;
        background-color: var(--bg-color--2);
        padding: 20px;
        border-radius: 5px;
        cursor: initial;
        margin: 0;
        -webkit-box-shadow: 0 2px 4px 0px rgba(0,0,0,.2);
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,.2);
    }
    .search-input__result-box .result-box__items {
        display: flex;
        flex-direction: column;
    }
    .search-input__result-box .result-box__items .items__item {
        display: flex;
        flex-direction: row;
        padding-bottom: 8px;
        margin-bottom: 8px;
        border-bottom: 1px solid var(--bg-color--8);
        flex-shrink: 0;
        cursor: pointer;
    }
    .search-input__result-box .result-box__items .items__item:last-child {
        padding-bottom: 0;
        margin-bottom: 0;
        border-bottom: 0;
    }
    .ag-search .container__close-button {
        position: absolute;
        top: 3px;
        right: 3px;
        width: 15px;
        height: 15px;
        display: flex;
        font-size: 10px;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        line-height: 100%;
        background-color: var(--bg-color--7);
        cursor: pointer;
    }
</style>

<style>
    em {
        color: var(--primary-color);
        background-color: var(--bg-color--7);
        font-style: initial;
        font-weight: 600;
    }
</style>