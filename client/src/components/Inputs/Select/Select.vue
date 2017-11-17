<template>
    <div class="ag-select-input" ref="select" @mouseleave="onMouseLeave($event)" @mouseover="onMouseOver($event)">
        <div class="select-input__target" @mousedown="onClickTarget($event)" ref="target">
            <slot></slot>
        </div>
        <transition name="fade">
            <div class="select-input__container" v-if="isShowing" ref="container">
                <a class="container__close-button" ref="closeButton">X</a>
                <div class="container__section" v-show="sections && sections.length > 0" v-for="section in sections">
                    <slot name="section" :text="section.text"></slot>
                    <div class="section__item" v-for="item in section.items">
                        <slot name="item" :text="item.text"></slot>
                        <span class="push-both-sides"></span>
                        OK
                    </div>
                </div>
                <div class="container__items" v-show="items && items.length > 0">
                    <h3>Escolha</h3>
                    <div class="items__item" v-for="item in items">
                        <slot name="item" :text="item.text"></slot>
                        <span class="push-both-sides"></span>
                        OK
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import Vue from 'vue';
    import _ from 'lodash';
    import Popper from 'popper.js';
    export default {
        data(){
            return {
                popperInstance: null,
                closeTimeout: null,
                isShowing: false
            }
        },
        props: ['sections', 'items'],
        computed: {
        },
        methods: {
            onMouseOver(ev){
                if(this.closeTimeout){
                    clearTimeout(this.closeTimeout);
                }
            },
            onMouseLeave(ev){
                this.closeTimeout = setTimeout(() => {
                    this.closeSelect();
                }, 1200);
            },
            onClickTarget(ev){
                this.openSelect();
            },
            onClick(ev){
                const vm = this;
                if(vm.isShowing && vm.$refs.container && ((vm.$refs.container !== ev.target && !vm.$refs.container.contains(ev.target)) ||
                    ev.target === vm.$refs.closeButton || vm.$refs.closeButton.contains(ev.target))){
                    vm.closeSelect();
                }
            },
            openSelect(){
                this.isShowing = true;
                /*document.addEventListener("click", this.onClick);*/
                Vue.nextTick(() => {
                    if(this.popperInstance) {
                        this.popperInstance.destroy();
                    }
                    this.popperInstance = new Popper(this.$refs.target, this.$refs.container, {
                        placement: 'bottom-start'
                    });
                });
            },
            closeSelect(){
                this.isShowing = false;
            },
            toggleSelect(){
                if(this.isShowing) return this.closeSelect();
                this.openSelect();
            }
        },
        mounted(){
            document.addEventListener('mousedown', this.onClick);
        },
        beforeDestroy(){
            document.removeEventListener("mousedown", this.onClick);
        }
    }
</script>

<style scoped>

    .ag-select-input .fade-enter-active, .ag-select-input  .fade-leave-active {
        transition: opacity .1s
    }

    .ag-select-input .fade-enter, .ag-select-input  .fade-leave-to {
        opacity: 0
    }

    .ag-select-input .select-input__target {
        position: relative;
        color: var(--base-color);
    }
    .ag-select-input .select-input__container {
        transition: .5s opacity;
        width: 200px;
        position: absolute;
        z-index: 99999;
        background-color: var(--bg-color-5);
        padding: 20px;
        border-radius: 10px;
        cursor: initial;
        margin: 15px 0;
        -webkit-box-shadow: 0 2px 4px 0px rgba(0,0,0,.2);
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,.2);
    }
    .ag-select-input .container__close-button {
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
        background-color: var(--bg-color-7)
    }
    .ag-select-input .container__section {
        margin-bottom: 10px;
    }
    .ag-select-input .container__section:last-child {
        margin-bottom: 0;
    }
    .ag-select-input .section__item, .ag-select-input .container__items .items__item {
        display: flex;
        flex-direction: row;
        cursor: pointer;
        padding: 5px 0;
    }
    .ag-select-input .section__item span {
        color: var(--base-color);
    }
    .ag-select-input .container__items {
        display: flex;
        flex-direction: column;
    }
    .ag-select-input h3 {
        color: var(--secondary-color--d);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 3px;
    }
    .ag-select-input .container__items .items__item span {
        color: var(--base-color);
    }
</style>
