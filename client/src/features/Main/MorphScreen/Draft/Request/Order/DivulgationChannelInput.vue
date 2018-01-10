<template>
    <div class="product-input">
        <app-select :items="selectDivulgationChannels" title="Divulgação" :verticalOffset="8" showInput="true" v-model="selectedDivulgationChannel">
            <input type="text" class="input--borderless" style="text-align: right; cursor: pointer; padding-right: 24px;" readonly :value="selectedDivulgationChannelName" placeholder="ESCOLHA UM" />
            <icon-dropdown style="position: absolute; top: 7px; right: 0px;"></icon-dropdown>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-select>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '../../../../../../utils/index';

    export default {
        props: ['value'],
        watch: {
            selectedDivulgationChannel(selectedDivulgationChannel){
                this.$emit('input', selectedDivulgationChannel.value);
            }
        },
        data(){
            return {
                selectedDivulgationChannel: null,
                selectDivulgationChannels: [
                    {
                        value: 1,
                        text: 'Campanha Natal 2017'
                    },
                    {
                        value: 2,
                        text: 'Halloween 2017'
                    },
                    {
                        value: 3,
                        text: 'Dia dos pais 2017'
                    },
                    {
                        value: 4,
                        text: 'Páscoa 2017'
                    },
                    {
                        value: 5,
                        text: 'Ano novo 2016/2017'
                    }
                ]
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            selectedDivulgationChannelName(){
                if(this.selectedDivulgationChannel){
                    const selectedDivulgationChannel = _.find(this.selectDivulgationChannels, { value: this.selectedDivulgationChannel });
                    if(selectedDivulgationChannel) return selectedDivulgationChannel.text;
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