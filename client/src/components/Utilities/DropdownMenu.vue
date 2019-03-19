<template>
    <div class="ag-dropdown-menu" ref="dropdownMenu" @mouseleave="onMouseLeave($event)" @mouseover="onMouseOver($event)">
        <div class="dropdown-target" @mousedown="onClickTarget($event)" ref="target">
            <slot></slot>
        </div>
        <transition>
            <div class="dropdown-menu" v-if="isOpen" ref="popover"
                 :style="{'margin-top': (verticalOffset) ? verticalOffset + 'px' : '0px', 'margin-left': (horizontalOffset) ? horizontalOffset + 'px' : '0px'}">
                <ul>
                    <li v-for="(menuItem, index) in menuList" :key="index" @click="onMenuItemClick(menuItem)">{{ menuItem.text }}</li>
                </ul>
            </div>
        </transition>
    </div>
</template>
<script>
    import Vue from 'vue';
    import Popper from 'popper.js';

    export default {
        data(){
            return {
                popperInstance: null,
                isOpen: false,
                closeTimeout: null
            }
        },
        props: ['params', 'closeOnSelect', 'menuList', 'placement', 'verticalOffset', 'horizontalOffset'],
        methods: {
            onMenuItemClick(menuItem){
                menuItem.action(this.params)
                if(this.closeOnSelect){
                    this.closeSelect()
                }
            },
            onMouseOver(){
                if(this.closeTimeout){
                    clearTimeout(this.closeTimeout);
                }
            },
            onMouseLeave(){
                this.closeTimeout = setTimeout(() => {
                    this.closeSelect();
                }, 1200);
            },
            onClickTarget(){
                this.openSelect();
            },
            onClick(ev){
                const vm = this;
                if(vm.isOpen && vm.$refs.popover && (vm.$refs.popover !== ev.target && !vm.$refs.popover.contains(ev.target))){
                    vm.closeSelect();
                }
            },
            openSelect(){
                this.isOpen = true;
                /*document.addEventListener("click", this.onClick);*/
                Vue.nextTick(() => {
                    if(this.popperInstance) {
                        this.popperInstance.destroy();
                    }
                    this.popperInstance = new Popper(this.$refs.target, this.$refs.popover, {
                        placement: (!this.placement) ? 'bottom-start' : this.placement
                    })
                });
            },
            closeSelect(){
                this.isOpen = false;
            },
            toggleSelect(){
                if(this.isOpen) return this.closeSelect();
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

div.ag-dropdown-menu {
    display:flex;
    justify-content: flex-end;
    flex-direction: row;
}

div.dropdown-menu {
    position: absolute;
    z-index: 99999;
    background: var(--bg-color);
    text-align: left;
    align-self: center;
    box-shadow: var(--popover-shadow);
    min-width: 160px;
}

.v-enter-active, .v-leave-active {
    transition: opacity .1s
}
.v-enter, .v-leave-to {
    opacity: 0;
}

div.dropdown-menu li {
    padding: 8px 12px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    color: var(--font-color--8);
    cursor: pointer;
}

div.dropdown-menu li:hover {
    background: var(--bg-color--7);
}

div.dropdown-menu li:last-child {
    border-bottom: 0;
}

div.dropdown-target {
    cursor: pointer;
    display: flex;
}

</style>
