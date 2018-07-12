<!--

<template>
    <div class="app-select" ref="select">
        <div class="dropdown-target">
            <span v-if="valueExists">{{ value.join(", ") }}</span>
            <slot v-else></slot>
        </div>
        <transition>
            <div class="select-options" v-show="isOpen">
                <ul>
                    <li class="select-option" v-for="option in options" @click.prevent="emit(option)">{{ option.text }}</li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script>

    import _ from 'lodash';

    export default {
        props: ['options','value'],
        mounted(){
            const vm = this;
            window.addEventListener('click', function(e){
                if(e.target.classList.contains("select-option")){
                    vm.isOpen = false;
                }
                else if(typeof vm.$refs.select !== 'undefined' && vm.$refs.select.contains(e.target)){
                    vm.isOpen = true;
                } else{
                    vm.isOpen = false;
                }
            });
        },
        computed: {
            valueExists(){
                return _.find(this.options,(option) => {
                    return _.find(this.value, (selectedValue) => {
                        if(option.value === selectedValue){
                            return true;
                        }
                    })

                });
            }
        },
        data(){
            return {
                isOpen: false
            }
        },
        methods: {
            emit(option){
                let selectedValues = this.value;
                selectedValues = _.map(selectedValues, (selectedValue) => {
                    if(option.value == selectedValue){}
                })
                this.$emit("input", option.value);
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
    padding: 5px 0 4px;
    position: relative;
    width: 100%;
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    text-transform: uppercase;
    line-height: 145%;
    font-size: 14px;
    cursor: pointer;
}

div.app-select div.dropdown-target > span {
    color: #FFF;
}

div.app-select div.select-options {
    position: absolute;
    left: 0;
    top: 34px;
    z-index: 9999;
    background: #2A2B33;
    width: 100%;
    text-align: right;
    align-self: center;
    box-shadow: 0px 1px 3px #151515;
}

div.app-select div.select-options li {
    font-size: 14px;
    text-transform: uppercase;
    color: #D4D4D4;
    text-align: left;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    padding: 5px 8px;
    cursor: pointer;
}

div.app-select div.select-options li:last-child {
    border-bottom: 0px;
}

</style>

-->
