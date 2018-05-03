<template>
    <div class="form-groups">
        <div class="form-group">
            <div class="form-group__header">
                <div class="header__icon">
                    <icon-phone></icon-phone>
                </div>
                <span class="static">Telefones</span>
                <span class="push-both-sides"></span>
                <app-popover>
                    <template slot="triggerer">
                        <icon-add class="header__action-icon"></icon-add>
                    </template>
                    <template slot="content">
                        <div class="form-row" style="margin-bottom: 15px;">
                            <div class="form-column">
                                <label>Número</label>
                                <app-mask :mask="['(##) ####-####','(##) #####-####']" ref="clientPhoneInput" v-model="form.addForm.number"
                                    @input.native="inputAddNumber($event)" placeholder="(##) #####-####"></app-mask>
                            </div>
                            <div class="form-column">
                                <label>Apelido</label>
                                <input type="text" v-model="form.addForm.name" @input="sync(form.addForm.name,'addForm.name')" placeholder="Digite..." />
                            </div>
                        </div>
                        <a class="btn btn--primary" @click="addClientPhone()" style="float: right;">Adicionar</a>
                    </template>
                </app-popover>
            </div>
            <div class="form-group__content">
                <ul class="content__list--mini" v-if="clientPhones && clientPhones.length">
                    <li class="list__item" v-for="(clientPhone, index) in clientPhones" :class="{ active: false }">
                        <div class="item__check" @click="selectClientPhone(clientPhone)" style="margin-right: 10px; cursor: pointer;">
                            <icon-check></icon-check>
                        </div>
                        <span style="cursor: pointer;" @click="selectClientPhone(clientPhone)">{{ clientPhone.number }}</span>
                        <div class="item__mini-circle"></div>
                        <span>{{ clientPhone.name }}</span>
                        <span class="push-both-sides"></span>
                        <app-popover @open="editClientPhone(clientPhone)">
                            <template slot="triggerer">
                                <div class="item__icon" style="cursor: pointer; margin-right: 10px;">
                                    <icon-edit></icon-edit>
                                </div>
                            </template>
                            <template slot="content">
                                <div class="form-row" style="margin-bottom: 15px;">
                                    <div class="form-column">
                                        <label>Número</label>
                                        <app-mask :mask="['(##) ####-####','(##) #####-####']" ref="clientPhoneInput"
                                              v-model="form.editForm.number" @input.native="inputEditNumber($event)" placeholder="(##) #####-####"></app-mask>
                                    </div>
                                    <div class="form-column">
                                        <label>Apelido</label>
                                        <input type="text" v-model="form.editForm.name" @input="sync(form.editForm.name, 'editForm.name')" placeholder="Digite..." />
                                    </div>
                                </div>
                                <a class="btn btn--primary" @click="saveClientPhone(clientPhone)" style="float: right;">Salvar</a>
                                <a class="btn btn--danger" @click="removeClientPhone(clientPhone)" style="float: right; margin-right: 5px;">Remover</a>
                            </template>
                        </app-popover>
                    </li>
                </ul>
                <span v-else>Nenhum telefone...</span>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import Vue from 'vue'
    import DraftMixin from '../../DraftMixin'

    import shortid from 'shortid'

    export default {
        props: ['data'],
        mixins: [DraftMixin],
        data(){
            return {
                form: {
                    addForm: {
                        name: null,
                        number: null
                    },
                    editForm: {
                        name: null,
                        number: null
                    },
                    clientPhones: {}
                },
                clientPhones: [],
                formPath: 'request.client.clientPhone'
            }
        },
        watch:{
            'form.clientPhones': {
                handler(){
                    this.clientPhones = []
                    _.forOwn(this.form.clientPhones, (value, key) => {
                        this.clientPhones.push(_.assign(value, {
                            id: key
                        }))
                    })
                },
                deep: true,
                immediate: true
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company'])
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            inputAddNumber(ev){
                if(ev.isTrusted){
                    this.sync(this.form.addForm.number, 'addForm.number')
                }
            },

            inputEditNumber(ev){
                if(ev.isTrusted){
                    this.sync(this.form.editForm.number, 'editForm.number')
                }
            },

            editClientPhone(clientPhone){
                clientPhone = utils.removeReactivity(clientPhone)
                this.form.editForm.number = clientPhone.number
                this.form.editForm.name = clientPhone.name
            },

            removeClientPhone(clientPhone){
                this.form.clientPhones = _.omit(this.form.clientPhones, [clientPhone.id])
                this.syncKeyRemove('clientPhones.' + clientPhone.id)
            },

            saveClientPhone(clientPhone){
                Vue.set(this.form.clientPhones, clientPhone.id, {
                    name: this.form.editForm.name,
                    number: this.form.editForm.number
                })

                this.sync(this.form.clientPhones, 'clientPhones')
            },

            addClientPhone(){
                Vue.set(this.form.clientPhones, shortid.generate(), {
                    name: this.form.addForm.name,
                    number: this.form.addForm.number
                })

                this.form.addForm.number = null
                this.form.addForm.name = null

                this.syncMultiple([
                    { data: this.form.addForm.number, path: 'addForm.number' },
                    { data: this.form.addForm.name, path: 'addForm.name' },
                    { data: this.form.clientPhones, path: 'clientPhones' }
                ])
            }

        },
        created(){
            const vm = this
        },
        mounted(){
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
