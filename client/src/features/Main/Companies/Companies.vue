<template>
    <div class="parent">
        <div class="content-header">
            <h3>Empresas</h3>
            <span class="push-both-sides"></span>
            <ul>
                <li @click="refresh()">
                    <span class="icon"><i class="mi mi-refresh"></i></span>
                </li>
                <li @click="addCompany()">
                    <span class="icon"><i class="mi mi-add-circle"></i></span>
                </li>
            </ul>
        </div>
        <div class="content-row table">
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Empresa</th>
                    <th>Data criada</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="company in companies" @click="companyClicked(company)">
                    <td>{{ company.id }}</td>
                    <td>{{ company.name }}</td>
                    <td>{{ company.formatedDateCreated }}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';
    import Utils from '../../../utils';
    import CompaniesAPI from '../../../api/companies';

    export default {
        components: {
        },
        data(){
            return {
                companies: []
            }
        },
        methods: {
            loadCompanies(){
                const vm = this;
                CompaniesAPI.getAll().then(({data}) => {
                    vm.companies = _.map(data,(company) => {
                        company.formatedDateCreated = moment(company.dateCreated).format('DD/MM/YYYY HH:mm:ss');
                        return company;
                    });
                }).catch((err) => {
                    console.log(err);
                });
            },
            companyClicked(company){
                this.$modal.show('company-form', {
                    company
                });
            },
            addCompany(){
                this.$modal.show('company-form', {
                    company: null
                });
            },
            refresh(){
                this.loadCompanies();
            }
        },
        created(){
            const vm = this;
            vm.loadCompanies();
            vm.$bus.$on('user-updated', function(){
                vm.refresh();
            });
            vm.$bus.$on('company-removed', function(id){
                console.log("Removed "+id);
                vm.companies = _.filter(vm.companies, function(company){
                    if(company.id !== id) return true;
                });
            });
            vm.$bus.$on('company-created', () => {
                vm.refresh();
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