<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <app-revenue-group v-for="(revenueGroup, index) in revenues.revenueGroups" :key="revenueGroup.id"
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
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash';
    import utils from '../../../../../../utils'
    import RevenueGroup from './RevenueGroup.vue'

    export default {
        components: {
            'app-revenue-group': RevenueGroup
        },
        props: ['revenues','activeStep'],
        data(){
            return {
                showHoverOverlayMenu: false,
                revenueGroups: {},
                form: {},
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
            draftAccountsRevenuesRevenueItemAdd(response){
                console.log("Received draftAccountsRevenuesRevenueItemAdd", response)
                const revenues = utils.removeReactivity(this.revenues)
                revenues.revenueItems.push(response.data)
                this.$emit('update:revenues', revenues)
            },
            draftAccountsRevenuesRevenueItemRemove(response){
                console.log("Received draftAccountsRevenuesRevenueItemRemove", response)
                if(response.success){
                    const revenueItemIndex = this.revenues.revenueItems.findIndex((t) => t.id === response.data.id)
                    if(revenueItemIndex !== -1) this.revenues.revenueItems.splice(revenueItemIndex, 1)
                    return
                }
                console.log("Erro", response.message)
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

</style>