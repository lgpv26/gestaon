<template>
    <div class="ms-form">
        <div class="form-columns">
            <div class="form-column" style="flex: 1 1 60%;">
                <label>Endereço</label>
                <div class="search">
                    <app-address-form :clientAddress="clientAddress" :address.sync="clientAddress.address"
                                      @input="syncClientAddressForm('address.name')" @change="addressChanged($event)"></app-address-form>
                </div>
            </div>
            <div class="form-column" style="flex: 1 1 10%;">
                <label>Número</label>
                <input type="text" v-model="clientAddress.number" @input="syncClientAddressForm('number')" />
            </div>
            <div class="form-column" style="flex: 1 1 25%;">
                <label>Complemento</label>
                <input type="text" v-model="clientAddress.complement" @input="syncClientAddressForm('complement')" />
            </div>
        </div>
        <div class="form-columns">
            <div class="form-column" style="flex: 1 1 40%;">
                <label>Bairro</label>
                <input type="text" v-model="clientAddress.address.neighborhood" @input="syncClientAddressForm('address.neighborhood')" />
            </div>
            <div class="form-column" style="flex: 1 1 15%;">
                <label>CEP</label>
                <!--<input type="text" v-model="form.address.cep" />-->
                <app-mask ref="cepInput" placeholder="#####-###" :mask="'#####-###'" v-model="clientAddress.address.cep"
                @input.native="syncTrustedEvent($event,'address.cep')" ></app-mask>
            </div>
            <div class="form-column" style="flex: 1 1 35%;">
                <label>Cidade</label>
                <input type="text" v-model="clientAddress.address.city" @input="syncClientAddressForm('address.city')" />
            </div>
            <div class="form-column" style="flex: 1 1 8%;">
                <label>Estado</label>
                <input type="text" v-model="clientAddress.address.state" @input="syncClientAddressForm('address.state')" />
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '../../../../utils';
    import AddressesAPI from '../../../../api/addresses';
    import ClientAPI from '../../../../api/clients';
    import AddressForm from './AddressForm.vue';
    import Vue from 'vue';

    export default {
        components: {
            'app-address-form': AddressForm
        },
        props: ['value','clientId','clientAddress','isSaving'],
        data(){
            return {
            }
        },
        watch: {
            'clientAddress.address.cep': function(cep){
                this.$refs.cepInput.display = cep;
            }
        },
        sockets: {
            draftClientAddressSaveable(){
                this.$emit('update:isSaving', false);
            },
            draftClientAddressSave(clientAddress){
                /*this.$emit('update:clientAddress', this.createClientAddress());*/
                Vue.nextTick(() => {
                    this.$emit('save', clientAddress);
                });
            },
            draftClientAddressUpdate(clientAddress){
                if(clientAddress.address){
                    utils.assignToExistentKeys(this.clientAddress.address, clientAddress.address);
                    delete clientAddress.address;
                }
                utils.assignToExistentKeys(this.clientAddress, clientAddress);
            }
        },
        computed: {
            ...mapState('auth', ['company']),
            ...mapGetters('morph-screen', ['activeMorphScreen'])
        },
        methods: {
            ...mapActions('toast', ['showToast', 'showError']),
            addressChanged(ev){
                /*
                this.clientAddress.address.cep = ev.cep;
                this.$refs.cepInput.refresh();
                setImmediate(() => {

                    console.log(this.$refs.cepInput);
                })
                */
                /*setTimeout(() => {
                    console.log(ev.cep);
                    this.clientAddress.address.cep = ev.cep;
                }, 2000)*/
            },
            createClientAddress(){
                return {
                    id: null,
                    addressId: null,
                    address: null,
                    name: null,
                    number: null,
                    complement: null,
                    status: 'activated'
                }
            },
            getIsolatedFormPathObj(path){
                return _.set({}, path, _.get(this.clientAddress, path));
            },
            syncTrustedEvent(ev, mapping){
                if(ev.isTrusted){
                    setImmediate(() => {
                        this.syncClientAddressForm(mapping);
                    });
                }
            },
            syncClientAddressForm(mapping){
                this.$emit('update:isSaving', true);
                this.$socket.emit("draft:client-address-update", {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientAddressId: this.clientAddress.id,
                    clientAddressForm: this.getIsolatedFormPathObj(mapping)
                });
            },
            save(){
                this.$socket.emit('draft:client-address-save', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            }
        },
        mounted(){

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