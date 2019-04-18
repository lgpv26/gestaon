<template>
    <div scrollbar style="width: 100%">
        <div class="scrollable-content">
            <div class="geofence-form">
                <app-panel-loading :loading="loading" :loadingText="'Carregando...'"></app-panel-loading>
                <div class="modal-container">
                    <div class="columns">
                        <div class="column">
                            <h3 class="form-title">CERCA VIRTUAL</h3>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column is-6">
                            Nome
                            <input type="text" placeholder="NOME" v-model="form.name" />
                        </div>
                        <div class="column is-6">
                            Nome
                            <app-select v-model="form.devices" :options="formDevicesOptions" multiple position="bottom"></app-select>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <div id="geofence-map">
                            </div>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <a class="button is-primary" @click="create()" style="float: right">
                                CRIAR CERCA
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
    import GeofencesAPI from '../../api/geofences';
    import Scrollbar from 'smooth-scrollbar';
    import PanelLoadingComponent from '../Utilities/PanelLoading.vue';
    import _ from 'lodash';
    export default {
        props: {
            value: {
                default: null
            },
            defaultSettings: {
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
                map: null,
                form: {
                    id: null,
                    name: null,
                    devices: []
                },
                polygon: null,
                drawingManager: null
            }
        },
        computed: {
            ...mapState('auth', ['auth', 'company', 'companySettings']),
            ...mapState('tracker', ['devices']),
            formDevicesOptions(){
                return this.devices.map((device) => {
                    return {
                        text: device.name,
                        value: device.code
                    }
                });
            }
        },
        methods: {
            ...mapActions('toast', ['showToast']),
            ...mapActions('auth', ['saveCompanySettings']),
            create(){
                const vm = this;
                const geofence = {
                    name: vm.form.name,
                    devices: vm.form.devices
                };
                if(this.polygon && this.polygon.getPath().getArray().length > 0){
                    let requestCoordinates = [];
                    let polygonCoordinates = this.polygon.getPath().getArray();
                    polygonCoordinates.push(polygonCoordinates[0]);
                    polygonCoordinates.forEach((coordinate) => {
                        requestCoordinates.push([
                            coordinate.lat(),
                            coordinate.lng()
                        ]);
                    });
                    _.assign(geofence, {
                        polygon: requestCoordinates
                    });
                }
                GeofencesAPI.createOne(geofence, {
                    companyId: vm.company.id
                }).then(({data}) => {
                    vm.$bus.$emit('geofence-created');
                    vm.$modal.hide('geofence-form');
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
            }
        },
        created(){
            const vm = this;
            /*if(vm.company){
                _.assign(vm.form, _.pick(vm.company, _.keys(vm.form)));
            }*/
        },
        mounted(){
            const vm = this;
            // initialize scrollbars
            vm.scrollbars = Scrollbar.initAll({
                overscrollEffect: 'bounce'
            });
            const center = {
                lat: parseFloat(vm.companySettings.onMapLoadLatitude) || -23.42103,
                lng: parseFloat(vm.companySettings.onMapLoadLongitude) || -51.93357
            };
            const zoom = parseFloat(vm.companySettings.onMapLoadZoom) || 10;
            vm.map = new google.maps.Map(document.getElementById('geofence-map'), {
                center,
                zoom,
                gestureHandling: 'cooperative',
                disableDefaultUI: true
            });
            vm.drawingManager = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT,
                    drawingModes: ['polygon']
                },
                polygonOptions: {
                    fillColor: '#990000',
                    fillOpacity: .3,
                    strokeWeight: 3,
                    clickable: false,
                    editable: true,
                    zIndex: 1
                },
                map: vm.map
            });
            google.maps.event.addListener(vm.drawingManager, 'overlaycomplete', function(event){
                if(vm.polygon) vm.polygon.setMap(null);
                vm.polygon = new google.maps.Polygon({
                    paths: event.overlay.getPaths(),
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                    map: vm.map
                });
                event.overlay.setMap(null);
                vm.drawingManager.setDrawingMode(null);
            });
        }
    }
</script>

<style scoped>
    #geofence-map {
        width: 100%;
        height: 300px;
    }
    h3.form-title {
        color: #999;
    }
    div.geofence-form {
        position: relative;
        flex-grow: 1;
    }
    div.geofence-form:last-child {
        margin-bottom: 0;
    }
    div.geofence-form-subsection {
        border: 1px solid rgba(150,150,150,0.1);
        padding: 20px;
    }
    div.geofence-form-subsection h3 {
        margin-bottom: 10px;
    }

</style>
