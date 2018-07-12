<template>
    <div id="map-context-menu" @mouseleave="onMouseLeave($event)" @mouseenter="onMouseEnter($event)" v-show="mapContextMenu.active">
        <transition>
            <div class="dropdown-menu" v-if="mapContextMenu.active">
                <ul>
                    <li @click="setAsCompanyBase()">Marcar esta posição como sendo a base da empresa</li>
                    <li @click="setAsCompanyInitialMapView()">Configurar como visão inicial ao carregar o mapa</li>
                </ul>
            </div>
        </transition>
    </div>
</template>
<script>
    import moment from 'moment';
    import _ from 'lodash';
    import utils from '../../../../utils/index';
    import geolib from 'geolib/dist/geolib';
    import Scrollbar from 'smooth-scrollbar';

    import DevicesAPI from '../../../../api/devices';

    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

    export default {
        data(){
            return {
                scrollbar: null,
                timeout: null
            }
        },
        computed: {
            ...mapState('auth', [
                'company'
            ]),
            ...mapState('tracker', [
                'mapContextMenu'
            ]),
            ...mapGetters('auth', ['hasPermission'])
        },
        methods: {
            ...mapMutations('tracker', ['setMapContextMenu']),
            ...mapActions('auth', ['saveCompanySettings']),
            ...mapActions('toast', ['showToast']),
            setAsCompanyBase(){
                const vm = this;
                vm.setMapContextMenu({
                    active: false
                });
                vm.saveCompanySettings({
                    companyBaseLatitude: vm.mapContextMenu.latitude,
                    companyBaseLongitude: vm.mapContextMenu.longitude
                }).then(({data}) => {
                    vm.$bus.$emit('company-base-redraw', {
                        companyBaseLatitude: vm.mapContextMenu.latitude,
                        companyBaseLongitude: vm.mapContextMenu.longitude
                    });
                    vm.showToast({
                        type: "success",
                        message: "Preferências salvadas com sucesso."
                    });
                }).catch((err) => {
                    vm.showToast({
                        type: "error",
                        message: "Erro ao salvar as preferências."
                    });
                });
            },
            setAsCompanyInitialMapView(){
                const vm = this;
                vm.setMapContextMenu({
                    active: false
                });
                vm.saveCompanySettings({
                    onMapLoadZoom: vm.mapContextMenu.map.zoom,
                    onMapLoadLatitude: vm.mapContextMenu.map.center.latitude,
                    onMapLoadLongitude: vm.mapContextMenu.map.center.longitude
                }).then(({data}) => {
                    vm.showToast({
                        type: "success",
                        message: "Preferências salvadas com sucesso."
                    });
                }).catch((err) => {
                    vm.showToast({
                        type: "error",
                        message: "Erro ao salvar as preferências."
                    });
                });
            },
            onMouseLeave(ev){
                const vm = this;
                vm.timeout = setTimeout(function(){
                    vm.setMapContextMenu({
                        active: false
                    });
                }, 1000);
            },
            onMouseEnter(ev){
                const vm = this;
                vm.setMapContextMenu({
                    active: true
                });
                clearTimeout(vm.timeout);
            }
        },
        created(){
        },
        mounted(){

        }
    }
</script>

<style scoped>
    h3 {
        text-transform: uppercase;
        padding: 15px 20px;
        margin-bottom: 0;
        color: #FFF;
    }

    h3.device-name {
        padding: 15px 20px;
        margin-bottom: 0;
    }

    h3 > small {
        font-size: 10px;
    }

    h3 > small > strong {
        color: greenyellow;
    }

    #map-context-menu {
        flex-shrink: 0;
        flex-direction: column;
        position: absolute;
        z-index: 999999999;
        top: 0;
        left: 0;
    }

    div.dropdown-menu {
        background: #2A2B33;
        width: 120px;
        text-align: left;
        box-shadow: 0px 1px 3px #151515;
        min-width: 160px;
    }

    .v-enter-active {
        transition: all .1s ease-in;
    }
    .v-leave-active {
        transition: all .1s ease-in;
    }
    .v-enter, .v-leave-to {
        transform: translateY(-10px);
        opacity: 0;
    }

    div.dropdown-menu li {
        padding: 5px 8px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        color: #FFF;
        cursor: pointer;
    }

    div.dropdown-menu li:hover {
        padding: 5px 8px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        color: #FFF;
        background: #26272E;
        cursor: pointer;
    }

    div.dropdown-menu li:last-child {
        border-bottom: 0px;
    }
</style>
