<template>
    <div style="display: flex; flex-grow: 1; flex-direction: row">
        <div class="form__main-column">
            <!-- client name and document -->
            <div class="form-groups">
                <div class="form-group">
                    <div class="form-columns">
                        <div class="form-column" style="flex-grow: 1;">
                            Nome / Empresa
                            <div v-if="false">
                                <input type="text" class="input--borderless" style="color: var(--font-color--primary)" v-model="form.name" v-if="client.id" placeholder="..." />
                            </div>
                            <app-search v-else ref="search" :items="search.items" :shouldStayOpen="search.isNameInputFocused" :query="search.query" :verticalOffset="5" :horizontalOffset="-20"
                                @itemSelected="searchMethods().searchClientSelected($event)" >
                                <input type="text" class="input--borderless search-input__field" placeholder="..." v-model="form.name" @input="sync(form.name, 'name')" ref="searchInput"
                                @keydown="searchMethods().searchValueUpdated()" @focus="search.isNameInputFocused = true" @blur="search.isNameInputFocused = false" />
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
                            <icon-search v-if="false" style="position: relative; top: -4px;"></icon-search>
                            <div style="cursor: pointer;" @click="changeClient()" v-else>
                                <icon-change></icon-change>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    CPF / CNPJ
                    <app-mask class="input--borderless" ref="legalDocumentInput" :mask="['###.###.###-##', '##.###.###/####-##']" v-model="form.legalDocument"
                    placeholder="..." @input.native="inputLegalDocument($event)" />
                </div>
            </div>
            <div class="form-groups">
                <!-- Show client address form -->
                <app-client-address-form ref="clientAddressForm" :data="data" @save="onClientAddressSave($event)"></app-client-address-form>
            </div>
        </div>
        <div class="form__side-column">
            <app-client-phone-form :data="data"></app-client-phone-form>
            <!--
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
            -->
            <!--
            <div class="form-groups">
                <app-client-group-form :clientGroup="client.clientGroup" :data="data"></app-client-group-form>
            </div>
            -->
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash'
    import utils from '@/utils'
    import models from '@/models'
    import DraftMixin from '../../DraftMixin'
    import ClientAddressForm from './ClientAddressForm.vue'
    import ClientPhoneForm from './ClientPhoneForm.vue'
    import ClientGroupForm from './ClientGroupForm.vue'
    import SearchComponent from '@/components/Inputs/Search.vue'
    import ClientAddressTypesInput from './ClientAddressTypesInput.vue'
    import ServiceAPI from '@/api/service'
    import Vue from 'vue'

    export default {
        components: {
            'app-search': SearchComponent,
            'app-client-address-form': ClientAddressForm,
            'app-client-address-types-input': ClientAddressTypesInput,
            'app-client-phone-form': ClientPhoneForm,
            'app-client-group-form': ClientGroupForm
        },
        props: ['data','clientAddressId','clientPhoneId'],
        mixins: [DraftMixin],
        data(){
            return {
                search: {
                    items: [],
                    isNameInputFocused: false,
                    query: '',
                    lastQuery: '',
                    commitTimeout: null
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
                form: {
                    name: '',
                    legalDocument: ''
                },
                formPath: 'request.client'
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
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            /*isCurrentStepActive(){
                return this.client.activeStep === 'client';
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
                return _.find(this.clientGroups, { value: this.client.clientGroup });
            },
            selectedClientAddress(){
                const clientAddress = _.find(this.client.clientAddresses, { id: this.clientAddressId });
                return clientAddress || null;
            },
            selectedClientPhone(){
                const clientPhone = _.find(this.client.clientPhones, { id: this.clientPhoneId });
                return clientPhone || null;
            },
            formatedClientPhone(){
                if(this.selectedClientPhone)
                return utils.formatPhone(this.selectedClientPhone.ddd + this.selectedClientPhone.number);
            },
            shortenedClientName(){
                if(this.client.id)
                return utils.getShortString(this.client.name, 18, '[...]');
            },
            shortenedClientAddress(){
                if(this.selectedClientAddress)
                return utils.getShortString(this.selectedClientAddress.address.name, 24, '[...]') + ', ' + this.selectedClientAddress.number + ' - ' + this.selectedClientAddress.complement;
            }*/
        },
        sockets: {
            /*/!* draft custom fields *!/

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

            /!* draft client custom fields *!/

            draftClientCustomFieldUpdate(clientCustomField){
                console.log("Received draftClientCustomFieldUpdate", clientCustomField);
                const clientCustomFieldIndex = _.findIndex(this.client.clientCustomFields, { id: clientCustomField.clientCustomFieldId });
                if(clientCustomFieldIndex !== -1){
                    let tClientCustomField = this.client.clientCustomFields[clientCustomFieldIndex];
                    _.assign(tClientCustomField, {
                        value: clientCustomField.clientCustomFieldForm.value
                    });
                    Vue.set(this.client.clientCustomFields, clientCustomFieldIndex, tClientCustomField)
                }
            },
            draftClientCustomFieldAdd(clientCustomField){
                console.log("Received draftClientCustomFieldAdd", clientCustomField);
                let tClientCustomField = models.createClientCustomFieldModel();
                utils.assignToExistentKeys(tClientCustomField.customField, clientCustomField.customField);
                delete clientCustomField.customField;
                utils.assignToExistentKeys(tClientCustomField, clientCustomField);
                this.client.clientCustomFields.push(tClientCustomField);
                this.updateClientCustomFieldsSelectedOptions();
            },
            draftClientCustomFieldRemove(clientCustomFieldId){
                console.log("Received draftClientCustomFieldRemove", clientCustomFieldId);
                _.forEach(this.client.clientCustomFields, (clientCustomField, index) => {
                    if(_.has(clientCustomField, 'id') && clientCustomField.id === clientCustomFieldId){
                        this.client.clientCustomFields.splice(index, 1);
                    }
                });
                this.updateClientCustomFieldsSelectedOptions(this.client.clientCustomFields);
            },

            /!* draft client phone *!/

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
                const clientPhoneId = _.findIndex(this.client.clientPhones, { id: clientPhone.id });
                if(clientPhoneId >= 0){ // found
                    this.client.clientPhones[clientPhoneId] = clientPhone;
                }
                else {
                    this.client.clientPhones.push(clientPhone);
                }
                this.clientPhoneForm = models.createClientPhoneModel();
            },
            draftClientPhoneEdit(clientPhoneId){
                console.log("Received draftClientPhoneEdit", clientPhoneId);
                let clientPhone = _.find(this.client.clientPhones, {id: clientPhoneId});
                if(clientPhone){
                    clientPhone = utils.removeReactivity(clientPhone);
                    utils.assignToExistentKeys(this.clientPhoneForm, clientPhone);
                    this.clientPhoneForm.number = clientPhone.ddd + clientPhone.number;
                }
            },
            draftClientPhoneRemove(clientPhoneId){
                console.log("Received draftClientPhoneRemove", clientPhoneId);
                const clientPhoneIndex = _.findIndex(this.client.clientPhones, {id: clientPhoneId});
                if(clientPhoneIndex !== -1){
                    this.client.clientPhones.splice(clientPhoneIndex, 1);
                }
            },

            /!* draft client address fields *!/

            draftClientAddressAdd(){
                this.resetClientAddressForm();
                this.isAdding = true;
            },
            draftClientAddressBack(){
                this.isAdding = false;
                this.isEditing = false;
            },
            draftClientAddressEdit(clientAddressId){
                const clientAddress = _.find(this.client.clientAddresses, {id: clientAddressId});
                if(clientAddress){
                    _.assign(this.clientAddressForm, utils.removeReactivity(clientAddress));
                    this.isEditing = true;
                }
            },
            draftClientAddressRemove(clientAddressId){
                const clientAddressIndex = _.findIndex(this.client.clientAddresses, {id: clientAddressId});
                if(clientAddressIndex !== -1){
                    this.client.clientAddresses.splice(clientAddressIndex, 1);
                }
            },

            /!* draft client *!/

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
                utils.assignToExistentKeys(this.client, client);
                this.updateClientCustomFieldsSelectedOptions();
            },
            draftClientReset() {
                Object.assign(this.$data.client, this.$options.data.apply(this).client);
                utils.assignToExistentKeys(this.clientPhoneForm, models.createClientPhoneModel());
                utils.assignToExistentKeys(this.clientAddressForm, models.createClientAddressModel());
            }*/
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            /**
             * Search
             */

            searchMethods(){
                const vm = this
                return {
                    search() {
                        ServiceAPI.search({
                            actingCities: ['MARINGA'],
                            q: vm.search.query,
                            companyId: vm.company.id
                        }).then(({data}) => {
                            let clients = data[0];
                            vm.search.items = clients.map(({source}) => {
                                // source refers to search address item
                                return {
                                    client: source
                                }
                            })
                            vm.$refs.search.search()
                        }).catch((err) => {
                            vm.search.items = []
                        })
                    },
                    searchClientSelected(searchItem) {
                        vm.search.items = [];
                        const emitData = {
                            draftId: vm.activeMorphScreen.draft.draftId,
                            clientId: searchItem.client.id
                        }
                        console.log("Emitting to draft/request.client.select", emitData)
                        vm.$socket.emit('draft/request.client.select', emitData)
                    },
                    searchValueUpdated() {
                        if (vm.search.commitTimeout) clearTimeout(vm.search.commitTimeout);
                        vm.search.commitTimeout = setTimeout(() => {
                            vm.search.query = vm.form.name;
                            vm.searchMethods().commitUpdatedValue()
                        }, 300)
                    },
                    commitUpdatedValue() {
                        if (vm.search.query.trim() !== vm.search.lastQuery) {
                            vm.search.lastQuery = vm.search.query.trim()
                            vm.searchMethods().search()
                        }
                    }
                }
            },

            /**
             * Inputs
             */

            inputLegalDocument(ev){
                if(ev.isTrusted){
                    this.sync(this.form.legalDocument, 'legalDocument')
                }
            },

            /**
             * Actions
             */

            addClientAddress(){
                const vm = this
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    showClientAddressForm: true
                }
                console.log("Emitting to draft/request.client.showClientAddressForm", emitData)
                vm.$socket.emit('draft/request.client.showClientAddressForm', emitData)
            },
            changeClient(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting to draft/request.client.reset", emitData)
                this.$socket.emit('draft/request.client.reset', emitData)
            },

            // client address

            backToClientAddressesList(){
                this.$socket.emit('draft:client-address-back', {
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
                this.client.clientSelectedCustomFields = _.map(this.client.clientCustomFields, (clientCustomField) => {
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
                const clientAddressId = _.findIndex(this.client.clientAddresses, {id: clientAddress.id});
                if (clientAddressId !== -1) {
                    this.client.clientAddresses[clientAddressId] = clientAddress;
                }
                else {
                    this.client.clientAddresses.push(clientAddress);
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
                const clientCustomField = _.find(this.client.clientCustomFields, (clientCustomField) => {
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
            }
        },
        created(){
            const vm = this
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
