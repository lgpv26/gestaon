<template>
    <div class="form__header summary">
        <div class="form-columns" style="flex-grow: 1;">
            <div class="form-column" style="flex-grow: 1; flex-basis: 70%; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;">
                <span style="margin-right: 8px;">{{ client.name }}</span>
                <!--
                <div v-if="selectedClientAddress">
                    <span style="margin-right: 8px;">{{ shortenedClientAddress }}</span>
                </div>
                <icon-edit style="width:10px;"></icon-edit>-->
            </div>
            <!--
            <div class="form-column" v-if="selectedClientPhone">
                <a class="btn btn--border-only" style="height: auto; padding: 5px 8px;">
                    <icon-phone class="icon--d-secondary" style="margin-right: 10px;"></icon-phone>
                    <span style="white-space: nowrap;">{{ formatedClientPhone }}</span>
                </a>
            </div>
            <div class="form-column" v-if="client.clientGroup">
                <app-select class="form-group__header" title="Grupo de cliente"  v-model="client.clientGroup"
                            :verticalOffset="8" :items="clientGroups" :showInput="true" @change="commitSocketChanges('client.clientGroup')">
                    <a class="btn btn--border-only" style="height: auto; padding: 5px 8px;">
                        <div class="header__icon">
                            <icon-client-group class="icon--d-secondary" style="margin-right: 10px;"></icon-client-group>
                        </div>
                        <span class="static" style="white-space: nowrap" v-if="!selectedClientGroup.value">Grupo de cliente</span>
                        <span style="white-space: nowrap" v-else>{{ selectedClientGroup.text }}</span>
                        <span class="push-both-sides"></span>
                        <icon-dropdown class="header__action-icon"></icon-dropdown>
                    </a>
                    <template slot="item" slot-scope="itemProps">
                        <span>{{itemProps.text }}</span>
                    </template>
                </app-select>
            </div>
            -->
            <div class="form-column" style="flex-grow: initial; flex-direction: row; align-items: center;">
                <h3 style="top: 0;">Cliente</h3>
                <app-switch style="float: right;" :value="activeStep === 'client'" @change="$emit('step','client')"></app-switch>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import utils from '@/utils/index'
    import _ from 'lodash'
    import DraftMixin from '../../DraftMixin'

    import { Portuguese } from 'flatpickr/dist/l10n/pt'

    const { mapFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
        },
        mixins: [DraftMixin],
        data(){
            return {
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapFields([
                'form.activeStep',
                'form.client'
            ])
        },
        methods: {
            ...mapActions('draft/request', []),
            ...mapActions('toast', ['showToast']),
            ...mapActions('loading', ['stopLoading'])
        }
    }
</script>

<style lang="scss">
</style>
