<template>
    <div id="app-fences-panel">
        <div class="form">
            <div class="form-item">
                <label>Nome:</label>
                <input type="text" placeholder="NOME DA CERCA" style="width: 130px;" v-model="form.name" />
            </div>
            <div class="form-item">
                <label>Dispositivos:</label>
                <app-select :options="devicesSelectOptions" position="bottom" :multiple="true" v-model="form.devices"></app-select>
            </div>
            <div class="form-item">
                <label>Alarme ao entrar:</label>
                <app-switch v-model="form.alarmOnEnter"></app-switch>
            </div>
            <div class="form-item">
                <label>Alarme ao sair:</label>
                <app-switch v-model="form.alarmOnLeave"></app-switch>
            </div>
            <div class="form-item">
                <label>Cor:</label>
                <app-color-picker v-model="form.color" @change="colorChanged(form.color)">SELECIONAR</app-color-picker>
            </div>
            <div class="form-item">
                <label>Repetir (x):</label>
                <input type="text" style="width: 20px;" v-model="form.repeat" />
            </div>
            <div class="form-item">
                <label>Intervalo (s):</label>
                <input type="text" style="width: 20px;" v-model="form.interval" />
            </div>
            <div class="form-item">
                <a class="btn btn--circle" v-if="!geofenceDrawn" @click="drawOnMap()">
                    <i class="mi mi-edit" style="margin: 0;"></i>
                </a>
                <a class="btn btn--circle" v-else @click="redrawOnMap()">
                    <i class="mi mi-edit" style="margin: 0;"></i>
                </a>
            </div>
            <div class="form-item" v-if="form.id">
                <a class="button is-primary is-small" @click="save()">
                    <i class="mi mi-save" style="margin: 3px;"></i> SALVAR ALTERAÇÕES
                </a>
            </div>
            <div class="form-item" v-if="form.id">
                <a class="button is-yellow is-small" @click="clearForm()">
                    <i class="mi mi-undo" style="margin: 3px;"></i> CANCELAR
                </a>
            </div>
            <div class="form-item" v-else>
                <a class="button is-primary is-small" @click="create()">CRIAR CERCA</a>
            </div>
            <span class="push-both-sides"></span>
            <div class="form-item" v-if="form.id">
                <a class="button is-red is-small" @click="remove()">
                    <i class="mi mi-delete" style="margin: 3px;"></i> REMOVER
                </a>
            </div>
        </div>
        <p v-if="geofences.length === 0" style="padding:0 20px;">Nenhuma cerca encontrada.</p>
        <div class="table" v-if="geofences.length > 0">
            <table>
                <tbody>
                    <tr v-for="geofence in geofences" @click="selectGeofence(geofence)">
                        <td style="width: 18px;"><div :style="{ width: '18px', height: '18px', borderRadius: '100%', backgroundColor: geofence.color}"></div></td>
                        <td>{{ geofence.name }}</td>
                        <td><i class="mi mi-notifications" style="position: relative; top: 1px;"></i> {{ geofence.repeat }}x a cada {{ geofence.interval }} segundos.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
