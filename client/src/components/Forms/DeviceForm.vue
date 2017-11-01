<template>
    <div scrollbar style="width: 100%">
        <div class="scrollable-content">
            <div class="device-form">
                <app-panel-loading :loading="loading" :loadingText="'Carregando...'"></app-panel-loading>
                <div class="modal-container">
                    <div class="columns">
                        <div class="column">
                            <h3 class="form-title">DISPOSITIVO</h3>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column is-6">
                            Nome
                            <input type="text" placeholder="NOME" v-model="form.name" />
                        </div>
                        <div class="column">
                            Identificador (ou IMEI)
                            <input type="text" placeholder="CÓDIGO" v-model="form.code" />
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            Telefone
                            <the-mask placeholder="(##) ####-####" :mask="['(##) ####-####', '(##) #####-####']" v-model="form.phoneNumber" />
                        </div>
                        <div class="column">
                            Protocolo
                            <app-select :options="protocolSelectOptions" position="bottom" v-model="form.protocol"></app-select>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <div style="display: flex;">
                                Cor do dispositivo
                                <app-color-picker v-model="form.color" style="margin-left: 8px;"></app-color-picker>
                            </div>
                        </div>
                        <div class="column">
                            <div style="display: flex;">
                                É portátil
                                <app-switch v-model="form.isPortable" style="margin-left: 8px;"></app-switch>
                            </div>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <div class="device-form-subsection">
                                <h3>AVANÇADO</h3>
                                <div class="columns">
                                    <div class="column">
                                        Comprimento do rastro (s)
                                        <input type="number" placeholder="300" v-model="form.settings.trackLength" />
                                    </div>
                                </div>
                                <div class="columns">
                                    <div class="column">
                                        Mín. de tempo para status ocioso (s)
                                        <input type="number" placeholder="90" v-model="form.settings.minimumTimeToIdle" />
                                    </div>
                                    <div class="column">
                                        Mín. de tempo para status inativo (m)
                                        <input type="number" placeholder="60" v-model="form.settings.minimumTimeToInactive" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <a v-if="device && hasPermission('devices.remove')" @click="remove()" class="button is-red" style="float: left;">
                                Remover
                            </a>
                            <a v-if="device && hasPermission('devices.edit')" @click="update()" class="button is-primary" style="float: right">
                                Salvar
                            </a>
                            <a v-else @click="create()" class="button btn-primary" style="float: right">
                                Adicionar
                            </a>
                            <a v-if="!device" @click="reset()" class="button is-yellow" style="float: right; margin-right: 5px;">
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
    import { mapGetters, mapState, mapActions } from 'vuex';
    import devicesAPI from '../../api/devices';
    import Scrollbar from 'smooth-scrollbar';
    import ColorPickerComponent from '../Inputs/ColorPicker.vue';
    import PanelLoadingComponent from '../Utilities/PanelLoading.vue';
    import _ from 'lodash';
    export default {
        props: {
            value: {
                default: null
            },
            device: {
                default: null
            }
        },
        components: {
            'app-panel-loading': PanelLoadingComponent,
            'app-color-picker': ColorPickerComponent
        },
        data(){
            return {
                scrollbars: null,
                loading: false,
                form: {
                    id: null,
                    companyId: null,
                    obs: null,
                    name: null,
                    code: null,
                    phoneNumber: null,
                    color: "#EEE",
                    isPortable: false,
                    settings: {
                        trackLength: 360,
                        minimumTimeToIdle: 90,
                        minimumTimeToInactive: 60,
                    },
                    protocol: 'agiliza'
                },
                protocolSelectOptions: [
                    {
                        text: 'Android / iOS',
                        value: 'agiliza'
                    },
                    {
                        text: 'OsmAnd',
                        value: 'osmand'
                    },
                    {
                        text: 'TLT2H',
                        value: 'tlt2h'
                    },
                    {
                        text: 'GPS103',
                        value: 'gps103'
                    }
                ]
            }
        },
        computed: {
            ...mapGetters('auth', ['hasPermission']),
            ...mapState('auth', ['user', 'company'])
        },
        methods: {
            ...mapActions('tracker', ['loadDevices']),
            ...mapActions('toast', ['showToast','showError']),
            update(){
                const vm = this;
                vm.loading = true;
                devicesAPI.updateOne(vm.form.id, vm.form, {companyId: vm.company.id}).then((response) => {
                    vm.loadDevices(vm.company.id).then(() => {
                        vm.$modal.hide('device-form');
                        vm.showToast({
                            type: "success",
                            message: "Dispositivo \"" + vm.form.name + "\" salvo com sucesso."
                        });
                        vm.$socket.emit('leave-device-room', vm.device.code);
                        vm.$socket.emit('join-device-room', vm.form.code);
                        vm.$bus.$emit('device-updated');
                        vm.loading = false;
                    }).catch((error) => {
                        vm.loading = false;
                        vm.showError(error.body.detailed);
                    });
                }).catch((error) => {
                    vm.loading = false;
                    vm.showError(error.body.detailed);
                });
            },
            remove(){
                const vm = this;
                vm.loading = true;
                devicesAPI.removeOne(vm.form.id, {companyId: vm.company.id}).then(({data}) => {
                    vm.loadDevices(vm.company.id).then(() => {
                        vm.$modal.hide('device-form');
                        vm.showToast({
                            type: "success",
                            message: "Dispositivo \"" + vm.form.name + "\" removido com sucesso."
                        });
                        vm.$socket.emit('leave-device-room', vm.device.code);
                        vm.$bus.$emit('device-removed');
                        vm.loading = false;
                    }).catch((error) => {
                        console.log(error);
                        vm.showToast({
                            type: "error",
                            message: "Erro ao atualizar os dispositivos. Recarregue a página."
                        });
                    });
                }).catch((error) => {
                    vm.loading = false;
                    vm.showError(error.body.detailed);
                });
            },
            create(){
                const vm = this;
                vm.loading = true;
                _.assign(vm.form, {companyId: vm.company.id});
                devicesAPI.createOne(vm.form, {companyId: vm.company.id}).then(({data}) => {
                    vm.loadDevices(vm.company.id).then(() => {
                        vm.$modal.hide('device-form');
                        vm.showToast({
                            type: "success",
                            message: "Dispositivo \"" + vm.form.name + "\" adicionado com sucesso."
                        });
                        vm.$socket.emit('join-device-room', data.code);
                        vm.$bus.$emit('device-created');
                        vm.loading = false;
                    }).catch((error) => {
                        vm.showToast({
                            type: "error",
                            message: "Erro ao atualizar os dispositivos. Recarregue a página."
                        });
                    });
                }).catch((error) => {
                    vm.loading = false;
                    vm.showError(error.body.detailed);
                });
            },
            reset(){
                Object.assign(this.$data, this.$options.data());
            }
        },
        created(){
            const vm = this;
            vm.reset();

        },
        mounted(){
            if(this.device){
                _.assign(this.form, _.pick(_.cloneDeep(this.device), _.keys(this.form)));
            }
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
