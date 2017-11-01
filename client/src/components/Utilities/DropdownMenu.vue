<template>
    <div class="parent" ref="dropdownMenu" @mouseleave="mouseLeave($event)" @mouseover="mouseOver($event)">
        <div class="dropdown-target">
            <slot></slot>
        </div>
        <transition>
            <div class="dropdown-menu" v-if="isOpen">
                <ul>
                    <li v-for="menuItem in menuList" @click="menuItem.action(menuItem.param)">{{ menuItem.text }}</li>
                </ul>
            </div>
        </transition>
    </div>
</template>
<script>
    import { mapState } from 'vuex';

    export default {
        data(){
            return {
                mouseLeaveTimeout: null,
                isOpen: false
            }
        },
        props: ['menuList'],
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
    display:flex;
    justify-content: flex-end;
    flex-direction: row;
    position: relative;
}

div.dropdown-menu {
    position: absolute;
    right: 0;
    top: 50px;
    z-index: 9999;
    background: #2A2B33;
    width: 120px;
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
