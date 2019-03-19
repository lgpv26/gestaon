<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <div class="form__main-column">
                <div class="main-column__form">
                    <div class="columns">
                        <div class="column">
                            Nome / Empresa
                        </div>
                    </div>
                </div>
            </div>
            <div class="form__side-column">
                <div class="side-column__header">
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!isCurrentStepActive">Incluir <span style="color: var(--font-color--7)">centros de custos</span> para os seus relatórios</span>
            <span class="push-both-sides"></span>
            <h3 :class="{active: isCurrentStepActive}"><></h3> <app-switch style="float: right;" :value="isCurrentStepActive" @changed="onCurrentStepChanged($event)"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';

    export default {
        components: {
        },
        props: ['task','activeStep'],
        data(){
            return {
                form: {
                }
            }
        },
        computed: {
            isCurrentStepActive(){
                return this.activeStep === 'cost-centers';
            }
        },
        methods: {
            onCurrentStepChanged(value){
                (this.activeStep === 'transaction-accounts') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'cost-centers');
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

<style scoped>
</style>