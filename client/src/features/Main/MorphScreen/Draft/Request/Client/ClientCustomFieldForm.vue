<template>
    <div class="form-group">
        <app-custom-field-select v-model="clientCustomFields" :items="items" @change="change($event)">
            <div style="cursor: pointer; display: flex; flex-direction: row; align-items: center;">
                <div class="header__icon" style="margin-right: 8px;">
                    <icon-client-details style="position: relative; top: 2px;"></icon-client-details>
                </div>
                <span class="static">Informações adicionais</span>
                <span class="push-both-sides"></span>
                <icon-dropdown class="header__action-icon"></icon-dropdown>
            </div>
        </app-custom-field-select>
        <div class="form-group__content" v-if="_.isArray(clientCustomFieldRows) && clientCustomFieldRows.length > 0">
            <div class="dashed-line"></div>
            <ul class="content__list--mini">
                <li class="list__item" v-for="(clientCustomFieldRow, index) in clientCustomFieldRows">
                    <span style="white-space: nowrap">{{ _.find(items, { value: clientCustomFieldRow.id }).text }}</span>
                    <div class="item__mini-circle"></div>
                    <input type="text" placeholder="..." v-model="clientCustomFieldRow.value"
                           @input="inputClientCustomFieldRowValue(index, clientCustomFieldRow.value)" class="input--borderless" />
                    <span class="push-both-sides"></span>
                    <a href="javascript:void(0)" @click="remove(index)">
                        <icon-remove style="flex-shrink: 0;"></icon-remove>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import Vue from 'vue'
    import CustomFieldsAPI from '@/api/custom-fields'

    import DraftMixin from '../../DraftMixin'

    import CustomFieldSelect from '../../_Shared/CustomFieldSelect.vue'

    const { mapFields, mapMultiRowFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        props: [],
        components: {
            'app-custom-field-select': CustomFieldSelect
        },
        mixins: [DraftMixin],
        data(){
            return {
                items: [],
                selectedClientCustomFields: [],
                formPath: 'request.client'
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            ...mapMultiRowFields({
                clientCustomFieldRows: 'form.client.clientCustomFields'
            }),
            ...mapFields(['form.client.clientCustomFields']),
        },
        methods: {
            ...mapActions('toast', ['showToast', 'showError']),
            remove(index){

            },
            inputClientCustomFieldRowValue(rowIndex, value){
                this.sync(value,'clientCustomFields[' + rowIndex + '].value')
            },
            change(clientCustomFields){
                this.clientCustomFields = clientCustomFields
                this.sync(this.clientCustomFields, 'clientCustomFields')
            }
        },
        created(){
            const vm = this
            CustomFieldsAPI.getList({ companyId: this.company.id }).then(({data}) => {
                vm.items = _.map(data, (customField) => {
                    return {
                        value: customField.id,
                        text: customField.name
                    }
                })
            })
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

    .form-group__content {
        margin-top: 15px;
    }

    .form-group__content .dashed-line {
        height: 2px;
        background-image: linear-gradient(to right, var(--border-color--2) 50%, rgba(255,255,255,0) 0%);
        background-position: bottom left;
        background-size: 6px 2px;
        background-repeat: repeat-x;
        margin-bottom: 15px;
    }

</style>
