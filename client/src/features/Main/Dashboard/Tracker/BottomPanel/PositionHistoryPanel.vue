<template>
    <div id="position-history" class="position-history">
        <div class="filter">
            <div class="filter-critery">
                <label>Dispositivo:</label>
                <app-select :options="devicesSelectOptions" position="bottom" v-model="form.deviceId">
                </app-select>
            </div>
            <div class="filter-critery">
                <label>Intervalo:</label>
                <app-select :options="timeIntervalOptions" position="top" v-model="form.timeInterval">
                </app-select>
            </div>
            <div class="filter-critery" v-if="isCustomIntervalSelected">
                <label>De:</label>
                <app-datetime-picker v-model="form.initialInterval"></app-datetime-picker>
            </div>
            <div class="filter-critery" v-if="isCustomIntervalSelected">
                <label>Até:</label>
                <app-datetime-picker v-model="form.finalInterval"></app-datetime-picker>
            </div>
            <div class="filter-critery">
                <label>Mostrar horários:</label>
                <app-switch v-model="form.showTimes"></app-switch>
            </div>
            <div class="filter-critery">
                <button class="btn btn--primary" @click="applyFilter()">Aplicar Filtro</button>
            </div>
            <div class="filter-critery">
                <button class="btn btn--terciary" @click="cleanFilter()">Limpar</button>
            </div>
        </div>
        <div class="table" v-show="historyPanel">
            <span v-show="loadedRoutePositions.length === 0" class="default-text">
                Nenhuma posição carregada.
            </span>
            <span v-show="loadedRoutePositions.length > 100" class="default-text">
                Mais de 100 posições carregadas. A listagem foi ocultada para aumento de perfomance.
            </span>
            <div v-if="loadedRoutePositions.length > 0 && false" style="width: 100%; padding: 15px 20px 20px;">
                <a class="btn" @click="playPositionHistoryPlayer()">PLAAAAAAAY</a>
                <app-slider v-model="positionHistoryPlayer.currentStep"></app-slider>
            </div>
            <div scrollbar style="width: 100%" v-if="loadedRoutePositions.length > 0 && loadedRoutePositions.length <= 100"  v-show="loadedRoutePositions.length > 0">
                <div class="scrollable-content" style="max-height:150px;">
                    <table>
                        <thead>
                            <tr>
                                <th>Dispositivo</th>
                                <th>Hora</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Altitude</th>
                                <th>Velocidade</th>
                                <th>Ângulo</th>
                            </tr>
                        </thead>
                        <tbody class="parent">
                            <tr v-for="loadedRoutePosition in loadedRoutePositions">
                                <td>{{ loadedRoutePosition.deviceCode }}</td>
                                <td>{{ loadedRoutePosition.formatedGeneratedAt }}</td>
                                <td>{{ loadedRoutePosition.latitude }}</td>
                                <td>{{ loadedRoutePosition.longitude }}</td>
                                <td>{{ loadedRoutePosition.altitude }}</td>
                                <td>{{ loadedRoutePosition.formatedSpeed }} km/h</td>
                                <td>{{ parseInt(loadedRoutePosition.bearing) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import moment from 'moment';
    import _ from 'lodash';
    import utils from '../../../../../utils/index';
    import geolib from 'geolib/dist/geolib';
    import Scrollbar from 'smooth-scrollbar';
    import Label from '../Label';

    import { mapGetters, mapState, mapActions } from 'vuex';
    import PositionsAPI from '../../../../../api/positions';
    import MarkerWithLabel from 'marker-with-label';

    const polylineUtils = require('@mapbox/polyline');
    const Marker = MarkerWithLabel(google.maps);

    export default {
        data(){
            return {
                scrollbars: null,
                editingDevice: false,
                historyPanel: false,
                loadedRoutePositions: [],
                routesOnMap: [],
                form: {
                    deviceId: null,
                    timeInterval: 'today',
                    showTimes: true,
                    initialInterval: null,
                    finalInterval: null
                },
                timeIntervalOptions: [
                    {
                        text: "Última hora",
                        value: "lastHour"
                    },
                    {
                        text: "3 horas",
                        value: "threeHours"
                    },
                    {
                        text: "6 horas",
                        value: "sixHours"
                    },
                    {
                        text: "12 horas",
                        value: "twelveHours"
                    },
                    {
                        text: "Hoje",
                        value: "today"
                    },
                    {
                        text: "Ontem",
                        value: "onlyYesterday"
                    },
                    {
                        text: "Personalizar",
                        value: "custom"
                    }
                ],
                timeLabel: new Label(),
                positionHistoryPlayer: {
                    playable: false,
                    currentStep: 3,
                    timeInterval: null
                }
            }
        },
        props: ['map'],
        computed: {
            ...mapState('tracker', [
                'devices'
            ]),
            ...mapGetters('tracker', [
                'devicesSelectOptions'
            ]),
            isCustomIntervalSelected(){
                return (this.form.timeInterval === "custom");
            }
        },
        methods: {
            ...mapActions('toast', ['showToast']),
            toggleHistoryPanel(){
                this.historyPanel = !this.historyPanel;
            },
            applyFilter(){
                const vm = this;
                if(!vm.form.deviceId){
                    vm.showToast({
                        type: "error",
                        message: "Selecione um dispositivo."
                    });
                    return false;
                }
                vm.historyPanel = true;
                const device = _.find(vm.devices, { id: this.form.deviceId });
                vm.$emit('loadingChanged', true);
                PositionsAPI.filter(this.form).then(({data}) => {
                    vm.drawRouteOnMap(data.positions, device);
                    // Load route positions to create list
                    vm.loadedRoutePositions = _.filter(data.positions, (loadedRoutePosition) => {
                        return _.has(loadedRoutePosition, 'latitude') && _.has(loadedRoutePosition, 'longitude')
                            && !isNaN(loadedRoutePosition.latitude) && !isNaN(loadedRoutePosition.longitude);
                    });
                    vm.loadedRoutePositions = _.map(data.positions, (loadedRoutePosition) => {
                        const routePosition = _.clone(loadedRoutePosition);
                        routePosition.deviceCode = device.code;
                        routePosition.formatedSpeed = (routePosition.speed * 3.6).toFixed(1);
                        routePosition.formatedGeneratedAt = moment(routePosition.generatedAt).format("DD/MM/YYYY HH:mm:ss");
                        return routePosition;
                    });
                    vm.initializePositionHistoryPlayer();
                    vm.$emit('loadingChanged', false);
                }).catch((error) => {
                    vm.$emit('loadingChanged', false);
                    if(!vm.form.deviceId){
                        vm.showToast({
                            type: "error",
                            message: "Erro ao traçar rotas."
                        });
                        return false;
                    }
                });
            },
            drawRouteOnMap(positions, device){
                const vm = this;
                const randomDarkColor = utils.getRandomDarkColor();
                positions = _.filter(positions, (position) => {
                    return _.has(position, 'latitude') && _.has(position, 'longitude')
                        && !isNaN(position.latitude) && !isNaN(position.longitude);
                });
                let times = [], linkPoints = [];
                let lastClosestTime = null;
                const path = _.map(positions, (position) => {
                    let p = {
                        lat: parseFloat(position.latitude),
                        lng: parseFloat(position.longitude)
                    };
                    if(vm.form.showTimes){
                        times.push(moment(position.generatedAt).format("HH:mm") + " - " + parseInt(position.speed) + " km/h");
                    }
                    return p;
                });
                const route = new google.maps.Polyline({
                    path: path,
                    icons: [{
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 1,
                            strokeColor: "#2A2B33",
                            strokeWeight: 1,
                            fillColor: "#2A2B33",
                            fillOpacity: 1,
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(0, 2.6)
                        },
                        offset: '100%',
                        repeat: '50px'
                    }],
                    map: vm.map,
                    geodesic: true,
                    strokeColor: device.color,
                    strokeOpacity: .7,
                    clickable: false,
                    strokeWeight: 7,
                    zIndex: 999
                });
                if(vm.form.showTimes) {
                    for (let i = 0; i < route.getPath().getLength(); i++) {
                        let linkPoint = new google.maps.Marker({
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                fillColor: device.color,
                                strokeOpacity: 0,
                                fillOpacity: .3,
                                scale: 10
                            },
                            clickable: true,
                            visible: false,
                            position: route.getPath().getAt(i),
                            zIndex: 99999,
                            map: vm.map
                        });
                        linkPoint.addListener('mouseover', () => {
                            vm.timeLabel.bindTo('position', linkPoint, 'position');
                            vm.timeLabel.set('text', times[i]);
                            vm.timeLabel.setMap(vm.map);
                        });
                        linkPoint.addListener('mouseout', () => {
                            vm.timeLabel.setMap(null);
                        });
                        linkPoints.push(linkPoint);
                    }
                    const rad = function(x){
                        return x * Math.PI/180;
                    };
                    google.maps.event.addListener(vm.map, 'mousemove', (event) => {
                        const R = 6371; // radius of earth in km
                        let mouseLat = event.latLng.lat();
                        let mouseLng = event.latLng.lng();
                        let closestMarkerIndexes = [];
                        for(let i = 0; i < linkPoints.length; i++ ) {
                            linkPoints[i].setVisible(false);
                            let linkPointLat = linkPoints[i].position.lat();
                            let linkPointLng = linkPoints[i].position.lng();
                            let dLat  = rad(linkPointLat - mouseLat);
                            let dLong = rad(linkPointLng - mouseLng);
                            let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                Math.cos(rad(mouseLat)) * Math.cos(rad(mouseLat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
                            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                            let d = R * c;
                            closestMarkerIndexes[i] = {
                                index: i,
                                distance: d
                            };
                        }
                        closestMarkerIndexes = _.sortBy(closestMarkerIndexes, function(markerIndex) { return markerIndex.distance; });
                        for(let i = 0; i < 3; i ++){
                            if(closestMarkerIndexes[i]){
                                linkPoints[closestMarkerIndexes[i].index].setVisible(true);
                            }
                        }
                    });
                }
                vm.routesOnMap.push({
                    route,
                    times,
                    linkPoints
                });
            },
            initializePositionHistoryPlayer(){
                /*console.log(this.getPlayerSteps(10));*/
            },
            playPositionHistoryPlayer(){
                const vm = this;
                console.log("exec");
                vm.positionHistoryPlayer.timeInterval = setInterval(() => {
                    if(vm.positionHistoryPlayer.currentStep < 100){
                        vm.positionHistoryPlayer.currentStep ++;
                    }
                    else{
                        clearInterval(vm.positionHistoryPlayer.timeInterval);
                    }
                }, 1000);
            },
            /*
            getPlayerSteps(numberOfSteps){
                const vm = this;
                vm.positionHistoryPlayer.playable = vm.loadedRoutePositions.length >= 2;
                if(!vm.positionHistoryPlayer.playable){
                    return false;
                }
                const initialPosition = vm.loadedRoutePositions[0];
                const finalPosition = vm.loadedRoutePositions[vm.loadedRoutePositions.length - 1];
                const bothEndsDifferenceInSeconds = Math.abs(moment.duration(moment(initialPosition.generatedAt).diff(moment(finalPosition.generatedAt))).asSeconds());
                const eachStepSeconds = Math.abs(bothEndsDifferenceInSeconds / numberOfSteps);
                const eachStepPositions = [];
                let prevStepInitialSecond = 0;
                for(let i = 0; i < numberOfSteps; i ++){
                    eachStepPositions.push({
                        step: i + 1,
                        fromSecond: Math.abs(prevStepInitialSecond),
                        toSecond: Math.abs((i + 1) * eachStepSeconds),
                        positions: []
                    });
                    prevStepInitialSecond += eachStepSeconds;
                }
                for(let i = 0; i < vm.loadedRoutePositions.length; i ++){
                    const iterationPosition = vm.loadedRoutePositions[i];
                    const differenceFromInitialTime = Math.abs(moment.duration(moment(iterationPosition.generatedAt).diff(initialPosition.generatedAt)).asSeconds());
                    for(let k = 0; k < eachStepPositions.length; k ++){
                        if(differenceFromInitialTime > eachStepPositions[k].fromSecond && differenceFromInitialTime < eachStepPositions[k].toSecond){
                            eachStepPositions[k].positions.unshift(iterationPosition);
                        }
                    }
                }
                return eachStepPositions;
            },
            */
            cleanFilter(){
                this.loadedRoutePositions = [];
                this.routesOnMap.forEach((routeOnMap) => {
                    routeOnMap.route.setMap(null);
                    routeOnMap.times = [];
                    routeOnMap.linkPoints.forEach(linkPoint => linkPoint.setMap(null));
                });
                this.routesOnMap = [];
                this.timeLabel.setMap(null);
            },
            resetForm(){
                Object.assign(this.$data.form, this.$options.data().form);
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
            // initialize scrollbars
            this.scrollbars = Scrollbar.initAll({
                overscrollEffect: 'bounce'
            });
        },
        beforeDestroy(){
            this.cleanFilter();
        }
    }
</script>

<style scoped>
    h3 {
        text-transform: uppercase;
        margin-bottom: 10px;
        color: #FFF;
    }

    div.position-history {
        display: flex;
        flex-shrink: 0;
        flex-direction: column;
        position: relative;
    }

    div.position-history div.filter{
        padding: 0 20px 20px;
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-shrink: 0;
    }
    div.position-history div.filter > div.filter-critery{
        display: flex;
        flex-direction: row;
        padding: 0 0 0 20px;
    }
    div.position-history div.filter > div.filter-critery:first-child{
        padding-left: 0;
    }
    div.position-history div.filter > div.filter-critery label {
        display: flex;
        align-items: center;
        margin-right: 5px;
    }

    div.position-history div.table > span.default-text {
        padding: 20px 0;
        margin-left: 20px;
        border-top: 1px dotted rgba(255,255,255,.1);
        color: #CCC;
    }

    div.position-history div.table table {
        padding: 20px;
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
