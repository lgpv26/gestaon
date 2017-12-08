<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <div class="form__main-column">
                <!-- client name and document -->
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-columns">
                            <div class="form-column" style="flex-grow: 1;">
                                Nome / Empresa
                                <div v-if="client.id"> <!-- unassociate client -->
                                    <input type="text" class="input--borderless" style="color: var(--font-color--primary)"
                                    v-model="client.name" v-if="client.id" placeholder="..." @input="commitSocketChanges('client.name')" />
                                </div>
                                <app-search v-else ref="search" :items="searchItems" :shouldStayOpen="isNameInputFocused" :query="query" :verticalOffset="5" :horizontalOffset="-20"
                                    @itemSelected="searchClientSelected($event)" >
                                    <input type="text" class="input--borderless search-input__field" placeholder="..." v-model="client.name" ref="searchInput"
                                    @keydown="searchValueUpdated()" @focus="isNameInputFocused = true" @blur="isNameInputFocused = false" @input="commitSocketChanges('client.name')" />
                                    <template slot="item" slot-scope="props">
                                        <div class="search-input__item" v-if="props.item.client">
                                            <span class="detail__name" v-html="props.item.client.name"></span>
                                            <span class="detail__address" v-if="props.item.client.address" v-html="props.item.client.address.address + ', ' + props.item.client.address.number"></span>
                                            <span class="detail__phones" v-if="props.item.client.phones.length > 0">
                                            <span v-for="(clientPhone, index) in props.item.client.phones"
                                                v-html="((index === 0) ? '' : ', ') + clientPhone.ddd + clientPhone.number"></span>
                                            </span>
                                        </div>
                                        <div class="search-input__item" v-if="props.item.address">
                                            <span class="detail__address" v-html="props.item.address.name"></span>
                                        </div>
                                    </template>
                                    <template slot="no-results">
                                        <span>Nenhum resulado encontrado...</span>
                                    </template>
                                </app-search>
                            </div>
                            <div class="form-column" style="justify-content: center;">
                                <icon-search v-if="!client.id"></icon-search>
                                <span class="btn btn--border-only" v-else @click="changeClient()">Mudar</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        CPF / CNPJ
                        <app-mask class="input--borderless" :mask="['###.###.###-##', '##.###.###/####-##']" v-model="form.legalDocument" placeholder="..." @input="commitSocketChanges('client.legalDocument')" />
                    </div>
                </div>
                <!-- client addresses -->
                <div class="form-groups">
                    <div class="form-group" v-if="isEditing || isAdding || form.clientAddresses.length <= 0">
                        <div class="form-group__header">
                            <h3 style="margin-right: 10px; color: var(--font-color--2);" v-if="isEditing">
                                {{ clientAddressForm.address.name + ', ' + clientAddressForm.number }}
                            </h3>
                            <h3 style="margin-right: 10px;" v-else>Locais</h3>
                            <icon-local></icon-local>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only" v-if="form.clientAddresses.length > 0" @click="backToClientAddressesList()">Voltar</a>
                            <a class="btn btn--primary" v-if="form.clientAddresses.length <= 0" @click="saveClientAddress()" style="margin-left: 10px;">Adicionar</a>
                            <a class="btn btn--primary" v-else @click="saveClientAddress()" style="margin-left: 10px;">Salvar</a>
                        </div>
                        <div class="form-group__content">
                            <app-client-address-form ref="clientAddressForm" :clientId="client.id" :clientAddress.sync="clientAddressForm"></app-client-address-form>
                        </div>
                    </div>
                    <div class="form-group" v-else>
                        <div class="form-group__header">
                            <span style="margin-right: 10px;">Selecione um local</span><icon-local></icon-local>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only" @click="addClientAddress()">Novo</a>
                        </div>
                        <div class="form-group__content">
                            <ul class="content__list">
                                <li class="list__item" v-for="clientAddress in form.clientAddresses" :class="{ active: clientAddress.active }">
                                    <span style="cursor: pointer;" @click="onClientAddressSelected(clientAddress)">
                                        {{ clientAddress.address.name }}, {{ clientAddress.number }}
                                    </span>
                                    <span class="push-both-sides"></span>
                                    <div class="item__check" @click="onClientAddressSelected(clientAddress)" style="cursor: pointer; margin-right: 10px;">
                                        <icon-check></icon-check>
                                    </div>
                                    <div @click="editClientAddress(clientAddress)" style="cursor: pointer; margin-right: 10px;">
                                        <icon-copy></icon-copy>
                                    </div>
                                    <div style="cursor: pointer;">
                                        <icon-remove></icon-remove>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="form-groups" v-if="isEditing || isAdding || form.clientAddresses.length <= 0">
                    <div class="form-group">
                        <div class="form-columns">
                            <div class="form-column" style="flex-grow: 1;">
                                <label>Apelido (ex: Casa da mãe)</label>
                                <input type="text" class="input--borderless" v-model="clientAddressForm.name" placeholder="..." />
                            </div>
                            <div class="form-column" style="width: 180px;">
                                <a class="btn">Tipo de local</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form__side-column">
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-group__header">
                            <div class="header__icon">
                                <icon-phone></icon-phone>
                            </div>
                            <app-mask :mask="['(##) ####-####','(##) #####-####']" class="input--borderless" v-model="clientPhoneForm.number" placeholder="Número" />
                            <div class="header__mini-circle"></div>
                            <input type="text" v-model="clientPhoneForm.name" class="input--borderless" placeholder="fixo/celular" />
                            <span class="push-both-sides"></span>
                            <div style="cursor: pointer;" @click="addClientPhone()">
                            <icon-add class="header__action-icon"></icon-add>
                            </div>
                        </div>
                        <div class="form-group__content">
                            <ul class="content__list--mini" v-if="form.clientPhones && form.clientPhones.length > 0">
                                <li class="list__item" v-for="clientPhone in form.clientPhones" :class="{ active: clientPhone.active }">
                                    <div class="item__check" style="margin-right: 10px;">
                                        <icon-check></icon-check>
                                    </div>
                                    <span style="cursor: pointer;" @click="onClientPhoneSelected(clientPhone)">({{ clientPhone.ddd }}) {{ clientPhone.number }}</span>
                                    <div class="item__mini-circle"></div>
                                    <span>{{ clientPhone.name }}</span>
                                    <span class="push-both-sides"></span>
                                    <div @click="removeClientPhone(clientPhone)" style="display: flex; cursor: pointer;">
                                        <icon-remove></icon-remove>
                                    </div>
                                </li>
                            </ul>
                            <span v-else>Nenhum telefone...</span>
                        </div>
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group">
                        <app-new-select class="form-group__header" title="Grupo de cliente" :verticalOffset="8" :items="clientGroups" v-model="client.clientGroup" :showInput="true" @change="commitSocketChanges('client.clientGroup')">
                            <div class="header__icon">
                                <icon-client-group></icon-client-group>
                            </div>
                            <h3 class="static" v-if="!selectedClientGroup.value">Grupo de cliente</h3>
                            <h3 v-else style="color: var(--font-color--primary);">{{ selectedClientGroup.text }}</h3>
                            <span class="push-both-sides"></span>
                            <icon-dropdown class="header__action-icon"></icon-dropdown>
                            <template slot="item" slot-scope="itemProps">
                                <span>{{itemProps.text }}</span>
                            </template>
                        </app-new-select>
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group">
                        <app-new-select class="form-group__header" :verticalOffset="8" :items="clientCustomFields" v-model="form.clientSelectedCustomFields" :multiple="true" :showInput="true">
                            <div class="header__icon">
                                <icon-client-details></icon-client-details>
                            </div>
                            <h3 class="static">Informações adicionais</h3>
                            <span class="push-both-sides"></span>
                            <icon-dropdown class="header__action-icon" v-if="form.clientCustomFields && form.clientCustomFields.length >= 0"></icon-dropdown>
                            <icon-add class="header__action-icon" v-else></icon-add>
                            <template slot="item" slot-scope="itemProps">
                                <span>{{itemProps.text }}</span>
                            </template>
                        </app-new-select>
                        <div class="form-group__content" v-if="form.clientCustomFields && form.clientCustomFields.length > 0">
                            <ul class="content__list--mini">
                                <li class="list__item" v-for="clientCustomField in form.clientCustomFields">
                                    <span>{{ clientCustomField.text }}</span>
                                    <div class="item__mini-circle"></div>
                                    <span><input type="text" placeholder="..." class="input--borderless" /></span>
                                    <span class="push-both-sides"></span>
                                    <icon-remove></icon-remove>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form__header" v-if="!isCurrentStepActive && client.id" :class="{'summary': !isCurrentStepActive && client.id}">
            <div class="form-groups" style="flex-grow: 1;">
                <div class="form-group" style="flex-basis: 70%">
                    <span style="color: var(--font-color--secondary)">{{ client.name }}</span>
                </div>
                <div class="form-group" style="flex-basis: 30%;">
                    <icon-phone style="margin-right: 10px;"></icon-phone>
                    <span>(11) 99847-2355</span>
                    <div class="mini-circle"></div>
                    <span>WhatsApp</span>
                </div>
                <div class="form-group" style="flex-wrap: wrap; flex-grow: initial;">
                    <app-switch style="float: right;" :value="isCurrentStepActive" @change="onCurrentStepChanged()"></app-switch>
                </div>
            </div>
        </div>
        <div class="form__header" v-else>
            <span v-if="!isCurrentStepActive">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
            <span class="push-both-sides"></span>
            <h3>DADOS DO CLIENTE</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @change="onCurrentStepChanged()"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import { Select } from "../../../../components/Inputs/Select/index";
    import _ from 'lodash';
    import utils from '../../../../utils';
    import ClientAddressForm from './ClientAddressForm.vue';
    import SearchComponent from '../../../../components/Inputs/Search.vue';
    import ClientsAPI from '../../../../api/clients';
    import ServiceAPI from '../../../../api/service';

    export default {
        components: {
            'app-search': SearchComponent,
            'app-client-address-form': ClientAddressForm,
            'app-new-select': Select
        },
        props: ['client','activeStep'],

        data(){
            return {
                lastQuery: '',
                query: '',
                isNameInputFocused: false,
                isAdding: false,
                isEditing: false,
                clientPhoneForm: {
                    id: null,
                    name: null,
                    number: null
                },
                clientAddressForm: {
                    id: null,
                    name: null,
                    number: null,
                    complement: null,
                    address: {
                        id: null,
                        name: null,
                        neighborhood: null,
                        cep: null,
                        city: null,
                        state: null
                    }
                },
                form: {
                    active: false,
                    id: null, // se passar, atualizar cliente. se não, criar.
                    name: '', // se passar e tiver id, atualizar. se não, criar.
                    legalDocument: '', // cpf, cnpj
                    clientGroup: null,
                    clientSelectedCustomFields: [],
                    clientCustomFields: [],
                    clientAddresses: [],
                    clientPhones: [],
                    clientAddressName: null
                },
                clientCustomFields: [
                    {
                        text: 'RG',
                        value: 'rg'
                    },
                    {
                        text: 'E-mail',
                        value: 'email'
                    },
                    {
                        text: 'Apelido',
                        value: 'nickname'
                    }
                ],
                clientGroups: [
                    {
                        text: 'NENHUM',
                        value: null
                    },
                    {
                        text: 'VAREJO DISK',
                        value: 'retail-disk'
                    },
                    {
                        text: 'VENDA AUTOMÁTICA',
                        value: 'automatic-sales'
                    },
                    {
                        text: 'COMÉRCIO',
                        value: 'commerce'
                    }
                ],
                searchItems: [],
                commitTimeout: null
            }
        },
        watch: {
            'form.clientSelectedCustomFields' : function(clientSelectedCustomFields) {
                if(clientSelectedCustomFields.length && clientSelectedCustomFields.length > 0){
                    this.form.clientCustomFields = _.reduce(this.clientCustomFields, (accumulator, clientCustomField, index) => {
                        if(_.includes(clientSelectedCustomFields, clientCustomField.value)){ // Exists in selected custom fields
                            const existentClientCustomField = _.find(this.form.clientCustomFields, { field: clientCustomField.value });
                            if(existentClientCustomField){
                                accumulator.push(existentClientCustomField);
                            }
                            else {
                                accumulator.push({
                                    text: clientCustomField.text,
                                    field: clientCustomField.value,
                                    value: null
                                });
                            }
                            return accumulator;
                        }
                        // If it does not exist in selected custom fields, don't push it to accumulator
                        return accumulator;
                    }, []);
                }
                else {
                    this.form.clientCustomFields = [];
                }
            },
            form: {
                handler: function(form) {
                    this.syncWithParentForm();
                },
                deep: true
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            isCurrentStepActive(){
                return this.activeStep === 'client';
            },
            selectedClientGroup(){
                return _.find(this.clientGroups, { value: this.form.clientGroup });
            }
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            /**
             * Form model
             */

            createClientAddress(){
                return {
                    id: null,
                    name: null,
                    number: null,
                    complement: null,
                    address: {
                        id: null,
                        name: null,
                        neighborhood: null,
                        cep: null,
                        city: null,
                        state: null
                    }
                }
            },

            /**
             * Client search
             */

            search(){
                const vm = this;
                ServiceAPI.search({
                    actingCities: ['MARINGA'],
                    q: vm.query,
                    companyId: vm.company.id
                }).then(({data}) => {
                    let clients = data[0];
                    vm.searchItems = clients.map(({source}) => {
                        // source refers to search address item
                        return {
                            client: source
                        };
                    });
                    vm.$refs.search.search();
                }).catch((err) => {
                    vm.searchItems = [];
                })
            },
            searchClientSelected(searchItem){
                const vm = this;
                ClientsAPI.getOne(searchItem.client.id).then(({data}) => {
                    const client = data;
                    client.clientPhones.map((clientPhone) => {
                        clientPhone.active = false;
                        return clientPhone;
                    });
                    client.clientAddresses.map((clientAddress) => {
                        clientAddress.active = false;
                        return clientAddress;
                    });
                    _.assign(vm.form, _.pick(client, _.keys(vm.form)));
                    vm.searchItems = [];
                });
            },
            searchValueUpdated(){
                if(this.commitTimeout) clearTimeout(this.commitTimeout);
                this.commitTimeout = setTimeout(() => {
                    this.query = this.form.name;
                    this.commitUpdatedValue();
                }, 300)
            },
            commitUpdatedValue(){
                if(this.query.trim() !== this.lastQuery){
                    this.lastQuery = this.query.trim();
                    this.search();
                }
            },

            /**
             * Actions
             */

            changeClient(){
                this.resetForm();
            },
            backToClientAddressesList(){
                this.isAdding = false;
                this.isEditing = false;
            },
            addClientPhone(){
                const vm = this;
                const clientPhone = _.assign({}, vm.clientPhoneForm, {
                    ddd: utils.getDDDAndNumber(vm.clientPhoneForm.number).ddd,
                    number: utils.getDDDAndNumber(vm.clientPhoneForm.number).number
                });
                ClientsAPI.savePhones(vm.client.id, [clientPhone], { companyId: vm.company.id }).then((resultx) => {
                    const savedClientPhone = _.first(resultx.data);
                    const clientPhoneId = _.findIndex(vm.form.clientAddresses, { id: savedClientPhone.id });
                    if(clientPhoneId !== -1){ // found
                        vm.showToast({
                            type: "success",
                            message: "Número de contato salvo com sucesso."
                        });
                        vm.form.clientPhones[clientPhoneId] = savedClientPhone;
                    }
                    else {
                        vm.showToast({
                            type: "success",
                            message: "Número de contato adicionado com sucesso."
                        });
                        vm.form.clientPhones.push(savedClientPhone);
                    }
                })
            },
            removeClientPhone(clientPhone){
                const vm = this;
                ClientsAPI.removeOneClientPhone(vm.client.id, clientPhone.id, { companyId: vm.company.id }).then(() => {
                    vm.showToast({
                        type: "success",
                        message: "Telefone do cliente removido com sucesso."
                    });
                    const clientPhoneIndex = _.findIndex(vm.form.clientPhones, { id: clientPhone.id });
                    if(clientPhoneIndex !== -1){
                        vm.form.clientPhones.splice(clientPhoneIndex, 1);
                    }
                });
            },
            onClientPhoneSelected(selectedClientPhone){
                this.client.clientPhones.forEach((clientPhone) => {
                    clientPhone.active = false;
                    if(selectedClientPhone.id === clientPhone.id){
                        selectedClientPhone.active = true;
                    }
                })
            },
            onClientAddressSelected(selectedClientAddress){
                this.client.clientAddresses.forEach((clientAddress) => {
                    clientAddress.active = false;
                    if(selectedClientAddress.id === clientAddress.id){
                        selectedClientAddress.active = true;
                    }
                })
            },
            addClientAddress(){
                this.resetClientAddressForm();
                this.isAdding = true;
            },
            editClientAddress(clientAddress){
                _.assign(this.clientAddressForm, utils.removeReactivity(clientAddress));
                this.isEditing = true;
            },
            saveClientAddress(){
                const vm = this;
                const saveAddress = this.$refs.clientAddressForm.save();
                if(saveAddress){
                    saveAddress.then((clientAddress) => {
                        const clientAddressId = _.findIndex(vm.form.clientAddresses, {id: clientAddress.id});
                        if (clientAddressId !== -1) {
                            vm.form.clientAddresses[clientAddressId] = clientAddress;
                        }
                        else {
                            vm.form.clientAddresses.push(clientAddress);
                        }
                        vm.backToClientAddressesList();
                    });
                }
            },

            /**
             * Resets
             */

            resetForm(){
                this.resetClientForm();
                this.resetClientAddressForm();
            },
            resetClientForm(){
                Object.assign(this.$data.form, this.$options.data.apply(this).form);
            },
            resetClientAddressForm(){
                this.clientAddressForm = this.createClientAddress();
            },

            /**
             * Real-time
             */

            onCurrentStepChanged(){
                (this.activeStep === 'client') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'client');
                this.commitSocketChanges('activeStep');
            },
            syncWithParentForm(){
                this.$emit('update:client', this.form);
            },
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            }
        },
        mounted(){
            this.syncWithParentForm();
        }
    }
</script>

<style scoped>

    .form__header.summary {
        height: auto;
    }

    .form__header.summary span {
        text-transform: uppercase;
        font-weight: 600;
    }

    .form__header.summary .form-group {
        padding: 0 20px;
        display: flex;
        height: 50px;
        align-items: center;
        flex-direction: row;
    }

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
