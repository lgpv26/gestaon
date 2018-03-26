<template>
    <div class="outcome-column">
        <div class="outcome-column__header">
            <h3 v-if="!isRenaming">{{ expenseGroup.name || "..." }}</h3>
            <div v-else style="display: flex; flex-direction: row;">
                <input class="input--borderless" v-model="form.rename" type="text" placeholder="NOME" />
                <a href="javascript:void(0)" style="margin-left: 3px; display: flex; align-items: center; justify-content: center" @click="saveExpenseGroupName()">
                    <icon-check></icon-check>
                </a>
                <a href="javascript:void(0)" style="margin-left: 5px; display: flex; align-items: center; justify-content: center" @click="cancelExpenseGroupRename()">
                    <icon-remove></icon-remove>
                </a>
            </div>
            <span class="push-both-sides"></span>
            <app-dropdown-menu v-if="!isRenaming" :menuList="expenseGroupMenuList" :params="expenseGroupMenuParams" :closeOnSelect="true">
                <a href="javascript:void(0)" @mouseover="setLastHoveredGroup()" style="display: flex;">
                    <icon-cog @mouseover="setLastHoveredGroup()"></icon-cog>
                </a>
            </app-dropdown-menu>
        </div>
        <div class="outcome-column__body" ref="outcomeColumnBody" @mouseleave="hideHoverOverlayMenu()">
            <div class="hover-overlay-menu" v-show="showHoverOverlayMenu" ref="hoverOverlayMenu">
                <a href="#" @click="moveExpenseItemUp()"><icon-caret-up></icon-caret-up></a>
                <a href="#"><icon-caret-down></icon-caret-down></a>
                <a href="#" @click="removeExpenseItem()"><icon-remove></icon-remove></a>
            </div>
            <ul>
                <li v-for="expenseGroupItem in expenseGroupItems" @mouseover="onExpenseItemHover(expenseGroupItem, $event)">
                    {{ expenseGroupItem.name }}
                </li>
            </ul>
        </div>
        <div class="outcome-column__footer">
            <input type="text" v-model="form.name" />
            <a href="javascript:void(0)" @click="addExpenseItem()">
                <icon-check></icon-check>
            </a>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils'
    import Vue from 'vue'

    export default {
        components: {
        },
        props: ['expenseGroupIndex','expenseGroup','expenseItems'],
        data(){
            return {
                expenseGroupMenuParams: {
                    lastHoveredGroupId: null
                },
                expenseGroupMenuList: [
                    {
                        text: 'Renomear grupo',
                        type: 'system',
                        param: {},
                        action: this.renameExpenseGroup
                    },
                    {
                        text: 'Remover grupo',
                        type: 'system',
                        param: {},
                        action: this.removeExpenseGroup
                    }
                ],
                lastHoveredItemId: null,
                showHoverOverlayMenu: false,
                isRenaming: false,
                expenseGroupItems: [],
                form: {
                    name: null,
                    rename: null
                }
            }
        },
        sockets: {
        },
        watch: {
            expenseItems(after){
                const vm = this
                vm.expenseGroupItems = []
                after.forEach((a) => {
                    if(a.expenseGroupId === vm.expenseGroup.id){
                        vm.expenseGroupItems.push(a)
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
                this.expenseGroupMenuParams.lastHoveredGroupId = this.expenseGroup.id
            },
            saveExpenseGroupName(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    expenseGroupId: this.expenseGroup.id,
                    form: {
                        expenseGroupId: this.expenseGroup.id,
                        name: renameValue
                    }
                }
                this.expenseGroup.name = utils.removeReactivity(this.form.rename)
                this.$emit('update:expenseGroup', this.expenseGroup)
                this.$emit('saveExpenseGroup')
                this.commitSocketChanges('expenses.expenseGroups[' + this.expenseGroupIndex + ']')
                console.log("Emitting draft:accounts:expenses:expense-group-rename", emitData)
                this.isRenaming = false
                this.form.rename = null
            },
            cancelExpenseGroupRename(){
                this.isRenaming = false
                this.form.rename = null
            },
            renameExpenseGroup(){
                this.form.rename = null
                this.isRenaming = true
            },
            removeExpenseGroup(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    expenseGroupId: this.expenseGroup.id,
                    form: {
                        expenseGroupId: this.expenseGroup.id
                    }
                }
                this.$socket.emit('draft:accounts:expenses:expense-group-remove', emitData)
                console.log("Emitting draft:accounts:expenses:expense-group-remove", emitData)
            },
            onExpenseItemHover(expenseGroupItem, ev){
                const vm = this
                vm.showHoverOverlayMenu = true
                vm.$refs.hoverOverlayMenu.style.top = (utils.getElPositionInScreen(ev.target).y - (utils.getElPositionInScreen(vm.$refs.outcomeColumnBody).y + 7)) + 'px'
                this.lastHoveredItemId = expenseGroupItem.id
            },

            /* items */

            addExpenseItem(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    expenseGroupId: this.expenseGroup.id,
                    name: this.form.name
                }
                this.$socket.emit('draft:accounts:expenses:expense-item-add', emitData)
                console.log("Emitting draft:accounts:expenses:expense-item-add", emitData)
            },
            removeExpenseItem(){
                this.showHoverOverlayMenu = false
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    expenseItemId: this.lastHoveredItemId,
                    form: {
                        expenseItemId: this.lastHoveredItemId
                    }
                }
                this.$socket.emit('draft:accounts:expenses:expense-item-remove', emitData)
                console.log("Emitting draft:accounts:expenses:expense-item-remove", emitData)
            },
            moveExpenseItemUp(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    expenseItemId: this.lastHoveredItemId,
                    form: {
                        expenseItemId: this.lastHoveredItemId
                    }
                }
                this.$socket.emit('draft:accounts:expenses:expense-item-move-up', emitData)
                console.log("Emitting draft:accounts:expenses:expense-item-move-up", emitData)
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
    .outcome-column .outcome-column__header {
        margin: 0 10px;
        border-bottom: 2px solid var(--bg-color--9);
        display: flex;
        flex-direction: row;
        height: 50px;
        align-items: center;
    }
    .outcome-column .outcome-column__header h3 {
        font-size: 14px;
        color: var(--font-color--primary)
    }
    .outcome-column .outcome-column__body {
        padding: 0 10px;
        margin-top: 7px;
        flex-grow: 1;
        position: relative;
    }
    .outcome-column .outcome-column__body .hover-overlay-menu {
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

    .outcome-column .outcome-column__body .hover-overlay-menu a {
        margin-right: 10px;
    }

    .outcome-column .outcome-column__body ul li {
        margin: 8px 0;
        color: var(--font-color--9);
        font-size: 12px;
    }

    .outcome-column .outcome-column__footer {
        display: flex;
        flex-direction: row;
        margin: 0 10px;
        padding: 15px 0;
        align-items: center;
    }
    .outcome-column .outcome-column__footer input {
        margin-right: 10px;
    }

</style>