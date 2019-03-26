<template>
    <div id="map" class="map">
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from "vuex"
    import _ from "lodash"
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
                    baseMarker: null
                }
            }
        },
        computed: {

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
            }
        },
        mounted(){
            this.initializeMap()
            this.setBaseMarker()
        }
    };
</script>

<style lang="scss" scoped>
    #map {
        flex-grow: 1;
        background-color: #990000
    }
</style>
