<template>
    <div class="form-group">
        <app-select class="form-group__header" title="Grupo de cliente" :verticalOffset="8" :items="clientGroupSelectItems" v-model="clientGroup.selected" :showInput="true" @change="changeSelected()">
            <div class="header__icon">
                <icon-client-group></icon-client-group>
            </div>
            <span class="static" v-if="!selectedClientGroup">Grupo de cliente</span>
            <span v-else style="color: var(--font-color--primary);">{{ selectedClientGroup.text }}</span>
            <span class="push-both-sides"></span>
            <icon-dropdown class="header__action-icon"></icon-dropdown>
            <template slot="item" slot-scope="itemProps">
                <span>{{itemProps.text }}</span>
            </template>
        </app-select>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import models from '@/models'
    import Vue from 'vue'

    export default {
        props: ['clientGroup','data'],
        data(){
            return {
                clientGroupSelectItems: []
            }
        },
        watch: {
            'data.clientGroups': function(clientGroups){
                this.clientGroupSelectItems = _.map(clientGroups, (clientGroup) => {
                    return {
                        value: clientGroup.id,
                        text: clientGroup.name
                    }
                })
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            selectedClientGroup(){
                if(this.clientGroup.selected){
                    return _.find(this.clientGroupSelectItems, { value: this.clientGroup.selected })
                }
                return false
            }
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),
            changeSelected(){
                console.log("Changing selected client group")
            }

        },
        created(){
            const vm = this
        }
    }
</script>

<style scoped>

    .mini-circle {
        flex-shrink: 0;
        height: 4px;
        width: 4px;
        background-color: var(--font-color--secondary);
        border-radius: 2px;
        margin: 0 10px;
    }

    /* search input */

    .search-input__field {
        border-bottom: 0;
    }
    .search-input__item {
        display: flex;
        flex-direction: column;
    }
    .search-input__item span {
        line-height: 150%;
        font-size: 13px;
    }
    .search-input__item span em {
        font-style: initial;
        color: red;
    }
    .search-input__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
        padding-top: 15px;
        margin-top: 15px;
        border-top: 1px solid var(--bg-color--8);
    }
    .search-input__settings .settings__info {
        background-color: var(--bg-color--7);
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        border: 1px solid var(--base-color--d);
    }

</style>
