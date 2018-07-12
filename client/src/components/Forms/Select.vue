<template>
    <div class="app-select" ref="select" @mouseleave="mouseLeave($event)" @mouseover="mouseOver($event)">
        <div class="dropdown-target">
            <span v-if="!multiple && value">{{ selected.text }}</span>
            <span v-else-if="multiple && value && value.length > 0">Vários selecionado</span>
            <span v-else>Selecionar</span>
        </div>
        <transition @enter="afterEnter($event)">
            <div class="select-options" ref="selectOptionsDiv" v-show="isOpen">
                <ul>
                    <li class="select-option" v-for="option in options" :class="{active: value === option.value || ( Array.isArray(value) && value.includes(option.value))}" @click.prevent="emit(option)">{{ option.text }}</li>
                </ul>
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script>

    import _ from 'lodash';
    import inView from 'in-view';

    export default {
        props: {
            options: { default: [] },
            value: { default: null },
            position: { default: null },
            multiple: { type: Boolean }
        },
        computed: {
            selected(){
                if(this.multiple){
                    return _.filter(this.options, (option) => {
                        if(this.value && this.value.length > 0) {
                            this.value.forEach((inputValue) => {
                                if (inputValue === option.value) {
                                    return true;
                                }
                            });
                        }
                    });
                }
                else {
                    return _.find(this.options, {value: this.value});
                }
            }
        },
        data(){
            return {
                data: null,
                mouseLeaveTimeout: null,
                isOpen: false
            }
        },
        methods: {
            toggle(){
                this.isOpen = !this.isOpen;
            },
            emit(option){
                if(this.multiple) {
                    this.data = _.xor(this.data, [option.value]);
                }
                else {
                    this.data = option.value
                }
                this.$emit("input", this.data);
            },
            afterEnter(el){
                inView.threshold(1);
                if(!inView.is(el)){
                    let position = null;
                    if(this.position === 'top'){
                        position = 'bottom';
                    }
                    else if(this.position === 'left'){
                        position = 'right';
                    }
                    else if(this.position === 'right'){
                        position = 'left';
                    }
                    else {
                        position = 'top';
                    }
                    this.calculateDivPosition(position);
                }
            },
            calculateDivPosition(position){
                if(typeof position !== 'undefined'){
                    switch(position){
                        case "top":
                            this.$refs.selectOptionsDiv.style.top = 'initial';
                            this.$refs.selectOptionsDiv.style.bottom = 28 + 'px';
                            break;
                        default:
                            this.$refs.selectOptionsDiv.style.top = 28 + 'px';
                            this.$refs.selectOptionsDiv.style.bottom = 'initial';
                            break;
                    }
                }
            },
            mouseOver(ev){
                clearTimeout(this.mouseLeaveTimeout);
            },
            mouseLeave(ev){
                const vm = this;
                vm.mouseLeaveTimeout = setTimeout(() => {
                    vm.isOpen = false;
                }, 500);
            }
        },
        mounted(){
            const vm = this;
            window.addEventListener('click', function(e){
                if(e.target.classList.contains("select-option")){
                    vm.isOpen = false;
                }
                else if(typeof vm.$refs.select !== 'undefined' && vm.$refs.select.contains(e.target)){
                    vm.isOpen = !vm.isOpen;
                } else{
                    vm.isOpen = false;
                }
            });
            this.calculateDivPosition(vm.position);
            if(this.multiple) {
                this.data = [];
            }
            else {
                this.data = null;
            }
        }
    }
</script>

<style scoped>

div.app-select {
    display: flex;
    flex-direction: row;
    position: relative;
    align-items: center;
    height: auto;
}

.v-enter-active {
  transition: all .1s ease-in;
}
.v-leave-active {
  transition: all .1s ease-in;
}
.v-enter, .v-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

div.app-select div.dropdown-target {
    padding: 5px 0 3px;
    position: relative;
    width: 100%;
    display: flex;
    border-bottom: 1px solid rgba(150,150,150,.1);
    text-transform: uppercase;
    line-height: 130%;
    font-size: 14px;
    cursor: pointer;
}

div.app-select div.dropdown-target > span {
    color: #FFF;
    font-size: 14px;
}

div.app-select div.select-options {
    position: absolute;
    left: -15px;
    z-index: 9999;
    background: #2A2B33;
    text-align: right;
    align-self: center;
    box-shadow: 0px 1px 3px #151515;
    min-width: 150px;
}

div.app-select div.select-options li {
    font-size: 14px;
    text-transform: uppercase;
    color: #D4D4D4;
    text-align: left;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    padding: 8px 15px;
    cursor: pointer;
}

div.app-select div.select-options li.active {
    color: #61AFEF;
}

div.app-select div.select-options li:last-child {
    border-bottom: 0px;
}

</style>
