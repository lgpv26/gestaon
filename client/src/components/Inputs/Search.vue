<template>
    <div class="ag-search" ref="search" @mouseleave="onMouseLeave($event)" @mouseover="onMouseOver($event)">
        <div class="search-input__target" @mousedown="onClickTarget($event)" ref="target">
            <slot></slot>
        </div>
        <transition name="fade">
            <div class="search-input__result-box" ref="container" v-show="isShowing">
                <a class="container__close-button" ref="closeButton">X</a>
                <slot name="no-results" v-if="!items || items.length <= 0"></slot>
                <div class="result-box__items" v-show="items && items.length > 0">
                    <div v-for="item in items" class="items__item" ref="searchable">
                        <slot name="item" :item="item"></slot>
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
    export default {
        data(){
            return {
                popperInstance: null,
                isShowing: false,
                closeTimeout: null,
                markJs: null
            }
        },
        props: ['items', 'shouldStayOpen', 'query'],
        watch: {
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
                })
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
                        placement: 'bottom-start'
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
        },
        beforeDestroy(){
            document.removeEventListener("mousedown", this.onClick);
        }
    }
</script>

<style scoped>

    .ag-search .fade-enter-active, .ag-search  .fade-leave-active {
        transition: opacity .1s
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
        transition: .5s opacity;
        width: 420px;
        position: absolute;
        z-index: 99999;
        background-color: var(--bg-color);
        padding: 20px;
        border-radius: 10px;
        cursor: initial;
        margin: 15px 0;
        -webkit-box-shadow: 0 2px 4px 0px rgba(0,0,0,.2);
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,.2);
        max-height: 350px;
        overflow-y: auto;
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
    }
    .search-input__result-box .result-box__items .items__item:last-child {
        padding-bottom: 0;
        margin-bottom: 0;
        border-bottom: 0;
    }
    .ag-search .container__close-button {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 15px;
        height: 15px;
        display: flex;
        font-size: 10px;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        line-height: 100%;
        background-color: var(--bg-color--7)
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