<template>
    <tbody class="parent">
        <tr>
            <td style="width: 94px;">
                <a class="device-action" v-tippy="{ theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Visível/Invisível'" @click="toggleDeviceVisibility(device.code); $bus.$emit('device-action', {action: 'toggle-visibility', device})"
                       :class="{ active: device.visible }"><i class="mi mi-visibility"></i></a>
                <a class="device-action" v-tippy="{ theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Visualizar rastro'" @click="toggleDeviceTrack(device.code); $bus.$emit('device-action', {action: 'toggle-track', device})"
                       :class="{ active: device.track }"><i class="mi mi-trending-up"></i></a>
                <a class="device-action" v-tippy="{ theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Seguir dispositivo'" @click="followDevice(device.code)"
                       :class="{ active: follow === device.code }"><i class="mi mi-play-arrow"></i></a>
            </td>
            <td class="device-name" :class="{'selected': selected === device.code}" @click="deviceClicked(device)">{{ device.name }}<span v-show="follow === device.code"> (T)</span></td>
            <td @click="deviceClicked(device)">{{ lastTime }} <small v-if="lastPosition.generatedAt">(<timeago :since="lastPosition.generatedAt" :auto-update="5"></timeago> )</small></td>
            <td @click="deviceClicked(device)">{{ address }}</td>
            <td @click="deviceClicked(device)">
                <i class="mi mi-smartphone" v-if="device.protocol === 'osmand' || device.isPortable"></i>
                <i class="mi mi-vpn-key" v-else-if="isAccOn" :style="'color: #8AC363;'"></i>
                <i class="mi mi-vpn-key" v-else :style="'color: #D46C63;'"></i>
                <span v-if="!lastPosition.latitude && !lastPosition.longitude"> ---</span>
                <span v-else-if="isLoadingDeviceState"> Carregando...</span>
                <span v-else-if="isInactive" :style="'color: #D46C63;'"> Inativo</span>
                <span v-else-if="isIdle" :style="'color: #D19A66'"> Ocioso</span>
                <span v-else> Ativo</span>
            </td>
            <td class="edit-device">
                    <a @click="editDeviceButton()" v-tippy="{ theme: 'light', inertia: true, arrow: true, animation: 'perspective' }"  :title="'Editar ' + device.name">
                        <i class="mi mi-edit"></i>
                    </a>
            </td>
        </tr>
    </tbody>
</template>
<script>
    import moment from 'moment';
    import utils from '../../../../../utils/index';
    import geolib from 'geolib/dist/geolib';
    import _ from 'lodash';

    import { mapState, mapActions, mapMutations } from 'vuex';
    import DevicesAPI from '../../../../../api/devices';

    export default {
        data(){
            return {
                editingDevice: false,
                isIdle: false,
                isInactive: false,
                form: {
                    name: this.device.name,
                    status: this.device.status
                },
                deviceStateCheckInterval: null,
                isLoadingDeviceState: true
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
            isAccOn(){
                if(_.has(this.lastPosition, 'isAccOn'))
                    return this.lastPosition.isAccOn;
                else
                    return false;
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
                this.$bus.$emit('device-choose',device);
            },
            editDeviceButton(){
                this.$bus.$emit('device-details-window-hide');
                this.$modal.show('device-form', { device: this.device });
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
            },
            checkDeviceState(){
                const vm = this;
                vm.isIdle = false; vm.isInactive = false;
                if(_.has(this.device, 'settings.minimumTimeToIdle')){
                    let differenceInSecondsToLastPosition = parseInt(moment.duration(moment().diff(vm.lastPosition.generatedAt)).asSeconds());
                    vm.isIdle = parseInt(this.device.settings.minimumTimeToIdle) <= differenceInSecondsToLastPosition;
                }
                if(_.has(this.device, 'settings.minimumTimeToInactive')){
                    let differenceInMinutesToLastPosition = parseInt(moment.duration(moment().diff(vm.lastPosition.generatedAt)).asMinutes());
                    vm.isInactive = parseInt(this.device.settings.minimumTimeToInactive) <= differenceInMinutesToLastPosition;
                }
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
        },
        mounted(){
            const vm = this;
            vm.deviceStateCheckInterval = setInterval(() => {
                vm.isLoadingDeviceState = false;
                vm.checkDeviceState();
            }, 1000);
        },
        beforeDestroy(){
            clearInterval(this.deviceStateCheckInterval);
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

    td.edit-device {
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    td.edit-device a {
        font-size: 12px;
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

    td.edit-device a i {
        position: relative;
        top: 0;
    }

    td.edit-device a.active {
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
