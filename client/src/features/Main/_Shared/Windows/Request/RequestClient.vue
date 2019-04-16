<template>
    <div class="request__section" :class="{ active: request.requestUIState.activeTab === 'client' }">
        <app-perfect-scrollbar v-if="request.requestUIState.activeTab === 'client' && request.client" class="section__content">
            <div class="columns">
                <div class="left-side">
                    <div class="box">
                        <div class="form" style="display: flex; flex-direction: column; flex-grow: 1;">
                            <label style="margin-bottom: 5px;">Nome</label>
                            <div style="display: flex; flex-direction: row; flex-wrap: nowrap;">
                                <input type="text" class="input" :value="request.client.name" @input="updateValue('clients','name',request.client.id,$event.target.value,'uppercase',$event)" />
                                <div v-if="!isNewClient" style="margin-left: 8px; display: flex; align-items: flex-end;">
                                    <a class="button" style="white-space: nowrap; margin-bottom: 15px;" @click="addClient()">NOVO CLIENTE</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="!request.requestUIState.requestClientAddressForm" class="box">
                        <h3 style="margin-bottom: 5px;">Endereços</h3>
                        <table class="client-addresses" style="margin: 3px 0 12px 0;" v-if="request.requestClientAddresses.length > 0 && request.client.clientAddresses.length > 0">
                            <tbody>
                            <tr v-for="clientAddress in request.client.clientAddresses"
                                :class="{ selected: request.requestClientAddresses[0].clientAddressId === clientAddress.id }"
                                :key="clientAddress.id"
                                v-if="clientAddress.address"
                                @click="selectClientAddress(clientAddress.id)">
                                <td>
                                    {{ clientAddress.address.name }},
                                    {{ clientAddress.number }}<br />
                                    {{
                                    clientAddress.complement
                                    ? clientAddress.complement
                                    : "S/ COMPLEMENTO"
                                    }}
                                </td>
                                <td>
                                    {{ clientAddress.address.neighborhood }}<br />{{
                                    clientAddress.address.city
                                    }}/{{ clientAddress.address.state }}
                                </td>
                                <td style="text-align: right; white-space: nowrap;">
                                    <a href="javascript:void(0)" @click.stop="editClientAddress(clientAddress.id)">
                                        <i class="mi mi-edit" style="font-size: 18px; padding: 2px;"></i>
                                    </a>
                                    <a href="javascript:void(0)" @click.stop="removeClientAddress(clientAddress.id)" style="margin-left: 7px;">
                                        <i class="mi mi-close" style="font-size: 18px; padding: 2px;"></i>
                                    </a>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div style="margin: 3px 0 12px 0;" v-else>
                            <p>Este cliente não possui endereço cadastrado.</p>
                        </div>
                        <div style="display: flex;">
                            <a class="button" style="float: right;" @click="addClientAddress()">INCLUIR ENDEREÇO</a>
                            <span class="push-both-sides"></span>
                        </div>
                    </div>
                    <div class="box" v-if="request.requestUIState.requestClientAddressForm">
                        <h3 style="margin-bottom: 15px;">Novo endereço</h3>
                        <div style="display: flex; flex-direction: row;">
                            <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 8px;">
                                <label>Endereço</label>
                                <app-address-search-input :value="request.requestClientAddresses[0].clientAddress.address.name" :address="request.requestClientAddresses[0].clientAddress.address"
                                      @select="onAddressSelect($event)"
                                      @input="updateValue('addresses','name',request.requestClientAddresses[0].clientAddress.address.id,$event)">
                                </app-address-search-input>
                            </div>
                            <div style="display: flex; flex-direction: column; width: 50px; margin-right: 8px;">
                                <label>Nº</label>
                                <input type="text" class="input" :value="request.requestClientAddresses[0].clientAddress.number" @input="updateValue('clientAddresses','number',request.requestClientAddresses[0].clientAddress.id,$event.target.value)" />
                            </div>
                            <div style="display: flex; flex-direction: column; width: 170px;">
                                <label>Complemento</label>
                                <input type="text"class="input" :value="request.requestClientAddresses[0].clientAddress.complement" @input="updateValue('clientAddresses','complement',request.requestClientAddresses[0].clientAddress.id,$event.target.value,'uppercase',$event)" />
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: row;">
                            <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 8px">
                                <label>Bairro</label>
                                <input type="text" class="input" :disabled="isEditingAddress" :class="{ readonly: isEditingAddress }" :value="request.requestClientAddresses[0].clientAddress.address.neighborhood" @input="updateValue('addresses','neighborhood',request.requestClientAddresses[0].clientAddress.address.id,$event.target.value,'uppercase',$event)" />
                            </div>
                            <div style="display: flex; flex-direction: column; width: 100px; margin-right: 8px">
                                <label>CEP</label>
                                <input type="text" class="input" :disabled="isEditingAddress" :class="{ readonly: isEditingAddress }" :value="request.requestClientAddresses[0].clientAddress.address.cep" @input="updateValue('addresses','cep',request.requestClientAddresses[0].clientAddress.address.id,$event.target.value)" />
                            </div>
                            <div style="display: flex; flex-direction: column; width: 170px; margin-right: 8px">
                                <label>Cidade</label>
                                <input type="text" class="input" :disabled="isEditingAddress" :class="{ readonly: isEditingAddress }" :value="request.requestClientAddresses[0].clientAddress.address.city" @input="updateValue('addresses','city',request.requestClientAddresses[0].clientAddress.address.id,$event.target.value,'uppercase',$event)" />
                            </div>
                            <div style="display: flex; flex-direction: column; width: 50px;">
                                <label>Estado</label>
                                <input type="text" class="input" autocomplete="off" :disabled="isEditingAddress" :class="{ readonly: isEditingAddress }" :value="request.requestClientAddresses[0].clientAddress.address.state" @input="updateValue('addresses','state',request.requestClientAddresses[0].clientAddress.address.id,$event.target.value,'uppercase',$event)" />
                            </div>
                        </div>
                        <div style="display: flex;">
                            <a class="button" v-if="request.client.clientAddresses.length >= 1" @click="cancel()">VOLTAR</a>
                            <span class="push-both-sides"></span>
                            <a class="button" style="margin-right: 5px;" v-if="isEditingAddress" @click="onAddressUnselect()">LIMPAR</a>
                            <a class="button" v-if="request.requestUIState.isAddingClientAddress" @click="updateValue('requestUIState','requestClientAddressForm',request.requestUIState.id,!request.requestUIState.requestClientAddressForm)">SALVAR ENDEREÇO</a>
                        </div>
                    </div>
                </div>
                <div class="right-side">
                    <div class="box">
                        <div style="display: flex; align-items: center;">
                            <h3>Telefones</h3>
                            <span class="push-both-sides"></span>
                            <span style="font-size: 12px">{{ (request.phoneLine) ? request.phoneLine : ''}}</span>
                        </div>

                        <div class="box__item" v-for="clientPhone in request.client.clientPhones" :key="clientPhone.id">
                            <a href="javascript:void(0)" v-if="clientPhone.id === _.get(request,'requestClientPhones[0].clientPhoneId',false)"
                               style="margin-top: 7px; margin-right: 7px; padding: 0 3px; align-self: baseline;">
                                <i class="mi mi-check" style="font-size: 18px;"></i>
                            </a>
                            <a href="javascript:void(0)" v-else
                               @click="updateValue('requestClientPhones','clientPhoneId',request.requestClientPhones[0].id,clientPhone.id)"
                               style="margin-top: 7px; margin-right: 7px; padding: 0 3px; align-self: baseline;">
                                <i class="mi mi-close" style="font-size: 18px;"></i>
                            </a>
                            <app-mask :mask="['(##) ####-####', '(##) #####-####']" :value="clientPhone.number"
                                      @input="updateMaskValue('clientPhones','number',clientPhone.id,$event)" placeholder="(##) #####-####" class="input" style="margin-bottom: 0;"></app-mask>
                            <a :class="{ disabled: request.client.clientPhones.length <= 1 }" href="javascript:void(0)" @click="removeClientPhone(clientPhone.id)" style="margin-top: 7px; margin-left: 7px; padding: 0 3px; align-self: baseline;">
                                <i class="mi mi-close" style="font-size: 18px;"></i>
                            </a>
                        </div>
                        <div class="box__item">
                            <a class="button" style="margin-top: 10px;" @click="addClientPhone()">ADICIONAR TELEFONE</a>
                        </div>
                    </div>
                    <div class="box" style="padding: 10px 12px;">
                        <div class="box__item" style="display: flex; flex-direction: column;">
                            <h3>Grupo do cliente</h3>
                            <app-select :items="getSelectClientGroups" :value="request.client.clientGroupId"
                                        @input="updateValue('clients','clientGroupId',request.client.id,$event)"
                                        :popoverProps="{verticalOffset: 0,horizontalOffset: -15,placement: 'bottom-start'}">
                                <input type="text" class="select readonly" readonly
                                       :value="_.has(request, 'client.clientGroup.name') ? request.client.clientGroup.name : '-- SELECIONE --'" />
                                <template slot="item" slot-scope="slotProps">
                                    <span>{{ slotProps.text }}</span>
                                </template>
                            </app-select>
                        </div>
                    </div>
                    <div class="box">
                        <h3>Obs. do cliente</h3>
                        <textarea-autosize
                                class="input"
                                style="flex-shrink: 0;"
                                :min-height="30"
                                :max-height="350"
                                :value="request.client.obs"
                                @input.native="updateValue('clients','obs',request.client.id,$event.target.value.toUpperCase(),'uppercase',$event)"
                        ></textarea-autosize>
                    </div>
                </div>
            </div>
        </app-perfect-scrollbar>
        <div class="section__summary" @click="activateTab()">
            <div class="summary-radio" style="margin-right: 5px;">
                <app-switch :readonly="true" :value="request.requestUIState.activeTab === 'client'"></app-switch>
            </div>
            <h3>Cliente</h3>
            <div v-if="request.requestUIState.activeTab !== 'client' && request.clientId" style="margin-left: 12px; display: flex; flex-direction: row; align-items: center;">
                <div class="dot-separator"></div>
                <div v-if="hasClientSelected" style="display: flex; flex-direction: row; align-items: center;">
                    <h3 style="margin-left: 8px; margin-right: 8px;">
                        {{ utils.getShortString(request.client.name, 14, "[...]") }}
                    </h3>
                    <div class="dot-separator"></div>
                    <h3 style="margin-left: 8px; margin-right: 8px;">
                        {{ utils.getShortString(request.requestClientAddresses[0].clientAddress.address.name, 22, "[...]") }},
                        {{ request.requestClientAddresses[0].clientAddress.number ? request.requestClientAddresses[0].clientAddress.number : "S/N" }}
                    </h3>
                    <div class="dot-separator"></div>
                    <h3 style="margin-left: 8px;" v-if="request.requestClientAddresses[0].clientAddress.complement">
                        {{ utils.getShortString(request.requestClientAddresses[0].clientAddress.complement, 9, "[...]") }}
                    </h3>
                    <h3 style="margin-left: 8px;" v-else>S/ COMPLEMENTO</h3>
                </div>
                <div v-else style="display: flex; flex-direction: row; align-items: center;">
                    <h3 style="margin-left: 8px;">S/CLIENTE</h3>
                </div>
            </div>
            <span class="push-both-sides"></span>
            <a class="button" v-if="request.clientId && !isNewClient"
               @click.stop="updateValue('requestUIState','showClientOrderTimeline',request.requestUIState.id,true)"
               style="display: flex; align-items: center; align-self: center; text-transform: uppercase;">últimas compras</a>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex'
    import _ from 'lodash'
    import Vue from 'vue'
    import shortid from 'shortid'

    import AddressSearchInputComponent from "../_Shared/Search/AddressSearchInput"

    import RequestHelper from '../../../../../helpers/RequestHelper'

    export default {
        props: ['request'],
        mixins: [RequestHelper],
        components: {
            "app-address-search-input": AddressSearchInputComponent
        },
        data(){
            return {
            }
        },
        computed: {
            isNewClient() {
                return this.utils.isTmp(this.request.clientId);
            },
            isEditingAddress() {
                return Number.isInteger(
                    this.request.requestClientAddresses[0].clientAddress.addressId
                );
            },
            hasClientSelected() {
                return (
                    _.get(this.request, "client.name", false) &&
                    typeof this.request.client.name === "string" &&
                    this.request.client.name.trim()
                );
            },
            getSelectClientGroups() {
                return _.map(
                    this.$store.getters["entities/clientGroups/all"](),
                    clientGroup => {
                        return {
                            value: clientGroup.id,
                            text: clientGroup.name
                        };
                    }
                );
            },
        },
        methods: {
            updateValue(modelName, field, id, value, modifier = false, ev = false) {
                let start, end
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    start = ev.target.selectionStart
                    end = ev.target.selectionEnd
                }
                switch (modifier) {
                    case "uppercase":
                        value = value.toUpperCase();
                        break;
                }
                // this.$store.dispatch(path, {where: id, data})
                this.stateHelper({
                    modelName,
                    action: 'update',
                    persist: true,
                    data: {
                        id: id,
                        [field]: value
                    }
                })
                if((modifier === 'uppercase') && ev && ev.constructor.name === 'InputEvent'){
                    Vue.nextTick(() => {
                        ev.target.setSelectionRange(start,end);
                    })
                }
            },
            updateMaskValue(path, field, id, event){
                this.updateValue(path, field, id, event)
                /*if(event.isTrusted){
                    const data = {}
                    data[field] = this.utils.getMoneyAsDecimal(event.target.value)
                    this.$store.dispatch(path, {
                        where: id,
                        data
                    })
                }*/
            },

            /* Client */

            addClient() {
                const clientTmpId = `tmp/${shortid.generate()}`
                this.$store.dispatch("entities/clients/insert", {
                    data: {
                        id: clientTmpId
                    }
                })
                this.$store.dispatch("entities/requests/update", {
                    where: this.request.id,
                    data: {
                        clientId: clientTmpId
                    }
                })
                this.addClientAddress()
            },

            /* Client Phones */

            addClientPhone() {
                this.$store.dispatch("entities/clientPhones/insert", {
                    data: {
                        id: `tmp/${shortid.generate()}`,
                        clientId: this.request.client.id
                    }
                });
            },
            removeClientPhone(clientPhoneId) {
                if (this.request.client.clientPhones.length <= 1) {
                    return;
                }
                this.$store.dispatch("entities/clientPhones/delete", clientPhoneId);
            },

            /* Client Address */

            addClientAddress() {
                const requestClientAddressId = this.request.requestClientAddresses[0].id;
                if (requestClientAddressId) {
                    const clientAddressTmpId = `tmp/${shortid.generate()}`;
                    const addressTmpId = `tmp/${shortid.generate()}`;
                    this.$store
                        .dispatch("entities/addresses/insert", {
                            data: {
                                id: addressTmpId
                            }
                        })
                        .then(() => {
                            Vue.nextTick(() => {
                                this.$store
                                    .dispatch("entities/clientAddresses/insert", {
                                        data: {
                                            id: clientAddressTmpId,
                                            clientId: this.request.clientId,
                                            addressId: addressTmpId
                                        }
                                    })
                                    .then(() => {
                                        this.$store
                                            .dispatch("entities/requestClientAddresses/update", {
                                                where: requestClientAddressId,
                                                data: {
                                                    clientAddressId: clientAddressTmpId,
                                                    number: 0,
                                                    complement: null
                                                }
                                            })
                                            .then(() => {
                                                this.updateValue(
                                                    "requestUIState",
                                                    "isAddingClientAddress",
                                                    this.request.requestUIState.id,
                                                    true
                                                );
                                                this.updateValue(
                                                    "requestUIState",
                                                    "requestClientAddressForm",
                                                    this.request.requestUIState.id,
                                                    true
                                                );
                                            });
                                    });
                            });
                        });
                }
            },
            editClientAddress(clientAddressId) {
                this.updateValue(
                    "requestUIState",
                    "isAddingClientAddress",
                    this.request.requestUIState.id,
                    false
                );
                this.updateValue(
                    "requestUIState",
                    "requestClientAddressForm",
                    this.request.requestUIState.id,
                    true
                );
                const requestClientAddressId = this.request.requestClientAddresses[0].id;
                if (requestClientAddressId) {
                    this.$store.dispatch("entities/requestClientAddresses/update", {
                        where: requestClientAddressId,
                        data: {
                            clientAddressId: clientAddressId
                        }
                    });
                }
            },
            selectClientAddress(clientAddressId) {
                this.updateValue(
                    "requestClientAddresses",
                    "clientAddressId",
                    this.request.requestClientAddresses[0].id,
                    clientAddressId
                );
            },
            removeClientAddress(clientAddressId) {
                this.$store.dispatch("entities/clientAddresses/delete", clientAddressId);
            },
            onAddressSelect(address) {
                this.$store.dispatch("entities/addresses/insert", {
                    data: address
                });
                this.$store.dispatch("entities/clientAddresses/update", {
                    where: this.request.requestClientAddresses[0].clientAddress.id,
                    data: {
                        addressId: address.id
                    }
                });
            },
            onAddressUnselect() {
                const addressTmpId = `tmp/${shortid.generate()}`;
                this.$store.dispatch("entities/addresses/insert", {
                    data: {
                        id: addressTmpId
                    }
                });
                this.$store.dispatch("entities/clientAddresses/update", {
                    where: this.request.requestClientAddresses[0].clientAddress.id,
                    data: {
                        addressId: addressTmpId
                    }
                });
            },

            cancel() {
                if (this.request.requestUIState.isAddingClientAddress) {
                    if (this.utils.isTmp(this.request.requestClientAddresses[0].id)) {
                        const clientAddressId = this.request.requestClientAddresses[0].clientAddressId
                        this.removeClientAddress(clientAddressId)
                    }
                    this.updateValue(
                        "requestUIState",
                        "isAddingClientAddress",
                        this.request.requestUIState.id,
                        false
                    )
                }
                this.updateValue(
                    "requestUIState",
                    "requestClientAddressForm",
                    this.request.requestUIState.id,
                    false
                );
            },


            async activateTab() {
                this.stateHelper({
                    modelName: 'requestUIState',
                    action: 'patch',
                    persist: true,
                    data: {
                        id: this.request.requestUIState.id,
                        activeTab: 'client'
                    }
                })
                this.$emit('activate')
            },
        }
    }
</script>

<style lang="scss" scoped>
    .request__section {
        display: flex;
        background-color: var(--bg-color--2);
        flex-direction: column;
        margin-bottom: 5px;
        flex-shrink: 0;
        .section__content {
            display: none;
            .columns {
                flex-grow: 1;
                display: flex;
                flex-direction: row;
            }
        }
        .section__summary {
            height: 50px;
            align-items: center;
            background-color: var(--bg-color--2);
            display: flex;
            flex-direction: row;
            padding: 8px;
            cursor: pointer;
            flex-shrink: 0;
            h3 {
                font-weight: 400;
            }
            .summary-radio {
                margin: 0 0 0 0;
                .v-input {
                    margin: 0;
                    padding: 0;
                    .v-radio {
                        margin: 0;
                    }
                }
            }
            &:hover {
                background-color: var(--bg-color--3);
            }
        }
        &.instruction {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        &.active {
            display: flex;
            flex-grow: 1;
            flex-shrink: unset;
            .section__content {
                display: flex;
                background-color: var(--bg-color--2);
                flex-grow: 1;
            }
        }
        &:last-child {
            margin-bottom: 0;
        }
    }
</style>
