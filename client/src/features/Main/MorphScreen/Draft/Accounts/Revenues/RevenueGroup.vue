<template>
    <div class="income-column">
        <div class="income-column__header">
            <h3 v-if="!isRenaming">{{ revenueGroup.name || "..." }}</h3>
            <div v-else style="display: flex; flex-direction: row;">
                <input class="input--borderless" v-model="form.rename" type="text" placeholder="NOME" />
                <a href="javascript:void(0)" style="margin-left: 3px; display: flex; align-items: center; justify-content: center" @click="saveRevenueGroupName()">
                    <icon-check></icon-check>
                </a>
                <a href="javascript:void(0)" style="margin-left: 5px; display: flex; align-items: center; justify-content: center" @click="cancelRevenueGroupRename()">
                    <icon-remove></icon-remove>
                </a>
            </div>
            <span class="push-both-sides"></span>
            <app-dropdown-menu v-if="!isRenaming" :menuList="revenueGroupMenuList" :params="revenueGroupMenuParams" :closeOnSelect="true">
                <a href="javascript:void(0)" @mouseover="setLastHoveredGroup()" style="display: flex;">
                    <icon-cog @mouseover="setLastHoveredGroup()"></icon-cog>
                </a>
            </app-dropdown-menu>
        </div>
        <div class="income-column__body" ref="incomeColumnBody" @mouseleave="hideHoverOverlayMenu()">
            <div class="hover-overlay-menu" v-show="showHoverOverlayMenu" ref="hoverOverlayMenu">
                <a href="#" @click="moveRevenueItemUp()"><icon-caret-up></icon-caret-up></a>
                <a href="#"><icon-caret-down></icon-caret-down></a>
                <a href="#" @click="removeRevenueItem()"><icon-remove></icon-remove></a>
            </div>
            <ul>
                <li v-for="revenueGroupItem in revenueGroupItems" @mouseover="onRevenueItemHover(revenueGroupItem, $event)">
                    {{ revenueGroupItem.name }}
                </li>
            </ul>
        </div>
        <div class="income-column__footer">
            <input type="text" v-model="form.name" />
            <a href="javascript:void(0)" @click="addRevenueItem()">
                <icon-check></icon-check>
            </a>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '../../../../../../utils'
    import Vue from 'vue'

    export default {
        components: {
        },
        props: ['revenueGroupIndex','revenueGroup','revenueItems'],
        data(){
            return {
                revenueGroupMenuParams: {
                    lastHoveredGroupId: null
                },
                revenueGroupMenuList: [
                    {
                        text: 'Renomear grupo',
                        type: 'system',
                        param: {},
                        action: this.renameRevenueGroup
                    },
                    {
                        text: 'Remover grupo',
                        type: 'system',
                        param: {},
                        action: this.removeRevenueGroup
                    }
                ],
                lastHoveredItemId: null,
                showHoverOverlayMenu: false,
                isRenaming: false,
                revenueGroupItems: [],
                form: {
                    name: null,
                    rename: null
                }
            }
        },
        sockets: {
        },
        watch: {
            revenueItems(after){
                const vm = this
                vm.revenueGroupItems = []
                after.forEach((a) => {
                    if(a.revenueGroupId === vm.revenueGroup.id){
                        vm.revenueGroupItems.push(a)
                    }
                })
                this.form.name = null
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen'])
        },
        methods: {
            hideHoverOverlayMenu(){
                this.showHoverOverlayMenu = false
            },
            setLastHoveredGroup(){
                this.revenueGroupMenuParams.lastHoveredGroupId = this.revenueGroup.id
            },
            saveRevenueGroupName(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    revenueGroupId: this.revenueGroup.id,
                    form: {
                        revenueGroupId: this.revenueGroup.id,
                        name: renameValue
                    }
                }
                this.revenueGroup.name = utils.removeReactivity(this.form.rename)
                this.$emit('update:revenueGroup', this.revenueGroup)
                this.$emit('saveRevenueGroup')
                this.commitSocketChanges('revenues.revenueGroups[' + this.revenueGroupIndex + ']')
                console.log("Emitting draft:accounts:revenues:revenue-group-rename", emitData)
                this.isRenaming = false
                this.form.rename = null
            },
            cancelRevenueGroupRename(){
                this.isRenaming = false
                this.form.rename = null
            },
            renameRevenueGroup(){
                this.form.rename = null
                this.isRenaming = true
            },
            removeRevenueGroup(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    revenueGroupId: this.revenueGroup.id,
                    form: {
                        revenueGroupId: this.revenueGroup.id
                    }
                }
                this.$socket.emit('draft:accounts:revenues:revenue-group-remove', emitData)
                console.log("Emitting draft:accounts:revenues:revenue-group-remove", emitData)
            },
            onRevenueItemHover(revenueGroupItem, ev){
                const vm = this
                vm.showHoverOverlayMenu = true
                vm.$refs.hoverOverlayMenu.style.top = (utils.getElPositionInScreen(ev.target).y - (utils.getElPositionInScreen(vm.$refs.incomeColumnBody).y + 7)) + 'px'
                this.lastHoveredItemId = revenueGroupItem.id
            },

            /* items */

            addRevenueItem(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    revenueGroupId: this.revenueGroup.id,
                    name: this.form.name
                }
                this.$socket.emit('draft:accounts:revenues:revenue-item-add', emitData)
                console.log("Emitting draft:accounts:revenues:revenue-item-add", emitData)
            },
            removeRevenueItem(){
                this.showHoverOverlayMenu = false
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    revenueItemId: this.lastHoveredItemId,
                    form: {
                        revenueItemId: this.lastHoveredItemId
                    }
                }
                this.$socket.emit('draft:accounts:revenues:revenue-item-remove', emitData)
                console.log("Emitting draft:accounts:revenues:revenue-item-remove", emitData)
            },
            moveRevenueItemUp(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    revenueItemId: this.lastHoveredItemId,
                    form: {
                        revenueItemId: this.lastHoveredItemId
                    }
                }
                this.$socket.emit('draft:accounts:revenues:revenue-item-move-up', emitData)
                console.log("Emitting draft:accounts:revenues:revenue-item-move-up", emitData)
            },

            /* common */

            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            }
        },
        mounted(){
        }
    }
