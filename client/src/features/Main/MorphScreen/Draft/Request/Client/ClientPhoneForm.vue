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
                                <app-mask :mask="['(##) ####-####','(##) #####-####']" ref="clientPhoneInput" v-model="clientPhone.add.number"
                                    @input.native="inputAddNumber($event)" placeholder="(##) #####-####"></app-mask>
                            </div>
                            <div class="form-column">
                                <label>Apelido</label>
                                <input type="text" v-model="clientPhone.add.name" @input="inputAddName()" placeholder="Digite..." />
                            </div>
                        </div>
                        <a class="btn btn--primary" @click="addClientPhone()" style="float: right;">Adicionar</a>
                    </template>
                </app-popover>
            </div>
            <div class="form-group__content">
                <ul class="content__list--mini" v-if="data.clientPhones && data.clientPhones.length">
                    <li class="list__item" v-for="(dataClientPhone, index) in data.clientPhones" :class="{ active: false }">
                        <div class="item__check" @click="selectClientPhone(dataClientPhone)" style="margin-right: 10px; cursor: pointer;">
                            <icon-check></icon-check>
                        </div>
                        <span style="cursor: pointer;" @click="selectClientPhone(dataClientPhone)">{{ maskedClientPhones[index] }}</span>
                        <div class="item__mini-circle"></div>
                        <span>{{ dataClientPhone.name }}</span>
                        <span class="push-both-sides"></span>
                        <app-popover>
                            <template slot="triggerer">
                                <div class="item__icon" style="cursor: pointer; margin-right: 10px;">
                                    <icon-edit></icon-edit>
                                </div>
                            </template>
                            <template slot="content">
                                <div class="form-row" style="margin-bottom: 15px;">
                                    <div class="form-column">
                                        <label>Número</label>
                                        <app-mask :mask="['(##) ####-####','(##) #####-####']" ref="clientPhoneInput" v-model="clientPhone.edit[index].number"
                                                  @input.native="inputEditNumber($event, dataClientPhone.id)" placeholder="(##) #####-####"></app-mask>
                                    </div>
                                    <div class="form-column">
                                        <label>Apelido</label>
                                        <input type="text" v-model="clientPhone.edit[index].name" @input="inputEditName(dataClientPhone.id)" placeholder="Digite..." />
                                    </div>
                                </div>
                                <a class="btn btn--primary" @click="saveClientPhone(dataClientPhone)" style="float: right;">Salvar</a>
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
    import models from '@/models'
    import Vue from 'vue'

    export default {
        props: ['clientPhone','data'],
        data(){
            return {
                maskedClientPhones: []
            }
        },
        watch: {
            'data.clientPhones': function(clientPhones){
                if(clientPhones.length)
                this.maskClientPhones(clientPhones)
            },
            'clientPhone.number': function(number){
                this.$refs.clientPhoneInput.display = number;
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company'])
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            maskClientPhones(clientPhones){
                const vm = this
                clientPhones = utils.removeReactivity(clientPhones)
                console.log("maskClientPhones", clientPhones)
                this.maskedClientPhones = []
                clientPhones.forEach((clientPhone) => {
                    vm.maskedClientPhones.push(utils.formatPhone(clientPhone.number))
                })
                console.log(vm.clientPhone, vm.data.clientPhones)
            },

            /**
             * Inputs
             */

            inputAddName(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    name: this.clientPhone.add.name
                }
                console.log("Emitting to draft/request.client.clientPhone.add.name", emitData)
                this.$socket.emit('draft/request.client.clientPhone.add.name', emitData)
            },
            inputAddNumber(ev){
                if(!ev.isTrusted){
                    return
                }
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    number: this.clientPhone.add.number
                }
                console.log("Emitting to draft/request.client.clientPhone.add.number", emitData)
                this.$socket.emit('draft/request.client.clientPhone.add.number', emitData)
            },

            inputEditName(clientPhoneId){
                const clientPhone = _.find(this.clientPhone.edit, {id: clientPhoneId})
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientPhoneId: clientPhoneId,
                    name: clientPhone.name
                }
                console.log("Emitting to draft/request.client.clientPhone.edit.name", emitData)
                this.$socket.emit('draft/request.client.clientPhone.edit.name', emitData)
            },
            inputEditNumber(ev, clientPhoneId){
                if(!ev.isTrusted){
                    return
                }
                const clientPhone = _.find(this.clientPhone.edit, {id: clientPhoneId})
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientPhoneId: clientPhoneId,
                    number: clientPhone.number
                }
                console.log("Emitting to draft/request.client.clientPhone.edit.number", emitData)
                this.$socket.emit('draft/request.client.clientPhone.edit.number', emitData)
            },

            /**
             * Actions
             */

            selectClientPhone(clientPhone){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientPhoneId: clientPhone.id
                }
                console.log("Emitting to draft/request.client.clientPhone.select", emitData)
                this.$socket.emit('draft/request.client.clientPhone.select', emitData)
            },

            addClientPhone(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting to draft/request.client.clientPhone.add", emitData)
                this.$socket.emit('draft/request.client.clientPhone.add', emitData)
            },

            saveClientPhone(clientPhone){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientPhoneId: clientPhone.id
                }
                console.log("Emitting to draft/request.client.clientPhone.save", emitData)
                this.$socket.emit('draft/request.client.clientPhone.save', emitData)
            },

            removeClientPhone(clientPhone){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientPhoneId: clientPhone.id
                };
                console.log("Emitting to draft/request.client.clientPhone.remove", emitData);
                this.$socket.emit('draft/request.client.clientPhone.remove', emitData);
            }
        },
        created(){
            const vm = this
            /**
             * On name input in the add form
             * @param {Object} ev = { success:Boolean, evData = { name:String } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.add.name'] = (ev) => {
                console.log("Received draft/request.client.clientPhone.add.name", ev)
                if(ev.success){
                    vm.clientPhone.add.name = ev.evData.name
                }
            }

            /**
             * On number input in the add form
             * @param {Object} ev = { success:Boolean, evData = { number:String } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.add.number'] = (ev) => {
                console.log("Received draft/request.client.clientPhone.add.number", ev)
                if(ev.success){
                    vm.clientPhone.add.number = ev.evData.number
                }
            }
            /**
             * On name input in the edit form
             * @param {Object} ev = { success:Boolean, evData = { clientPhoneId:String, name:String } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.edit.name'] = (ev) => {
                console.log("Received draft/request.client.clientPhone.edit.name", ev)
                if(ev.success){
                    const clientPhone = _.find(vm.clientPhone.edit, {id: ev.evData.clientPhoneId})
                    // const dataClientPhone = _.find(vm.data.clientPhones, {id: ev.evData.clientPhoneId})
                    clientPhone.name = ev.evData.name
                    // dataClientPhone.name = ev.evData.name
                }
            }
            /**
             * On number input in the edit form
             * @param {Object} ev = { success:Boolean, evData = { clientPhoneId:String, number:String } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.edit.number'] = (ev) => {
                console.log("Received draft/request.client.clientPhone.edit.number", ev)
                if(ev.success){
                    const clientPhone = _.find(vm.clientPhone.edit, {id: ev.evData.clientPhoneId})
                    // const dataClientPhone = _.find(vm.data.clientPhones, {id: ev.evData.clientPhoneId})
                    clientPhone.number = ev.evData.number
                    // dataClientPhone.number = ev.evData.number
                }
            }
            /**
             * When a client phone has been selected
             * @param {Object} ev = { success:Boolean, evData = { clientPhoneId:String } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.select'] = (ev) => {
                console.log("Received draft/request.client.clientPhone.select", ev)
                if(ev.success){
                    vm.clientPhone.selected = ev.evData.clientPhoneId
                }
            }
            /**
             * When a new client phone has beed added
             * @param {Object} ev = { success:Boolean, evData = { $data:Object = { clientPhones } } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.add'] = (ev) => {
                console.log("Received draft/request.client.clientPhone.add", ev)
                if(ev.success){
                    vm.clientPhone.add.name = null
                    vm.clientPhone.add.number = null
                    vm.clientPhone.edit = ev.evData.clientPhone.edit
                    vm.data.clientPhones = ev.evData.$data.clientPhones
                }
            }
            /**
             * The edit form should now be visible
             * @param {Object} ev = { success:Boolean, evData = { id:Number , name:String, number:String } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.edit'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientPhone.edit", ev)
                    vm.clientPhone.edit.id = ev.evData.id
                    vm.clientPhone.edit.name = ev.evData.name
                    vm.clientPhone.edit.number = ev.evData.number
                }
            }
            /**
             * When a client phone was saved (after ...clientPhone.edit), this event won't happen in additions/creations
             * @param {Object} ev = { success:Boolean, evData = { $data:Object = { clientPhones } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.save'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientPhone.save", ev)
                    vm.clientPhone.edit.id = null
                    vm.clientPhone.edit.name = null
                    vm.clientPhone.edit.number = null
                    vm.clientPhone.edit = ev.evData.clientPhone.edit
                    vm.data.clientPhones = ev.evData.$data.clientPhones
                }
            }
            /**
             * When a client phone was removed
             * @param {Object} ev = { success:Boolean, evData = { clientPhoneId:String } }
             */
            vm.$options.sockets['draft/request.client.clientPhone.remove'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientPhone.remove", ev)
                    vm.data.clientPhones = _.remove(vm.data.clientPhones, (clientPhone) => {
                        if(clientPhone.id === ev.evData.clientPhoneId){
                            return true // remove the elements that accomplishes the condition
                        }
                    })
                }
            }
        },
        mounted(){
            if(_.has(this.data,'clientPhones') && this.data.clientPhones.length)
            this.maskClientPhones(this.data.clientPhones, false)
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
