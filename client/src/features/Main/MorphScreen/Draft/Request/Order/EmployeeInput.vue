<template>
    <div class="product-input">
        <app-select :items="selectEmployees" title="Responśavel" :verticalOffset="8" showInput="false" v-model="selectedEmployee">
            <input type="text" class="input--borderless" style="text-align: right; cursor: pointer; padding-right: 24px;" readonly :value="selectedEmployeeName" placeholder="ESCOLHA UM" />
            <icon-dropdown style="position: absolute; top: 7px; right: 0px;"></icon-dropdown>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-select>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import _ from 'lodash';

    export default {
        props: ['value'],
        watch: {
            selectedEmployee(selectedEmployee){
                this.$emit('input', selectedEmployee.value);
            }
        },
        data(){
            return {
                selectedEmployee: null,
                selectEmployees: [
                    {
                        value: 1,
                        text: 'GISELE TAKAHASHI'
                    },
                    {
                        value: 2,
                        text: 'DANIEL ROCHA'
                    },
                    {
                        value: 3,
                        text: 'TÂNIA ROCHA'
                    },
                    {
                        value: 4,
                        text: 'CINTIA GONÇALVES'
                    },
                    {
                        value: 5,
                        text: 'CLEVERSON'
                    }
                ]
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            selectedEmployeeName(){
                if(this.selectedEmployee){
                    const selectedEmployee = _.find(this.selectEmployees, { value: this.selectedEmployee });
                    if(selectedEmployee) return selectedEmployee.text;
                }
            }
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            /**
             * Form model
             */

        },
        mounted(){
        }
    }
</script>

<style scoped>

</style>