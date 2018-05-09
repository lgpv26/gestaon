<template>
    <app-popover>
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div style="width: 200px;">
                <h3>Grupo de clientes</h3>
                <div v-for="customField in customFields" class="item">
                    <div style="margin-top: 10px; position: relative;" v-if="editing === customField.id">
                        <input type="text" style="font-size: 12px;" v-model="editForm.name" />
                        <div style="position: absolute; right: 0px; top: 0; cursor: pointer;">
                            <icon-check></icon-check>
                        </div>
                    </div>
                    <div v-else :class="{ active: _.find(value, { id: customField.id }) }" style="display: flex; flex-direction: row;">
                        <span style="cursor: pointer;" @click="select(customField)" @dblclick="edit(customField)">{{ customField.name }}</span>
                        <span class="push-both-sides"></span>
                        <icon-check></icon-check>
                    </div>
                </div>
                <div style="margin-top: 20px; position: relative;">
                    <input type="text" style="font-size: 12px;" v-model="inputValue" placeholder="ADICIONAR NOVO" />
                    <div style="position: absolute; right: 0px; top: 0; cursor: pointer;" @click="save()">
                        <icon-check></icon-check>
                    </div>
                </div>
            </div>

        </template>
    </app-popover>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import Vue from 'vue'

    export default {
        props: ['value'],
        data(){
            return {
                editing: false,
                inputValue: null,
                editForm: {
                    name: null
                }
            }
        },
        computed: {
            ...mapState('data/custom-fields', ['customFields']),
        },
        methods: {
            select(customField){
                const customFields = utils.removeReactivity(this.value)
                if(_.find(customFields, {id: customField.id})){
                    const index = _.findIndex(customFields, {id: customField.id})
                    customFields.splice(index, 1)
                }
                else {
                    customFields.push({
                        id: customField.id,
                        value: ''
                    })
                }
                this.$emit('change', customFields)
                this.$emit('input', customFields)
            },
            edit(customField){
                this.editing = customField.id
                this.editForm.name = customField.name
            },
            save(){

            }
        }
    }
</script>

<style scoped>
    h3 {
        font-size: 16px;
        text-transform: uppercase;
        color: var(--font-color--d-secondary);
        margin-bottom: 10px;
    }
    .item {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
        margin-bottom: 10px;
    }
    .item:last-child {
        margin-bottom: 0;
    }
    .active >>> .colorizable {
        fill: var(--font-color--primary)
    }
</style>
