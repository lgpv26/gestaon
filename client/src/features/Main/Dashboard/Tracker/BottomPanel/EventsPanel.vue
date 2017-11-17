<template>
    <div id="app-events-panel">
        <div class="filter">
            <div class="filter-critery">
                <label>Dispositivo:</label>
                <app-select :options="devicesSelectOptions" position="bottom" v-model="form.deviceId"></app-select>
            </div>
            <div class="filter-critery">
                <button class="button is-primary is-small" @click="applyFilter()">Aplicar Filtro</button>
            </div>
            <div class="filter-critery">
                <button class="button is-red is-small" @click="cleanFilter()">Limpar</button>
            </div>
        </div>
        <div class="device-panel-column">
            <p v-if="events.length === 0" style="padding:0 20px;">Nenhum evento encontrado.</p>
            <div class="table" v-if="events.length > 0">
                <table>
                    <tbody>
                        <tr v-for="event in events" @click="showEventDetails(event)">
                            <td>{{ event.formatedCreatedAt }}</td>
                            <td>{{ event.formatedType }}</td>
                            <td v-if="event.type === 'alarm'">{{ event.formatedAlarmType }}</td>
                            <td v-else>{{ event.smsId }}</td>
                        </tr>
                    </tbody>
                </table>
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

    import { mapGetters, mapState, mapActions } from 'vuex';
    import EventsAPI from '../../../../../api/events';

    import resize from 'vue-resize-directive';

    const polyline = require('@mapbox/polyline');

    export default {
        directives: {
            resize
        },
        data(){
            return {
                loading: false,
                scrollbars: null,
                events: [],
                form: {
                    deviceId: null,
                    timeInterval: 'today',
                    showTimes: true,
                    initialInterval: null,
                    finalInterval: null
                },
            }
        },
        computed: {
            ...mapState('auth', [
                'company'
            ]),
            ...mapState('tracker', [
                'devices'
            ]),
            ...mapGetters('tracker', [
                'selectedDevice',
                'devicesSelectOptions'
            ])
        },
        methods: {
            ...mapActions('tracker', []),
            ...mapActions('toast', ['showError']),
            onResize(){
                this.$bus.$emit('map-recalculate-height');
            },
            applyFilter(){
                const vm = this;
                EventsAPI.filter(vm.form,{ companyId: this.company.id }).then(({data}) => {
                    console.log(data);
                    vm.events = _.map(data, (event) => {
                        switch(event.type){
                            case "alarm":
                                event.formatedType = "Alarme";
                                switch(event.alarmType){
                                    case "geofence_enter":
                                        event.formatedAlarmType = "Entrou na cerca: " + event.alarmGeofence.name;
                                        break;
                                    case "geofence_leave":
                                        event.formatedAlarmType = "Saiu da cerca: " + event.alarmGeofence.name;
                                        break;
                                }
                                break;
                            case "command":
                                event.formatedType = "Comando";
                                break;
                            default:
                                event.formatedType = "Desconhecido";
                        }
                        event.formatedCreatedAt = moment(event.createdAt).format("DD/MM/YYYY HH:mm:ss");
                        return event;
                    });
                }).catch((err) => {
                    vm.showError(err);
                });
            },
            cleanFilter(){
                this.events = [];
            },
            showEventDetails(event){
                console.log(event.smsReplies.join(', '));
            }
        },
        created(){
        },
        mounted(){
            const vm = this;
            vm.scrollbars = Scrollbar.initAll({
                overscrollEffect: 'bounce'
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

    #app-events-panel {
        display: flex;
        flex-shrink: 0;
        flex-direction: column;
        position: relative;
        padding: 0 0 20px;
    }

    #app-events-panel div.filter{
        padding: 0 20px 20px;
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-shrink: 0;
    }

    #app-events-panel div.filter > div.filter-critery{
        display: flex;
        flex-direction: row;
        padding: 0 0 0 20px;
    }

    #app-events-panel div.filter > div.filter-critery:first-child{
        padding-left: 0;
    }

    #app-events-panel div.filter > div.filter-critery label {
        display: flex;
        align-items: center;
        margin-right: 5px;
    }

</style>
