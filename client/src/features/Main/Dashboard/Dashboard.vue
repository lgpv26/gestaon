<template>
    <div class="tracker-page">
        <div id="main-content-area" class="horizontal-align">
            <resize-observer @notify="mainContentContainerResized()" />
            <app-request-board></app-request-board>
            <div class="vertical-align">
                <app-map></app-map>
                <div class="tracker__header">
                    <span class="push-both-sides"></span>
                    <ul class="menu">
                        <li class="active">
                            <a href="javascript:void(0)">Dispositivos</a>
                        </li>
                        <li>
                            <a href="javascript:void(0)">Rotas</a>
                        </li>
                        <li>
                            <a href="javascript:void(0)">Eventos</a>
                        </li>
                        <li>
                            <a href="javascript:void(0)">Cercas</a>
                        </li>
                    </ul>
                </div>
                <div class="tracker__body">
                    <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th style="text-align: left;">Ações</th>
                                <th style="text-align: left;">Dispositivo</th>
                                <th style="text-align: left;">Distância</th>
                                <th style="text-align: right;">Última atualização</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="device in devices" style="cursor: pointer;" @click="focusDevice(device.id)">
                                <td style="text-align: left;">
                                    <a href="javascript:void(0)" @click.stop="followDevice(device.id)">
                                        <i class="mi mi-lock" :style="'color: ' + ((device.id === followingDeviceId) ? 'var(--font-color--primary)' : 'var(--font-color)')"></i>
                                    </a>
                                </td>
                                <td style="text-align: left;">{{ device.name }}</td>
                                <td v-if="device.lastPosition">{{ device.lastPosition.distance }}</td>
                                <td v-else>---</td>
                                <td style="text-align: right;" v-if="device.lastPosition">{{ moment(device.lastPosition.dateCreated).format('DD/MM/YYYY HH:mm:ss') }}</td>
                                <td style="text-align: right;" v-else>---</td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState, mapMutations } from 'vuex'
    import RequestBoard from './RequestBoard/RequestBoard.vue'
    import Map from './Map/Map'

    import geolib from 'geolib'

    export default {
        name: 'app-dashboard',
        components: {
            'app-request-board': RequestBoard,
            'app-map': Map
        },
        computed: {
            ...mapState('tracker',['followingDeviceId']),
            devices(){
                const vm = this
                return _.map(vm.$store.getters[`entities/devices`]().with('positions').get(), (device) => {
                    if(device.positions.length){
                        device.lastPosition = _.last(device.positions)
                        const distanceInMeters = geolib.getDistanceSimple(
                            {latitude: -23.41367408, longitude: -51.90355003},
                            {latitude: device.lastPosition.lat, longitude: device.lastPosition.lng}
                        )
                        device.lastPosition.distance = ( distanceInMeters / 1000 ) + ' km'
                    }
                    return device
                })
            }
        },
        methods: {
            ...mapMutations(['setMainContentArea']),
            ...mapActions('tracker',['followDevice']),
            mainContentContainerResized(){
                this.setMainContentArea({
                    height: document.getElementById('main-content-area').clientHeight,
                    width: document.getElementById('main-content-area').clientWidth
                })
            },
            focusDevice(deviceId){
                this.$bus.$emit('map.panToDevice',deviceId)
            }
        },
        mounted(){
            this.mainContentContainerResized()
        }
    }
</script>

<style lang="scss" scoped>
    div.tracker-page {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        position: relative;
        .tracker__header {
            background-color: var(--bg-color--4);
            height: 50px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            ul.menu {
                margin-right: 12px;
                li {
                    display: inline;
                    padding: 8px 15px;
                    background-color: var(--bg-color--6);
                    margin-left: 1px;
                    cursor: pointer;
                    &:hover {
                        background-color: var(--bg-color--7)
                    }
                    &.active {
                        background-color: var(--bg-color--7);
                        a {
                            color: var(--primary-color);
                        }
                    }
                    a {
                        color: var(--font-color);
                    }
                    &:first-child {
                        border-top-left-radius: 20px;
                        border-bottom-left-radius: 20px;
                    }
                    &:last-child {
                        border-top-right-radius: 20px;
                        border-bottom-right-radius: 20px;
                    }
                }
            }
        }
        .tracker__body {
            background-color: var(--bg-color--4);
            max-height: 180px;
            flex-shrink: 0;
            table {
                width: 100%;
            }
        }
    }
    div.vertical-align {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        flex-grow: 1;
    }
    div.horizontal-align {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        position: relative;
    }

    #markerLayer img {
        animation: pulse .5s infinite alternate;
        -webkit-animation: pulse .5s infinite alternate;
        transform-origin: center;
        -webkit-transform-origin: center;
    }
</style>
