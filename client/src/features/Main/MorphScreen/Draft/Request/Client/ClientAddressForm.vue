<template>
    <div style="display: flex; flex-grow: 1; flex-direction: column">
        <div class="form-group" v-if="!data.clientAddresses.length">
            <div class="form-group__header">
                <div style="display: flex; flex-direction: row;" v-if="clientAddress.form.id">
                    <span style="margin-right: 10px;">Tipo do local</span>
                    <icon-local></icon-local>
                    <app-client-address-types-input style="margin-left: 10px;" v-model="clientAddressForm.clientAddressTypes"></app-client-address-types-input>
                </div>
                <div style="display: flex; flex-direction: row;" v-else>
                    <span style="margin-right: 10px;">Selecione um local</span>
                    <icon-local></icon-local>
                </div>
                <span class="push-both-sides"></span>
                <a class="btn btn--border-only" v-if="data.clientAddresses.length" @click="backToClientAddressesList()">Voltar</a>
                <div v-if="data.clientAddresses.length">
                    <a class="btn btn--primary" @click="saveClientAddress()" style="margin-left: 10px;">Salvar</a>
                </div>
                <div v-else>
                    <a class="btn btn--primary" @click="saveClientAddress()" style="margin-left: 10px;">Adicionar</a>
                </div>
            </div>
            <div class="form-group__content">
                <div class="ms-form">
                    <div class="form-columns">
                        <div class="form-column" style="flex: 1 1 60%;">
                            <label>Endereço</label>
                            <div class="search">
                                <app-address-form :address.sync="clientAddress.form.address" @change="addressChanged($event)"></app-address-form>
                            </div>
                        </div>
                        <div class="form-column" style="flex: 1 1 10%;">
                            <label>Número</label>
                            <input type="text" v-model="clientAddress.form.number" @input="inputNumber()" />
                        </div>
                        <div class="form-column" style="flex: 1 1 25%;">
                            <label>Complemento</label>
                            <input type="text" v-model="clientAddress.form.complement" @input="inputComplement()" />
                        </div>
                    </div>
                    <div class="form-columns">
                        <div class="form-column" style="flex: 1 1 40%;">
                            <label>Bairro</label>
                            <input type="text" v-model="clientAddress.form.address.neighborhood" @input="inputAddressNeighborhood()" />
                        </div>
                        <div class="form-column" style="flex: 1 1 15%;">
                            <label>CEP</label>
                            <!--<input type="text" v-model="form.address.cep" />-->
                            <app-mask ref="cepInput" placeholder="#####-###" :mask="'#####-###'" v-model="clientAddress.form.address.cep"
                            @input.native="inputAddressCEP()"></app-mask>
                        </div>
                        <div class="form-column" style="flex: 1 1 35%;">
                            <label>Cidade</label>
                            <input type="text" v-model="clientAddress.form.address.city" @input="inputAddressCity()" />
                        </div>
                        <div class="form-column" style="flex: 1 1 8%;">
                            <label>Estado</label>
                            <input type="text" v-model="clientAddress.form.address.state" @input="inputAddressState()" />
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
                    <li class="list__item" v-for="clientAddress in data.clientAddresses" :class="{ active: clientAddressId === clientAddress.id }">
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
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '../../../../../../utils/index';
    import AddressesAPI from '../../../../../../api/addresses';
    import ClientAPI from '../../../../../../api/clients';
    import AddressForm from './AddressForm.vue';
    import Vue from 'vue';

    export default {
        components: {
            'app-address-form': AddressForm
        },
        props: ['clientAddress','data'],
        data(){
            return {
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

            inputNumber(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    number: this.clientAddress.form.number
                }
                console.log("Emitting to draft/request.client.clientAddress.form.number", emitData)
                this.$socket.emit('draft/request.client.clientAddress.form.number', emitData)
            },

            inputComplement(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    complement: this.clientAddress.form.complement
                }
                console.log("Emitting to draft/request.client.clientAddress.form.complement", emitData)
                this.$socket.emit('draft/request.client.clientAddress.form.complement', emitData)
            },

            inputAddressNeighborhood(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    neighborhood: this.clientAddress.form.address.neighborhood
                }
                console.log("Emitting to draft/request.client.clientAddress.form.address.neighborhood", emitData)
                this.$socket.emit('draft/request.client.clientAddress.form.address.neighborhood', emitData)
            },

            inputAddressCity(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    city: this.clientAddress.form.address.city
                }
                console.log("Emitting to draft/request.client.clientAddress.form.address.city", emitData)
                this.$socket.emit('draft/request.client.clientAddress.form.address.city', emitData)
            },

            inputAddressState(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    state: this.clientAddress.form.address.state
                }
                console.log("Emitting to draft/request.client.clientAddress.form.address.state", emitData)
                this.$socket.emit('draft/request.client.clientAddress.form.address.state', emitData)
            },

            inputAddressCEP(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    cep: this.clientAddress.form.address.cep
                }
                console.log("Emitting to draft/request.client.clientAddress.form.address.cep", emitData)
                this.$socket.emit('draft/request.client.clientAddress.form.address.cep', emitData)
            }
        },
        created(){
            const vm = this
            /**
             * On show/hide clientAddress form
             * @param {Object} ev = { success:Boolean, evData = { showForm:Boolean } }
             */
            vm.$options.sockets['draft/request.client.clientAddress.showForm'] = (ev) => {
                if(ev.success){
                    console.log("Received draft/request.client.clientAddress.showForm", ev)
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