<template>
    <div id="settings-company-users">
        <header style="display: flex; flex-direction: row">
            <h3>MEMBROS</h3>
            <span class="push-both-sides"></span>
            <a style="alignSelf: center" @click="addUser" v-if="hasPermission('users.add')">Adicionar usuário</a>
            <app-loading :loading="true"></app-loading>
        </header>
        <div class="columns">
            <div class="column table">
                <table>
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Data adicionada</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody v-for="(companyUser, index) in form.companyUsers">
                        <tr style="margin-bottom: 20px; cursor: pointer;" @click="togglePermissions(index)">
                            <td>{{ companyUser.user.name }}</td>
                            <td>{{ companyUser.user.email }}</td>
                            <td>{{ companyUser.dateCreated.format('DD/MM/YYYY HH:mm') }}</td>
                            <td class="toggle-permissions" :class="{active: permissionsOpenedIndex === index}">
                                <i class="mi mi-expand-more" v-if="permissionsOpenedIndex !== index"></i>
                                <i class="mi mi-expand-less" v-else></i>
                            </td>
                        </tr>
                        <tr class="table-subsection" v-show="permissionsOpenedIndex === index">
                            <td colspan="4">
                                <div class="settings-subsection" v-show="companyUser.isCreator">
                                    <h3>PERMISSÕES</h3>
                                    <p>O administrador da empresa possui todas permissões.</p>
                                </div>
                                <div class="settings-subsection" v-show="!companyUser.isCreator">
                                    <h3>PERMISSÕES</h3>
                                    <div class="permission-container">
                                        <h4 class="permission-group">Gerenciamento de usuários</h4>
                                        <div>
                                            <div class="permission-item">
                                                <small>Adicionar</small>
                                                <app-switch v-model="companyUser.permissions['users.add']" @changed="permissionUpdated()"></app-switch>
                                            </div>
                                            <div class="permission-item">
                                                <small>Editar / mudar permissões</small>
                                                <app-switch v-model="companyUser.permissions['users.edit']" @changed="permissionUpdated()"></app-switch>
                                            </div>
                                            <div class="permission-item">
                                                <small>Remover</small>
                                                <app-switch v-model="companyUser.permissions['users.remove']" @changed="permissionUpdated()"></app-switch>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="permission-container">
                                        <h4 class="permission-group">Gerenciamento de dispositivos</h4>
                                        <div>
                                            <div class="permission-item">
                                                <small>Adicionar</small>
                                                <app-switch v-model="companyUser.permissions['devices.add']" @changed="permissionUpdated()"></app-switch>
                                            </div>
                                            <div class="permission-item">
                                                <small>Editar</small>
                                                <app-switch v-model="companyUser.permissions['devices.edit']" @changed="permissionUpdated()"></app-switch>
                                            </div>
                                            <div class="permission-item">
                                                <small>Remover</small>
                                                <app-switch v-model="companyUser.permissions['devices.remove']" @changed="permissionUpdated()"></app-switch>
                                            </div>
                                            <div class="permission-item">
                                                <small>Traçar rotas</small>
                                                <app-switch v-model="companyUser.permissions['devices.filter-positions']" @changed="permissionUpdated()"></app-switch>
                                            </div>
                                            <div class="permission-item">
                                                <small>Enviar comandos</small>
                                                <app-switch v-model="companyUser.permissions['devices.command']" @changed="permissionUpdated()"></app-switch>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="settings-subsection" v-if="hasPermission('users.remove')">
                                    <a class="button is-small" @click="removeCompanyUser(companyUser)">Remover usuário da empresa</a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>

    import { mapGetters, mapMutations, mapActions, mapState } from 'vuex';
    import CompaniesAPI from '../../../api/companies';
    import LoadingComponent from '../../../components/Utilities/Loading.vue';
    import moment from 'moment';
    import _ from 'lodash';

    export default {
        data(){
            return {
                permissionsOpenedIndex: -1,
                permissionsModel: [
                    'users.add', 'users.edit', 'users.remove',
                    'devices.add', 'devices.edit', 'devices.remove', 'devices.filter-positions', 'devices.command'
                ],
                form: {
                    companyUsers: []
                }
            }
        },
        components: {
            'app-loading': LoadingComponent
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapGetters('auth', ['hasPermission'])
        },
        methods: {
            ...mapMutations('auth', ['setPermissions']),
            ...mapActions('toast', ['showToast','showError']),
            addUser(){
                this.$modal.show('user-form', {
                    user: null
                });
            },
            loadCompanyUsers(){
                const vm = this;
                CompaniesAPI.companyUsersGetAll(this.company.id).then(({data}) => {
                    vm.form.companyUsers = _.map(data, (companyUser) => {
                        companyUser.dateCreated = moment(companyUser.dateCreated);
                        const companyUserPermissions = {};
                        vm.permissionsModel.forEach((permissionModel) => {
                            const currentPerm = _.find(companyUser.permissions, (permission) => {
                                if(permission.companyUserId === companyUser.id && permission.resourceName === permissionModel) return true;
                            });
                            companyUserPermissions[permissionModel] = !!(currentPerm);
                        });
                        companyUser.permissions = companyUserPermissions;
                        return companyUser;
                    });
                });
            },
            togglePermissions(index){
                if(this.permissionsOpenedIndex === index){
                    this.permissionsOpenedIndex = -1;
                    return;
                }
                this.permissionsOpenedIndex = index;
            },
            saveCompanyUsers(){
                // Save permissions
                const vm = this;
                const companyUsers = _.map(vm.form.companyUsers, (companyUser) => {
                    const permissions = [];
                    _.forIn(companyUser.permissions, (value, key) => {
                        if(value) {
                            permissions.push({
                                companyUserId: companyUser.id,
                                resourceName: key
                            });
                        }
                    });
                    return {
                        companyUserId: companyUser.id,
                        permissions
                    }
                });
                CompaniesAPI.companyUsersPermissionsSaveMultiple(this.company.id,{companyUsers}).then(({data}) => {
                    vm.setPermissions(data);
                    vm.showToast({
                        type: 'success',
                        message: 'Permissão alterada.'
                    });
                }).catch((error) => {
                    vm.showToast({
                        type: 'error',
                        message: 'Erro ao alterar permissão.'
                    });
                });
            },
            permissionUpdated(){
                this.saveCompanyUsers();
            },
            removeCompanyUser(companyUser){
                const vm = this;
                CompaniesAPI.companyUsersRemoveOne(companyUser.companyId, companyUser.userId).then(({data}) => {
                    vm.showToast({
                        type: 'success',
                        message: 'Usuário removido.'
                    });
                    vm.form.companyUsers = _.filter(vm.form.companyUsers, (companyUser) => {
                        if(companyUser.id !== data.id)
                            return true;
                    });
                }).catch((err) => {
                    vm.showError(err);
                })
            }
        },
        created(){
            const vm = this;
            vm.loadCompanyUsers();
            vm.$bus.$on('user-created', function(){
                vm.loadCompanyUsers();
            });
            vm.$bus.$on('user-updated', function(){
                vm.loadCompanyUsers();
            });
        },
        mounted(){

        }
    }
