<template>
    <div class="form-group">
        <div class="form-group__header">
            <div style="display: flex; flex-direction: row;" v-if="id">
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
            <div v-if="id">
                <a class="btn btn--primary" @click="save()" style="margin-left: 10px;">Salvar</a>
            </div>
            <div v-else>
                <a class="btn btn--primary" @click="add()" style="margin-left: 10px;">Adicionar</a>
            </div>
        </div>
        <div class="form-group__content">
            <div class="ms-form">
                <div class="form-columns">
                    <div class="form-column" style="flex: 1 1 60%;">
                        <label>Endereço</label>
                        <div class="search">
                            <app-address-form></app-address-form>
                        </div>
                    </div>
                    <div class="form-column" style="flex: 1 1 10%;">
                        <label>Número</label>
                        <input type="text" v-model="number" @input="sync(number, 'number')" />
                    </div>
                    <div class="form-column" style="flex: 1 1 25%;">
                        <label>Complemento</label>
                        <input type="text" v-model="complement" @input="sync(complement, 'complement')" />
                    </div>
                </div>
                <div class="form-columns">
                    <div class="form-column" style="flex: 1 1 40%;">
                        <label>Bairro</label>
                        <input type="text" v-model="addressNeighborhood" @input="sync(addressNeighborhood, 'address.neighborhood')" />
                    </div>
                    <div class="form-column" style="flex: 1 1 15%;">
                        <label>CEP</label>
                        <!--<input type="text" v-model="form.address.cep" />-->
                        <app-mask ref="cepInput" placeholder="#####-###" :mask="'#####-###'" v-model="addressCEP"
                        @input.native="inputAddressCEP($event)"></app-mask>
                    </div>
                    <div class="form-column" style="flex: 1 1 35%;">
                        <label>Cidade</label>
                        <input type="text" v-model="addressCity" @input="sync(addressCity, 'address.city')" />
                    </div>
                    <div class="form-column" style="flex: 1 1 8%;">
                        <label>Estado</label>
                        <input type="text" v-model="addressState" @input="sync(addressState, 'address.state')" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'

    import _ from 'lodash';
    import utils from '@/utils';
    import AddressesAPI from '@/api/addresses';
    import ClientAPI from '@/api/clients';
    import AddressForm from './AddressForm.vue';
    import Vue from 'vue';

    import DraftMixin from '../../DraftMixin'

    const { mapFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-address-form': AddressForm
        },
        mixins: [DraftMixin],
        data(){
            return {
                formPath: 'request.client.clientAddressForm'
            }
        },
        sockets: {
        },
        computed: {
            ...mapState('auth', ['company']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapFields({
                clientAddresses: 'form.client.clientAddresses',
                clientAddressForm: 'form.client.clientAddressForm',
                show: 'form.client.clientAddressForm.show',
                id: 'form.client.clientAddressForm.id',
                complement: 'form.client.clientAddressForm.complement',
                number: 'form.client.clientAddressForm.number',
                addressId: 'form.client.clientAddressForm.address.id',
                addressName: 'form.client.clientAddressForm.address.name',
                addressCEP: 'form.client.clientAddressForm.address.cep',
                addressNeighborhood: 'form.client.clientAddressForm.address.neighborhood',
                addressCity: 'form.client.clientAddressForm.address.city',
                addressState: 'form.client.clientAddressForm.address.state'
            })
        },
        methods: {
            ...mapActions('toast', ['showToast', 'showError']),
            ...mapActions('draft/request', ['setClientAddressForm','setClientAddressFormAddress', 'addClientAddress', 'saveClientAddress']),

            backToClientAddressList(){
                this.setClientAddressForm()
                this.syncMultiple(
                    _.map(this.clientAddressForm, (v, k) => {
                        return {
                            value: v,
                            path: k
                        }
                    })
                )
            },

            save(){
                this.saveClientAddress(this.clientAddressForm)
                this.setClientAddressForm()
                Vue.nextTick(() => {
                    const syncItems = _.map(this.clientAddressForm, (v, k) => {
                        return {
                            value: v,
                            path: k
                        }
                    })
                    syncItems.push({
                        value: this.clientAddresses,
                        path: 'clientAddresses',
                        customBaseFormPath: 'request.client'
                    })
                    this.syncMultiple(syncItems)
                })

            },

            add(){
                this.addClientAddress(this.clientAddressForm)
                this.setClientAddressForm()
                Vue.nextTick(() => {
                    const syncItems = _.map(this.clientAddressForm, (v, k) => {
                        return {
                            value: v,
                            path: k
                        }
                    })
                    syncItems.push({
                        value: this.clientAddresses,
                        path: 'clientAddresses',
                        customBaseFormPath: 'request.client'
                    })
                    this.syncMultiple(syncItems)
                })
            },

            inputAddressCEP(ev){
                if(ev.isTrusted){
                    this.sync(this.addressCEP, 'address.cep')
                }
            },

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