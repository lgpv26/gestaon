<template>
    <div class="parent" ref="dropdownMenu" @mouseleave="mouseLeave($event)" @mouseover="mouseOver($event)">
        <div class="dropdown-target" :style="{backgroundColor: defaultProps.hex}">
        </div>
        <transition>
            <div class="dropdown-menu" v-if="isOpen">
                <app-slider-color-picker v-model="defaultProps"></app-slider-color-picker>
            </div>
        </transition>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import { Slider } from 'vue-color';

    export default {
        data(){
            return {
                mouseLeaveTimeout: null,
                isOpen: false,
                defaultProps: {
                    hex: '#61AFEF',
                }
            }
        },
        components: {
            'app-slider-color-picker': Slider
        },
        props: ['color','value'],
        watch: {
            value(color){
                this.defaultProps.hex = color;
            },
            defaultProps(){
                this.$emit("input",this.defaultProps.hex);
                this.$emit("change",this.defaultProps.hex);
            }
        },
        methods: {
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
                if(typeof vm.$refs.dropdownMenu !== 'undefined' && vm.$refs.dropdownMenu.contains(e.target)){
                    vm.isOpen = true;
                } else{
                    vm.isOpen = false;
                }
            });
        }
    }
</script>

<style scoped>

    div.parent {
        position: relative;
        width: 18px;
        flex-grow: initial;
    }

    div.dropdown-target {
        width: 18px;
        height: 18px;
        border-radius: 100%;
    }

    div.dropdown-menu {
        position: absolute;
        left: -15px;
        bottom: 28px;
        z-index: 9999;
        padding: 15px;
        background: #2A2B33;
        text-align: right;
        align-self: center;
        box-shadow: 0px 1px 3px #151515;
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

    div.dropdown-menu li {
        padding: 5px 8px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        color: #FFF;
        cursor: pointer;
    }

    div.dropdown-menu li:hover {
        background-color: #26272E;
    }

    div.dropdown-menu li:last-child {
        border-bottom: 0px;
    }

    div.dropdown-target {
        cursor: pointer;
        display: flex;
    }

</style>
