<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <div class="form__main-column">
                <div class="main-column__form">
                    <div class="columns">
                        <div class="column">
                            Nome / Empresa
                            <input type="text" v-model="task.name" @input="sync('task.name')" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="form__side-column">
                <div class="side-column__header">

                </div>
            </div>
        </div>
    </form>
</template>

<script>
    export default {
        components: {
        },
        props: ['task'],
        data(){
            return {
                form: {
                }
            }
        },
        computed: {
            isCurrentStepActive(){
                return this.form.activeStep === 'task';
            }
        },
        methods: {
            /**
             * Recreating
             */

            onStepChange(){
                const vm = this
                this.$emit('step-change', 'task')
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