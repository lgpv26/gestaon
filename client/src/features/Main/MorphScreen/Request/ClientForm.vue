<template>
    <form :class="{'active': value.active}">
        <div class="form__content" v-show="value.active">
            <div class="form__main-column">
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-columns">
                            <div class="form-column" style="flex-grow: 1;">
                                Nome / Empresa
                                <input type="text" class="input--borderless" v-model="value.name" placeholder="..." @input="commitSocketChanges('client.name')" />
                            </div>
                            <div class="form-column" style="justify-content: center;">
                                <icon-search></icon-search>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        CPF / CNPJ
                        <input type="text" class="input--borderless" v-model="value.legalDocument" placeholder="..." @input="commitSocketChanges('client.legalDocument')" />
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group" v-if="true">
                        <div class="form-group__header">
                            <h3 style="margin-right: 10px;">Locais</h3> <icon-local></icon-local>
                            <span class="push-both-sides"></span>
                            <a class="btn btn--border-only">Voltar</a>
                            <a class="btn btn--primary" style="margin-left: 10px;">Salvar</a>
                        </div>
                        <div class="form-group__content">
                            <div class="form-columns">
                                <div class="form-column" style="flex: 1 1 60%;">
                                    <label>Endereço</label>
                                    <div class="search">
                                        <app-search ref="search" @itemSelected="addressSearchItemSelected($event)" :items="addresses" :shouldStayOpen="isAddressInputFocused" :query="addressQuery"
                                        :verticalOffset="8" :horizontalOffset="-20">
                                            <input type="text" class="search-input__field" v-model="addressForm.name" ref="searchInput"
                                            @focus="isAddressInputFocused = true" @blur="isAddressInputFocused = false" @keydown="onAddressSearchInputKeyDown($event)" />
                                            <template slot="item" slot-scope="props">
                                                <div class="search-input__item">
                                                    <span class="detail__address" v-html="props.item.text">RUA 28 DE JUNHO, 1214</span>
                                                </div>
                                            </template>
                                            <template slot="settings">
                                                <div class="search-input__settings">
                                                    <app-switch style="margin-right: 8px;"></app-switch>
                                                    <span style="margin-right: 8px;">Apenas endereços</span>
                                                    <a class="settings__info">?</a>
                                                </div>
                                            </template>
                                            <template slot="no-results">
                                                <span>Nenhum resulado encontrado...</span>
                                            </template>
                                        </app-search>
                                    </div>
                                </div>
                                <div class="form-column" style="flex: 1 1 10%;">
                                    <label>Número</label>
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 25%;">
                                    <label>Complemento</label>
                                    <input type="text" />
                                </div>
                            </div>
                            <div class="form-columns">
                                <div class="form-column" style="flex: 1 1 40%;">
                                    <label>Bairro</label>
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 15%;">
                                    <label>CEP</label>
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 35%;">
                                    <label>Cidade</label>
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 8%;">
                                    <label>Estado</label>
                                    <input type="text" />
                                </div>
                            </div>
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
                                <li class="list__item">
                                    <span>RUA 28 DE JUNHO, 1214</span>
                                    <span class="push-both-sides"></span>
                                </li>
                                <li class="list__item">
                                    <span>RUA LARALA, 455</span>
                                    <span class="push-both-sides"></span>
                                </li>
                                <li class="list__item">
                                    <span>RUA xD</span>
                                    <span class="push-both-sides"></span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-columns">
                            <div class="form-column" style="flex-grow: 1;">
                                <label>Apelido (ex: Casa da mãe)</label>
                                <input type="text" class="input--borderless" placeholder="..." />
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
            <span v-if="!value.active">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
            <span class="" v-else>Cancelar cadastro do cliente e sair</span>
            <span class="push-both-sides"></span>
            <h3>DADOS DO CLIENTE</h3> <app-switch style="float: right;" v-model="value.active" @changed="commitSocketChanges('client.active')"></app-switch>
        </div>
    </form>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import AddressForm from '../../../../components/Forms/AddressForm.vue';
    import SearchComponent from '../../../../components/Inputs/Search.vue';
    import AddressesAPI from '../../../../api/addresses';

    export default {
        components: {
            'app-search': SearchComponent,
            'app-address-form': AddressForm
        },
        props: ['value'],
        data(){
            return {
                addressQuery: null,
                addressInputTimeout: null,
                isAddressInputFocused: false,
                addressForm: {
                    addressId: null,
                    name: null,
                    neighborhood: null,
                    cep: null,
                    city: null,
                    state: null
                },
                addresses: [],
            }
        },
        computed: {
        },
        methods: {
            searchAddresses(){
                const vm = this;
                const searchComponent = vm.$refs.search;
                AddressesAPI.search({
                    actingCities: ['MARINGA'],
                    q: vm.addressQuery
                }).then((result) => {
                    console.log(result);
                    vm.addresses = result.data.map(({source}) => {
                        console.log(source);
                        return {
                            text: source.name
                        };
                    });
                    searchComponent.search();
                }).catch((err) => {
                    vm.addresses = [];
                })
            },
            onAddressSearchInputKeyDown(ev){
                if(this.addressInputTimeout) clearTimeout(this.addressInputTimeout);
                this.addressInputTimeout = setTimeout(() => {
                    this.addressQuery = this.addressForm.name;
                    this.searchAddresses();
                }, 300);
            },
            addressSearchItemSelected(item){
                console.log(item);
            },
            commitSocketChanges(mapping){
                this.$emit('sync', mapping);
                this.commitChanges();
            },
            commitChanges(){
                this.$emit('input', this.value);
            }
        },
        mounted(){
        }
    }
</script>

<style scoped>

    /* search input */

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
