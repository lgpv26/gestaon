<template>
    <div style="display: flex; flex-grow: 1; flex-direction: column">
        <app-client-address-form v-if="show" @save="onClientAddressFormSave($event)" @create="onClientAddressFormCreate($event)"></app-client-address-form>
        <!-- Show client address list -->
        <div class="form-group" v-else>
            <div class="form-group__header">
                <span style="margin-right: 10px;">Selecione um local</span><icon-local></icon-local>
                <span class="push-both-sides"></span>
                <a class="btn btn--border-only" @click="addClientAddress()">Novo</a>
            </div>
            <div class="form-group__content">
                <ul class="content__list">
                    <li class="list__item" v-for="clientAddress in clientAddresses" :class="{ active: false }">
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
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'

    import _ from 'lodash'
    import utils from '@/utils'
    import models from '@/models'
    import AddressesAPI from '@/api/addresses'
    import ClientAPI from '@/api/clients'
    import AddressForm from './AddressForm.vue'
    import ClientAddressForm from './ClientAddressForm.vue'
    import Vue from 'vue';

    import DraftMixin from '../../DraftMixin'

    const { mapFields, mapMultiRowFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-client-address-form': ClientAddressForm
        },
        mixins: [DraftMixin],
        watch: {
            'form.legalDocument': function(legalDocument){
                this.$refs.legalDocumentInput.display = legalDocument;
            },
            'clientAddress.address.cep': function(cep){
                this.$refs.cepInput.display = cep;
            },
            'clientPhoneForm.number': function(number){
                this.$refs.clientPhoneInput.display = number;
            }
        },
        data(){
            return {
                formPath: 'request.client.clientAddressForm'
            }
        },
        computed: {
            ...mapState('auth', ['company']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapFields([
                'form.client.clientAddressForm',
                'form.client.clientAddressForm.show'
            ]),
            ...mapMultiRowFields(['form.client.clientAddresses']),
        },
        methods: {
            ...mapActions('toast', ['showToast', 'showError']),
            ...mapActions('draft/request', ['setClientAddressForm','addClientAddress']),

            onClientAddressFormSave(clientAddressForm){
                const clientAddressIndex = _.findIndex(this.clientAddresses, { id: clientAddressForm.id })
                if(clientAddressIndex !== -1){
                    this.clientAddresses[clientAddressIndex] = clientAddressForm
                    this.sync(
                        this.clientAddresses,
                        'clientAddresses',
                        'request.client'
                    )
                }
            },

            onClientAddressFormCreate(clientAddressForm){
            },

            /**
             * Actions
             */

            editClientAddress(clientAddress){
                this.setClientAddressForm(clientAddress)
                this.show = true
                this.syncMultiple(
                    _.map(this.clientAddressForm, (v, k) => {
                        return {
                            value: v,
                            path: k
                        }
                    })
                )
            },

            addClientAddress(){
                this.show = true
                this.sync(this.show, 'show')
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