<template>
    <div class="app-settings">
        <div class="settings-left-column">
            <div class="sidebar-menu">
                <ul>
                    <li class="menu-header"><h3>CONFIGURAÇÕES</h3></li>
                    <li class="settings-menu-item" :class="{active: activeSetting === 'account'}" @click="activeSetting = 'account'">Conta</li>
                    <li class="settings-menu-item" :class="{active: activeSetting === 'company'}" @click="activeSetting = 'company'">Empresa</li>
                    <li class="settings-menu-item" :class="{active: activeSetting === 'tracking'}" @click="activeSetting = 'tracking'">Rastreamento</li>
                </ul>
            </div>
        </div>
        <div class="settings-right-column">
            <div class="module-panel">
                <div class="active-setting" v-if="activeSetting === 'account'">
                    <header>
                        <h3>CONTA</h3>
                    </header>
                    <form>
                        <div class="settings-subsection">
                            <h3>Seu usuário</h3>
                            <div class="columns">
                                <div class="column">
                                    Nome
                                    <input type="text" v-model="form.user.name" readonly />
                                </div>
                                <div class="column is-6">
                                    E-mail
                                    <input type="text" v-model="form.user.email" readonly />
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column">
                                    Última atualização
                                    <input type="text" v-model="form.user.dateUpdated" readonly />
                                </div>
                                <div class="column is-6">
                                    Data de cadastro
                                    <input type="text" v-model="form.user.dateCreated" readonly />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="active-setting" v-show="activeSetting === 'company'">
                    <section>
                        <header>
                            <h3>EMPRESA</h3>
                        </header>
                        <div class="settings-subsection">
                            <div class="columns">
                                <div class="column">
                                    Nome
                                    <input type="text" v-model="form.company.name" readonly />
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column">
                                    Última atualização
                                    <input type="text" v-model="form.company.dateUpdated" readonly />
                                </div>
                                <div class="column is-6">
                                    Data de cadastro
                                    <input type="text" v-model="form.company.dateCreated" readonly />
                                </div>
                            </div>
                        </div>
                    </section>
                    <section v-show="hasPermission('users.edit')">
                        <keep-alive>
                            <app-company-users v-if="activeSetting === 'company'"></app-company-users>
                        </keep-alive>
                    </section>
                </div>
                <div class="active-setting" v-if="activeSetting === 'tracking'">
                    <header>
                        <h3>RASTREAMENTO</h3>
                    </header>
                    <form>
                        <!--
                        <div class="columns">
                            <div class="column">
                                Número máximo de dispositivos
                                <input type="number" placeholder="1, 2, 3..." v-model="form.maxAllowedDevices" />
                            </div>
                        </div>
                        -->
                        <div class="columns">
                            <div class="column">
                                <div class="settings-subsection">
                                    <h3>Base da empresa</h3>
                                    <p>Esta configuração pode ser alterada clicando com o botão direito no mapa principal.</p>
                                    <div class="columns">
                                        <div class="column">
                                            Latitude
                                            <input type="textr" placeholder="..." readonly v-model="form.companySettings.companyBaseLatitude" />
                                        </div>
                                        <div class="column">
                                            Longitude
                                            <input type="text" placeholder="..." readonly v-model="form.companySettings.companyBaseLongitude" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="columns">
                            <div class="column">
                                <div class="settings-subsection">
                                    <h3>Mapa ao entrar no sistema</h3>
                                    <p>Esta configuração pode ser alterada clicando com o botão direito no mapa principal.</p>
                                    <div class="columns">
                                        <div class="column">
                                            Latitude padrão
                                            <input type="textr" placeholder="..." readonly v-model="form.companySettings.onMapLoadLatitude" />
                                        </div>
                                        <div class="column">
                                            Longitude padrão
                                            <input type="text" placeholder="..." readonly v-model="form.companySettings.onMapLoadLongitude" />
                                        </div>
                                    </div>
                                    <div class="columns">
                                        <div class="column">
                                            Zoom padrão
                                            <input type="number" placeholder="..." readonly :value="form.companySettings.onMapLoadZoom" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="close-settings" @click="closeSettings" v-tippy="{ position: 'left', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }" :title="'Fechar configurações'">
            <i class="mi mi-arrow-back"></i>
        </div>
    </div>
</template>

