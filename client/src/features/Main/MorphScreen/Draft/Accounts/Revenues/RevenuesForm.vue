<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <app-revenue-group v-for="(index, revenueGroup) in revenues.revenueGroups" :key="revenueGroup.id"
                :revenueGroupIndex="index" :revenueGroup="revenueGroup" :revenueItems="revenues.revenueItems">
            </app-revenue-group>
            <div class="income-column add">
                <div class="add__button" @click="addRevenueGroup()">
                    <icon-big-add></icon-big-add>
                    <span>GRUPO DE ENTRADAS</span>
                    <span style="color: var(--font-color--primary)">ENTRADAS</span>
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!isCurrentStepActive">Categorize <span style="color: var(--font-color--primary)">receitas</span> no plano de contas</span>
            <span class="push-both-sides"></span>
            <h3 :class="{active: isCurrentStepActive}">Receitas</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @changed="onCurrentStepChanged($event)"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '@/utils'
    import Vue from 'vue'
    import RevenueGroup from './RevenueGroup.vue'

    export default {
        components: {
            'app-revenue-group': RevenueGroup
        },
        props: ['revenues','activeStep'],
        data(){
            return {
                showHoverOverlayMenu: false,
                revenueGroups: {

                },
                form: {
                },
                revenueGroupMenuParams: {
                    lastHoveredGroupId: null
                }
            }
        },
        sockets: {
            draftAccountsRevenuesRevenueGroupAdd(data){
                console.log("Received draftAccountsRevenuesRevenueGroupAdd", data)
                const revenues = utils.removeReactivity(this.revenues)
                revenues.revenueGroups.push(data)
                this.$emit('update:revenues', revenues)
            },
            draftAccountsRevenuesRevenueGroupRemove(response){
                /* socket response example
                const successResponseEx = {
                    success: true,
                    data: {
                        revenueGroupId: 0,
                        id: 0
                        // ...
                    }
                }
                const errorResponseEx = {
                    success: false,
                    message: "xD",
                    errorCode: "ERROR"
                }
                */
                console.log("Received draftAccountsRevenuesRevenueGroupRemove", response)
                if(response.success){
                    const revenueGroupIndex = this.revenues.revenueGroups.findIndex((t) => t.id === response.data.revenueGroupId)
                    if(revenueGroupIndex !== -1) this.revenues.revenueGroups.splice(revenueGroupIndex, 1)
                    return
                }
                console.log("Erro", response.message)
            },
            draftAccountsRevenuesRevenueItemAdd(data){
                console.log("Received draftAccountsRevenuesRevenueItemAdd", data)
                const revenues = utils.removeReactivity(this.revenues)
                revenues.revenueItems.push(data)
                this.$emit('update:revenues', revenues)
            },
            draftAccountsRevenuesRevenueItemRemove(data){
                console.log("Received draftAccountsRevenuesRevenueItemRemove", data)
                if(response.success){
                    const revenueItemIndex = this.revenues.revenueItems.findIndex((t) => t.id === response.data.id)
                    if(revenueItemIndex !== -1) this.revenues.revenueItems.splice(revenueItemIndex, 1)
                    return
                }
                console.log("Erro", response.message)
            }
        },
        watch: {
            lastHoveredGroupIp(after){
                console.log("after", after)
            },
            revenues(){
                const vm = this
                /*
                vm.groups = utils.removeReactivity(vm.revenues.revenueGroups)
                vm.groups.map((revenueGroup) => {
                    revenueGroup.isRenaming = false
                    revenueGroup.items = vm.revenues.revenueItems.filter((revenueItem) => {
                        return revenueGroup.id === revenueItem.revenueGroupId
                    })
                    revenueGroup.form = {
                        rename: null,
                        name: null,
                        revenueGroupId: revenueGroup.id
                    }
                    return revenueGroup
                })
                */
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            isCurrentStepActive(){
                return this.activeStep === 'revenues';
            }
        },
        methods: {
            addRevenueGroup(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                this.$socket.emit('draft:accounts:revenues:revenue-group-add', emitData)
                console.log("Emitting draft:accounts:revenues:revenue-group-add", emitData)
            },

            onCurrentStepChanged(value){
                (this.activeStep === 'revenues') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'revenues')
                this.commitSocketChanges('activeStep')
            },
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            },
            getElPositionInScreen(el){
                let xPos = 0, yPos = 0;
                while (el) {
                    if (el.tagName.toLowerCase() === "body") {
                        let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                        let yScroll = el.scrollTop || document.documentElement.scrollTop;
                        xPos += (el.offsetLeft - xScroll + el.clientLeft);
                        yPos += (el.offsetTop - yScroll + el.clientTop);
                    } else {
                        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
                    }
                    el = el.offsetParent;
                }
                return { x: xPos, y: yPos };
            }
        },
        mounted(){
        }
    }
</script>

<style>

    .income-column {
        display: flex;
        flex-direction: column;
        max-width: 220px;
        flex-grow: 1;
        background: var(--bg-color--8);
        border: 1px solid var(--bg-color--9);
        border-radius: 5px;
        margin-right: 10px;
    }

    .income-column:last-child {
        margin-right: 0;
    }

    .income-column.add {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--bg-color--9);
    }

    .income-column.add .add__button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .income-column.add .add__button svg {
        margin-bottom: 15px;
    }

    .income-column.add .add__button .stroke {
        stroke: var(--font-color--primary);
    }

    .income-column.add .add__button .fill {
        fill: var(--font-color--primary)
    }

    .income-column.add .add__button span {
        font-size: 12px;
        font-weight: 600;
    }

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