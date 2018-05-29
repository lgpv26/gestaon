<template>
    <div class="popover-component">
        <div ref="content" :style="[contentDefaultStyle, contentStyle]" class="popover-content popover-shadow" :class="{hidden: !visible && !forceVisible, 'content-padding': config.contentPadding}" @mouseover="onMouseOver($event)" @mouseleave="onMouseLeave($event)">
            <slot name="content">
            </slot>
        </div>
        <div ref="triggerer" :style="[triggererDefaultStyle, triggererStyle]" class="popover-triggerer" @click="onTriggererClick()" @mouseover="onMouseOver($event)" @mouseleave="onMouseLeave($event)">
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
            },
            contentStyle: {
                default: () => {
                    return {}
                },
                type: Object
            },
            triggererStyle: {
                default: () => {
                    return {}
                },
                type: Object
            },
            config: {
                default: () => {
                    return {
                        contentPadding: true
                    }
                },
                type: Object
            }
        },
        data(){
            return {
                triggererDefaultStyle: {

                },
                contentDefaultStyle: {
                    position: 'absolute',
                    zIndex: 99999999,
                    backgroundColor: 'var(--bg-color--2)',
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
                const contents = document.querySelectorAll('div.popover-content')
                _.forEach(contents, (content) => {
                    if(content === this.$refs.content){
                        content.style.zIndex = 99999999
                    }
                    else {
                        content.style.zIndex = 99999998
                    }
                })
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
    .popover-triggerer {
        height: 100%;
        display: flex;
        align-items: center;
    }
    .hidden {
        display: none
    }
    .visible {
        display: block!important
    }

    .content-padding {
        padding: 15px 20px;
    }
</style>
