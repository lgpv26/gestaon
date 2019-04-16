<template>
    <div id="map" class="map">
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from "vuex"
    import _ from "lodash"
    import geolib from 'geolib/dist/geolib';
    import Vue from "vue"

    // map scripts
    import MarkerWithLabel from 'marker-with-label'
    const Marker = MarkerWithLabel(google.maps)

    export default {
        components: {

        },
        data() {
            return {
                map: null,
                markers: {
                    baseMarker: null,
                    deviceMarkers: {}
                }
            }
        },
        computed: {
            ...mapState('tracker',['followingDeviceId']),
        },
        methods: {
            initializeMap(){
                if(this.map) return
                this.map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: -23.41367408, lng: -51.90355003},
                    backgroundColor: '#2A2B33',
                    disableDefaultUI: true,
                    gestureHandling: 'greedy',
                    mapTypeControlOptions: {
                        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', 'light', 'dark']
                    },
                    zoom: 18
                })
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
                this.map.mapTypes.set('dark', darkMapType);
                this.map.mapTypes.set('light', lightMapType);
                this.map.setMapTypeId('dark')
            },
            setBaseMarker(){
                if(this.markers.baseMarker) this.markers.baseMarker.setMap(null)
                this.markers.baseMarker = new Marker({
                    position: {lat: -23.41367408, lng: -51.90355003},
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        strokeColor: "#FFF",
                        strokeWeight: 1,
                        fillColor: "#61AFEF",
                        fillOpacity: 1,
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 0)
                    },
                    labelContent: "EMPRESA",
                    labelAnchor: new google.maps.Point(60, -15),
                    labelClass: "tracked-device-label", // the CSS class for the label
                    clickable: false,
                    zIndex: 0,
                    map: this.map
                })
            },
            async onTrackerPosition(ev){
                const vm = this
                if(ev && _.has(ev, 'position.coordinates[0]') && _.has(ev, 'position.coordinates[1]')){
                    ev.lat = parseFloat(ev.position.coordinates[0])
                    ev.lng = parseFloat(ev.position.coordinates[1])
                    delete ev['position']

                    const persistedPositions = _.orderBy(vm.$store.getters['entities/positions']().where('deviceId',ev.deviceId).get(), ['id'], ['desc'])
                    const positionsToRemove = []
                    let k = 0, limitToStore = 2

                    persistedPositions.forEach((position) => {
                        k ++;
                        if(k > limitToStore){
                            positionsToRemove.push(position.id)
                        }
                    })
                    positionsToRemove.forEach((positionToRemove) => {
                        vm.$store.dispatch('entities/delete', {
                            entity: 'positions',
                            where: positionToRemove
                        })
                    })

                    await vm.$db.positions.put(ev)

                    vm.$store.dispatch("entities/insert", {
                        entity: 'positions',
                        data: ev
                    })

                    const device = vm.$store.getters['entities/devices']().where('id',ev.deviceId).first()
                    if(_.has(this.markers.deviceMarkers, ev.deviceId)){
                        this.markers.deviceMarkers[ev.deviceId].setIcon({
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 5,
                            strokeColor: "#FFF",
                            strokeWeight: 2,
                            fillColor: (device.color) ? device.color : vm.utils.getRandomDarkColor(),
                            fillOpacity: 1,
                            zIndex: 9999999999,
                            rotation: parseFloat(ev.orientation),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(0, 2.6)
                        })
                        const currentPositionCoordinates = new google.maps.LatLng(ev.lat, ev.lng)
                        this.markers.deviceMarkers[ev.deviceId].setPosition(currentPositionCoordinates);
                    }
                    else {
                        this.markers.deviceMarkers[ev.deviceId] = new Marker({
                            position: { lat: ev.lat, lng: ev.lng },
                            icon: {
                                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                scale: 5,
                                rotation: parseFloat(ev.orientation),
                                strokeColor: "#FFF",
                                strokeWeight: 2,
                                fillColor: (device.color) ? device.color : vm.utils.getRandomDarkColor(),
                                fillOpacity: 1,
                                origin: new google.maps.Point(0, 0),
                                anchor: new google.maps.Point(0, 2.6)
                            },
                            draggable: false,
                            labelContent: device.name,
                            labelAnchor: new google.maps.Point(60, -15),
                            labelClass: "tracked-device-label", // the CSS class for the label
                        })
                        this.markers.deviceMarkers[ev.deviceId].setDuration(1000)
                        this.markers.deviceMarkers[ev.deviceId].setEasing('linear')
                        this.markers.deviceMarkers[ev.deviceId].setMap(vm.map)
                    }

                    if(vm.followingDeviceId){
                        vm.map.panTo(vm.markers.deviceMarkers[ev.deviceId].getPosition())
                    }
                }
            },
            panMapToDevice(deviceId){
                if(this.markers.deviceMarkers[deviceId]){
                    this.map.panTo(this.markers.deviceMarkers[deviceId].getPosition())
                }
            }
        },
        async mounted(){
            const vm = this
            vm.initializeMap()
            vm.setBaseMarker()

            // on new position from server
            vm.$socket.on('tracker:position', vm.onTrackerPosition)

            // on pan to device
            vm.$bus.$on('map.panToDevice', vm.panMapToDevice)

            google.maps.event.addListener(vm.map, 'click', (ev) => {
                const coordinateArray = []
                _.forOwn(vm.markers.deviceMarkers, (value, key) => {
                    coordinateArray.push({
                        latitude: value.getPosition().lat(),
                        longitude: value.getPosition().lng(),
                        deviceId: parseInt(key)
                    })
                })
                const nearestDistances = geolib.orderByDistance({
                    latitude: ev.latLng.lat(),
                    longitude: ev.latLng.lng()
                }, coordinateArray)
                if(nearestDistances.length){
                    const result = coordinateArray[_.first(nearestDistances).key]
                    const device = vm.$store.getters['entities/devices']().where('id',result.deviceId).first()
                    console.log("Nearest device:", device.name)
                    console.log("Distance:", (_.first(nearestDistances).distance / 1000) + ' km')
                }
            })
        },
        beforeDestroy(){
            const vm = this
            vm.$bus.$off('i-got-clicked', vm.panMapToDevice);
            vm.$socket.removeListener('tracker:position', vm.onTrackerPosition)
        }
    }
</script>

<style lang="scss" scoped>
    #map {
        flex-grow: 1;
    }
</style>
