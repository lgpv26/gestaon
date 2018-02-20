<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <div class="income-column">
                <div class="income-column__header">
                    <h3>Receitas com produtos</h3><span class="push-both-sides"></span><icon-cog></icon-cog>
                </div>
                <div class="income-column__body">
                    <ul>
                        <li>
                            Venda de GLP
                        </li>
                        <li>
                            Venda de Água Mineral
                        </li>
                        <li>
                            Acessórios para GLP
                        </li>
                        <li>
                            Venda de Conveniência
                        </li>
                    </ul>
                </div>
                <div class="income-column__footer">
                    <input type="text" /> <icon-check></icon-check>
                </div>
            </div>
            <div class="income-column">
                <div class="income-column__header">
                    <h3>Receitas com produtos</h3><span class="push-both-sides"></span><icon-cog></icon-cog>
                </div>
                <div class="income-column__body">
                    <ul>
                        <li>
                            Venda de GLP
                        </li>
                        <li>
                            Venda de Água Mineral
                        </li>
                        <li>
                            Acessórios para GLP
                        </li>
                        <li>
                            Venda de Conveniência
                        </li>
                    </ul>
                </div>
                <div class="income-column__footer">
                    <input type="text" />
                    <a href="javascript:void(0)" @click="addRevenueItem()">
                        <icon-check></icon-check>
                    </a>
                </div>
            </div>
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

    export default {
        components: {
        },
        props: ['task','revenues','activeStep'],
        data(){
            return {
                form: {
                }
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
                console.log("Emitting draft:accounts:revenues:add-revenue-group", emitData)
            },
            addRevenueItem(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting draft:accounts:expenses:add-revenue-item", emitData)
            },

            onCurrentStepChanged(value){
                (this.activeStep === 'revenues') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'revenues');
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