</script>

<style scoped>

    #settings-company-users .toggle-permissions {
        cursor: pointer;
        text-align: center;
    }

    #settings-company-users .toggle-permissions i {
        font-size: 16px;
    }

    div.module-panel h3 {
        text-transform: uppercase;
        font-weight: bolder;
        font-size: 16px;
    }

    div.settings-subsection {
        border: 1px solid rgba(150,150,150,0.1);
        padding: 20px;
    }

    div.settings-subsection h3 {
        margin-bottom: 10px;
    }

    .table th {
        background: #26272E;
    }

    .table tr td {
        color: #FFF;
    }

    .table tr {
        background: rgba(0,0,0,.1);
    }

    .table tr:hover {
    }

    .table thead td, .table thead th {
        border: 0;
    }

    .table td, .table th {
        border: 0;
    }

    table tr.table-subsection > td {
        padding: 0px;
    }

    table tr.table-subsection > td .settings-subsection {
        border: 0;
        border-top: 1px solid #36373F;
    }

    table tr.table-subsection > td .settings-subsection:last-child {
        border-bottom: 3px solid #36373F;
    }

    table tr.table-subsection > td .settings-subsection:hover {
        background: transparent;
    }

    div.permission-container {
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;
    }

    div.permission-container:last-child {
        margin-bottom: 0px;
    }

    h4.permission-group {
        margin-bottom: 5px;
        color: #CCC;
    }

    div.permission-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 5px 8px;
        background: rgba(0,0,0,.1);
        border-radius: 5px;
        float: left;
        margin-right: 5px;
    }

    div.permission-item > small {
        margin-right: 5px;
        color: #7a7a7a;
    }

</style>
