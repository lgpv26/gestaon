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
                            <div class="form-column" style="justify-content: flex-end;">
                                <icon-search v-if="!client.id" style="position: relative; top: -4px;"></icon-search>
                                <div style="cursor: pointer;" @click="changeClient()" v-else>
                                    <icon-change></icon-change>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        CPF / CNPJ
                        <app-mask class="input--borderless" ref="legalDocumentInput" :mask="['###.###.###-##', '##.###.###/####-##']" v-model="form.legalDocument"
                        placeholder="..." @input.native="commitTrustedSocketChanges($event,'client.legalDocument')" />
                    </div>
                </div>
                <!-- client addresses -->
                <div class="form-groups">
                    <div class="form-group" v-if="isEditing || isAdding || form.clientAddresses.length <= 0">
                        <div class="form-group__header">
                            <!-- previous implementation - shows the client address name/number
                            <h3 style="margin-right: 10px; color: var(--font-color--2);" v-if="isEditing && !clientAddressForm.address.id">Editando endereço...</h3>
                            <h3 style="margin-right: 10px; color: var(--font-color--2);" v-else-if="isEditing">
                                {{ clientAddressForm.address.name + ', ' + clientAddressForm.number }}
                            </h3>
                            -->
                            <div style="display: flex; flex-direction: row;" v-if="isEditing">
                                <span style="margin-right: 10px;">Tipo do local</span>
                                <icon-local></icon-local>
                                <app-client-address-types-input style="margin-left: 10px;" v-model="clientAddressForm.clientAddressTypes"></app-client-address-types-input>
                            </div>
                            <div style="display: flex; flex-direction: row;" v-else>
                                <span style="margin-right: 10px;">Selecione um local</span>
                                <icon-local></icon-local>
                            </div>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only" v-if="form.clientAddresses.length > 0" @click="backToClientAddressesList()">Voltar</a>
                            <div v-if="form.clientAddresses.length <= 0">
                                <a class="btn btn--primary" @click="saveClientAddress()" v-if="!isSavingClientAddress" style="margin-left: 10px;">Adicionar</a>
                                <a class="btn btn--primary btn--disabled" v-else style="margin-left: 10px;">Adicionar</a>
                            </div>
                            <div v-else>
                                <a class="btn btn--primary" @click="saveClientAddress()" v-if="!isSavingClientAddress" style="margin-left: 10px;">Salvar</a>
                                <a class="btn btn--primary btn--disabled" v-else style="margin-left: 10px;">Salvar</a>
                            </div>
                        </div>
                        <div class="form-group__content">
                            <app-client-address-form ref="clientAddressForm" :clientId="client.id" :clientAddress.sync="clientAddressForm" :isSaving.sync="isSavingClientAddress"
                            @save="onClientAddressSave($event)"></app-client-address-form>
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
                                <li class="list__item" v-for="clientAddress in form.clientAddresses" :class="{ active: clientAddressId === clientAddress.id }">
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
            </div>
            <div class="form__side-column">
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-group__header">
                            <div class="header__icon">
                                <icon-phone></icon-phone>
                            </div>
                            <app-mask :mask="['(##) ####-####','(##) #####-####']" class="input--borderless" ref="clientPhoneInput" v-model="clientPhoneForm.number"
                                      @input.native="syncClientPhoneTrustedEvent($event, 'number')" placeholder="(##) #####-####"></app-mask>
                            <div class="header__mini-circle"></div>
                            <input type="text" v-model="clientPhoneForm.name" @input="syncClientPhoneForm('name')" class="input--borderless" placeholder="fixo ou celular" />
                            <span class="push-both-sides"></span>
                            <div style="cursor: pointer; margin-right: 8px;" @click="cancelClientPhoneEdition()" v-if="clientPhoneForm.id">
                                <a style="font-size: 15px; font-weight: 600; color: var(--base-color); position: relative; top: -2px;">V</a>
                            </div>
                            <div style="cursor: pointer;" @click="saveClientPhone()">
                                <icon-add class="header__action-icon" v-if="!clientPhoneForm.id"></icon-add>
                                <a v-else style="font-size: 15px; font-weight: 600; color: var(--base-color); position: relative; top: -2px;">S</a>
                            </div>
                        </div>
                        <div class="form-group__content">
                            <ul class="content__list--mini" v-if="form.clientPhones && form.clientPhones.length > 0">
                                <li class="list__item" v-for="clientPhone in form.clientPhones" :class="{ active: clientPhoneId === clientPhone.id }">
                                    <div class="item__check" @click="selectClientPhone(clientPhone)" style="margin-right: 10px; cursor: pointer;">
                                        <icon-check></icon-check>
                                    </div>
                                    <span style="cursor: pointer;" @click="selectClientPhone(clientPhone)">({{ clientPhone.ddd }}) {{ clientPhone.number }}</span>
                                    <div class="item__mini-circle"></div>
                                    <span>{{ clientPhone.name }}</span>
                                    <span class="push-both-sides"></span>
                                    <div class="item__icon" @click="editClientPhone(clientPhone)" style="cursor: pointer; margin-right: 10px;">
                                        <icon-edit></icon-edit>
                                    </div>
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
                        <app-select class="form-group__header" :verticalOffset="8" :items="customFieldsSelectOptions" v-model="form.clientSelectedCustomFields"
                            :multiple="true" :showInput="true" @select="onClientCustomFieldSelect($event)" @unselect="onClientCustomFieldUnselect($event)"
                            @save="onCustomFieldSave($event)">
                            <div class="header__icon">
                                <icon-client-details></icon-client-details>
                            </div>
                            <span class="static">Informações adicionais</span>
                            <span class="push-both-sides"></span>
                            <icon-dropdown class="header__action-icon" v-if="form.clientCustomFields && form.clientCustomFields.length >= 0"></icon-dropdown>
                            <icon-add class="header__action-icon" v-else></icon-add>
                            <template slot="item" slot-scope="itemProps">
                                <span>{{itemProps.text }}</span>
                                <div style="margin-left: 8px;" v-if="itemProps.isRemovable" @click="removeCustomField(itemProps.value)">
                                    <icon-remove></icon-remove>
                                </div>
                            </template>
                        </app-select>
                        <div class="form-group__content" v-if="form.clientCustomFields && form.clientCustomFields.length > 0">
                            <ul class="content__list--mini">
                                <li class="list__item" v-for="clientCustomField in form.clientCustomFields">
                                    <span style="white-space: nowrap">{{ clientCustomField.customField.name }}</span>
                                    <div class="item__mini-circle"></div>
                                    <input type="text" placeholder="..." v-model="clientCustomField.value" @input="onClientCustomFieldInput(clientCustomField)" class="input--borderless" />
                                    <span class="push-both-sides"></span>
                                    <icon-remove style="flex-shrink: 0;"></icon-remove>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group">
                        <app-select class="form-group__header" title="Grupo de cliente" :verticalOffset="8" :items="clientGroups" v-model="client.clientGroup" :showInput="true" @change="commitSocketChanges('client.clientGroup')">
                            <div class="header__icon">
                                <icon-client-group></icon-client-group>
                            </div>
                            <span class="static" v-if="!selectedClientGroup.value">Grupo de cliente</span>
                            <span v-else style="color: var(--font-color--primary);">{{ selectedClientGroup.text }}</span>
                            <span class="push-both-sides"></span>
                            <icon-dropdown class="header__action-icon"></icon-dropdown>
                            <template slot="item" slot-scope="itemProps">
                                <span>{{itemProps.text }}</span>
                            </template>
                        </app-select>
                    </div>
                </div>
            </div>
        </div>
        <div class="form__header" v-if="!isCurrentStepActive && client.id" :class="{'summary': !isCurrentStepActive && client.id}">
            <div class="form-columns" style="flex-grow: 1;">
                <div class="form-column" style="flex-grow: 1; flex-basis: 70%; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;">
                    <span style="margin-right: 8px;">{{ shortenedClientName }}</span>
                    <div v-if="selectedClientAddress">
                        <span style="margin-right: 8px;">{{ shortenedClientAddress }}</span>
                    </div>
                    <icon-edit style="width:10px;"></icon-edit>
                </div>
                <div class="form-column" v-if="selectedClientPhone">
                    <a class="btn btn--border-only" style="height: auto; padding: 5px 8px;">
                        <icon-phone class="icon--d-secondary" style="margin-right: 10px;"></icon-phone>
                        <span style="white-space: nowrap;">{{ formatedClientPhone }}</span>
                    </a>
                </div>
                <div class="form-column" v-if="client.clientGroup">
                    <app-select class="form-group__header" title="Grupo de cliente" :verticalOffset="8" :items="clientGroups" v-model="client.clientGroup" :showInput="true" @change="commitSocketChanges('client.clientGroup')">
                        <a class="btn btn--border-only" style="height: auto; padding: 5px 8px;">
                            <div class="header__icon">
                                <icon-client-group class="icon--d-secondary" style="margin-right: 10px;"></icon-client-group>
                            </div>
                            <span class="static" style="white-space: nowrap" v-if="!selectedClientGroup.value">Grupo de cliente</span>
                            <span style="white-space: nowrap" v-else>{{ selectedClientGroup.text }}</span>
                            <span class="push-both-sides"></span>
                            <icon-dropdown class="header__action-icon"></icon-dropdown>
                        </a>
                        <template slot="item" slot-scope="itemProps">
                            <span>{{itemProps.text }}</span>
                        </template>
                    </app-select>
                </div>
                <div class="form-column" style="flex-grow: initial; flex-direction: row; align-items: center;">
                    <h3 style="top: 0;">Cliente</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @change="onCurrentStepChanged()"></app-switch>
                </div>
            </div>
        </div>
        <div class="form__header" v-else>
            <span v-if="!isCurrentStepActive">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
            <span class="push-both-sides"></span>
            <h3 :class="{active: isCurrentStepActive}">Cliente</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @change="onCurrentStepChanged()"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import utils from '@/utils/index';
    import models from '@/models';
    import ClientAddressForm from './ClientAddressForm.vue';
    import SearchComponent from '@/components/Inputs/Search.vue';
    import ClientAddressTypesInput from './ClientAddressTypesInput.vue';
    import ClientsAPI from '@/api/clients';
    import ServiceAPI from '@/api/service';
    import Vue from 'vue';

    export default {
        components: {
            'app-search': SearchComponent,
            'app-client-address-form': ClientAddressForm,
            'app-client-address-types-input': ClientAddressTypesInput,
        },
        props: ['client','activeStep','clientAddressId','clientPhoneId'],
        data(){
            return {
                lastQuery: '',
                query: '',
                isNameInputFocused: false,
                isAdding: false,
                isEditing: false,
                isSavingClientAddress: false,
                clientPhoneForm: {
                    id: null,
                    name: null,
                    number: null
                },
                selectedClientAddressId: null,
                clientAddressForm: {
                    id: null,
                    name: null,
                    number: null,
                    complement: null,
                    clientAddressTypes: [],
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
                customFields: [
                    {
                        companyId: 0,
                        dateCreated: null,
                        dateUpdated: null,
                        name: 'RG',
                        id: 1,
                        dateRemoved: null
                    },
                    {
                        companyId: 0,
                        dateCreated: null,
                        dateUpdated: null,
                        name: 'E-MAIL',
                        id: 2,
                        dateRemoved: null
                    },
                    {
                        companyId: 0,
                        dateCreated: null,
                        dateUpdated: null,
                        name: 'APELIDO',
                        id: 3,
                        dateRemoved: null
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
            'form.legalDocument': function(legalDocument){
                this.$refs.legalDocumentInput.display = legalDocument;
            },
            'clientAddress.address.cep': function(cep){
                this.$refs.cepInput.display = cep;
            },
            'clientPhoneForm.number': function(number){
                this.$refs.clientPhoneInput.display = number;
            },
            form: {
                handler: function(form) {
                    this.syncWithParentForm();
                },
                deep: true
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            isCurrentStepActive(){
                return this.activeStep === 'client';
            },
            customFieldsSelectOptions(){
                return _.map(this.customFields, (customField) => {
                    return {
                        text: customField.name,
                        isRemovable: customField.companyId !== 0,
                        value: customField.id
                    }
                });
            },
            selectedClientGroup(){
                return _.find(this.clientGroups, { value: this.form.clientGroup });
            },
            selectedClientAddress(){
                const clientAddress = _.find(this.form.clientAddresses, { id: this.clientAddressId });
                return clientAddress || null;
            },
            selectedClientPhone(){
                const clientPhone = _.find(this.form.clientPhones, { id: this.clientPhoneId });
                return clientPhone || null;
            },
            formatedClientPhone(){
                if(this.selectedClientPhone)
                return utils.formatPhone(this.selectedClientPhone.ddd + this.selectedClientPhone.number);
            },
            shortenedClientName(){
                if(this.form.id)
                return utils.getShortString(this.form.name, 18, '[...]');
            },
            shortenedClientAddress(){
                if(this.selectedClientAddress)
                return utils.getShortString(this.selectedClientAddress.address.name, 24, '[...]') + ', ' + this.selectedClientAddress.number + ' - ' + this.selectedClientAddress.complement;
            }
        },
        sockets: {

            /* draft custom fields */

            draftCustomFieldSave(customField){
                console.log("Received draftCustomFieldSave", customField);
                const customFieldIndex = _.findIndex(this.customFields, { id: customField.id });
                let tCustomField = models.createCustomFieldModel();
                utils.assignToExistentKeys(tCustomField, customField);
                if(customFieldIndex !== -1){ // updating an existent custom field
                    Vue.set(this.customFields, customFieldIndex, tCustomField);
                }
                else { // creating a new custom field
                    this.customFields.push(tCustomField);
                    console.log(this.customFields);
                }
            },

            /* draft client custom fields */

            draftClientCustomFieldUpdate(clientCustomField){
                console.log("Received draftClientCustomFieldUpdate", clientCustomField);
                const clientCustomFieldIndex = _.findIndex(this.form.clientCustomFields, { id: clientCustomField.clientCustomFieldId });
                if(clientCustomFieldIndex !== -1){
                    let tClientCustomField = this.form.clientCustomFields[clientCustomFieldIndex];
                    _.assign(tClientCustomField, {
                        value: clientCustomField.clientCustomFieldForm.value
                    });
                    Vue.set(this.form.clientCustomFields, clientCustomFieldIndex, tClientCustomField)
                }
            },
            draftClientCustomFieldAdd(clientCustomField){
                console.log("Received draftClientCustomFieldAdd", clientCustomField);
                let tClientCustomField = models.createClientCustomFieldModel();
                utils.assignToExistentKeys(tClientCustomField.customField, clientCustomField.customField);
                delete clientCustomField.customField;
                utils.assignToExistentKeys(tClientCustomField, clientCustomField);
                this.form.clientCustomFields.push(tClientCustomField);
                this.updateClientCustomFieldsSelectedOptions();
            },
            draftClientCustomFieldRemove(clientCustomFieldId){
                console.log("Received draftClientCustomFieldRemove", clientCustomFieldId);
                _.forEach(this.form.clientCustomFields, (clientCustomField, index) => {
                    if(_.has(clientCustomField, 'id') && clientCustomField.id === clientCustomFieldId){
                        this.form.clientCustomFields.splice(index, 1);
                    }
                });
                this.updateClientCustomFieldsSelectedOptions(this.form.clientCustomFields);
            },

            /* draft client phone */

            draftClientPhoneEditionCancel(){
                console.log("Received draftClientPhoneEditionCancel");
                this.resetClientPhoneForm();
            },
            draftClientPhoneUpdate(clientPhone){
                if(_.has(clientPhone, 'ddd') && _.has(clientPhone, 'number')){
                    this.clientPhoneForm.number = clientPhone.ddd + clientPhone.number;
                    delete clientPhone.ddd;
                    delete clientPhone.number;
                }
                utils.assignToExistentKeys(this.clientPhoneForm, clientPhone);
            },
            draftClientPhoneSave(clientPhone){
                console.log("Received draftClientPhoneSave", clientPhone);
                const clientPhoneId = _.findIndex(this.form.clientPhones, { id: clientPhone.id });
                if(clientPhoneId >= 0){ // found
                    this.form.clientPhones[clientPhoneId] = clientPhone;
                }
                else {
                    this.form.clientPhones.push(clientPhone);
                }
                this.clientPhoneForm = models.createClientPhoneModel();
            },
            draftClientPhoneEdit(clientPhoneId){
                console.log("Received draftClientPhoneEdit", clientPhoneId);
                let clientPhone = _.find(this.form.clientPhones, {id: clientPhoneId});
                if(clientPhone){
                    clientPhone = utils.removeReactivity(clientPhone);
                    utils.assignToExistentKeys(this.clientPhoneForm, clientPhone);
                    this.clientPhoneForm.number = clientPhone.ddd + clientPhone.number;
                }
            },
            draftClientPhoneRemove(clientPhoneId){
                console.log("Received draftClientPhoneRemove", clientPhoneId);
                const clientPhoneIndex = _.findIndex(this.form.clientPhones, {id: clientPhoneId});
                if(clientPhoneIndex !== -1){
                    this.form.clientPhones.splice(clientPhoneIndex, 1);
                }
            },

            /* draft client address fields */

            draftClientAddressAdd(){
                this.resetClientAddressForm();
                this.isAdding = true;
            },
            draftClientAddressBack(){
                this.isAdding = false;
                this.isEditing = false;
            },
            draftClientAddressEdit(clientAddressId){
                const clientAddress = _.find(this.form.clientAddresses, {id: clientAddressId});
                if(clientAddress){
                    _.assign(this.clientAddressForm, utils.removeReactivity(clientAddress));
                    this.isEditing = true;
                }
            },
            draftClientAddressRemove(clientAddressId){
                const clientAddressIndex = _.findIndex(this.form.clientAddresses, {id: clientAddressId});
                if(clientAddressIndex !== -1){
                    this.form.clientAddresses.splice(clientAddressIndex, 1);
                }
            },

            /* draft client */

            draftClientSelect(data){
                const client = data;
                client.clientPhones.map((clientPhone) => {
                    clientPhone.active = false;
                    return clientPhone;
                });
                client.clientAddresses.map((clientAddress) => {
                    clientAddress.active = false;
                    return clientAddress;
                });
                utils.assignToExistentKeys(this.form, client);
                this.updateClientCustomFieldsSelectedOptions();
            },
            draftClientReset() {
                Object.assign(this.$data.form, this.$options.data.apply(this).form);
                utils.assignToExistentKeys(this.clientPhoneForm, models.createClientPhoneModel());
                utils.assignToExistentKeys(this.clientAddressForm, models.createClientAddressModel());
            }
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

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
                const toBeEmitted = { draftId: this.activeMorphScreen.draft.draftId, clientId: searchItem.client.id};
                this.$socket.emit('draft:client-select', toBeEmitted);
                this.searchItems = [];
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

            // client phone

            selectClientPhone(selectedClientPhone){
                this.$emit('update:clientPhoneId', selectedClientPhone.id);
                this.commitSocketChanges('clientPhoneId');
            },
            cancelClientPhoneEdition(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                };
                console.log("Emitting draft:client-phone-edition-cancel", emitData);
                this.$socket.emit('draft:client-phone-edition-cancel', emitData);
            },
            editClientPhone(clientPhone){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientPhoneId: clientPhone.id
                };
                console.log("Emitting draft:client-phone-edit", emitData);
                this.$socket.emit('draft:client-phone-edit', emitData);
            },
            saveClientPhone(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                };
                console.log("Emitting draft:client-phone-save", emitData);
                this.$socket.emit('draft:client-phone-save', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            },
            removeClientPhone(clientPhone){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientPhoneId: clientPhone.id
                };
                console.log("Emitting draft:client-phone-remove", emitData);
                this.$socket.emit('draft:client-phone-remove', emitData);
            },

            // client address

            backToClientAddressesList(){
                this.$socket.emit('draft:client-address-back', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            },
            addClientAddress(){
                this.$socket.emit('draft:client-address-add', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            },
            editClientAddress(clientAddress){
                this.$socket.emit('draft:client-address-edit', {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientAddressId: clientAddress.id
                });
            },
            removeClientAddress(clientAddress){
                this.$socket.emit('draft:client-address-remove', {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientAddressId: clientAddress.id
                });
            },
            saveClientAddress(){
                this.$refs.clientAddressForm.save();
            },

            // custom fields

            removeCustomField(customFieldId){
                console.log(customFieldId);
            },

            // client custom fields

            updateClientCustomFieldsSelectedOptions(){
                this.form.clientSelectedCustomFields = _.map(this.form.clientCustomFields, (clientCustomField) => {
                    return clientCustomField.customField.id
                });
            },

            /**
             * Events / Parent component callbacks
             */

            // client address

            onClientAddressSelected(selectedClientAddress){
                this.$emit('update:clientAddressId', selectedClientAddress.id);
                this.commitSocketChanges('clientAddressId');
            },
            onClientAddressSave(clientAddress){
                const clientAddressId = _.findIndex(this.form.clientAddresses, {id: clientAddress.id});
                if (clientAddressId !== -1) {
                    this.form.clientAddresses[clientAddressId] = clientAddress;
                }
                else {
                    this.form.clientAddresses.push(clientAddress);
                }
                this.backToClientAddressesList();
            },

            // custom fields

            onCustomFieldSave(name){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    name: name
                };
                console.log("Emitting draft:custom-field-save", emitData);
                this.$socket.emit('draft:custom-field-save', emitData);
            },

            // client custom fields

            onClientCustomFieldSelect(customFieldId){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    customFieldId: customFieldId
                };
                console.log("Emitting draft:client-custom-field-add", emitData);
                this.$socket.emit('draft:client-custom-field-add', emitData);
            },
            onClientCustomFieldUnselect(customFieldId){
                const clientCustomField = _.find(this.form.clientCustomFields, (clientCustomField) => {
                    if(clientCustomField.customField.id === customFieldId) return true;
                });
                if(clientCustomField){
                    const emitData = {
                        draftId: this.activeMorphScreen.draft.draftId,
                        clientCustomFieldId: clientCustomField.id
                    };
                    console.log("Emitting draft:client-custom-field-remove", emitData);
                    this.$socket.emit('draft:client-custom-field-remove', emitData);
                }

            },
            onClientCustomFieldInput(clientCustomField){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    clientCustomFieldId: clientCustomField.id,
                    clientCustomFieldForm: {
                        value: clientCustomField.value
                    }
                };
                console.log("Emitting draft:client-custom-field-update", emitData);
                this.$socket.emit('draft:client-custom-field-update', emitData);
            },

            /**
             * Resets
             */

            resetForm(){
                this.resetClientForm();
                this.resetClientAddressForm();
            },
            resetClientForm(){
                this.$socket.emit('draft:client-reset', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            },
            resetClientPhoneForm(){
                this.clientPhoneForm = models.createClientPhoneModel();
            },
            resetClientAddressForm(){
                this.clientAddressForm = models.createClientAddressModel();
            },

            /**
             * Real-time
             */

            commitTrustedSocketChanges(ev, mapping){
                if(ev.isTrusted){
                    setImmediate(() => {
                        this.commitSocketChanges(mapping);
                    });
                }
            },
            onCurrentStepChanged(){
                (this.activeStep === 'client') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'client');
                this.commitSocketChanges('activeStep');
            },
            syncWithParentForm(){
                this.$emit('update:client', this.form);
            },
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            },

            // client phone

            getIsolatedClientPhoneFormPathObj(path){
                return _.set({}, path, _.get(this.clientPhoneForm, path));
            },
            syncClientPhoneTrustedEvent(ev, mapping){
                if(ev.isTrusted){
                    setImmediate(() => {
                        this.syncClientPhoneForm(mapping);
                    });
                }
            },
            syncClientPhoneForm(mapping){
                if(mapping === 'number'){
                    const clientPhone = utils.getDDDAndNumber(this.clientPhoneForm.number);
                    const emitData = {
                        draftId: this.activeMorphScreen.draft.draftId,
                        clientPhoneId: this.clientPhoneForm.id || null,
                        clientPhoneForm: {
                            ddd: clientPhone.ddd,
                            number: clientPhone.number || null
                        }
                    };
                    console.log("Emitting draft:client-phone-update", emitData);
                    this.$socket.emit("draft:client-phone-update", emitData);
                }
                else {
                    const emitData = {
                        draftId: this.activeMorphScreen.draft.draftId,
                        clientPhoneId: this.clientPhoneForm.id || null,
                        clientPhoneForm: this.getIsolatedClientPhoneFormPathObj(mapping)
                    };
                    console.log("Emitting draft:client-phone-update", emitData);
                    this.$socket.emit("draft:client-phone-update", emitData);
                }
            },
        },
        mounted(){
            this.syncWithParentForm();
            this.$bus.$on('draft:update', ({draftId, form}) => {
                if(this.activeMorphScreen.draft.draftId === draftId){
                    const client = form.client;
                    this.form.clientSelectedCustomFields = _.map(client.clientCustomFields, (clientCustomField) => {
                        return clientCustomField.customField.id
                    });
                }
            })
        }
    }
</script>

<style scoped>

    .form__header.summary {
        height: auto;
    }

    .form__header.summary >>> .colorizable {
        fill: var(--font-color--2);
    }

    .form__header.summary span {
        text-transform: uppercase;
        margin-right: 10px;
        color: var(--font-color--8)
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
