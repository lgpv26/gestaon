<template>
    <app-popover>
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div style="width: 200px;">
                <h3>Grupo de clientes</h3>
                <div v-for="item in items" class="item">
                    <div style="margin-top: 10px; position: relative;" v-if="editing === item.value">
                        <input type="text" style="font-size: 12px;" v-model="editForm.name" />
                        <div style="position: absolute; right: 0px; top: 0; cursor: pointer;">
                            <icon-check></icon-check>
                        </div>
                    </div>
                    <div v-else :class="{ active: _.find(value, { id: item.value }) }" style="display: flex; flex-direction: row;">
                        <span style="cursor: pointer;" @click="select(item)" @dblclick="edit(item)">{{ item.text }}</span>
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
        props: ['value','items'],
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
        },
        methods: {
            haas(item){
                return _.find(this.value, { id: item.value })
            },
            select(item){
                const customFields = utils.removeReactivity(this.value)
                if(_.find(customFields, {id: item.value})){
                    const index = _.findIndex(customFields, {id: item.value})
                    customFields.splice(index, 1)
                }
                else {
                    customFields.push({
                        id: item.value,
                        value: ''
                    })
                }
                this.$emit('change', customFields)
                this.$emit('input', customFields)
            },
            edit(item){
                this.editing = item.value
                this.editForm.name = item.text
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
