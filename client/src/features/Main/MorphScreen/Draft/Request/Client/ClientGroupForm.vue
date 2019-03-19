<template>
    <app-client-group-select v-model="clientGroupId" @change="change($event)"
         :popoverProps="{ placement: 'bottom-start', verticalOffset: -5, horizontalOffset: 0, contentStyle: { width: '350px' } }">
        <div style="cursor: pointer; display: flex; flex-direction: row; align-items: center;" class="form-group">
            <div class="header__icon" style="margin-right: 8px;">
                <icon-client-group style="position: relative; top: 2px;"></icon-client-group>
            </div>
            <span class="static" v-if="!selectedClientGroup">Grupo de cliente</span>
            <span v-else style="color: var(--font-color--primary);">{{ selectedClientGroup.name }}</span>
            <span class="push-both-sides"></span>
            <icon-dropdown class="header__action-icon"></icon-dropdown>
        </div>
    </app-client-group-select>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import _ from 'lodash'

    import DraftMixin from '../../DraftMixin'

    import ClientGroupSelect from '../../_Shared/ClientGroupSelect.vue'

    const { mapFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        props: [],
        components: {
            'app-client-group-select': ClientGroupSelect
        },
        mixins: [DraftMixin],
        data(){
            return {
                items: [],
                formPath: 'request.client'
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            ...mapState('data/client-groups', ['clientGroups']),
            ...mapFields([
                'form.client.clientGroupId'
            ]),
            selectedClientGroup(){
                return _.find(this.clientGroups, { id: this.clientGroupId })
            }
        },
        methods: {
            ...mapActions('toast', ['showToast', 'showError']),
            change(clientGroupId){
                this.clientGroupId = clientGroupId
                this.sync(this.clientGroupId, 'clientGroupId')
            }
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
