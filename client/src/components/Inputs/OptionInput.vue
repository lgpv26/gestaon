<template>
    <tbody class="parent">
    <tr>
        <td style="width: 94px;">
            <app-tooltip content="Visível/Invisível" placement="top" :enterable="false">
                <a class="device-action" @click="toggleDeviceVisibility(device.code); $bus.$emit('device-action', {action: 'toggle-visibility', device})"
                   :class="{ active: device.visible }"><i class="mi mi-visibility"></i></a>
            </app-tooltip>
            <app-tooltip content="Visualizar rastro" placement="top" :enterable="false">
                <a class="device-action" @click="toggleDeviceTrack(device.code); $bus.$emit('device-action', {action: 'toggle-track', device})"
                   :class="{ active: device.track }"><i class="mi mi-trending-up"></i></a>
            </app-tooltip>
            <app-tooltip content="Seguir dispositivo" placement="top" :enterable="false">
                <a class="device-action" @click="followDevice(device.code)"
                   :class="{ active: follow === device.code }"><i class="mi mi-play-arrow"></i></a>
            </app-tooltip>
        </td>
        <td class="device-name" :class="{'selected': selected === device.code}" @click="deviceClicked(device)">{{ device.name }}<span v-show="follow === device.code"> (T)</span></td>
        <td @click="deviceClicked(device)">{{ lastTime }} <small v-if="lastPosition.generatedAt">(<timeago :since="lastPosition.generatedAt" :auto-update="5"></timeago> )</small></td>
        <td @click="deviceClicked(device)" :style="'color:' + deviceState.color">{{ deviceState.text }}</td>
        <td class="toggle-device-details">
            <a @click="toggleDeviceDetails()" :class="{active: showDetails}">
                <i class="mi mi-keyboard-arrow-up" v-if="showDetails"></i>
                <i class="mi mi-keyboard-arrow-down" v-else></i>
            </a>
        </td>
    </tr>
    <tr v-show="showDetails">
        <td colspan="4" style="padding-top: 0;">
            <div class="device-details">
                <a class="" @click="editDeviceButton(device)">
                    Editar
                </a>
                <a class="" @click="$bus.$emit('device-edit-fence')">
                    Fences
                </a>
                <div class="device-address" v-if="address">
                    <span>{{ address }}</span>
                </div>
                <div class="device-altitude">
                    <span>{{ altitude }} M</span>
                </div>
                <div class="device-speed">
                    <span>{{ speed }} Km/h</span>
                </div>
                <div class="device-battery">
                    <span>{{ battery }} %</span>
                </div>
                <div class="device-direction">
                    <span>{{ direction }}</span>
                </div>
                <div class="device-base-distance">
                    <span>{{ baseDistance }} M</span>
                </div>
            </div>
        </td>
    </tr>
    </tbody>
