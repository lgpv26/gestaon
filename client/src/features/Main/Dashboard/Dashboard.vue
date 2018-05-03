<template>
    <div class="tracker-page">
        <app-panel-loading :loading="loading" :loadingText="'Carregando dispositivos...'"></app-panel-loading>
        <div class="vertical-align">
            <div id="main-content-area" class="horizontal-align">
                <resize-observer @notify="mainContentContainerResized()" />
                <app-request-panel></app-request-panel>
                <div id="map-height" class="horizontal-align">
                    <div class="map-container">
                        <app-tracker-controls :map.sync="map"></app-tracker-controls>
                        <div id="map"></div>
                    </div>
                </div>
            </div>
            <app-bottom-panel :map.sync="map"></app-bottom-panel>
        </div>
    </div>
</template>

<script>
    import Tracker from './Tracker/Tracker'
    import moment from 'moment'
    import Utils from '../../../utils/index'
    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex'

    import RequestPanel from './RequestBoard/RequestBoard.vue'

    import PanelLoadingComponent from '../../../components/Utilities/PanelLoading.vue'

    import TrackerControls from './Tracker/TrackerControls.vue'
    import BottomPanel from './Tracker/BottomPanel/BottomPanel.vue'
    import DeviceDetails from './Tracker/DeviceDetails.vue'

    import geolib from 'geolib/dist/geolib'
    import _ from 'lodash'

    export default {
        name: 'app-dashboard',
        components: {
            'app-panel-loading': PanelLoadingComponent,
            'app-tracker-controls': TrackerControls,
            'app-bottom-panel': BottomPanel,
            'app-device-details': DeviceDetails,
            'app-request-panel': RequestPanel
        },
        mixins: [Tracker]
    }
</script>

<style scoped>
    div.tracker-page {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        position: relative;
    }
    div.vertical-align {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    div.horizontal-align {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        position: relative;
    }

    div.map-container {
        position: relative;
        display: flex;
        flex-grow: 1;
    }
    div.tracker-controls {
        position: absolute;
        top: 15px;
        right: 15px;
        z-index: 99;
        height: 30px;
    }
    div#map {
        position: relative;
        height: 200px;
        width: 100%;
    }

    #markerLayer img {
        animation: pulse .5s infinite alternate;
        -webkit-animation: pulse .5s infinite alternate;
        transform-origin: center;
        -webkit-transform-origin: center;
    }
</style>
