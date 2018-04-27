<template>
    <div style="display: flex; flex-grow: 1; flex-direction: column">
        <div class="form-group" v-if="form.show">
            <div class="form-group__header">
                <div style="display: flex; flex-direction: row;" v-if="form.id">
                    <span style="margin-right: 10px;">Tipo do local</span>
                    <icon-local></icon-local>
                    <!--<app-client-address-types-input style="margin-left: 10px;" v-model="clientAddressForm.clientAddressTypes"></app-client-address-types-input>-->
                </div>
                <div style="display: flex; flex-direction: row;" v-else>
                    <span style="margin-right: 10px;">Selecione um local</span>
                    <icon-local></icon-local>
                </div>
                <span class="push-both-sides"></span>
                <div>
                    <a class="btn btn--primary" style="margin-left: 10px;" @click="backToClientAddressList()">Voltar</a>
                </div>
                <!--<div v-if="data.clientAddresses.length">
                    <a class="btn btn&#45;&#45;primary" @click="saveClientAddress()" style="margin-left: 10px;">Salvar</a>
                </div>
                <div v-else>
                    <a class="btn btn&#45;&#45;primary" @click="saveClientAddress()" style="margin-left: 10px;">Adicionar</a>
                </div>-->
            </div>
            <div class="form-group__content">
                <div class="ms-form">
                    <div class="form-columns">
                        <div class="form-column" style="flex: 1 1 60%;">
                            <label>Endereço</label>
                            <div class="search">
                                <app-address-form :id.sync="form.address.id" :name.sync="form.address.name" @input="inputAddress($event)" @select="selectAddress($event)" @reset="resetAddress()"></app-address-form>
                            </div>
                        </div>
                        <div class="form-column" style="flex: 1 1 10%;">
                            <label>Número</label>
                            <input type="text" v-model="form.number" @input="sync(form.number, 'number')" />
                        </div>
                        <div class="form-column" style="flex: 1 1 25%;">
                            <label>Complemento</label>
                            <input type="text" v-model="form.complement" @input="sync(form.complement, 'complement')" />
                        </div>
                    </div>
                    <div class="form-columns">
                        <div class="form-column" style="flex: 1 1 40%;">
                            <label>Bairro</label>
                            <input type="text" v-model="form.address.neighborhood" @input="sync(form.address.neighborhood, 'address.neighborhood')" />
                        </div>
                        <div class="form-column" style="flex: 1 1 15%;">
                            <label>CEP</label>
                            <!--<input type="text" v-model="form.address.cep" />-->
                            <app-mask ref="cepInput" placeholder="#####-###" :mask="'#####-###'" v-model="form.address.cep"
                            @input.native="inputAddressCEP($event)"></app-mask>
                        </div>
                        <div class="form-column" style="flex: 1 1 35%;">
                            <label>Cidade</label>
                            <input type="text" v-model="form.address.city" @input="sync(form.address.city, 'address.city')" />
                        </div>
                        <div class="form-column" style="flex: 1 1 8%;">
                            <label>Estado</label>
                            <input type="text" v-model="form.address.state" @input="sync(form.address.state, 'address.state')" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Show client address list -->
        <div class="form-group" v-else>
            <div class="form-group__header">
                <span style="margin-right: 10px;">Selecione um local</span><icon-local></icon-local>
                <span class="push-both-sides"></span>
                <a class="btn btn--border-only" @click="addClientAddress()">Novo</a>
            </div>
            <div class="form-group__content">
                <ul class="content__list">
                    <!--<li class="list__item" v-for="clientAddress in data.clientAddresses" :class="{ active: false }">
                                    <span style="cursor: pointer;" @click="onClientAddressSelected(clientAddress)">
                                        {{ clientAddress.address.name }},
                                        {{ clientAddress.number.toString().trim() || "SN" }}
                                    </span>
                        <span class="push-both-sides"></span>
                        <div class="item__check item__icon" @click="onClientAddressSelected(clientAddress)" style="cursor: pointer; margin-right: 10px;">
                            <icon-check style="width: 16px;"></icon-check>
                        </div>
                        <div class="item__icon" @click="editClientAddress(clientAddress)" style="cursor: pointer; margin-right: 10px;">
                            <icon-edit></icon-edit>
                        </div>
                        <div class="item__icon" @click="removeClientAddress(clientAddress)" style="cursor: pointer;">
                            <icon-remove></icon-remove>
                        </div>
                    </li>-->
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '../../../../../../utils/index';
    import models from '../../../../../../models';
    import AddressesAPI from '../../../../../../api/addresses';
    import ClientAPI from '../../../../../../api/clients';
    import AddressForm from './AddressForm.vue';
    import Vue from 'vue';

    import DraftMixin from '../../DraftMixin'

    export default {
        components: {
            'app-address-form': AddressForm
        },
        props: ['data'],
        mixins: [DraftMixin],
        data(){
            return {
                form: {
                    show: true,
                    number: null,
                    complement: null,
                    address: models.createAddressModel()
                },
                formPath: 'request.client.clientAddress'
            }
        },
        watch: {
            'form.address.cep': function(cep){
                this.$refs.cepInput.display = cep;
            }
        },
        sockets: {
        },
        computed: {
            ...mapState('auth', ['company']),
            ...mapGetters('morph-screen', ['activeMorphScreen'])
        },
        methods: {
            ...mapActions('toast', ['showToast', 'showError']),

            resetAddress(){
                this.form.address = models.createAddressModel()
                const addressToSync = _.map(this.form.address, (v, k) => {
                    return {
                        data: v || null,
                        path: 'address.' + k
                    }
                })
                this.syncMultiple(addressToSync)
            },

            inputAddressCEP(ev){
                if(ev.isTrusted){
                    this.sync(this.form.address.cep, 'address.cep')
                }
            },

            inputAddress(addressInputValue){
                this.form.address.name = addressInputValue
                this.sync(this.form.address.name, 'address.name')
            },

            selectAddress(address){
                this.form.address = utils.removeReactivity(address)
                const addressToSync = _.map(address, (v, k) => {
                    return {
                        data: v || null,
                        path: 'address.' + k
                    }
                })  
                this.syncMultiple(addressToSync)
            },

            /**
             * Actions
             */

            addClientAddress(){
                this.form.show = true
                this.sync(this.form.show, 'show')
            },

            backToClientAddressList(){
                this.form.show = false
                this.sync(this.form.show, 'show')
            }

        },
        created(){
            const vm = this
            /**
             * On show/hide clientAddress form
             * @param {Object} ev = { success:Boolean, evData = { showForm:Boolean } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.showForm'] = (ev) => {
                console.log("Received draft/request.client.clientAddress.showForm", ev)
                if(ev.success){
                    vm.clientAddress.showForm = ev.evData.showForm
                }
            }
            /**
             * On show/hide clientAddress form
             * @param {Object} ev = { success:Boolean, evData = { number:Number } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.form.number'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientAddress.form.number", ev)
                    vm.clientAddress.form.number = ev.evData.number
                }
            }
            /**
             * On show/hide clientAddress form
             * @param {Object} ev = { success:Boolean, evData = { complement:String } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.form.complement'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientAddress.form.complement", ev)
                    vm.clientAddress.form.complement = ev.evData.complement
                }
            }
            /**
             * On show/hide clientAddress form
             * @param {Object} ev = { success:Boolean, evData = { neighborhood:String } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.form.address.neighborhood'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientAddress.form.address.neighborhood", ev)
                    vm.clientAddress.form.address.neighborhood = ev.evData.neighborhood
                }
            }
            /**
             * On show/hide clientAddress form
             * @param {Object} ev = { success:Boolean, evData = { cep:String } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.form.address.cep'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientAddress.form.address.cep", ev)
                    vm.clientAddress.form.address.cep = ev.evData.cep
                }
            }
            /**
             * On show/hide clientAddress form
             * @param {Object} ev = { success:Boolean, evData = { city:String } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.form.address.city'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientAddress.form.address.city", ev)
                    vm.clientAddress.form.address.city = ev.evData.city
                }
            }
            /**
             * On show/hide clientAddress form
             * @param {Object} ev = { success:Boolean, evData = { state:String } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.form.address.state'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientAddress.form.address.state", ev)
                    vm.clientAddress.form.address.state = ev.evData.state
                }
            }
        }
    }
</script>

<style scoped>

    /* search input */

    .search {
        display: flex;
        flex-direction: row;
        position: relative;
    }

    .search .search-input__item {
        display: flex;
        flex-direction: column;
    }
    .search .search-input__item span {
        line-height: 150%;
        font-size: 13px;
    }
    .search .search-input__item span em {
        font-style: initial;
        color: red;
    }
    .search .search-input__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
        padding-top: 15px;
        margin-top: 15px;
        border-top: 1px solid var(--bg-color--8);
    }
    .search .search-input__settings .settings__info {
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