</template>
<script>
    import moment from 'moment';
    import utils from '../../../../utils';
    import geolib from 'geolib/dist/geolib';
    import _ from 'lodash';

    import { mapState, mapActions, mapMutations } from 'vuex';
    import DevicesAPI from '../../../../api/devices';

    export default {
        data(){
            return {
                editingDevice: false,
                showDetails: false,
                form: {
                    name: this.device.name,
                    status: this.device.status
                }
            }
        },
        props: {
            device: {
                validator: function(device){
                    return !!device;
                },
                default: function(){
                    return {};
                }
            },
            lastPosition: {
                validator: function(lastPosition){
                    return !!lastPosition;
                },
                default: function(){
                    return {};
                }
            }
        },
        computed: {
            ...mapState('tracker', [
                'selected',
                'follow'
            ]),
            deviceState(){
                if(_.has(this.lastPosition, 'deviceState')) {
                    switch (this.lastPosition.deviceState) {
                        case "ACC_START":
                            return {
                                text: 'Chave ligada',
                                color: 'greenyellow'
                            };
                            break;
                        case "ACC_OFF":
                            return {
                                text: 'Chave desligada',
                                color: 'orange'
                            };
                            break;
                        case "IDLE":
                            return {
                                text: 'Parado',
                                color: 'red'
                            };
                            break;
                        default:
                            return {
                                text: 'Ativo',
                                color: '#FFF'
                            }
                    }
                }
                else{
                    return {
                        text: '---',
                        color: '#CCC'
                    }
                }
            },
            address(){
                if(_.has(this.lastPosition, 'address'))
                    return this.lastPosition.address;
            },
            lastTime(){
                if(_.has(this.lastPosition, 'generatedAt'))
                    return moment(this.lastPosition.generatedAt).format('DD/MM/YYYY HH:mm:ss');
                else
                    return '---';
            },
            battery(){
                if(_.has(this.lastPosition, 'battery'))
                    return this.lastPosition.battery;
                else
                    return '---';

            },
            speed(){
                if(_.has(this.lastPosition, 'speed'))
                    return Math.round(this.lastPosition.speed);
                else
                    return '---';
            },
            altitude(){
                if(_.has(this.lastPosition, 'altitude'))
                    return parseInt(this.lastPosition.altitude);
                else
                    return '---';
            },
            direction(){
                if(_.has(this.lastPosition, 'bearing'))
                    return utils.getDirection(this.lastPosition.bearing);
                else
                    return '---';
            },
            baseDistance(){
                if(_.has(this.lastPosition, 'latitude') && _.has(this.lastPosition, 'longitude')){
                    return geolib.getDistance(
                        { latitude: parseFloat(this.lastPosition.latitude), longitude: parseFloat(this.lastPosition.longitude)},
                        { latitude: -23.4134652, longitude: -51.9035723}
                    );
                }
                else {
                    return '???';
                }
            }
        },
        methods: {
            ...mapMutations('tracker', ['toggleDeviceVisibility','toggleDeviceTrack']),
            ...mapActions('tracker', ['updateDevice','followDevice','selectDevice']),
            deviceClicked(device){
                this.$router.replace("/tracker");
                this.selectDevice(device.code);
                /*this.showDeviceDetails();*/
                this.$bus.$emit('device-choose',device);
            },
            showDeviceDetails(){
                this.showDetails = true;
            },
            toggleDeviceDetails(){
                this.showDetails = !this.showDetails;
            },
            editDeviceButton(device){
                this.$modal.show('device-form', {
                    device
                });
            },
            remove(){
                const vm = this;
                DevicesAPI.removeOne(this.form.id).then(function(response){
                    vm.$emit('itemRemoved');
                });
            },
            save(){
                this.updateDevice({
                    data: this.device,
                    form: this.form
                });
            }
        },
        created(){
            const vm = this;
            vm.$bus.$on('device-edit', function(device){
                if(JSON.stringify(vm.device) === JSON.stringify(device)){
                    vm.editingDevice = !vm.editingDevice;
                }
                else{
                    vm.editingDevice = false;
                }
            });
        }
    }
</script>

<style scoped>
    h3 {
        text-transform: uppercase;
        margin-bottom: 10px;
        color: #FFF;
    }

    div.parent{
        background: linear-gradient(180deg, #18A2E2 0%, #15CFDA 100%);
        color: #FFF;
        padding: 20px;
        width: 320px;
        display: flex;
        flex-direction: column;
    }

    thead th {
        color: #FFF;
        font-weight: bold;
        padding-bottom: 5px;
    }

    tbody {
        border-bottom: 1px solid rgba(0,0,0,.1)
    }

    tbody:last-child {
        border-bottom: 0 none;
    }

    tbody td {
        color: #EEE;
        padding: 5px 20px;
        cursor: pointer;
        border-bottom: 0;
    }

    tbody td.selected {
        color: #61AFEF;
        font-weight: bold;
    }

    td.device-name {
        font-weight: bold;
        width: 200px;
    }

    div.device-details {
        position: relative;
        padding: 10px;
        background: rgba(150,150,150,.1);
    }

    div.device-details a.edit-button {
        position: absolute;
        top: 0;
        right: 0;
    }

    td.toggle-device-details {
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    td.toggle-device-details a {
        font-size: 16px;
        height: 18px;
        width: 18px;
        display: flex;
        align-self: center;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        background-color: rgba(150,150,150,0.1);
        margin-right: 2px;
    }

    td.toggle-device-details a i {
        position: relative;
        top: 0;
    }

    td.toggle-device-details a.active {
        background-color: #61AFEF;
        color: #FFF;
    }

    a.device-action {
        position: relative;
        top: 3px;
    }

    a.device-action > i {
        font-size: 15px;
        margin-top: -3px;
    }

    a.device-action.active {
        color: #61AFEF;
    }
</style>
