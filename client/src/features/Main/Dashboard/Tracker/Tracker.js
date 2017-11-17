import moment from 'moment';
import Utils from '../../../../utils/index';
import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

import MarkerWithLabel from 'marker-with-label';

import geolib from 'geolib/dist/geolib';
import _ from 'lodash';
import Label from '../Tracker/GeofenceLabel';

const Marker = MarkerWithLabel(google.maps);

export default {
    data(){
        return {
            map: null,
            isShowingDeviceDetailsWindow: false,
            loading: false,
            devicesOnMap: [],
            routesOnMap: [],
            geofencesOnMap: [],
            baseOnMap: null
        }
    },
    watch: {
        company(newData, oldData){
            const vm = this;
            if(_.has(newData, 'id')){
                vm.loadDevices(newData.id).then(() => {
                    vm.loadMapObjects();
                });
            }
        },
        showGeofences(showGeofences){
            const vm = this;
            if(this.geofencesOnMap.length > 0)
                this.geofencesOnMap.forEach((geofenceOnMap) => {
                    geofenceOnMap.setVisible(showGeofences);
                    if(showGeofences){
                        geofenceOnMap.geofenceLabel.setMap(vm.map);
                    }
                    else {
                        geofenceOnMap.geofenceLabel.setMap(null);
                    }
                });
        }
    },
    computed: {
        ...mapState(['system']),
        ...mapState('auth', ['company','companySettings']),
        ...mapState('tracker', ['devices', 'follow']),
        ...mapState('geofences', ['isEditingGeofences','geofences']),
        ...mapGetters('geofences', ['showGeofences'])
    },
    sockets:{
        newPosition(position){
            const device = _.find(this.devices, {code: position.deviceCode});
            if(device){
                if(_.has(device, 'lastPosition')){
                    if(moment(device.lastPosition.generatedAt).isBefore(moment(position.generatedAt))){
                        this.addPosition(position.deviceCode, position);
                    }
                }
                else{
                    this.addPosition(position.deviceCode, position);
                }
            }
        },
        geofenceAlarm(geofences){
            let geofencesString = "";
            geofences.forEach((geofence, index) => {
                if((geofences.length - 1) === index){
                    geofencesString = geofencesString + geofence.name;
                }
                else {
                    geofencesString = geofencesString + geofence.name + ", ";
                }
            });

            this.showToast({
                type: "error",
                message: "Entrou/Saiu: " + geofencesString
            });
            this.$bus.$emit('sound-play');
        }
    },
    methods: {
        ...mapMutations(['setMainContentArea']),
        ...mapMutations('tracker', [
            'setMapContextMenu'
        ]),
        ...mapActions('loading', [
            'startLoading', 'stopLoading', 'setLoadingText'
        ]),
        ...mapActions('tracker', [
            'loadDevices',
            'addDevicePosition',
            'addMarker',
            'addTrack',
            'removeFirstTrackFromDevice',
            'selectDevice'
        ]),
        ...mapActions('geofences', [
            'loadGeofences',
        ]),
        ...mapActions('toast', ['showToast']),
        removeMapObjects(){
            const vm = this;
            if(vm.devicesOnMap.length > 0){
                vm.devicesOnMap.forEach((deviceOnMap) => {
                    deviceOnMap.marker.setMap(null);
                    deviceOnMap.tracks.forEach((track) => {
                        if(_.has(track,'marker')) track.marker.setMap(null);
                        track.polyline.setMap(null);
                    })
                });
                vm.devicesOnMap = [];
            }
        },
        checkIfDeviceIsOnMap(deviceCode, position){

            const vm = this;

            // if device not found on map
            if(!_.find(vm.devicesOnMap, { 'code': deviceCode })){
                const randomDarkColor = Utils.getRandomDarkColor();
                console.log("Pino não existente, criando...");
                const device = vm.getDeviceByCode(deviceCode);
                const marker = new Marker({
                    position: {lat: parseFloat(position.latitude), lng: parseFloat(position.longitude)},
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 5,
                        rotation: parseInt(position.bearing),
                        strokeColor: "#FFF",
                        strokeWeight: 2,
                        fillColor: device.color,
                        fillOpacity: 1,
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 2.6)
                    },
                    draggable: false,
                    labelContent: device.name,
                    labelAnchor: new google.maps.Point(60, -15),
                    labelClass: "tracked-device-label", // the CSS class for the label
                });
                marker.setDuration(1000);
                marker.setEasing('linear');
                marker.setMap(vm.map);
                vm.onDeviceMarkerLoad(device, marker);
                vm.devicesOnMap.push({code: deviceCode, marker, tracks: [], color: device.color});
                return false;
            }
            else {
                return true;
            }

        },
        loadMapSettings(){
            const vm = this;
            if(vm.baseOnMap){
                vm.baseOnMap.setMap(null);
                vm.baseOnMap = null;
            }
            let onMapLoadLatitude = -23.4134652;
            let onMapLoadLongitude = -51.9035723;
            let onMapLoadZoom = 17;
            if(vm.company.companySettings.length > 0)                    {
                vm.company.companySettings.forEach((companySetting) => {
                    if (companySetting.name === 'onMapLoadLatitude') onMapLoadLatitude = parseFloat(companySetting.value);
                    if (companySetting.name === 'onMapLoadLongitude') onMapLoadLongitude = parseFloat(companySetting.value);
                    if (companySetting.name === 'onMapLoadZoom') onMapLoadZoom = parseInt(companySetting.value);
                });
                if(_.has(vm.companySettings, 'companyBaseLatitude') && _.has(vm.companySettings, 'companyBaseLongitude')){
                    vm.baseOnMap = new Marker({
                        position: {lat: parseFloat(vm.companySettings.companyBaseLatitude), lng: parseFloat(vm.companySettings.companyBaseLongitude)},
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 5,
                            strokeColor: "#FFF",
                            strokeWeight: 1,
                            fillColor: "#61AFEF",
                            fillOpacity: 1,
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(0, 0)
                        },
                        clickable: false,
                        zIndex: 0,
                        map: vm.map
                    });
                }
            }
            vm.map.setCenter(new google.maps.LatLng(
                onMapLoadLatitude,
                onMapLoadLongitude
            ));
            vm.map.setZoom(onMapLoadZoom);
            vm.geofencesOnMap.forEach((geofenceOnMap) => {
                geofenceOnMap.setMap(null);
                geofenceOnMap.geofenceLabel.setMap(null);
            });
            vm.devicesOnMap.forEach((deviceOnMap) => {
                deviceOnMap.marker.setMap(null);
                deviceOnMap.tracks.forEach((deviceTrackOnMap) => {
                    deviceTrackOnMap.polyline.setMap(null);
                });
            });
            vm.geofencesOnMap = [];
            vm.loadGeofences(vm.company.id).then((geofences) => {
                geofences.forEach((geofence) => {
                    if(_.has(geofence,'polygon')) {
                        const geofencePolygon = [];
                        geofence.polygon.coordinates[0].forEach((pathItem) => {
                            geofencePolygon.push(new google.maps.LatLng(pathItem[0], pathItem[1]));
                        });
                        const geofenceLabel = new Label();
                        const centerOfGeofence = geolib.getCenterOfBounds(geofence.polygon.coordinates[0].map((pathItem) => {
                            return {latitude: pathItem[0], longitude: pathItem[1]};
                        }));
                        let geofenceCenterPoint = new google.maps.Marker({
                            icon: " ",
                            clickable: false,
                            visible: false,
                            position: new google.maps.LatLng(centerOfGeofence.latitude, centerOfGeofence.longitude),
                            zIndex: 99999
                        });
                        geofenceLabel.bindTo('position', geofenceCenterPoint, 'position');
                        geofenceLabel.set('text', geofence.name);
                        geofenceLabel.setMap(vm.map);
                        vm.geofencesOnMap.push(new google.maps.Polygon({
                            paths: geofencePolygon,
                            strokeColor: geofence.color,
                            strokeOpacity: 0.5,
                            strokeWeight: 3,
                            clickable: false,
                            fillColor: geofence.color,
                            fillOpacity: 0.1,
                            map: vm.map,
                            geofenceLabel
                        }));
                    }
                });
            });
        },
        loadMapObjects(){
            const vm = this;
            vm.removeMapObjects();
            vm.devices.forEach((device) => {
                if(typeof device.positions !== 'undefined' && device.positions.length > 0){
                    const tracks = [];
                    const lastPosition = device.positions[0];
                    const randomDarkColor = Utils.getRandomDarkColor();
                    const marker = new Marker({
                        position: {lat: parseFloat(lastPosition.latitude), lng: parseFloat(lastPosition.longitude)},
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 5,
                            strokeColor: "#FFF",
                            strokeWeight: 2,
                            fillColor: device.color,
                            fillOpacity: 1,
                            zIndex: 99999999,
                            rotation: parseInt(lastPosition.bearing),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(0, 2.6)
                        },
                        zIndex: 99999999,
                        clickable: true,
                        labelContent: device.name,
                        labelAnchor: new google.maps.Point(60, -15),
                        labelClass: "tracked-device-label", // the CSS class for the label
                    });
                    marker.setDuration(1000);
                    marker.setEasing('linear');
                    marker.setMap(vm.map);

                    vm.onDeviceMarkerLoad(device, marker);

                    /* --- draw initial track -------- */
                    if(_.has(device, 'positions') && device.positions.length > 0) {
                        let i = device.positions.length - 1;
                        let previousPosition = undefined;
                        while (i >= 0) {
                            if (previousPosition) {
                                const currentPosition = device.positions[i];
                                const track = {};
                                track.position = currentPosition;
                                track.polyline = new google.maps.Polyline({
                                    path: [
                                        new google.maps.LatLng(
                                            parseFloat(previousPosition.latitude),
                                            parseFloat(previousPosition.longitude)
                                        ),
                                        new google.maps.LatLng(
                                            parseFloat(currentPosition.latitude),
                                            parseFloat(currentPosition.longitude)
                                        )],
                                    icons: [{
                                        icon: {
                                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                            scale: 1.5,
                                            rotation: parseInt(previousPosition.bearing),
                                            strokeColor: device.color,
                                            strokeWeight: 1,
                                            fillColor: device.color,
                                            fillOpacity: 1,
                                            origin: new google.maps.Point(0, 0),
                                            anchor: new google.maps.Point(0, 2.6)
                                        },
                                        offset: '0%'
                                    }],
                                    map: vm.map,
                                    visible: device.visible && device.track,
                                    geodesic: true,
                                    strokeColor: device.color,
                                    strokeOpacity: .7,
                                    strokeWeight: 3
                                });
                                tracks.push(track);
                            }
                            previousPosition = {
                                latitude: parseFloat(device.positions[i].latitude),
                                longitude: parseFloat(device.positions[i].longitude),
                            };
                            i--;
                        }
                    }

                    vm.devicesOnMap.push({code: device.code, marker, tracks, color: device.color});
                }
            });
        },
        calculateMapHeight(){
            if(document.getElementById('map')){
                document.getElementById('map').style.height = document.getElementById('map-height').clientHeight + 'px';
                google.maps.event.trigger(this.map, 'resize');
            }
        },
        addPosition(deviceCode, position){

            const vm = this;

            const device = vm.getDeviceByCode(deviceCode);
            const previousPosition = device.lastPosition;
            vm.addDevicePosition({deviceCode, position});
            const currentPosition = device.lastPosition;
            vm.checkIfDeviceIsOnMap(deviceCode, position);
            let deviceOnMap = _.find(vm.devicesOnMap, {code: deviceCode});

            deviceOnMap.marker.setIcon({
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                strokeColor: "#FFF",
                strokeWeight: 2,
                fillColor: device.color,
                fillOpacity: 1,
                zIndex: 9999999999,
                rotation: parseInt(position.bearing),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(0, 2.6)
            });

            const currentPositionCoordinates = new google.maps.LatLng(
                parseFloat(currentPosition.latitude),
                parseFloat(currentPosition.longitude)
            );

            deviceOnMap.marker.setPosition(currentPositionCoordinates);
            if(deviceCode === vm.follow) vm.map.panTo(deviceOnMap.marker.getPosition(currentPositionCoordinates));

            const track = {};
            const initialPath = [];

            if(_.has(previousPosition, 'latitude') && _.has(previousPosition, 'longitude')) initialPath.push(
                new google.maps.LatLng(parseFloat(previousPosition.latitude), parseFloat(previousPosition.longitude))
            );

            initialPath.push(currentPositionCoordinates);

            track.position = position;

            track.polyline = new google.maps.Polyline({
                path: initialPath,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        rotation: (_.has(previousPosition, 'bearing')) ? parseInt(previousPosition.bearing) : 0,
                        scale: 1.5,
                        strokeColor: device.color,
                        strokeWeight: 1,
                        fillColor: device.color,
                        fillOpacity: 1,
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 2.6)
                    },
                    offset: '0%'
                }],
                map: vm.map,
                visible: device.visible && device.track,
                geodesic: true,
                strokeColor: device.color,
                strokeOpacity: .7,
                strokeWeight: 3
            });

            deviceOnMap.tracks.push(track);

            let trackLengthSetting = 180;
            if(_.has(device, 'settings.trackLength')) trackLengthSetting = parseInt(device.settings.trackLength);
            deviceOnMap.tracks = _.filter(deviceOnMap.tracks, (track, index) => {
                const now = moment();
                const trackTime = moment(track.position.generatedAt);
                const secondDifference = parseInt(moment.duration(now.diff(trackTime)).asSeconds());
                if(secondDifference > trackLengthSetting){
                    if(track.marker) track.marker.setMap(null);
                    if(track.polyline) track.polyline.setMap(null);
                    return false;
                }
                else{
                    return true;
                }
            });

            /* --- print to console -------- */
            /*console.log('%c' + position.deviceCode + ' > ' + moment(position.generatedAt).format('HH:mm:ss'),'color:' + deviceOnMap.color + ';font-size:16px');*/

        },
        onDeviceMarkerLoad(device, marker){
            const vm = this;
            const deviceDetailsWindow = document.getElementById('device-details-window');
            const leftColumn = document.getElementById('left-column');
            const mainColumnHeader = document.getElementById('main-column-header');
            let mapMouseMoveEvent, mapMouseOutsideClickEvent;
            const positionateDeviceDetailsWindow = function(latLng){
                const scale = Math.pow(2, vm.map.getZoom());
                const nw = new google.maps.LatLng(
                    vm.map.getBounds().getNorthEast().lat(),
                    vm.map.getBounds().getSouthWest().lng()
                );
                const worldCoordinateNW = vm.map.getProjection().fromLatLngToPoint(nw);
                const worldCoordinate = vm.map.getProjection().fromLatLngToPoint(latLng);
                const pixelOffset = new google.maps.Point(
                    Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
                    Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
                );
                deviceDetailsWindow.style.top = (pixelOffset.y - 240 + mainColumnHeader.offsetHeight) + 'px';
                deviceDetailsWindow.style.left = (pixelOffset.x - 200 + leftColumn.offsetWidth) + 'px';
                deviceDetailsWindow.style.display = 'flex';
            };
            google.maps.event.addListener(marker, 'click', function(ev) {
                vm.selectDevice(device.code).then(() => {
                    vm.isShowingDeviceDetailsWindow = true;
                    positionateDeviceDetailsWindow(marker.getPosition());
                    document.addEventListener("click", (ev) => {
                        if(!document.getElementById('main').contains(ev.target)){
                            deviceDetailsWindow.style.display = 'none';
                            vm.selectDevice(null);
                            vm.isShowingDeviceDetailsWindow = false;
                        }
                    }, false);
                    mapMouseOutsideClickEvent = vm.map.addListener('click', function() {
                        deviceDetailsWindow.style.display = 'none';
                        vm.selectDevice(null);
                        vm.isShowingDeviceDetailsWindow = false;
                    });
                    mapMouseMoveEvent = vm.map.addListener('bounds_changed', function(bcEv) {
                        if(!vm.isShowingDeviceDetailsWindow){
                            deviceDetailsWindow.style.display = 'none';
                            vm.selectDevice(null);
                            vm.isShowingDeviceDetailsWindow = false;
                        }
                        else {
                            positionateDeviceDetailsWindow(marker.getPosition());
                        }
                    });
                    vm.$bus.$on('device-details-window-hide', () => {
                        deviceDetailsWindow.style.display = 'none';
                        vm.selectDevice(null);
                        vm.isShowingDeviceDetailsWindow = false;
                    });
                });
            });
        },
        setTrackerEventListeners(){
            const vm = this;
            /* --- */
            /* --- event bus -------- */
            /* --- */
            vm.$bus.$on('device-created', function(){
                vm.loadMapObjects();
            });
            vm.$bus.$on('device-updated', function(){
                vm.loadMapObjects();
            });
            vm.$bus.$on('device-removed', function(){
                vm.loadMapObjects();
            });
            vm.$bus.$on('device-choose', function(device){
                const deviceOnMap = _.find(vm.devicesOnMap, {code: device.code});
                if(deviceOnMap && _.has(deviceOnMap,'marker')){
                    vm.map.panTo(deviceOnMap.marker.getPosition());
                    google.maps.event.trigger(deviceOnMap.marker, 'click');
                }
            });
            vm.$bus.$on('device-action', function(event){
                const deviceOnMap = _.find(vm.devicesOnMap, {code: event.device.code});
                if(deviceOnMap) {
                    switch (event.action) {
                        case 'toggle-visibility':
                            deviceOnMap.marker.setVisible(event.device.visible);
                            deviceOnMap.tracks.forEach((track) => {
                                if (event.device.visible && event.device.track) {
                                    track.polyline.setVisible(event.device.visible);
                                }
                                else {
                                    track.polyline.setVisible(false);
                                }
                            });
                            break;
                        case 'toggle-track':
                            deviceOnMap.tracks.forEach((track) => {
                                if (!event.device.visible && event.device.track) {
                                    track.polyline.setVisible(false);
                                }
                                else {
                                    track.polyline.setVisible(event.device.track);
                                }
                            });
                            break;
                    }
                }
            });
            vm.$bus.$on('company-base-redraw', function({companyBaseLatitude, companyBaseLongitude}){
                if(vm.baseOnMap){
                    vm.baseOnMap.setPosition(new google.maps.LatLng(parseFloat(companyBaseLatitude), parseFloat(companyBaseLongitude)));
                }
                else {
                    vm.baseOnMap = new Marker({
                        position: {lat: parseFloat(vm.companySettings.companyBaseLatitude), lng: parseFloat(vm.companySettings.companyBaseLongitude)},
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 5,
                            strokeColor: "#FFF",
                            strokeWeight: 1,
                            fillColor: "#61AFEF",
                            fillOpacity: 1,
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(0, 0)
                        },
                        clickable: false,
                        zIndex: 0,
                        map: vm.map
                    });
                }
            });
            vm.$bus.$on('geofences-redraw', function(event){
                vm.geofencesOnMap.forEach((geofenceOnMap) => {
                    geofenceOnMap.setMap(null);
                    geofenceOnMap.geofenceLabel.setMap(null);
                });
                vm.geofencesOnMap = [];
                vm.geofences.forEach((geofence) => {
                    if(_.has(geofence,'polygon')) {
                        const geofencePolygon = [];
                        geofence.polygon.coordinates[0].forEach((pathItem) => {
                            geofencePolygon.push(new google.maps.LatLng(pathItem[0], pathItem[1]));
                        });
                        const geofenceLabel = new Label();
                        const centerOfGeofence = geolib.getCenterOfBounds(geofence.polygon.coordinates[0].map((pathItem) => {
                            return {latitude: pathItem[0], longitude: pathItem[1]};
                        }));
                        let geofenceCenterPoint = new google.maps.Marker({
                            icon: " ",
                            clickable: false,
                            visible: false,
                            position: new google.maps.LatLng(centerOfGeofence.latitude, centerOfGeofence.longitude),
                            zIndex: 99999
                        });
                        geofenceLabel.bindTo('position', geofenceCenterPoint, 'position');
                        geofenceLabel.set('text', geofence.name);
                        if(vm.showGeofences) geofenceLabel.setMap(vm.map);
                        vm.geofencesOnMap.push(new google.maps.Polygon({
                            paths: geofencePolygon,
                            strokeColor: geofence.color,
                            strokeOpacity: 0.5,
                            strokeWeight: 3,
                            clickable: false,
                            visible: vm.showGeofences,
                            fillColor: geofence.color,
                            fillOpacity: 0.1,
                            map: vm.map,
                            geofenceLabel
                        }));
                    }
                });
            });
        },
        getDeviceByCode(deviceCode){
            const device = _.find(this.devices, {code: deviceCode});
            if(device) return device;
            else return false;
        },
        mainContentContainerResized(){
            this.setMainContentArea({
                height: document.getElementById('main-content-area').clientHeight,
                width: document.getElementById('main-content-area').clientWidth
            });
            this.calculateMapHeight();
        }
    },
    mounted(){

        const vm = this;

        /* --- initialize map -------- */
        vm.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -50.75011771290449, lng: -4.639371646119175},
            backgroundColor: '#2A2B33',
            disableDefaultUI: true,
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', 'light', 'dark']
            },
            zoom: 4
        });

        const darkMapType = new google.maps.StyledMapType([
            {
                "stylers": [
                    {
                        "saturation": 35
                    },
                    {
                        "invert_lightness": true
                    },
                    {
                        "lightness": 5
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "hue": "#303544"
                    },
                    {
                        "saturation": -80
                    },
                    {
                        "invert_lightness": true
                    },
                    {
                        "lightness": -60
                    },
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#61afef"
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#191a24"
                    },
                    {
                        "saturation": -35
                    },
                    {
                        "lightness": -45
                    },
                    {
                        "visibility": "on"
                    },
                    {
                        "weight": 3
                    }
                ]
            },
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#767a8c"
                    }
                ]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#2a2b33"
                    }
                ]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#35415a"
                    },
                    {
                        "weight": 0.5
                    }
                ]
            },
            {
                "featureType": "landscape.natural",
                "stylers": [
                    {
                        "color": "#2a2b33"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#2a2b33"
                    },
                    {
                        "saturation": 10
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#767a8c"
                    }
                ]
            },
            {
                "featureType": "poi.business",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#111111"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#151515"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#353741"
                    }
                ]
            }
        ], {name: 'Dark'});
        const lightMapType = new google.maps.StyledMapType([], {name: 'Light'});
        vm.map.mapTypes.set('dark', darkMapType);
        vm.map.mapTypes.set('light', lightMapType);
        vm.map.setMapTypeId('dark');

        /* --- guarantee map height -------- */
        vm.calculateMapHeight();
        setTimeout(function(){
            vm.calculateMapHeight();
        }, 1000);

        vm.mainContentContainerResized();

        /* --- if the system was initially loaded in another page, so the system-initialized event won't occur -------- */
        if(vm.system.initialized){
            vm.setLoadingText("Carregando dispositivos...");
            vm.startLoading();
            vm.loadMapSettings();
            vm.loadDevices(vm.company.id).then(() => {
                vm.loadMapObjects();
                vm.stopLoading();
            });
        }

        /* --- System initialized event emmited from Main.vue  -------- */
        vm.$bus.$on('system-initialized', () => {
            vm.loadMapSettings();
        });

        /* --- set map  event listeners -------- */
        vm.setTrackerEventListeners();

        /* --- context menu -------- */
        const mapContextMenu = document.getElementById('map-context-menu');
        const leftColumn = document.getElementById('left-column');
        const mainColumnHeader = _.first(document.getElementsByClassName('main-column__header'));
        const positionateMapContextMenu = function(latLng){
            const scale = Math.pow(2, vm.map.getZoom());
            const nw = new google.maps.LatLng(
                vm.map.getBounds().getNorthEast().lat(),
                vm.map.getBounds().getSouthWest().lng()
            );
            const worldCoordinateNW = vm.map.getProjection().fromLatLngToPoint(nw);
            const worldCoordinate = vm.map.getProjection().fromLatLngToPoint(latLng);
            const pixelOffset = new google.maps.Point(
                Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
                Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
            );
            mapContextMenu.style.top = (pixelOffset.y + mainColumnHeader.offsetHeight) + 'px';
            mapContextMenu.style.left = (pixelOffset.x + leftColumn.offsetWidth) + 'px';
            mapContextMenu.style.display = 'flex';
        };

        google.maps.event.addListener(vm.map, "rightclick", function(event) {
            positionateMapContextMenu(event.latLng);
            const mapCenter = vm.map.getCenter();
            vm.setMapContextMenu({
                active: true,
                latitude: event.latLng.lat(),
                longitude: event.latLng.lng(),
                map: {
                    center: {
                        latitude: mapCenter.lat(),
                        longitude: mapCenter.lng()
                    },
                    zoom: vm.map.getZoom()
                }
            });
        });

        vm.map.addListener('bounds_changed', function(ev) {
            vm.setMapContextMenu({
                active: false,
                latitude: null,
                longitude: null
            });
        });
        vm.map.addListener('click', function(ev) {
            vm.setMapContextMenu({
                active: false,
                latitude: null,
                longitude: null
            });
        });

    }
}