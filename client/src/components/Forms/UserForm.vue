<template>
    <div scrollbar style="width: 100%">
        <div class="scrollable-content">
            <div class="user-form">
                <app-panel-loading :loading="loading" :loadingText="'Carregando...'"></app-panel-loading>
                <div class="modal-container">
                    <div class="columns">
                        <div class="column">
                            <h3 class="form-title">USUÁRIO</h3>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            Nome
                            <input type="text" placeholder="NOME" v-model="form.name" />
                        </div>
                        <div class="column">
                            Tipo
                            <input type="text" placeholder="NOME" readonly="readonly" :value="(form.type === 'admin') ? 'Administrador': 'Usuário'" />
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            E-mail
                            <input type="email" placeholder="E-MAIL" style="text-transform: lowercase;" v-model="form.email" />
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <div class="user-form-subsection">
                                <h3 v-if="user">ATRIBUIR NOVA SENHA</h3>
                                <h3 v-else>SENHA</h3>
                                <div class="columns">
                                    <div class="column">
                                        Senha
                                        <input type="password" placeholder="SENHA" v-model="form.password" />
                                    </div>
                                    <div class="column">
                                        Confirme a senha
                                        <input type="password" placeholder="CONFIRME A SENHA" v-model="form.confirmPassword" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <a v-if="user" @click="remove()" class="button is-red" style="float: left;">
                                Remover
                            </a>
                            <a v-if="user" @click="update()" class="button is-primary" style="float: right">
                                Salvar
                            </a>
                            <a v-else @click="create()" class="button btn-primary" style="float: right">
                                Adicionar
                            </a>
                            <a v-if="!user" @click="reset()" class="button is-yellow" style="float: right; margin-right: 5px;">
                                Limpar campos
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import UsersAPI from '../../api/users';
    import Scrollbar from 'smooth-scrollbar';
    import PanelLoadingComponent from '../Utilities/PanelLoading.vue';
    import _ from 'lodash';
    export default {
        props: {
            value: {
                default: null
            },
            user: {
                default: null
            }
        },
        components: {
            'app-panel-loading': PanelLoadingComponent
        },
        data(){
            return {
                scrollbars: null,
                loading: false,
                form: {
                    id: null,
                    name: null,
                    type: 'user',
                    email: null,
                    password: null,
                    confirmPassword: null
                }
            }
        },
        computed: {
            ...mapState('auth', {
                userCompany: 'user',
                company: 'company'
            })
        },
        methods: {
            ...mapActions('toast', ['showToast', 'showError']),
            update(){
                const vm = this;
                console.log(vm.form);
                const form = _.cloneDeep(vm.form);

                if(!form.password || form.password === ''){
                    delete form.password;
                }
                delete form.confirmPassword;
                vm.loading = true;
                UsersAPI.updateOne(form.id, form, {companyId: vm.company.id}).then(() => {
                    vm.$modal.hide('user-form');
                    vm.showToast({
                        type: "success",
                        message: "Usuário salvo com sucesso."
                    });
                    vm.$bus.$emit('user-updated');
                    vm.loading = false;
                 });
            },
            remove(){
                const vm = this;
                vm.loading = true;
                UsersAPI.removeOne(vm.form.id).then(({data}) => {
                    vm.$bus.$emit('user-removed', parseInt(data.id))
                    vm.$modal.hide('user-form')
                    vm.showToast({
                        type: "success",
                        message: "Usuário \"" + vm.form.name + "\" removido com sucesso."
                    });
                    vm.loading = false;
                }).catch((error) => {
                    console.log(error);
                    vm.loading = false;
                    vm.showToast({
                    type: "error",
                    message: "Erro ao remover o usuário."
                    });
                });
            },
            create(){
                const vm = this;
                vm.loading = true;
                _.assign(vm.form, {companyId: vm.company.id});
                if(vm.form.password === vm.form.confirmPassword) {
                    UsersAPI.createOne(vm.form, {companyId: vm.company.id}).then(() => {
                        vm.$modal.hide('user-form');
                        vm.showToast({
                            type: "success",
                            message: "Usuário \"" + vm.form.name + "\" adicionado com sucesso."
                        });
                        vm.$bus.$emit('user-created');
                        vm.loading = false;
                    }).catch((err) => {
                        vm.loading = false;
                        vm.showError(err);
                    });
                }
                else{
                    vm.loading = false;
                    vm.showToast({
                        type: "error",
                        message: "As senhas não coincidem."
                    });
                }
            },
            reset(){
                Object.assign(this.$data, this.$options.data());
            }
        },
        created(){
            const vm = this;
            vm.reset();
            if(vm.user){
                _.assign(vm.form, _.pick(vm.user, _.keys(vm.form)));
                vm.form.password = null;
            }
        },
        mounted(){
            // initialize scrollbars
            this.scrollbars = Scrollbar.initAll({
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            });
        }
    }
</script>

<style scoped>
    h3.form-title {
        color: #999;
    }
    div.user-form {
        position: relative;
        flex-grow: 1;
    }
    div.user-form:last-child {
        margin-bottom: 0;
    }
    div.user-form-subsection {
        border: 1px solid rgba(150,150,150,0.1);
        padding: 20px;
    }

    div.user-form-subsection h3 {
        margin-bottom: 10px;
    }
</style>