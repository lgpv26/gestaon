<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <div class="outcome-column">
                <div class="outcome-column__header">
                    <h3>Custo com produtos</h3><span class="push-both-sides"></span><icon-cog></icon-cog>
                </div>
                <div class="outcome-column__body">
                    <ul>
                        <li>
                            Compra de GLP
                        </li>
                        <li>
                            Compra de Água Mineral
                        </li>
                        <li>
                            Acessórios para GLP
                        </li>
                        <li>
                            Compra de Conveniência
                        </li>
                    </ul>
                </div>
                <div class="outcome-column__footer">
                    <input type="text" /> <icon-check></icon-check>
                </div>
            </div>
            <div class="outcome-column">
                <div class="outcome-column__header">
                    <h3>Custos com serviços</h3><span class="push-both-sides"></span><icon-cog></icon-cog>
                </div>
                <div class="outcome-column__body">
                    <ul>
                        <li>
                            Instalações com GLP
                        </li>
                        <li>
                            Assistência técnica
                        </li>
                        <li>
                            Manutenção preventiva
                        </li>
                    </ul>
                </div>
                <div class="outcome-column__footer">
                    <input type="text" />
                    <a href="javascript:void(0)" @click="addExpenseItem()">
                        <icon-check></icon-check>
                    </a>
                </div>
            </div>
            <div class="outcome-column add">
                <div class="add__button" @click="addExpenseGroup()">
                    <icon-big-add></icon-big-add>
                    <span>GRUPO DE DESPESAS</span>
                    <span style="color: var(--font-color--terciary)">SAÍDAS</span>
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!isCurrentStepActive">Categorize <span style="color: var(--terciary-color)">despesas</span> no plano de contas</span>
            <span class="push-both-sides"></span>
            <h3 :class="{active: isCurrentStepActive}">Despesas</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @changed="onCurrentStepChanged($event)"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';

    export default {
        components: {
        },
        props: ['task','expenses','activeStep'],
        data(){
            return {
                form: {
                }
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
                this.$socket.emit('draft:accounts:expenses:add-expense-group', emitData)
                console.log("Emitting draft:accounts:expenses:add-expense-group", emitData)
            },
            addExpenseItem(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting draft:accounts:expenses:add-expense-item", emitData)
            },

            onCurrentStepChanged(value){
                (this.activeStep === 'expenses') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'expenses');
                this.commitSocketChanges('activeStep');
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
        color: var(--font-color--terciary)
    }

    .outcome-column .outcome-column__body {
        padding: 0 10px;
        margin-top: 7px;
        flex-grow: 1;
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