</script>

<style>
    .income-column .income-column__header {
        margin: 0 10px;
        border-bottom: 2px solid var(--bg-color--9);
        display: flex;
        flex-direction: row;
        height: 50px;
        align-items: center;
    }
    .income-column .income-column__header h3 {
        font-size: 14px;
        color: var(--font-color--primary)
    }
    .income-column .income-column__body {
        padding: 0 10px;
        margin-top: 7px;
        flex-grow: 1;
        position: relative;
    }
    .income-column .income-column__body .hover-overlay-menu {
        position: absolute;
        top: 0;
        height: 24px;
        margin: 3px 0;
        display: flex;
        flex-direction: row;
        /* The old syntax, deprecated, but still needed, prefixed, for WebKit-based and old browsers */
        background: -prefix-linear-gradient(left, rgba(30, 30, 30, .3), rgba(30, 30, 30, 1) 65%));
        /* The new syntax needed by standard-compliant browsers (Opera 12.1, IE 10, Fx 16 onwards), without prefix */
        background: linear-gradient(to right, rgba(30, 30, 30, .3), rgba(30, 30, 30, 1) 65%);
        align-items: center;
        justify-content: flex-end;
        left: -1px;
        right: -1px;
    }
    .income-column .income-column__body .hover-overlay-menu a {
        margin-right: 10px;
    }
    .income-column .income-column__body ul li {
        margin: 8px 0;
        color: var(--font-color--9);
        font-size: 12px;
    }
    .income-column .income-column__footer {
        display: flex;
        flex-direction: row;
        margin: 0 10px;
        padding: 15px 0;
        align-items: center;
    }
    .income-column .income-column__footer input {
        margin-right: 10px;
    }
</style>