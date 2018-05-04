<template>
    <div class="popover-component" style="flex-grow: 1;">
        <div ref="content" :style="style" class="popover-content popover-shadow" :class="{hidden: !visible && !forceVisible}" @mouseover="onMouseOver($event)" @mouseleave="onMouseLeave($event)">
            <slot name="content">
            </slot>
        </div>
        <div ref="triggerer" class="popover-triggerer" @click="onTriggererClick()" @mouseover="onMouseOver($event)" @mouseleave="onMouseLeave($event)">
            <slot name="triggerer">
            </slot>
        </div>
    </div>
</template>

<script>

    import _ from 'lodash'
    import Popper from 'popper.js'
    import Vue from 'vue'

    export default {
        props: {
            forceVisible: {
                default: false,
                type: Boolean
            },
            trigger: {
                default: 'click',
                type: String
            }
        },
        data(){
            return {
                style: {
                    position: 'absolute',
                    zIndex: 99999999,
                    backgroundColor: 'var(--bg-color--2)',
                    padding: '15px 20px',
                    borderRadius: '5px'
                },
                visible: false,
                leaveTimeout: null,
                popper: null
            }
        },
        methods: {
            onMouseOver(ev){
                if(this.leaveTimeout){
                    clearTimeout(this.leaveTimeout);
                }
                if(!this.visible && (ev.target === this.$refs.triggerer || this.$refs.triggerer.contains(ev.target)) && this.trigger === 'mouseover'){
                    this.openPopover()
                }
            },
            onMouseLeave(ev){
                if((ev.target === this.$refs.triggerer || this.$refs.triggerer.contains(ev.target)) || (ev.target === this.$refs.content || this.$refs.content.contains(ev.target))){
                    this.leaveTimeout = setTimeout(() => {
                        this.closePopover()
                    }, 1000);
                }
            },
            onTriggererClick(){
                this.openPopover()
            },
            onBodyClick(ev){
                // verify if the user is not clicking the triggerer with the popup opened
                if(this.visible && (this.$refs.triggerer.contains(ev.target) || this.$refs.triggerer === ev.target)){}
                // verify if the user is clicking outside the triggerer and content area
                else if(this.visible && this.$refs.content && (this.$refs.content !== ev.target && !this.$refs.content.contains(ev.target))){
                    this.closePopover();
                }
            },
            openPopover(){
                this.visible = true
                this.$emit('open', true)
                Vue.nextTick(() => {
                    this.popper.update()
                })
            },
            closePopover(){
                this.visible = false
            },
            attachContentToBody(){
                document.body.appendChild(this.$refs.content)
            },
            attachPopper(){
                this.destroyPopper()
                this.popper = new Popper(this.$refs.triggerer, this.$refs.content, {
                    offset: 100
                })
            },
            destroyPopper(){
                if(this.popper){
                    this.popper.destroy()
                }
            }
        },
        mounted(){
            this.attachContentToBody()
            this.attachPopper()
            document.addEventListener('mousedown', this.onBodyClick);

        },
        beforeDestroy(){
            this.destroyPopper()
            this.$refs.content.parentNode.removeChild(this.$refs.content)
            document.removeEventListener("mousedown", this.onBodyClick)
        }
    }
</script>

<style scoped>
    .hidden {
        display: none
    }
    .visible {
        display: block!important
    }
</style>
