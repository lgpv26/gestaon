<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <app-expense-group v-for="(expenseGroup, index) in expenses.expenseGroups" :key="expenseGroup.id"
                :expenseGroupIndex="index" :expenseGroup="expenseGroup" :expenseItems="expenses.expenseItems">
            </app-expense-group>
            <div class="outcome-column add">
                <div class="add__button" @click="addExpenseGroup()">
                    <icon-big-add></icon-big-add>
                    <span>GRUPO DE SAÍDAS</span>
                    <span style="color: var(--font-color--terciary)">SAÍDAS</span>
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!isCurrentStepActive">Categorize <span style="color: var(--font-color--terciary)">despesas</span> no plano de contas</span>
            <span class="push-both-sides"></span>
            <h3 :class="{active: isCurrentStepActive}">Despesas</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @changed="onCurrentStepChanged($event)"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapGetters } from 'vuex'
    import utils from '../../../../../../utils'
    import ExpenseGroup from './ExpenseGroup.vue'

    export default {
        components: {
            'app-expense-group': ExpenseGroup
        },
        props: ['expenses','activeStep'],
        data(){
            return {
                showHoverOverlayMenu: false,
                expenseGroups: {},
                form: {},
                expenseGroupMenuParams: {
                    lastHoveredGroupId: null
                }
            }
        },
        sockets: {
            draftAccountsExpensesExpenseGroupAdd(data){
                console.log("Received draftAccountsExpensesExpenseGroupAdd", data)
                const expenses = utils.removeReactivity(this.expenses)
                expenses.expenseGroups.push(data)
                this.$emit('update:expenses', expenses)
            },
            draftAccountsExpensesExpenseGroupRemove(response){
                /* socket response example
                const successResponseEx = {
                    success: true,
                    data: {
                        expenseGroupId: 0,
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
                console.log("Received draftAccountsExpensesExpenseGroupRemove", response)
                if(response.success){
                    const expenseGroupIndex = this.expenses.expenseGroups.findIndex((t) => t.id === response.data.expenseGroupId)
                    if(expenseGroupIndex !== -1) this.expenses.expenseGroups.splice(expenseGroupIndex, 1)
                    return
                }
                console.log("Erro", response.message)
            },
            draftAccountsExpensesExpenseItemAdd(response){
                console.log("Received draftAccountsExpensesExpenseItemAdd", response)
                const expenses = utils.removeReactivity(this.expenses)
                expenses.expenseItems.push(response.data)
                this.$emit('update:expenses', expenses)
            },
            draftAccountsExpensesExpenseItemRemove(response){
                console.log("Received draftAccountsExpensesExpenseItemRemove", response)
                if(response.success){
                    const expenseItemIndex = this.expenses.expenseItems.findIndex((t) => t.id === response.data.id)
                    if(expenseItemIndex !== -1) this.expenses.expenseItems.splice(expenseItemIndex, 1)
                    return
                }
                console.log("Erro", response.message)
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            isCurrentStepActive(){
                return this.activeStep === 'expenses';
            }
        },
        methods: {
            addExpenseGroup(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                this.$socket.emit('draft:accounts:expenses:expense-group-add', emitData)
                console.log("Emitting draft:accounts:expenses:expense-group-add", emitData)
            },
            onCurrentStepChanged(value){
                (this.activeStep === 'expenses') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'expenses')
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
    .outcome-column {
        display: flex;
        flex-direction: column;
        max-width: 220px;
        flex-grow: 1;
        background: var(--bg-color--8);
        border: 1px solid var(--bg-color--9);
        border-radius: 5px;
        margin-right: 10px;
    }
    .outcome-column:last-child {
        margin-right: 0;
    }
    .outcome-column.add {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--bg-color--9);
    }
    .outcome-column.add .add__button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .outcome-column.add .add__button svg {
        margin-bottom: 15px;
    }
    .outcome-column.add .add__button .stroke {
        stroke: var(--font-color--terciary);
    }
    .outcome-column.add .add__button .fill {
        fill: var(--font-color--terciary)
    }
    .outcome-column.add .add__button span {
        font-size: 12px;
        font-weight: 600;
    }
</style>