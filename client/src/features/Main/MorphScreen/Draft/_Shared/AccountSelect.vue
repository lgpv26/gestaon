<template>
    <app-popover v-bind="popoverProps">
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div style="width: 240px;">
                <h3 v-if="showTitle">Conta</h3>
                <div v-for="(account, index) in accounts" :key="index" class="item">
                    <div style="margin-top: 10px; position: relative;" v-if="editing === account.id">
                        <input type="text" style="font-size: 12px;" v-model="editForm.name" />
                        <div style="position: absolute; right: 24px; top: 0; cursor: pointer; font-weight: bold;" @click="editing = false">
                            voltar
                        </div>
                        <div style="position: absolute; right: 0; top: 0; cursor: pointer;">
                            <icon-check style="height: 11px;"></icon-check>
                        </div>
                    </div>
                    <div v-else :class="{ active: value === account.id }" style="display: flex; flex-direction: row;">
                        <span style="cursor: pointer;" @click="select(account)">{{ account.name }}</span>
                        <span class="push-both-sides"></span>
                        <icon-check style="height: 11px;"></icon-check>
                        <a href="javascript:void(0)" v-if="false" style="margin-right: 3px;" @click="edit(account)">
                            <icon-edit></icon-edit>
                        </a>
                    </div>
                </div>
                <div style="margin-top: 20px; position: relative;" v-if="false">
                    <input type="text" style="font-size: 12px;" v-model="inputValue" placeholder="ADICIONAR NOVO" />
                    <div style="position: absolute; right: 24px; top: 0; cursor: pointer; font-weight: bold;" @click="adding = false">
                        voltar
                    </div>
                    <div style="position: absolute; right: 0px; top: 0; cursor: pointer;" @click="save()">
                        <icon-check style="height: 11px;"></icon-check>
                    </div>
                </div>
                <div style="margin-top: 20px; position: relative;" v-if="false">
                    <a class="btn btn--primary btn--border-only" style="float: right;" @click="add()">
                        Novo
                    </a>
                </div>
            </div>
        </template>
    </app-popover>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        props: ['value','showTitle','popoverProps'],
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
            ...mapState('data/accounts', ['accounts']),
        },
        methods: {
            select(account){
                if(account.id !== this.value){
                    this.$emit('change', account.id)
                }
                this.$emit('input', account.id)
            },
            add(){
                this.editing = false
                this.adding = true
            },
            edit(account){
                this.adding = false
                this.editing = account.id
                this.editForm.name = account.name
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