<script>

    import {mapGetters,mapActions,mapState} from 'vuex';
    import CompaniesAPI from '../../../api/companies';
    import moment from 'moment';
    import CompanyUsersComponent from './CompanyUsers.vue';
    import _ from 'lodash';

    export default {
        name: 'app-settings',
        computed: {
            ...mapGetters('auth', ['hasPermission']),
            ...mapState('auth', ['user', 'company','settings','companySettings'])
        },
        props: ['showSettings'],
        watch: {
            settings(settings){
                this.form.actingCities = settings.actingCities;
            },
            company(newData, oldData){
                if(JSON.stringify(newData.companySettings) !== JSON.stringify(oldData.companySettings)){
                    _.assign(this.form.companySettings, newData.companySettings);
                }
            },
            companySettings(newData, oldData){
                if(JSON.stringify(newData) !== JSON.stringify(oldData)){
                    this.form.companySettings = _.assign({}, this.form.companySettings, newData);
                }
            }
        },
        components: {
            'app-company-users': CompanyUsersComponent
        },
        data(){
            return {
                activeSetting: 'account',
                form: {
                    user: {
                        name: null,
                        email: null,
                        company: {
                            name: null,
                            dateUpdated: null,
                            dateCreated: null
                        },
                        dateUpdated: null,
                        dateCreated: null
                    },
                    company: {
                    },
                    actingCities: '',
                    companySettings: {}
                }
            }
        },
        methods: {
            ...mapActions('auth', ['saveCompanySettings']),
            ...mapActions('toast', ['showToast']),
            closeSettings(){
                this.$emit('update:showSettings', false);
            },
            loadSettings(){
                this.form.user.name = this.user.name;
                this.form.user.email = this.user.email;
                this.form.user.company.name = this.company.name;
                this.form.user.company.dateUpdated = moment(this.company.dateUpdated).format("DD/MM/YYYY HH:mm");
                this.form.user.company.dateCreated = moment(this.company.dateCreated).format("DD/MM/YYYY HH:mm");
                this.form.user.dateUpdated = moment(this.user.dateUpdated).format("DD/MM/YYYY HH:mm");
                this.form.user.dateCreated = moment(this.user.dateCreated).format("DD/MM/YYYY HH:mm");
                this.form.actingCities = this.settings.actingCities;
                _.assign(this.form.companySettings, this.companySettings);
            },
            save(form){
                const vm = this;
                this.saveCompanySettings(form).then(()=>{
                    vm.showToast({
                        type: 'success',
                        message: 'Configurações salvas.'
                    });
                });
            }
        },
        mounted(){
            const vm = this;
            vm.loadSettings();
            window.addEventListener('keydown', function (e) {
                if (vm.showSettings && (e.keyCode === 27)) {
                    // If esc or backspace
                    e.preventDefault();
                    vm.$emit('update:showSettings', false);
                }
            });
            _.assign(this.form.company, this.company);
        }
    }
</script>

<style scoped>

    div.app-settings {
        background: #26272E;
    }

    div.app-settings div.module-panel header {
        margin: 0 0 10px;
    }

    div.settings-left-column {
        flex-grow: 1;
        flex-shrink: 0;
        flex-basis: 0;
        display: flex;
        justify-content: flex-end;
    }

    div.settings-left-column .sidebar-menu {
        padding: 60px 0;
        width: 220px;
    }

    div.sidebar-menu ul {
        padding-right: 20px;
    }

    div.sidebar-menu ul li {
        color: #EEE;
    }

    div.sidebar-menu ul li.menu-header {
        padding: 3px 8px 5px;
        margin-bottom: 5px;
    }

    div.sidebar-menu ul li.menu-header h3 {
        color: #CCC;
        font-size: 12px;
    }

    div.sidebar-menu ul li.settings-menu-item {
        border-radius: 5px;
        padding: 5px 8px;
        font-size: 16px;
        margin-bottom: 3px;
        cursor: pointer;
    }

    div.sidebar-menu ul li.settings-menu-item.active {
        padding: 5px 8px;
        background: #61AFEF;
        color: #FFF;
    }

    div.settings-right-column {
        flex-grow: 2;
        flex-shrink: 0;
        flex-basis: 0;
        overflow: auto;
        background: #36373F;
    }

    div.settings-right-column div.module-panel {
        padding: 60px 40px;
        max-width: 740px;
        min-width: 700px;
    }

    div.module-panel h3 {
        text-transform: uppercase;
        font-weight: bolder;
        font-size: 16px;
    }

    div.parent > form {
        margin-top: 10px;
    }

    div.close-settings {
        position: absolute;
        top: 34px;
        right: 34px;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #FFF;
        text-transform: uppercase;
        cursor: pointer;
        border-radius: 50%;
        border: 2px solid #CCC;
    }

    div.close-settings i {
        font-size: 24px;
        padding: 5px;
    }

    div.settings-subsection {
        border: 1px solid rgba(32,34,37,.6);
        background-color: #26272E;
        border-radius: 5px;
        padding: 20px;
    }

    div.settings-subsection h3 {
        color: #FFF;
        margin-bottom: 10px;
    }

    div.settings-subsection p {
        margin-top: -10px;
        margin-bottom: 15px;
    }

    div.active-setting {
        display: flex;
        flex-direction: column;
    }

    div.active-setting > section {
        margin-bottom: 40px;
    }

    div.active-setting > section:last-child {
        margin-bottom: 0px;
    }

</style>
