<template>
    <form :class="{'active': value.active}">
        <div class="form__content" v-show="value.active">
            <div class="form__main-column">
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-columns">
                            <div class="form-column" style="flex-grow: 1;">
                                Nome / Empresa
                                <input type="text" v-model="value.name" @input="commitSocketChanges('client.name')" />
                            </div>
                            <div class="form-column" style="justify-content: center;">
                                <icon-search></icon-search>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        CPF / CNPJ
                        <input type="text" v-model="value.legalDocument" @input="commitSocketChanges('client.legalDocument')" />
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group" v-if="true">
                        <div class="form-group__header">
                            <span>Locais</span>
                            <span class="push-both-sides"></span>
                            <a class="is-small button">Voltar</a>
                            <a class="is-small button is-primary" style="margin-left: 10px;">Salvar</a>
                        </div>
                        <div class="form-group__content">
                            <div class="form-columns">
                                <div class="form-column" style="flex: 1 1 60%;">
                                    Endereço
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 10%;">
                                    Número
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 25%;">
                                    Complemento
                                    <input type="text" />
                                </div>
                            </div>
                            <div class="form-columns">
                                <div class="form-column" style="flex: 1 1 40%;">
                                    Bairro
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 15%;">
                                    CEP
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 35%;">
                                    Cidade
                                    <input type="text" />
                                </div>
                                <div class="form-column" style="flex: 1 1 8%;">
                                    Estado
                                    <input type="text" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group" v-else>
                        <div class="form-group__header">
                            <span>Selecione um local</span>
                            <span class="push-both-sides"></span>
                            <a class="is-small button">Voltar</a>
                            <a class="is-small button is-primary" style="margin-left: 10px;">Salvar</a>
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
                                Apelido deste endereço
                                <input type="text" placeholder="EX: CASA DA MÃE" />
                            </div>
                            <div class="form-column" style="width: 180px;">
                                <a class="button is-small">Tipo de local</a>
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
                            <input type="text" placeholder="(XX) XXXXX-XXXX" />
                            <div class="header__mini-circle"></div>
                            <input type="text" placeholder="fixo/celular" />
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
                                    <icon-add></icon-add>
                                </li>
                                <li class="list__item">
                                    <div class="item__check"></div>
                                    <span>(44) 99107-8686</span>
                                    <div class="item__mini-circle"></div>
                                    <span>Casa</span>
                                    <span class="push-both-sides"></span>
                                    <icon-add></icon-add>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="form-groups">
                    <div class="form-group">
                        <div class="form-group__header">
                            <icon-phone class="header__icon"></icon-phone>
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

    export default {
        props: ['value'],
        data(){
            return {
            }
        },
        computed: {
        },
        methods: {
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
</style>
