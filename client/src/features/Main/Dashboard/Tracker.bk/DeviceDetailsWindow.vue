<template>
    <div id="device-details-window" v-show="selectedDevice">
        <app-panel-loading :loading="loading" text="Carregando rotas..."></app-panel-loading>
        <h3 class="device-name">{{ selectedDevice.name }} <small>( <strong>{{ selectedDevice.code }}</strong> )</small></h3>
        <div scrollbar ref="scrollbar" style="width: 100%">
            <div class="scrollable-content">
                <div class="device-details-sections">
                    <div class="table">
                        <table>
                            <tbody class="parent">
                            <tr>
                                <td style="width: 145px;">Horário</td>
                                <td>{{ lastTime }}</td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                <td>
                                    <i class="mi mi-smartphone" v-if="selectedDevice.protocol === 'osmand' || selectedDevice.isPortable"></i>
                                    <i class="mi mi-vpn-key" v-else-if="isAccOn" :style="'color: #8AC363;'"></i>
                                    <i class="mi mi-vpn-key" v-else :style="'color: #D46C63;'"></i>
                                    <span v-if="isLoadingDeviceState"> Carregando...</span>
                                    <span v-else-if="isInactive" :style="'color: #D46C63;'"> Inativo</span>
                                    <span v-else-if="isIdle" :style="'color: #D19A66'"> Ocioso</span>
                                    <span v-else> Ativo</span>
                                </td>
                            </tr>
                            <tr v-if="address">
                                <td>Endereço</td>
                                <td>{{ address }}</td>
                            </tr>
                            <tr>
                                <td>Velocidade</td>
                                <td>{{ speed }} km/h</td>
                            </tr>
                            <tr v-if="battery">
                                <td>Bateria</td>
                                <td>{{ battery }}%</td>
                            </tr>
                            <tr>
                                <td>Direção</td>
                                <td>{{ direction }}</td>
                            </tr>
                            <tr v-if="baseDistance">
                                <td>Distância > Base</td>
                                <td>{{ baseDistance }} m</td>
                            </tr>
                            <tr v-if="altitude">
                                <td>Altitude</td>
                                <td>{{ altitude }}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="device-details-section">
                        <h3>Detalhes</h3>
                        <div class="table">
                            <table>
                                <tbody class="parent">
                                    <tr>
                                        <td style="width: 145px;">Nome</td>
                                        <td>{{ selectedDevice.name }}</td>
                                    </tr>
                                    <tr>
                                        <td>Código</td>
                                        <td>{{ selectedDevice.code }}</td>
                                    </tr>
                                    <tr>
                                        <td>Telefone</td>
                                        <td>{{ selectedDevice.phoneNumber }}</td>
                                    </tr>
                                    <tr>
                                        <td>Protocolo</td>
                                        <td>{{ protocol }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!--
                    <div class="device-details-section" v-if="hasPermission('devices.command')">
                        <h3>Comandos</h3>
                        <div class="device-details-section-content">
                            <app-select class="command-selector" :options="commandOptions" position="top" v-model="selectedCommand"></app-select>
                            <a @click="sendCommand()" class="button">Enviar Comando</a>
                        </div>
                    </div>
                    -->
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import moment from 'moment';
    import _ from 'lodash';
    import utils from '../../../../utils/index';
    import geolib from 'geolib/dist/geolib';
    import Scrollbar from 'smooth-scrollbar';

    import DevicesAPI from '../../../../api/devices';

    import { mapGetters, mapState, mapActions } from 'vuex';

    export default {
        data(){
            return {
                loading: false,
                scrollbar: null,
                commands: [],
                commandOptions: [],
                selectedCommand: null,
                isIdle: false,
                isInactive: false,
                deviceStateCheckInterval: null,
                isLoadingDeviceState: true
            }
        },
        watch: {
            selectedDevice(device){
                if(this.deviceStateCheckInterval) clearInterval(this.deviceStateCheckInterval);
                if (!device) return;
                else {
                    this.deviceStateCheckInterval = setInterval(() => {
                        vm.checkDeviceState();
                        vm.isLoadingDeviceState = false;
                    }, 0);
                }
                switch (device.protocol) {
                    case "osmand":
                        this.commandOptions = [
                            {
                                text: 'Enviar teste',
                                value: 'test'
                            }
                        ];
                        break;
                    case "gps103":
                        this.commandOptions = [
                            {
                                text: 'Status',
                                value: 'status'
                            }
                        ];
                        break;
                    case "tlt2h":
                        this.commandOptions = [
                            {
                                text: 'Status',
                                value: 'status'
                            }
                        ];
                        break;
                }
                const vm = this;
                setTimeout(function(){
                    vm.scrollbar.update();
                    vm.scrollbar.setPosition(0, 0);
                }, 0);
            }
        },
        computed: {
            ...mapState('auth', [
                'company', 'companySettings'
            ]),
            ...mapState('tracker', [
                'devices'
            ]),
            ...mapGetters('auth', ['hasPermission']),
            ...mapGetters('tracker', [
                'selectedDevice',
                'devicesSelectOptions'
            ]),
            isAccOn(){
                if(_.has(this.selectedDevice, 'lastPosition.isAccOn'))
                    return this.selectedDevice.lastPosition.isAccOn;
                else
                    return false;
            },
            address(){
                if(_.has(this.selectedDevice, 'lastPosition.address'))
                    return this.selectedDevice.lastPosition.address;
                else
                    return false;
            },
            lastTime(){
                if(_.has(this.selectedDevice, 'lastPosition.generatedAt'))
                    return moment(this.selectedDevice.lastPosition.generatedAt).format('DD/MM HH:mm:ss');
                else
                    return '---';
            },
            battery(){
                if(_.has(this.selectedDevice, 'lastPosition.battery'))
                    return this.selectedDevice.lastPosition.battery;
                else
                    return false;

            },
            speed(){
                if(_.has(this.selectedDevice, 'lastPosition.speed'))
                    return Math.round(this.selectedDevice.lastPosition.speed);
                else
                    return 0;
            },
            altitude(){
                if(_.has(this.selectedDevice, 'lastPosition.altitude'))
                    return parseInt(this.selectedDevice.lastPosition.altitude);
                else
                    return false;
            },
            direction(){
                if(_.has(this.selectedDevice, 'lastPosition.bearing'))
                    return utils.getDirection(this.selectedDevice.lastPosition.bearing);
                else
                    return '---';
            },
            protocol(){
                if(_.has(this.selectedDevice, 'protocol'))
                    switch(this.selectedDevice.protocol){
                        case "osmand":
                            return "OsmAnd";
                            break;
                        case "gps103":
                            return "GPS103";
                            break;
                        case "tlt2h":
                            return "TLT2H";
                            break;
                        case "agiliza":
                            return "AgilizaGPS";
                            break;
                    }
                else
                    return '---';
            },
            baseDistance(){
                if(_.has(this.selectedDevice, 'lastPosition')){
                    if(this.companySettings.companyBaseLatitude && this.companySettings.companyBaseLongitude){
                        return geolib.getDistance(
                            { latitude: parseFloat(this.selectedDevice.lastPosition.latitude), longitude: parseFloat(this.selectedDevice.lastPosition.longitude)},
                            { latitude: this.companySettings.companyBaseLatitude, longitude: this.companySettings.companyBaseLongitude}
                        );
                    }
                    return geolib.getDistance(
                        { latitude: parseFloat(this.selectedDevice.lastPosition.latitude), longitude: parseFloat(this.selectedDevice.lastPosition.longitude)},
                        { latitude: -23.4134652, longitude: -51.9035723}
                    );
                }
                else {
                    return false;
                }
            }
        },
        methods: {
            ...mapActions('tracker', [
                'selectDevice'
            ]),
            sendCommand(){
                if(!this.selectedCommand){
                    console.log("Nenhum comando selecionado.");
                    return;
                }
                DevicesAPI.sendCommand(this.selectedDevice.id, {
                    command: this.selectedCommand
                }, {
                    companyId: this.company.id
                }).then((response) => {
                    console.log(response);
                }).catch((err) => {
                    console.log(err);
                });
            },
            checkDeviceState(){
                const vm = this;
                vm.isIdle = false; vm.isInactive = false;
                if(_.has(vm.selectedDevice, 'settings.minimumTimeToIdle')){
                    let differenceInSecondsToLastPosition = parseInt(moment.duration(moment().diff(vm.selectedDevice.lastPosition.generatedAt)).asSeconds());
                    vm.isIdle = parseInt(this.selectedDevice.settings.minimumTimeToIdle) <= differenceInSecondsToLastPosition;
                }
                if(_.has(vm.selectedDevice, 'settings.minimumTimeToInactive')){
                    let differenceInMinutesToLastPosition = parseInt(moment.duration(moment().diff(vm.selectedDevice.lastPosition.generatedAt)).asMinutes());
                    vm.isInactive = parseInt(this.selectedDevice.settings.minimumTimeToInactive) <= differenceInMinutesToLastPosition;
                }
            }
        },
        mounted(){
            // initialize scrollbars
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            });
        },
        beforeDestroy(){
            if(this.deviceStateCheckInterval) clearInterval(this.deviceStateCheckInterval);
        }
    }
