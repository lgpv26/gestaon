<template>
    <div class="parent">
        <div class="content-header">
            <h3>Usuários</h3>
            <span class="push-both-sides"></span>
            <ul>
                <li @click="refresh()">
                    <span class="icon"><i class="mi mi-refresh"></i></span>
                </li>
                <li @click="addUser()">
                    <span class="icon"><i class="mi mi-add-circle"></i></span>
                </li>
            </ul>
        </div>
        <div class="content-row table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Data criado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" @click="userClicked(user)">
                        <td>{{ user.id }}</td>
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.formatedDateCreated }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';
    import Utils from '../../../utils';
    import UsersAPI from '../../../api/users';
    import _ from 'lodash';

    export default {
        components: {
        },
        data(){
            return {
                users: []
            }
        },
        methods: {
            loadUsers(){
                const vm = this;
                UsersAPI.getAll().then(({data}) => {
                    vm.users = _.map(data,(user) => {
                        user.formatedDateCreated = moment(user.dateCreated).format('DD/MM/YYYY HH:mm:ss');
                        return user;
                    });
                }).catch((err) => {
                    console.log(err);
                });
            },
            userClicked(user){
                this.$modal.show('user-form', {
                    user
                });
            },
            addUser(){
                this.$modal.show('user-form', {
                    user: {}
                });
            },
            refresh(){
                this.loadUsers();
            }
        },
        mounted(){
            const vm = this;
            vm.loadUsers();
            vm.$bus.$on('user-updated', function(){
                console.log('user removed event received!');
                vm.refresh();
            });
            vm.$bus.$on('user-created', function(){
                console.log('user created event received!');
                vm.refresh();
            });
            vm.$bus.$on('user-removed', function(id){
                vm.users = _.filter(vm.users, function(user){
                    if(user.id !== id) return true;
                });
            });
        }
    }
</script>

<style scoped>
    div.parent {
        background: #2A2B33;
    }
    tbody tr {
        cursor: pointer;
    }
</style>