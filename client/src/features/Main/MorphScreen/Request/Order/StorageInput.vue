<template>
    <div class="product-input">
        <app-select :items="selectStorages" title="Armazenamento" :verticalOffset="8" showInput="true" v-model="selectedStorage">
            <input type="text" class="input--borderless" style="text-align: right; cursor: pointer; padding-right: 24px;" readonly :value="selectedStorageName" placeholder="ESCOLHA UM" />
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
    import utils from '../../../../../utils/index';

    export default {
        props: ['value'],
        watch: {
            selectedStorage(selectedStorage){
                this.$emit('input', selectedStorage.value);
            }
        },
        data(){
            return {
                selectedStorage: null,
                selectStorages: [
                    {
                        value: 1,
                        text: 'AHS-8565'
                    },
                    {
                        value: 2,
                        text: 'IDEAL GÁS'
                    },
                    {
                        value: 3,
                        text: 'AZZU'
                    },
                    {
                        value: 4,
                        text: 'ARS-3424'
                    },
                    {
                        value: 5,
                        text: 'LALALA'
                    }
                ]
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            selectedStorageName(){
                if(this.selectedStorage){
                    const selectedStorage = _.find(this.selectStorages, { value: this.selectedStorage });
                    if(selectedStorage) return selectedStorage.text;
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