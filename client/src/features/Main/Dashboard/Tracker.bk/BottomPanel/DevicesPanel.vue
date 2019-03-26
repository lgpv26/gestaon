<template>
    <div id="app-devices-panel" class="devices-panel" :class="{'collapsed': sidePanel}">
        <p v-if="devices.length <= 0" style="padding:0 20px;">Nenhum dispositivo cadastrado.</p>
        <div scrollbar style="width: 100%">
            <div class="scrollable-content">
                <div class="table">
                    <table>
                        <app-device v-for="device in devices" :key="device.id" :device="device" :lastPosition="device.positions[0]"></app-device>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex';

    import Scrollbar from 'smooth-scrollbar';
    import moment from 'moment';
    import DeviceComponent from './Device.vue';
    import Vue from 'vue';

    export default {
        components: {
            'app-device': DeviceComponent
        },
        data(){
            return {
                sidePanel: false,
                scrollbars: null,
            }
        },
        methods: {
            showDeviceFormModal(){
                this.$modal.show('device-form', {
                    device: null
                });
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapState('tracker', ['devices'])
        },
        watch: {
            company(){
                this.scrollbars.forEach((scrollbar) => {
                    scrollbar.setPosition(0, 0);
                });
            }
        },
        mounted(){
            const vm = this;
            // initialize scrollbars
            this.scrollbars = Scrollbar.initAll({
                overscrollEffect: 'bounce'
            });
            this.$bus.$on('side-panel-toggle', () => {
                vm.sidePanel = !vm.sidePanel;
            });
        }
    }

</script>

<style scoped>

    #app-devices-panel div.table {
        max-height: 180px;
        margin-bottom: 20px;
    }

    h3 {
        text-transform: uppercase;
        margin-bottom: 10px;
        color: #FFF;
    }

    div.devices-panel {
        color: #FFF;
        display: flex;
        flex-direction: column;
        overflow: auto;
        flex-shrink: 0;
        position: relative;
        transition: all .1s;
    }
    div.devices-panel-header {
        display: flex;
        flex-direction: row;
        padding: 15px 20px;
    }

    div.devices-panel-header p {
        color: #FFFFFF;
    }

    div.devices-panel-header h3 {
        margin-bottom: 0;
    }

    div.devices-panel-header div.actions {
        align-self: center;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    div.devices-panel-header div.actions a {
        height: 22px;
        color: #FFF;
        font-size: 18px;
        border: 2px solid #FFF;
        border-radius: 22px;
    }

    div.devices-panel-header div.actions a > i {
        position: relative;
        top: -1px;
    }

    thead th {
        color: #FFF;
        font-weight: bold;
        padding-bottom: 5px;
    }

    tbody td {
        color: #EEE;
        padding: 10px 20px;
        cursor: pointer;
    }

    .devices-panel.collapsed {
        transform: translateX(-100%);
        position: absolute;
    }

</style>
