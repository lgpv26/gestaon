<template>
    <div scrollbar style="width: 100%">
        <div class="scrollable-content">
            <div class="company-form">
                <app-panel-loading :loading="loading" :loadingText="'Carregando...'"></app-panel-loading>
                <div class="modal-container">
                    <div class="columns">
                        <div class="column">
                            <h3 class="form-title">EMPRESA</h3>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            Nome
                            <input type="text" placeholder="NOME" v-model="form.name" />
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <a v-if="company" @click="remove()" class="button is-red" style="float: left;">
                                Remover
                            </a>
                            <a v-if="company" @click="update()" class="button is-primary" style="float: right">
                                Salvar
                            </a>
                            <a v-else @click="create()" class="button btn-primary" style="float: right">
                                Adicionar
                            </a>
                            <a v-if="!company" @click="reset()" class="button is-yellow" style="float: right; margin-right: 5px;">
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
    import CompaniesAPI from '../../api/companies';
    import Scrollbar from 'smooth-scrollbar';
    import PanelLoadingComponent from '../Utilities/PanelLoading.vue';
    import _ from 'lodash';
    export default {
        props: {
            value: {
                default: null
            },
            company: {
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
                    name: null
                }
            }
        },
        computed: {
            ...mapState('auth', {
                user: 'user',
                companyState: 'company'
            })
        },
        methods: {
            ...mapActions('toast', ['showToast','showError']),
            update(){
                const vm = this;
                vm.loading = true;
                CompaniesAPI.updateOne(vm.form.id, vm.form, {companyId: vm.company.id}).then((response) => {
                    vm.$modal.hide('company-form');
                    vm.showToast({
                        type: "success",
                        message: "Empresa salva com sucesso."
                    });
                    vm.$bus.$emit('company-updated');
                    vm.loading = false;
                }).catch((error) => {
                    console.log(error);
                    vm.loading = false;
                    vm.showToast({
                        type: "error",
                        message: "Erro ao salvar o empresa."
                    });
                });
            },
            remove(){
                const vm = this;
                vm.loading = true;
                CompaniesAPI.removeOne(vm.form.id, {companyId: vm.company.id}).then(({data}) => {
                    vm.$modal.hide('company-form');
                    vm.showToast({
                        type: "success",
                        message: "Empresa removida com sucesso."
                    });
                    vm.$bus.$emit('company-removed', parseInt(data.id));
                    vm.loading = false;
                }).catch((err) => {
                    console.log(err);
                    vm.loading = false;
                    vm.showError(err);
                });
            },
            create(){
                const vm = this;
                vm.loading = true;
                CompaniesAPI.createOne(vm.form).then(({data}) => {
                    vm.$modal.hide('company-form');
                    vm.showToast({
                        type: "success",
                        message: "Empresa adicionada com sucesso."
                    });
                    vm.$bus.$emit('company-created');
                    vm.loading = false;
                }).catch((err) => {
                    console.log(err);
                    vm.loading = false;
                    vm.showError(err);
                });
            },
            reset(){
                Object.assign(this.$data, this.$options.data());
            }
        },
        created(){
            const vm = this;
            vm.reset();
            console.log("Created", vm.company);
            if(vm.company){
                _.assign(vm.form, _.pick(vm.company, _.keys(vm.form)));
            }
            console.log(vm.form);
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
    div.device-form {
        position: relative;
        flex-grow: 1;
    }
    div.device-form:last-child {
        margin-bottom: 0;
    }
    div.device-form-subsection {
        border: 1px solid rgba(150,150,150,0.1);
        padding: 20px;
    }

    div.device-form-subsection h3 {
        margin-bottom: 10px;
    }
</style>
