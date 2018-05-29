<template>
    <div class="ag-select-input" ref="select" @mouseleave="onMouseLeave($event)" @mouseover="onMouseOver($event)">
        <div class="select-input__target" @mousedown="onClickTarget($event)" style="cursor: pointer;" ref="target">
            <slot></slot>
        </div>
        <transition name="fade">
            <div class="select-input__container" v-if="isShowing" ref="container"
                :style="{'margin-top': (verticalOffset) ? verticalOffset + 'px' : '0px', 'margin-left': (horizontalOffset) ? horizontalOffset + 'px' : '0px'}">
                <a class="container__close-button btn btn--mini-circle" ref="closeButton">X</a>
                <div class="container__section" v-show="sections && sections.length > 0" v-for="section in sections">
                    <slot name="section" :text="section.text"></slot>
                    <div class="section__item" v-for="item in section.items">
                        <slot name="item" :text="item.text"></slot>
                        <span class="push-both-sides"></span>
                        OK
                    </div>
                </div>
                <div class="container__items" v-show="items && items.length > 0">
                    <h3 style="text-align: left;">{{ (title) ? title : 'SELECIONE' }}</h3>
                    <div class="items__item" v-for="item in items" @click="itemSelected(item)">
                        <slot name="item" :text="item.text" :active="(!multiple && item.value === value) || (multiple && value.length && value[value.indexOf(item.value)])"></slot>
                        <span class="push-both-sides"></span>
                        <span v-if="(!multiple && item.value === value) || (multiple && value.length && value[value.indexOf(item.value)])">
                            <icon-check></icon-check>
                        </span>
                    </div>
                </div>
                <div class="container__input" v-if="showInput">
                    <input type="text" v-model="inputValue" placeholder="ADICIONAR NOVO" />
                    <div style="position: absolute; right: 0px; top: 0; cursor: pointer;" @click="saveInput()">
                        <icon-check></icon-check>
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
    import utils from '../../utils/index';
    export default {
        data(){
            return {
                popperInstance: null,
                closeTimeout: null,
                isShowing: false,
                inputValue: null
            }
        },
        props: ['value','sections','items','title','verticalOffset','horizontalOffset','showInput','multiple'],
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
                        placement: 'bottom-start',
                        modifiers: {
                            flip: {
                                enabled: false
                            }
                        }
                    });
                });
            },
            closeSelect(){
                this.isShowing = false;
            },
            toggleSelect(){
                if(this.isShowing) return this.closeSelect();
                this.openSelect();
            },
            itemSelected(item){
                if(!this.multiple){ // single select
                    if(this.value === item.value){
                        this.onValueChanged(null);
                        this.$emit('unselect', item.value);
                    }
                    else {
                        this.onValueChanged(item.value);
                        this.$emit('select', item.value);
                    }
                }
                else { // multiple select
                    if(_.includes(this.value, item.value)){
                        this.value.splice(this.value.indexOf(item.value), 1);
                        this.onValueChanged(this.value);
                        this.$emit('unselect', item.value);
                    }
                    else {
                        this.value.push(item.value);
                        this.onValueChanged(this.value);
                        this.$emit('select', item.value);
                    }
                }
                this.closeSelect();
            },
            saveInput(){
                this.$emit('save', this.inputValue);
            },
            onValueChanged(value){
                this.$emit('input', value);
                this.$emit('change', value);
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
        flex-direction: row;
        display: flex;
        flex-grow: 1;
        color: var(--base-color);
        align-items: center;
    }
    .ag-select-input .select-input__container {
        transition: .5s opacity;
        width: 240px;
        position: absolute;
        z-index: 99999;
        background-color: var(--bg-color--2);
        padding: 20px;
        border-radius: 10px;
        cursor: initial;
        margin: 15px 0;
        -webkit-box-shadow: var(--popover-shadow);
        box-shadow: var(--popover-shadow);
    }
    .ag-select-input .container__close-button {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 15px;
        height: 15px;
        padding: 0;
        display: flex;
        font-size: 10px;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        line-height: 100%;
        background-color: var(--bg-color--7);
        color: var(--font-color);
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
        padding: 8px 0;
        height: 32px;
    }
    .ag-select-input .section__item span {
        color: var(--base-color);
    }
    .ag-select-input .container__items {
        display: flex;
        flex-direction: column;
    }
    .ag-select-input .select-input__container h3 {
        color: var(--secondary-color--d);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
    }
    .ag-select-input .container__items .items__item span {
        color: var(--base-color);
    }
    .ag-select-input .container__items .items__item >>> .colorizable {
        fill: var(--font-color--secondary);
    }
    .ag-select-input .container__input {
        margin-top: 10px;
        position: relative;
    }
    .ag-select-input .container__input input {
        font-size: 12px;
    }
</style>
