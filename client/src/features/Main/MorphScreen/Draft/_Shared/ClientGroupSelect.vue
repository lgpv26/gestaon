<template>
    <app-popover>
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div style="width: 240px;">
                <h3>Grupo de clientes</h3>
                <div v-for="item in items" class="item">
                    <div style="margin-top: 10px; position: relative;" v-if="editing === item.value">
                        <input type="text" style="font-size: 12px;" v-model="editForm.name" />
                        <div style="position: absolute; right: 24px; top: 0; cursor: pointer; font-weight: bold;" @click="editing = false">
                            voltar
                        </div>
                        <div style="position: absolute; right: 0; top: 0; cursor: pointer;">
                            <icon-check style="height: 11px;"></icon-check>
                        </div>
                    </div>
                    <div v-else :class="{ active: value === item.value }" style="display: flex; flex-direction: row;">
                        <span style="cursor: pointer;" @click="select(item)">{{ item.text }}</span>
                        <span class="push-both-sides"></span>
                        <a href="javascript:void(0)" style="margin-right: 3px;" @click="edit(item)">
                            <icon-edit></icon-edit>
                        </a>
                    </div>
                </div>
                <div style="margin-top: 20px; position: relative;" v-if="adding">
                    <input type="text" style="font-size: 12px;" v-model="inputValue" placeholder="ADICIONAR NOVO" />
                    <div style="position: absolute; right: 24px; top: 0; cursor: pointer; font-weight: bold;" @click="adding = false">
                        voltar
                    </div>
                    <div style="position: absolute; right: 0px; top: 0; cursor: pointer;" @click="save()">
                        <icon-check style="height: 11px;"></icon-check>
                    </div>
                </div>
                <div style="margin-top: 20px; position: relative;" v-else>
                    <a class="btn btn--primary btn--border-only" style="float: right;" @click="add()">
                        Novo
                    </a>
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
                adding: false,
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
            select(item){
                if(item.value !== this.value){
                    this.$emit('change', item.value)
                }
                this.$emit('input', item.value)
            },
            add(){
                this.editing = false
                this.adding = true
            },
            edit(item){
                this.adding = false
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
    .active span {
        color: var(--font-color--primary)
    }
    svg >>> .colorizable {
        fill: var(--font-color)
    }
</style>
