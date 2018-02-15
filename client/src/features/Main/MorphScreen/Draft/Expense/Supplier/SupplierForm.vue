<template>
    <form :class="{'active': isCurrentStepActive}">
        <div class="form__content" v-show="isCurrentStepActive">
            <div class="form__main-column">
                <!-- supplier name and document -->
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-columns">
                            <div class="form-column" style="flex-grow: 1;">
                                Nome / Empresa
                                <div v-if="supplier.id"> <!-- unassociate supplier -->
                                    <input type="text" class="input--borderless" style="color: var(--font-color--primary)"
                                    v-model="supplier.name" v-if="supplier.id" placeholder="..." @input="commitSocketChanges('supplier.name')" />
                                </div>
                                <app-search v-else ref="search" :items="searchItems" :shouldStayOpen="isNameInputFocused" :query="query" :verticalOffset="5" :horizontalOffset="-20"
                                    @itemSelected="searchClientSelected($event)" >
                                    <input type="text" class="input--borderless search-input__field" placeholder="..." v-model="supplier.name" ref="searchInput"
                                    @keydown="searchValueUpdated()" @focus="isNameInputFocused = true" @blur="isNameInputFocused = false" @input="commitSocketChanges('supplier.name')" />
                                    <template slot="item" slot-scope="props">
                                        <div class="search-input__item" v-if="props.item.supplier">
                                            <span class="detail__name" v-html="props.item.supplier.name"></span>
                                            <span class="detail__address" v-if="props.item.supplier.address" v-html="props.item.supplier.address.address + ', ' + props.item.supplier.address.number"></span>
                                            <span class="detail__phones" v-if="props.item.supplier.phones.length > 0">
                                            <span v-for="(supplierPhone, index) in props.item.supplier.phones"
                                                v-html="((index === 0) ? '' : ', ') + supplierPhone.ddd + supplierPhone.number"></span>
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
                                <icon-search v-if="!supplier.id" style="position: relative; top: -4px;"></icon-search>
                                <div style="cursor: pointer;" @click="changeClient()" v-else>
                                    <icon-change></icon-change>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        CPF / CNPJ
                        <app-mask class="input--borderless" ref="legalDocumentInput" :mask="['###.###.###-##', '##.###.###/####-##']" v-model="form.legalDocument"
                        placeholder="..." @input.native="commitTrustedSocketChanges($event,'supplier.legalDocument')" />
                    </div>
                </div>
                <!-- supplier addresses -->
                <div class="form-groups">
                    <div class="form-group" v-if="isEditing || isAdding || form.supplierAddresses.length <= 0">
                        <div class="form-group__header">
                            <!-- previous implementation - shows the supplier address name/number
                            <h3 style="margin-right: 10px; color: var(--font-color--2);" v-if="isEditing && !supplierAddressForm.address.id">Editando endereço...</h3>
                            <h3 style="margin-right: 10px; color: var(--font-color--2);" v-else-if="isEditing">
                                {{ supplierAddressForm.address.name + ', ' + supplierAddressForm.number }}
                            </h3>
                            -->
                            <div style="display: flex; flex-direction: row;" v-if="isEditing">
                                <span style="margin-right: 10px;">Tipo do local</span>
                                <icon-local></icon-local>
                            </div>
                            <div style="display: flex; flex-direction: row;" v-else>
                                <span style="margin-right: 10px;">Selecione um local</span>
                                <icon-local></icon-local>
                            </div>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only" v-if="form.supplierAddresses.length > 0" @click="backToClientAddressesList()">Voltar</a>
                            <div v-if="form.supplierAddresses.length <= 0">
                                <a class="btn btn--primary" @click="saveClientAddress()" v-if="!isSavingClientAddress" style="margin-left: 10px;">Adicionar</a>
                                <a class="btn btn--primary btn--disabled" v-else style="margin-left: 10px;">Adicionar</a>
                            </div>
                            <div v-else>
                                <a class="btn btn--primary" @click="saveClientAddress()" v-if="!isSavingClientAddress" style="margin-left: 10px;">Salvar</a>
                                <a class="btn btn--primary btn--disabled" v-else style="margin-left: 10px;">Salvar</a>
                            </div>
                        </div>
                        <div class="form-group__content">
                            <!--<app-supplier-address-form ref="supplierAddressForm" :supplierId="supplier.id" :supplierAddress.sync="supplierAddressForm" :isSaving.sync="isSavingClientAddress"
                            @save="onClientAddressSave($event)"></app-supplier-address-form>-->
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
                                <li class="list__item" v-for="supplierAddress in form.supplierAddresses" :class="{ active: supplierAddressId === supplierAddress.id }">
                                    <span style="cursor: pointer;" @click="onClientAddressSelected(supplierAddress)">
                                        {{ supplierAddress.address.name }},
                                        {{ supplierAddress.number.toString().trim() || "SN" }}
                                    </span>
                                    <span class="push-both-sides"></span>
                                    <div class="item__check item__icon" @click="onClientAddressSelected(supplierAddress)" style="cursor: pointer; margin-right: 10px;">
                                        <icon-check style="width: 16px;"></icon-check>
                                    </div>
                                    <div class="item__icon" @click="editClientAddress(supplierAddress)" style="cursor: pointer; margin-right: 10px;">
                                        <icon-edit></icon-edit>
                                    </div>
                                    <div class="item__icon" @click="removeClientAddress(supplierAddress)" style="cursor: pointer;">
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
                            <app-mask :mask="['(##) ####-####','(##) #####-####']" class="input--borderless" ref="supplierPhoneInput" v-model="supplierPhoneForm.number"
                                      @input.native="syncClientPhoneTrustedEvent($event, 'number')" placeholder="(##) #####-####"></app-mask>
                            <div class="header__mini-circle"></div>
                            <input type="text" v-model="supplierPhoneForm.name" @input="syncClientPhoneForm('name')" class="input--borderless" placeholder="fixo ou celular" />
                            <span class="push-both-sides"></span>
                            <div style="cursor: pointer; margin-right: 8px;" @click="cancelClientPhoneEdition()" v-if="supplierPhoneForm.id">
                                <a style="font-size: 15px; font-weight: 600; color: var(--base-color); position: relative; top: -2px;">V</a>
                            </div>
                            <div style="cursor: pointer;" @click="saveClientPhone()">
                                <icon-add class="header__action-icon" v-if="!supplierPhoneForm.id"></icon-add>
                                <a v-else style="font-size: 15px; font-weight: 600; color: var(--base-color); position: relative; top: -2px;">S</a>
                            </div>
                        </div>
                        <div class="form-group__content">
                            <ul class="content__list--mini" v-if="form.supplierPhones && form.supplierPhones.length > 0">
                                <li class="list__item" v-for="supplierPhone in form.supplierPhones" :class="{ active: supplierPhoneId === supplierPhone.id }">
                                    <div class="item__check" @click="selectClientPhone(supplierPhone)" style="margin-right: 10px; cursor: pointer;">
                                        <icon-check></icon-check>
                                    </div>
                                    <span style="cursor: pointer;" @click="selectClientPhone(supplierPhone)">({{ supplierPhone.ddd }}) {{ supplierPhone.number }}</span>
                                    <div class="item__mini-circle"></div>
                                    <span>{{ supplierPhone.name }}</span>
                                    <span class="push-both-sides"></span>
                                    <div class="item__icon" @click="editClientPhone(supplierPhone)" style="cursor: pointer; margin-right: 10px;">
                                        <icon-edit></icon-edit>
                                    </div>
                                    <div @click="removeClientPhone(supplierPhone)" style="display: flex; cursor: pointer;">
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
                        <app-select class="form-group__header" :verticalOffset="8" :items="customFieldsSelectOptions" v-model="form.supplierSelectedCustomFields"
                            :multiple="true" :showInput="true" @select="onClientCustomFieldSelect($event)" @unselect="onClientCustomFieldUnselect($event)"
                            @save="onCustomFieldSave($event)">
                            <div class="header__icon">
                                <icon-supplier-details></icon-supplier-details>
                            </div>
                            <span class="static">Informações adicionais</span>
                            <span class="push-both-sides"></span>
                            <icon-dropdown class="header__action-icon" v-if="form.supplierCustomFields && form.supplierCustomFields.length >= 0"></icon-dropdown>
                            <icon-add class="header__action-icon" v-else></icon-add>
                            <template slot="item" slot-scope="itemProps">
                                <span>{{itemProps.text }}</span>
                                <div style="margin-left: 8px;" v-if="itemProps.isRemovable" @click="removeCustomField(itemProps.value)">
                                    <icon-remove></icon-remove>
                                </div>
                            </template>
                        </app-select>
                        <div class="form-group__content" v-if="form.supplierCustomFields && form.supplierCustomFields.length > 0">
                            <ul class="content__list--mini">
                                <li class="list__item" v-for="supplierCustomField in form.supplierCustomFields">
                                    <span style="white-space: nowrap">{{ supplierCustomField.customField.name }}</span>
                                    <div class="item__mini-circle"></div>
                                    <input type="text" placeholder="..." v-model="supplierCustomField.value" @input="onClientCustomFieldInput(supplierCustomField)" class="input--borderless" />
                                    <span class="push-both-sides"></span>
                                    <icon-remove style="flex-shrink: 0;"></icon-remove>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form__header" v-if="!isCurrentStepActive && supplier.id" :class="{'summary': !isCurrentStepActive && supplier.id}">
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
                <div class="form-column" style="flex-grow: initial; flex-direction: row; align-items: center;">
                    <h3 style="top: 0;">Cliente</h3> <app-switch style="float: right;" :value="isCurrentStepActive" @change="onCurrentStepChanged()"></app-switch>
                </div>
            </div>
        </div>
        <div class="form__header" v-else>
            <span v-if="!isCurrentStepActive">Incluir um <span style="color: var(--primary-color)">fornecedor</span> neste atendimento</span>
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
    import SupplierAddressForm from './SupplierAddressForm.vue';
    import SearchComponent from '@/components/Inputs/Search.vue';
    import ClientsAPI from '@/api/clients';
    import ServiceAPI from '@/api/service';
    import Vue from 'vue';

    export default {
        components: {
            'app-search': SearchComponent,
            'app-supplier-address-form': SupplierAddressForm,
        },
        props: ['supplier','activeStep','supplierAddressId','supplierPhoneId'],
        data(){
            return {
                lastQuery: '',
                query: '',
                isNameInputFocused: false,
                isAdding: false,
                isEditing: false,
                isSavingClientAddress: false,
                supplierPhoneForm: {
                    id: null,
                    name: null,
                    number: null
                },
                selectedClientAddressId: null,
                supplierAddressForm: {
                    id: null,
                    name: null,
                    number: null,
                    complement: null,
                    supplierAddressTypes: [],
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
                    id: null, // se passar, atualizar suppliere. se não, criar.
                    name: '', // se passar e tiver id, atualizar. se não, criar.
                    legalDocument: '', // cpf, cnpj
                    supplierGroup: null,
                    supplierSelectedCustomFields: [],
                    supplierCustomFields: [],
                    supplierAddresses: [],
                    supplierPhones: [],
                    supplierAddressName: null
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
                supplierGroups: [
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
            'supplierAddress.address.cep': function(cep){
                this.$refs.cepInput.display = cep;
            },
            'supplierPhoneForm.number': function(number){
                this.$refs.supplierPhoneInput.display = number;
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
                return this.activeStep === 'supplier';
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
                return _.find(this.supplierGroups, { value: this.form.supplierGroup });
            },
            selectedClientAddress(){
                const supplierAddress = _.find(this.form.supplierAddresses, { id: this.supplierAddressId });
                return supplierAddress || null;
            },
            selectedClientPhone(){
                const supplierPhone = _.find(this.form.supplierPhones, { id: this.supplierPhoneId });
                return supplierPhone || null;
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

            /* draft supplier custom fields */

            draftClientCustomFieldUpdate(supplierCustomField){
                console.log("Received draftClientCustomFieldUpdate", supplierCustomField);
                const supplierCustomFieldIndex = _.findIndex(this.form.supplierCustomFields, { id: supplierCustomField.supplierCustomFieldId });
                if(supplierCustomFieldIndex !== -1){
                    let tClientCustomField = this.form.supplierCustomFields[supplierCustomFieldIndex];
                    _.assign(tClientCustomField, {
                        value: supplierCustomField.supplierCustomFieldForm.value
                    });
                    Vue.set(this.form.supplierCustomFields, supplierCustomFieldIndex, tClientCustomField)
                }
            },
            draftClientCustomFieldAdd(supplierCustomField){
                console.log("Received draftClientCustomFieldAdd", supplierCustomField);
                let tClientCustomField = models.createClientCustomFieldModel();
                utils.assignToExistentKeys(tClientCustomField.customField, supplierCustomField.customField);
                delete supplierCustomField.customField;
                utils.assignToExistentKeys(tClientCustomField, supplierCustomField);
                this.form.supplierCustomFields.push(tClientCustomField);
                this.updateClientCustomFieldsSelectedOptions();
            },
            draftClientCustomFieldRemove(supplierCustomFieldId){
                console.log("Received draftClientCustomFieldRemove", supplierCustomFieldId);
                _.forEach(this.form.supplierCustomFields, (supplierCustomField, index) => {
                    if(_.has(supplierCustomField, 'id') && supplierCustomField.id === supplierCustomFieldId){
                        this.form.supplierCustomFields.splice(index, 1);
                    }
                });
                this.updateClientCustomFieldsSelectedOptions(this.form.supplierCustomFields);
            },

            /* draft supplier phone */

            draftClientPhoneEditionCancel(){
                console.log("Received draftClientPhoneEditionCancel");
                this.resetClientPhoneForm();
            },
            draftClientPhoneUpdate(supplierPhone){
                if(_.has(supplierPhone, 'ddd') && _.has(supplierPhone, 'number')){
                    this.supplierPhoneForm.number = supplierPhone.ddd + supplierPhone.number;
                    delete supplierPhone.ddd;
                    delete supplierPhone.number;
                }
                utils.assignToExistentKeys(this.supplierPhoneForm, supplierPhone);
            },
            draftClientPhoneSave(supplierPhone){
                console.log("Received draftClientPhoneSave", supplierPhone);
                const supplierPhoneId = _.findIndex(this.form.supplierPhones, { id: supplierPhone.id });
                if(supplierPhoneId >= 0){ // found
                    this.form.supplierPhones[supplierPhoneId] = supplierPhone;
                }
                else {
                    this.form.supplierPhones.push(supplierPhone);
                }
                this.supplierPhoneForm = models.createClientPhoneModel();
            },
            draftClientPhoneEdit(supplierPhoneId){
                console.log("Received draftClientPhoneEdit", supplierPhoneId);
                let supplierPhone = _.find(this.form.supplierPhones, {id: supplierPhoneId});
                if(supplierPhone){
                    supplierPhone = utils.removeReactivity(supplierPhone);
                    utils.assignToExistentKeys(this.supplierPhoneForm, supplierPhone);
                    this.supplierPhoneForm.number = supplierPhone.ddd + supplierPhone.number;
                }
            },
            draftClientPhoneRemove(supplierPhoneId){
                console.log("Received draftClientPhoneRemove", supplierPhoneId);
                const supplierPhoneIndex = _.findIndex(this.form.supplierPhones, {id: supplierPhoneId});
                if(supplierPhoneIndex !== -1){
                    this.form.supplierPhones.splice(supplierPhoneIndex, 1);
                }
            },

            /* draft supplier address fields */

            draftClientAddressAdd(){
                this.resetClientAddressForm();
                this.isAdding = true;
            },
            draftClientAddressBack(){
                this.isAdding = false;
                this.isEditing = false;
            },
            draftClientAddressEdit(supplierAddressId){
                const supplierAddress = _.find(this.form.supplierAddresses, {id: supplierAddressId});
                if(supplierAddress){
                    _.assign(this.supplierAddressForm, utils.removeReactivity(supplierAddress));
                    this.isEditing = true;
                }
            },
            draftClientAddressRemove(supplierAddressId){
                const supplierAddressIndex = _.findIndex(this.form.supplierAddresses, {id: supplierAddressId});
                if(supplierAddressIndex !== -1){
                    this.form.supplierAddresses.splice(supplierAddressIndex, 1);
                }
            },

            /* draft supplier */

            draftClientSelect(data){
                const supplier = data;
                supplier.supplierPhones.map((supplierPhone) => {
                    supplierPhone.active = false;
                    return supplierPhone;
                });
                supplier.supplierAddresses.map((supplierAddress) => {
                    supplierAddress.active = false;
                    return supplierAddress;
                });
                utils.assignToExistentKeys(this.form, supplier);
                this.updateClientCustomFieldsSelectedOptions();
            },
            draftClientReset() {
                Object.assign(this.$data.form, this.$options.data.apply(this).form);
                utils.assignToExistentKeys(this.supplierPhoneForm, models.createClientPhoneModel());
                utils.assignToExistentKeys(this.supplierAddressForm, models.createClientAddressModel());
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
                    let suppliers = data[0];
                    vm.searchItems = suppliers.map(({source}) => {
                        // source refers to search address item
                        return {
                            supplier: source
                        };
                    });
                    vm.$refs.search.search();
                }).catch((err) => {
                    vm.searchItems = [];
                })
            },
            searchClientSelected(searchItem){
                const toBeEmitted = { draftId: this.activeMorphScreen.draft.draftId, supplierId: searchItem.supplier.id};
                this.$socket.emit('draft:supplier-select', toBeEmitted);
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

            // supplier phone

            selectClientPhone(selectedClientPhone){
                this.$emit('update:supplierPhoneId', selectedClientPhone.id);
                this.commitSocketChanges('supplierPhoneId');
            },
            cancelClientPhoneEdition(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                };
                console.log("Emitting draft:supplier-phone-edition-cancel", emitData);
                this.$socket.emit('draft:supplier-phone-edition-cancel', emitData);
            },
            editClientPhone(supplierPhone){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    supplierPhoneId: supplierPhone.id
                };
                console.log("Emitting draft:supplier-phone-edit", emitData);
                this.$socket.emit('draft:supplier-phone-edit', emitData);
            },
            saveClientPhone(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                };
                console.log("Emitting draft:supplier-phone-save", emitData);
                this.$socket.emit('draft:supplier-phone-save', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            },
            removeClientPhone(supplierPhone){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    supplierPhoneId: supplierPhone.id
                };
                console.log("Emitting draft:supplier-phone-remove", emitData);
                this.$socket.emit('draft:supplier-phone-remove', emitData);
            },

            // supplier address

            backToClientAddressesList(){
                this.$socket.emit('draft:supplier-address-back', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            },
            addClientAddress(){
                this.$socket.emit('draft:supplier-address-add', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            },
            editClientAddress(supplierAddress){
                this.$socket.emit('draft:supplier-address-edit', {
                    draftId: this.activeMorphScreen.draft.draftId,
                    supplierAddressId: supplierAddress.id
                });
            },
            removeClientAddress(supplierAddress){
                this.$socket.emit('draft:supplier-address-remove', {
                    draftId: this.activeMorphScreen.draft.draftId,
                    supplierAddressId: supplierAddress.id
                });
            },
            saveClientAddress(){
                this.$refs.supplierAddressForm.save();
            },

            // custom fields

            removeCustomField(customFieldId){
                console.log(customFieldId);
            },

            // supplier custom fields

            updateClientCustomFieldsSelectedOptions(){
                this.form.supplierSelectedCustomFields = _.map(this.form.supplierCustomFields, (supplierCustomField) => {
                    return supplierCustomField.customField.id
                });
            },

            /**
             * Events / Parent component callbacks
             */

            // supplier address

            onClientAddressSelected(selectedClientAddress){
                this.$emit('update:supplierAddressId', selectedClientAddress.id);
                this.commitSocketChanges('supplierAddressId');
            },
            onClientAddressSave(supplierAddress){
                const supplierAddressId = _.findIndex(this.form.supplierAddresses, {id: supplierAddress.id});
                if (supplierAddressId !== -1) {
                    this.form.supplierAddresses[supplierAddressId] = supplierAddress;
                }
                else {
                    this.form.supplierAddresses.push(supplierAddress);
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

            // supplier custom fields

            onClientCustomFieldSelect(customFieldId){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    customFieldId: customFieldId
                };
                console.log("Emitting draft:supplier-custom-field-add", emitData);
                this.$socket.emit('draft:supplier-custom-field-add', emitData);
            },
            onClientCustomFieldUnselect(customFieldId){
                const supplierCustomField = _.find(this.form.supplierCustomFields, (supplierCustomField) => {
                    if(supplierCustomField.customField.id === customFieldId) return true;
                });
                if(supplierCustomField){
                    const emitData = {
                        draftId: this.activeMorphScreen.draft.draftId,
                        supplierCustomFieldId: supplierCustomField.id
                    };
                    console.log("Emitting draft:supplier-custom-field-remove", emitData);
                    this.$socket.emit('draft:supplier-custom-field-remove', emitData);
                }

            },
            onClientCustomFieldInput(supplierCustomField){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    supplierCustomFieldId: supplierCustomField.id,
                    supplierCustomFieldForm: {
                        value: supplierCustomField.value
                    }
                };
                console.log("Emitting draft:supplier-custom-field-update", emitData);
                this.$socket.emit('draft:supplier-custom-field-update', emitData);
            },

            /**
             * Resets
             */

            resetForm(){
                this.resetClientForm();
                this.resetClientAddressForm();
            },
            resetClientForm(){
                this.$socket.emit('draft:supplier-reset', {
                    draftId: this.activeMorphScreen.draft.draftId
                });
            },
            resetClientPhoneForm(){
                this.supplierPhoneForm = models.createClientPhoneModel();
            },
            resetClientAddressForm(){
                this.supplierAddressForm = models.createClientAddressModel();
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
                (this.activeStep === 'supplier') ? this.$emit('update:activeStep', null) : this.$emit('update:activeStep', 'supplier');
                this.commitSocketChanges('activeStep');
            },
            syncWithParentForm(){
                this.$emit('update:supplier', this.form);
            },
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            },

            // supplier phone

            getIsolatedClientPhoneFormPathObj(path){
                return _.set({}, path, _.get(this.supplierPhoneForm, path));
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
                    const supplierPhone = utils.getDDDAndNumber(this.supplierPhoneForm.number);
                    const emitData = {
                        draftId: this.activeMorphScreen.draft.draftId,
                        supplierPhoneId: this.supplierPhoneForm.id || null,
                        supplierPhoneForm: {
                            ddd: supplierPhone.ddd,
                            number: supplierPhone.number || null
                        }
                    };
                    console.log("Emitting draft:supplier-phone-update", emitData);
                    this.$socket.emit("draft:supplier-phone-update", emitData);
                }
                else {
                    const emitData = {
                        draftId: this.activeMorphScreen.draft.draftId,
                        supplierPhoneId: this.supplierPhoneForm.id || null,
                        supplierPhoneForm: this.getIsolatedClientPhoneFormPathObj(mapping)
                    };
                    console.log("Emitting draft:supplier-phone-update", emitData);
                    this.$socket.emit("draft:supplier-phone-update", emitData);
                }
            },
        },
        mounted(){
            this.syncWithParentForm();
            this.$bus.$on('draft:update', ({draftId, form}) => {
                if(this.activeMorphScreen.draft.draftId === draftId){
                    const supplier = form.supplier;
                    this.form.supplierSelectedCustomFields = _.map(supplier.supplierCustomFields, (supplierCustomField) => {
                        return supplierCustomField.customField.id
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
