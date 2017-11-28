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
                                <input type="text" class="input--borderless" v-model="client.name" placeholder="..." @input="commitSocketChanges('client.name')" />
                            </div>
                            <div class="form-column" style="justify-content: center;">
                                <icon-search></icon-search>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        CPF / CNPJ
                        <input type="text" class="input--borderless" v-model="client.legalDocument" placeholder="..." @input="commitSocketChanges('client.legalDocument')" />
                    </div>
                </div>
                <!-- client addresses -->
                <div class="form-groups">
                    <div class="form-group" v-if="isEditing || isAdding || form.clientAddresses.length <= 0">
                        <div class="form-group__header">
                            <h3 style="margin-right: 10px;">Locais</h3> <icon-local></icon-local>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only" v-if="form.clientAddresses.length > 0">Voltar</a>
                            <a class="btn btn--primary" v-if="form.clientAddresses.length <= 0" style="margin-left: 10px;">Adicionar</a>
                            <a class="btn btn--primary" v-else style="margin-left: 10px;">Salvar</a>
                        </div>
                        <div class="form-group__content">
                            <app-client-address-form :name="form.clientAddressName"></app-client-address-form>
                        </div>
                    </div>
                    <div class="form-group" v-else>
                        <div class="form-group__header">
                            <h3 style="margin-right: 10px;">Selecione um local</h3><icon-local></icon-local>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only">Voltar</a>
                            <a class="btn btn--primary" style="margin-left: 10px;">Salvar</a>
                        </div>
                        <div class="form-group__content">
                            <ul class="content__list">
                                <li class="list__item" v-for="clientAddress in form.clientAddresses">
                                    <span>{{ clientAddress.id }}</span>
                                    <span class="push-both-sides"></span>
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
                                <input type="text" class="input--borderless" v-model="form.clientAddressName" placeholder="..." />
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
                            <input type="text" class="input--borderless" placeholder="(XX) XXXXX-XXXX" />
                            <div class="header__mini-circle"></div>
                            <input type="text" class="input--borderless" placeholder="fixo/celular" />
                            <span class="push-both-sides"></span>
                            <icon-add class="header__action-icon"></icon-add>
                        </div>
                        <div class="form-group__content">
                            <ul class="content__list--mini">
                                <li class="list__item">
                                    <div class="item__check"></div>
                                    <span>(44) 99107-8686</span>
                                    <div class="item__mini-circle"></div>
                                    <span>WhatsApp</span>
                                    <span class="push-both-sides"></span>
                                    <icon-remove></icon-remove>
                                </li>
                                <li class="list__item">
                                    <div class="item__check"></div>
                                    <span>(44) 99107-8686</span>
                                    <div class="item__mini-circle"></div>
                                    <span>Casa</span>
                                    <span class="push-both-sides"></span>
                                    <icon-remove></icon-remove>
                                </li>
                            </ul>
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
                            <ul>
                                <li></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form__header">
            <span v-if="!client.active">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
            <span class="push-both-sides"></span>
            <h3>DADOS DO CLIENTE</h3> <app-switch style="float: right;" v-model="client.active" @changed="commitSocketChanges('client.active')"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import ClientAddressForm from './ClientAddressForm.vue';
    import SearchComponent from '../../../../components/Inputs/Search.vue';
    import AddressesAPI from '../../../../api/addresses';

    export default {
        components: {
            'app-search': SearchComponent,
            'app-client-address-form': ClientAddressForm
        },
        props: ['client'],
        data(){
            return {
                isAdding: false,
                isEditing: false,
                form: {
                    clientAddresses: [],
                    clientAddressName: null
                }
            }
        },
        computed: {
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
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
            }
        },
        mounted(){
        }
    }
</script>

<style scoped>
</style>