</script>

<style scoped>
    h3 {
        text-transform: uppercase;
        padding: 15px 20px;
        margin-bottom: 0;
        color: #FFF;
    }

    h3.device-name {
        padding: 15px 20px;
        margin-bottom: 0;
    }

    h3 > small {
        font-size: 10px;
    }

    h3 > small > strong {
        color: greenyellow;
    }

    #device-details-window {
        flex-shrink: 0;
        flex-direction: column;
        display: none; position: absolute; z-index: 999999999; background-color: #2A2B33; box-shadow: 0px 1px 3px #151515; top: 0; left: 0; width: 400px; height: 200px;
    }

    #device-details-window div.device-details-sections {
        display: flex;
        flex-direction: column;
        margin-bottom: 15px;
    }

    #device-details-window div.device-details-section {
        display: flex;
        flex-direction: column;
        margin-bottom: 0;
    }

    #device-details-window div.device-details-section > div.device-details-section-content {
        padding: 0 20px;
        display: flex;
        flex-direction: row;
    }

    #device-details-window div.device-details-section > div.device-details-section-content .command-selector {
        flex-grow: 1;
        margin-right: 20px;
    }

    thead th {
        color: #FFF;
        font-weight: bold;
        padding-bottom: 5px;
    }

    tbody td {
        color: #EEE;
        padding: 5px 20px 5px;
        cursor: pointer;
        border-bottom: 1px solid rgba(0,0,0,.1);
    }

    div.device-details {
        position: relative;
    }

    div.device-details a.edit-button {
        position: absolute;
        top: 0;
        right: 0;
    }
</style>
