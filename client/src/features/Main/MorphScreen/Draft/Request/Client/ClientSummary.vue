<template>
    <div class="form__header summary">
        <div class="form-columns" style="flex-grow: 1; justify-content: flex-end">
            <div class="form-column" style="flex-grow: 1; flex-basis: 70%; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;" v-if="selectedClientAddress">
                <span style="margin-right: 0">{{ client.name }}</span>
                <div class="mini-circle"></div>
                <div>
                    <span style="margin-right: 8px;">{{ selectedClientAddress.address.name + ', ' + selectedClientAddress.number + ((selectedClientAddress.complement) ? ' | ' + selectedClientAddress.complement : '') }}</span>
                </div>
                <!--<icon-edit style="width:10px;"></icon-edit>-->
            </div>
            <div class="form-column" v-if="selectedClientPhoneNumber">
                <a class="btn btn--border-only" style="height: auto; padding: 5px 8px;">
                    <icon-phone class="icon--d-secondary" style="margin-right: 10px;"></icon-phone>
                    <span style="white-space: nowrap;">{{ selectedClientPhoneNumber }}</span>
                </a>
            </div>
            <!--
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
    import { mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import utils from '../../../../../../utils/index'
    import _ from 'lodash'
    import DraftMixin from '../../DraftMixin'

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
                'form.client',
                'form.clientAddressId',
                'form.clientPhoneId',
                'form.client.clientAddresses',
                'form.client.clientPhones',
            ]),
            selectedClientAddress(){
                if(this.clientAddressId){
                    const clientAddress = _.find(this.clientAddresses, { id: this.clientAddressId })
                    if(clientAddress){
                        return clientAddress
                    }
                }
                return null
            },
            selectedClientPhoneNumber(){
                if(this.clientPhoneId){
                    const clientPhone = _.find(this.clientPhones, { id: this.clientPhoneId })
                    if(clientPhone){
                        return utils.formatPhone(clientPhone.number)
                    }
                }
                return null
            }
        },
        methods: {
            ...mapActions('draft/request', []),
            ...mapActions('toast', ['showToast']),
            ...mapActions('loading', ['stopLoading'])
        }
    }
</script>

<style lang="scss">
    .mini-circle {
        flex-shrink: 0;
        height: 4px;
        width: 4px;
        background-color: var(--font-color--secondary);
        border-radius: 2px;
        margin: 0 10px;
    }
</style>
