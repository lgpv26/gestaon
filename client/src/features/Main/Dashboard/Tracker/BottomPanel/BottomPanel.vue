<template>
    <div id="app-bottom-panel">
        <app-panel-loading :loading="loading || devicesLoading" :text="(devicesLoading) ? 'Carregando dispositivos...' : 'Carregando'"></app-panel-loading>
        <div class="bottom-panel-content">
            <div class="bottom-panel-container">
                <div class="bottom-panel-header">
                    <div class="device-tabs">
                        <ul>
                            <li :class="{active: activeBottomPanel === 'devices' && showBottomPanel}" @click="activateBottomPanel('devices')">Dispositivos</li>
                            <li :class="{active: activeBottomPanel === 'position-history' && showBottomPanel}" v-if="hasPermission('devices.filter-positions')" @click="activateBottomPanel('position-history')">Filtro de rotas</li>
                            <li :class="{active: activeBottomPanel === 'events' && showBottomPanel}" @click="activateBottomPanel('events')">Eventos</li>
                            <li :class="{active: activeBottomPanel === 'geofences' && showBottomPanel}" @click="activateBottomPanel('geofences')">Cercas virtuais</li>
                        </ul>
                    </div>
                    <span class="push-both-sides"></span>
                    <div v-if="activeBottomPanel === 'devices'" class="bottom-panel-actions">
                        <ul>
                            <li v-if="hasPermission('devices.add')">
                                <a class="btn btn--circle" @click="executePanelMethod('showDeviceFormModal')" v-tippy="{ theme: 'light', inertia: true, arrow: true, animation: 'perspective' }" :title="'Adicionar dispositivo'">
                                    <i class="mi mi-add"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div v-if="activeBottomPanel === 'events'" class="bottom-panel-actions">
                        <ul>
                            <li>
                                <a class="btn btn--circle" @click="executePanelMethod('refreshEvents')" v-tippy="{ theme: 'light', inertia: true, arrow: true, animation: 'perspective' }" :title="'Atualizar eventos'">
                                    <i class="mi mi-refresh"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div v-if="activeBottomPanel === 'geofences'" class="bottom-panel-actions">
                        <ul>
                            <li>
                                <a class="btn btn--circle" @click="executePanelMethod('refreshData')"  v-tippy="{ theme: 'light', inertia: true, arrow: true, animation: 'perspective' }" :title="'Atualizar cercas'">
                                    <i class="mi mi-refresh"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="bottom-panel-actions" style="padding-left: 0;">
                        <a class="btn btn--circle" @click="toggleBottomPanel()" :class="{'is-primary': showBottomPanel}">
                            <i class="mi" :class="{'mi-expand-less': showBottomPanel,'mi-expand-more': !showBottomPanel}" style="font-size: 16px;"></i>
                        </a>
                    </div>
                </div>
                <div v-show="showBottomPanel">
                    <app-position-history-panel v-if="hasPermission('devices.filter-positions') && activeBottomPanel === 'position-history'" :map.sync="map" @loadingChanged="setLoading($event)"></app-position-history-panel>
                    <app-devices-panel ref="devices-panel" v-if="activeBottomPanel === 'devices'" @loadingChanged="setLoading($event)"></app-devices-panel>
                    <app-events-panel ref="events-panel" v-if="activeBottomPanel === 'events'">Events</app-events-panel>
                    <app-fences-panel ref="geofences-panel" v-if="activeBottomPanel === 'geofences'" :map.sync="map"></app-fences-panel>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import moment from 'moment';
    import _ from 'lodash';
    import utils from '../../../../../utils/index';
    import Scrollbar from 'smooth-scrollbar';

    import TrackerControls from '../TrackerControls.vue';
    import DevicesPanel from './DevicesPanel.vue';
    import PositionHistoryPanel from './PositionHistoryPanel.vue';
    import FencesPanel from './GeofencesPanel.vue';
    import EventsPanel from './EventsPanel.vue';

    import GeofencesAPI from '../../../../../api/geofences';

    import { mapGetters, mapState, mapActions } from 'vuex';

    export default {
        components: {
            'app-tracker-controls': TrackerControls,
            'app-devices-panel': DevicesPanel,
            'app-position-history-panel': PositionHistoryPanel,
            'app-fences-panel': FencesPanel,
            'app-events-panel': EventsPanel
        },
        props: ['map'],
        data(){
            return {
                loading: false,
                scrollbars: null,
                activeBottomPanel: 'devices',
                showBottomPanel: false
            }
        },
        computed: {
            ...mapState('tracker', ['devicesLoading']),
            ...mapGetters('auth', [
                'hasPermission'
            ])
        },
        methods: {
            ...mapActions('tracker', []),
            activateBottomPanel(panelName){
                this.activeBottomPanel = panelName;
                this.showBottomPanel = true;
            },
            executePanelMethod(action){
                if(_.has(this.$refs, this.activeBottomPanel + '-panel')){
                    this.$bus.$emit('device-details-window-hide');
                    this.$refs[this.activeBottomPanel + '-panel'][action]();
                }
            },
            setLoading(isLoading){
                this.loading = isLoading;
            },
            toggleBottomPanel(){
                this.showBottomPanel = !this.showBottomPanel;
            }
        },
        created(){
        },
        mounted(){
            // initialize scrollbars
            this.scrollbars = Scrollbar.initAll({
                overscrollEffect: 'bounce'
            });
        }
    }
</script>

<style scoped>

    #app-bottom-panel {
        box-shadow: var(--bottom-panel-shadow);
        display: flex;
        flex-shrink: 0;
        flex-direction: column;
        background: var(--bg-color--2);
        position: relative;
        padding: 0;
    }

    #app-bottom-panel .bottom-panel-container {
        display: flex;
        flex-direction: column;
    }

    #app-bottom-panel .bottom-panel-header {
        display: flex;
        flex-direction: row;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
    }

    h3 {
        text-transform: uppercase;
        margin-bottom: 10px;
        color: #FFF;
    }

    #app-bottom-panel .device-tabs {
        padding: 0 10px;
    }

    #app-bottom-panel .device-tabs ul {
        height: 26px;
        display: flex;
        flex-direction: row;
    }

    #app-bottom-panel .device-tabs ul li {
        list-style: none;
        display: flex;
        background: var(--bg-color--9);
        color: var(--font-color--9);
        align-items: center;
        margin-right: 5px;
        padding: 0 20px;
        border-radius: 5px;
        cursor: pointer;
    }

    #app-bottom-panel .device-tabs ul li.active {
        color: #61AFEF;
    }

    #app-bottom-panel div.bottom-panel-actions {
        display: flex;
        padding: 0 10px;
        align-items: center;
    }

    #app-bottom-panel div.bottom-panel-actions ul {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    #app-bottom-panel div.bottom-panel-actions ul li{
        display: flex;
        margin-left: 10px;
    }

    #app-bottom-panel div.bottom-panel-actions ul li a{
        color: #FFF;
        font-size: 16px;
    }

    #app-bottom-panel div.bottom-panel-actions ul li a > i{
        position: relative;
        top: 0;
    }

</style>