<template>
    <form :class="{'active': client.active}">
        <div class="form__content" v-show="client.active">
            <div class="form__main-column">
                <!-- client name and document -->
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-columns">
                            <div class="form-column" style="flex-grow: 1;">
                                Nome / Empresa
                                <div v-if="form.id"> <!-- unassociate client -->
                                    <input type="text" class="input--borderless" style="color: var(--font-color--primary)"
                                    v-model="form.name" v-if="form.id" placeholder="..." @input="commitSocketChanges('form.name')" />
                                </div>
                                <app-search v-else ref="search" :items="searchItems" :shouldStayOpen="isNameInputFocused" :query="query" :verticalOffset="5" :horizontalOffset="-20"
                                    @itemSelected="clientSelected($event)" >
                                    <input type="text" class="input--borderless search-input__field" placeholder="..." v-model="form.name" ref="searchInput"
                                    @keydown="searchValueUpdated()" @focus="isNameInputFocused = true" @blur="isNameInputFocused = false" />
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
                                <icon-search v-if="!form.id"></icon-search>
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
                            <h3 style="margin-right: 10px;">Locais</h3> <icon-local></icon-local>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only" v-if="form.clientAddresses.length > 0" @click="backToClientAddressesList()">Voltar</a>
                            <a class="btn btn--primary" v-if="form.clientAddresses.length <= 0" style="margin-left: 10px;">Adicionar</a>
                            <a class="btn btn--primary" v-else @click="saveClientAddress()" style="margin-left: 10px;">Salvar</a>
                        </div>
                        <div class="form-group__content">
                            <app-client-address-form ref="clientAddressForm" :clientId="form.id" :clientAddress.sync="clientAddressForm"></app-client-address-form>
                        </div>
                    </div>
                    <div class="form-group" v-else>
                        <div class="form-group__header">
                            <h3 style="margin-right: 10px;">Selecione um local</h3><icon-local></icon-local>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only" @click="addClientAddress()">Novo</a>
                        </div>
                        <div class="form-group__content">
                            <ul class="content__list">
                                <li class="list__item" v-for="clientAddress in form.clientAddresses">
                                    <span style="cursor: pointer;">{{ clientAddress.address.name }}, {{ clientAddress.number }}</span>
                                    <span class="push-both-sides"></span>
                                    <a class="btn btn--border-only" style="position: absolute; right: 0" @click="editClientAddress(clientAddress)">Editar endereço</a>
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
                            <icon-phone class="header__icon"></icon-phone>
                            <app-mask :mask="['(##) ####-####','(##) #####-####']" style="width: 105px;" class="input--borderless" placeholder="(XX) XXXXX-XXXX" />
                            <div class="header__mini-circle"></div>
                            <input type="text" class="input--borderless" placeholder="fixo/celular" />
                            <span class="push-both-sides"></span>
                            <icon-add class="header__action-icon"></icon-add>
                        </div>
                        <div class="form-group__content">
                            <ul class="content__list--mini" v-if="form.clientPhones && form.clientPhones.length >= 0">
                                <li class="list__item" v-for="clientPhone in form.clientPhones">
                                    <div class="item__check"></div>
                                    <span>({{ clientPhone.ddd }}) clientPhone.number</span>
                                    <div class="item__mini-circle"></div>
                                    <span>{{ clientPhone.name }}</span>
                                    <span class="push-both-sides"></span>
                                    <icon-remove></icon-remove>
                                </li>
                            </ul>
                            <span v-else>Nenhum telefone...</span>
                        </div>
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-group__header">
                            <icon-client-details class="header__icon"></icon-client-details>
                            <h3>Informações adicionais</h3>
                            <span class="push-both-sides"></span>
                            <icon-dropdown class="header__action-icon"></icon-dropdown>
                        </div>
                        <div class="form-group__content">
                            <ul v-if="form.clientPhones && form.clientPhones.length >= 0">
                                <li></li>
                            </ul>
                            <span v-else>Nenhuma informação adicional...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!client.active">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
            <span class="push-both-sides"></span>
            <h3>DADOS DO CLIENTE</h3> <app-switch style="float: right;" v-model="client.active"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import ClientAddressForm from './ClientAddressForm.vue';
    import SearchComponent from '../../../../components/Inputs/Search.vue';
    import ClientsAPI from '../../../../api/clients';
    import ServiceAPI from '../../../../api/service';

    export default {
        components: {
            'app-search': SearchComponent,
            'app-client-address-form': ClientAddressForm
        },
        props: ['client'],
        data(){
            return {
                lastQuery: '',
                query: '',
                isNameInputFocused: false,
                isAdding: false,
                isEditing: false,
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
                    id: null, // se passar, atualizar cliente. se não, criar.
                    name: '', // se passar e tiver id, atualizar. se não, criar.
                    legalDocument: '', // cpf, cnpj
                    clientAddresses: [],
                    clientAddressName: null
                },
                searchItems: [],
                commitTimeout: null
            }
        },
        watch: {
            form: {
                handler: function(form) {
                    this.syncWithParentForm();
                },
                deep: true
            }
        },
        computed: {
            ...mapState('auth', ['company'])
        },
        methods: {
            createClientAddress(){
                return {
                    clientAddressId: null,
                    name: null,
                    number: null,
                    complement: null
                }
            },
            clientSelected(searchItem){
                const vm = this;
                ClientsAPI.getOne(searchItem.client.id).then(({data}) => {
                    _.assign(vm.form, _.pick(data, _.keys(vm.form)));
                    vm.searchItems = [];
                });
            },
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
            commitUpdatedValue(){
                if(this.query.trim() !== this.lastQuery){
                    this.lastQuery = this.query.trim();
                    this.search();
                }
            },
            searchValueUpdated(){
                if(this.commitTimeout) clearTimeout(this.commitTimeout);
                this.commitTimeout = setTimeout(() => {
                    this.query = this.form.name;
                    this.commitUpdatedValue();
                }, 300)
            },
            changeClient(){
                this.resetForm();
            },
            backToClientAddressesList(){
                this.isAdding = false;
                this.isEditing = false;
            },
            addClientAddress(){
                this.resetClientAddressForm();
                this.isAdding = true;
            },
            editClientAddress(clientAddress){
                this.resetClientAddressForm();
                _.assign(this.clientAddressForm, clientAddress);
                this.isEditing = true;
            },
            saveClientAddress(){
                this.$refs.clientAddressForm.save();
            },
            resetForm(){
                this.resetClientForm();
                this.resetClientAddressForm();
            },
            resetClientForm(){
                Object.assign(this.$data.form, this.$options.data.apply(this).form);
            },
            resetClientAddressForm(){
                Object.assign(this.$data.clientAddressForm, this.$options.data.apply(this).clientAddressForm);
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