<script>
    import moment from 'moment';
    import _ from 'lodash';
    import utils from '../../../../../utils/index';
    import geolib from 'geolib/dist/geolib';
    import Scrollbar from 'smooth-scrollbar';

    import { mapGetters, mapState, mapMutations, mapActions } from 'vuex';
    import PositionsAPI from '../../../../../api/positions';
    import GeofencesAPI from '../../../../../api/geofences';
    import ColorPickerComponent from '../../../../../components/Inputs/ColorPicker.vue';

    import resize from 'vue-resize-directive';

    const polyline = require('@mapbox/polyline');

    export default {
        directives: {
            resize
        },
        props: ['map'],
        components: {
            "app-color-picker": ColorPickerComponent
        },
        data(){
            return {
                loading: false,
                scrollbars: null,
                polygon: null,
                drawingManager: null,
                geofenceDrawn: false,
                form: {
                    id: null,
                    name: null,
                    devices: [],
                    color: "#61AFEF",
                    alarmOnEnter: false,
                    alarmOnLeave: false,
                    interval: 5,
                    repeat: 3
                }
            }
        },
        computed: {
            ...mapState('auth', [
                'company'
            ]),
            ...mapState('tracker', [
                'devices'
            ]),
            ...mapState('geofences', [
                'geofences'
            ]),
            ...mapGetters('tracker', [
                'devicesSelectOptions', 'selectedDevice'
            ])
        },
        methods: {
            ...mapMutations('geofences', ['setShowGeofences', 'addGeofence', 'updateGeofence', 'removeGeofence', 'setIsEditingGeofences']),
            ...mapActions('toast', ['showToast']),
            showGeofenceFormModal(){
                this.$modal.show('geofence-form', {
                    device: null
                });
            },
            deleteFence(id){
                const vm = this;
                GeofencesAPI.removeOne(id,{
                    companyId: vm.company.id
                }).then(() => {
                    vm.refreshData();
                });
            },
            drawOnMap(){
                const vm = this;
                if(vm.drawingManager){
                    vm.drawingManager.setDrawingMode(null);
                    vm.drawingManager = null;
                    if(vm.polygon){
                        vm.polygon.setMap(null)
                        vm.polygon = null;
                    }
                }
                vm.drawingManager = new google.maps.drawing.DrawingManager({
                    drawingControl: false,
                    polygonOptions: {
                        fillColor: vm.form.color,
                        fillOpacity: .3,
                        strokeColor: vm.form.color,
                        strokeWeight: 3,
                        clickable: false,
                        editable: true,
                        zIndex: 1
                    },
                    map: vm.map
                });
                vm.drawingManager.setDrawingMode('polygon');
                google.maps.event.addListener(vm.drawingManager, 'overlaycomplete', function(event){
                    if(vm.polygon) vm.polygon.setMap(null);
                    vm.polygon = new google.maps.Polygon({
                        paths: event.overlay.getPaths(),
                        strokeColor: vm.form.color,
                        strokeOpacity: 0.5,
                        strokeWeight: 3,
                        editable: true,
                        fillColor: vm.form.color,
                        fillOpacity: 0.1,
                        map: vm.map
                    });
                    vm.geofenceDrawn = true;
                    event.overlay.setMap(null);
                    vm.drawingManager.setDrawingMode(null);
                    vm.drawingManager = null;
                });
            },
            redrawOnMap(){
                this.polygon.setMap(null);
                this.polygon = null;
                this.geofenceDrawn = false;
                this.drawOnMap();
            },
            colorChanged(color){
                const vm = this;
                if(vm.polygon){
                    vm.polygon.setOptions({
                        fillColor: color,
                        strokeColor: color
                    });
                }
            },
            create(){
                const vm = this;
                if(!this.polygon || (this.geofenceDrawn === false && this.polygon.getPath().getArray().length > 0)){
                    this.showToast({
                        type: "warning",
                        message: "Você deve \"Desenhar no mapa\" antes de criar/salvar a cerca!"
                    });
                    return;
                }
                let requestCoordinates = [];
                let polygonCoordinates = this.polygon.getPath().getArray();
                polygonCoordinates.push(polygonCoordinates[0]);
                polygonCoordinates.forEach((coordinate) => {
                    requestCoordinates.push([
                        coordinate.lat(),
                        coordinate.lng()
                    ]);
                });
                _.assign(this.form, {
                    polygon: requestCoordinates
                });
                GeofencesAPI.createOne(this.form, {
                    companyId: vm.company.id
                }).then(({data}) => {
                    vm.addGeofence(data);
                    vm.$bus.$emit('geofences-redraw');
                    vm.showToast({
                        type: "success",
                        message: "Cerca criada com sucesso."
                    });
                }).catch((err) => {
                    this.showToast({
                        type: "error",
                        message: "Erro ao salvar cerca."
                    });
                });
            },
            save(){
                const vm = this;
                if(!this.polygon || (this.geofenceDrawn === false && this.polygon.getPath().getArray().length > 0)){
                    this.showToast({
                        type: "warning",
                        message: "Você deve \"Desenhar no mapa\" antes de criar/salvar a cerca!"
                    });
                    return;
                }
                let requestCoordinates = [];
                let polygonCoordinates = this.polygon.getPath().getArray();
                polygonCoordinates.push(polygonCoordinates[0]);
                polygonCoordinates.forEach((coordinate) => {
                    requestCoordinates.push([
                        coordinate.lat(),
                        coordinate.lng()
                    ]);
                });
                _.assign(this.form, {
                    polygon: requestCoordinates
                });
                GeofencesAPI.updateOne(this.form.id, this.form, {
                    companyId: vm.company.id
                }).then(({data}) => {
                    vm.updateGeofence(data);
                    vm.$bus.$emit('geofences-redraw');
                    vm.showToast({
                        type: "success",
                        message: "Cerca atualizada."
                    });
                }).catch((err) => {
                    this.showToast({
                        type: "error",
                        message: "Erro ao salvar cerca."
                    });
                });
            },
            remove(){
                const vm = this;
                GeofencesAPI.removeOne(this.form.id, {
                    companyId: vm.company.id
                }).then(({data}) => {
                    vm.removeGeofence(data); // passing geofence id
                    vm.clearForm();
                    vm.$bus.$emit('geofences-redraw');
                    vm.showToast({
                        type: "success",
                        message: "Cerca removida."
                    });
                }).catch((err) => {
                    this.showToast({
                        type: "error",
                        message: "Erro ao salvar cerca."
                    });
                });
            },
            selectGeofence(geofence){
                const vm = this;
                vm.mapDataToForm(geofence);
                if(_.has(geofence,'polygon')) {
                    if(vm.polygon) vm.polygon.setMap(null);
                    const geofencePolygon = [];
                    geofence.polygon.coordinates[0].forEach((pathItem) => {
                        geofencePolygon.push(new google.maps.LatLng(pathItem[0], pathItem[1]));
                    });
                    vm.polygon = new google.maps.Polygon({
                        paths: geofencePolygon,
                        strokeColor: geofence.color,
                        strokeOpacity: 0.5,
                        strokeWeight: 3,
                        clickable: false,
                        editable: true,
                        fillColor: geofence.color,
                        fillOpacity: 0.1,
                        map: vm.map
                    });
                    vm.geofenceDrawn = true;
                    if(vm.drawingManager){
                        vm.drawingManager.setDrawingMode(null);
                        vm.drawingManager = null;
                    }
                    const centerOfGeofence = geolib.getCenterOfBounds(geofence.polygon.coordinates[0].map((pathItem) => {
                        return {latitude: pathItem[0], longitude: pathItem[1]};
                    }));
                    vm.map.panTo(new google.maps.LatLng(centerOfGeofence.latitude, centerOfGeofence.longitude));
                }
            },
            mapDataToForm(geofence){
                this.form.id = geofence.id;
                this.form.name = geofence.name || "SN";
                this.form.color = geofence.color || "#EEEEEE";
                this.form.alarmOnEnter = geofence.alarmOnEnter || false;
                this.form.alarmOnLeave = geofence.alarmOnLeave || false;
                this.form.devices = geofence.devices.map((device) => {
                    return device.id;
                });
                this.form.interval = geofence.interval || 5;
                this.form.repeat = geofence.repeat || 3;
            },
            clearForm(){
                if(this.polygon) this.polygon.setMap(null);
                if(this.drawingManager){
                    this.drawingManager.setDrawingMode(null);
                }
                Object.assign(this.$data, this.$options.data());
            }
        },
        created(){
            const vm = this;
            this.$bus.$on('system-initialized', () => {
                vm.getData();
            });
            this.$bus.$on('geofence-created', () => {
                vm.refreshData();
            });
        },
        mounted(){
            const vm = this;
            // initialize scrollbars
            vm.scrollbars = Scrollbar.initAll({
                overscrollEffect: 'bounce'
            });
            vm.setIsEditingGeofences(true);
        },
        beforeDestroy(){
            if(this.polygon){
                this.polygon.setMap(null);
            }
            if(this.drawingManager){
                this.drawingManager.setDrawingMode(null);
            }
            this.setIsEditingGeofences(false);
        }
    }
</script>

<style scoped>
    #app-fences-panel {
        display: flex;
        flex-shrink: 0;
        flex-direction: column;
        position: relative;
        padding: 0 0 20px;
    }
    #app-fences-panel div.form{
        padding: 0 20px 20px;
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-shrink: 0;
    }
    #app-fences-panel div.form > div.form-item {
        display: flex;
        flex-direction: row;
        padding: 0 0 0 20px;
    }
    #app-fences-panel div.form > div.form-item:first-child{
        padding-left: 0;
    }
    #app-fences-panel div.form > div.form-item label {
        display: flex;
        align-items: center;
        margin-right: 5px;
    }
    #app-fences-panel tr {
        cursor: pointer;
    }
</style>
