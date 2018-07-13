import DevicesAPI from '../../api/devices';
import moment from 'moment';
import _ from 'lodash';

const state = {
    devicesLoading: false,
    devices: [],
    selected: null,
    follow: null,
    mapContextMenu: {
        active: false,
        latitude: null,
        longitude: null,
        map: {}
    }
};

const getters = {
    selectedDevice(state){
        const selectedDevice = _.find(state.devices, {code: state.selected});
        return selectedDevice || !!selectedDevice;
    },
    devices(state){
        let devices = [];
        state.devices.forEach(function(deviceState){
            let device = deviceState;
            device['lastPositionUpdate'] = moment(deviceState['positions'][0]['updatedAt']).format("DD/MM H:mm");
            devices.push(device);
        });
        return devices;
    },
    devicesSelectOptions(){
        let devices = [];
        state.devices.forEach(function(deviceState){
            let device = {
                text: deviceState.name,
                value: deviceState.id
            };
            devices.push(device);
        });
        return devices;
    }
};

const mutations = {
    setDevicesLoading(state, loading){
        state.devicesLoading = loading;
    },
    loadDevices(state, devices){
        state.devices = [];
        devices.forEach(function(device){
            if(_.has(device, 'positions') && device.positions.length > 0) {
                device.lastPosition = device.positions[0];
            }
            device.visible = true;
            device.track = true;
            state.devices.push(device);
        });
    },
    addDevicePosition(state, {deviceCode, position}){
        const device = _.find(state.devices, {code: deviceCode});
        if(_.has(device, 'positions')){
            device.lastPosition = position;
            device.positions.unshift(position);
        }
    },
    selectDevice(state, deviceCode){
        const device = _.findIndex((device) => {
            if(device.code === deviceCode){
                return true;
            }
        });
        if(device){
            state.selected = deviceCode;
        }
        else {
            state.selected = null;
        }
    },
    toggleDevice(state, deviceCode){
        if(deviceCode === state.selected) {
            state.selected = null;
        }
        else {
            const device = _.findIndex((device) => {
                if(device.code === deviceCode){
                    return true;
                }
            });
            if(device){
                state.selected = deviceCode;
            }
            else {
                state.selected = null;
            }
        }
    },
    followDevice(state, deviceCode){
        if(deviceCode === state.follow){
            state.follow = null;
        }
        else {
            const device = _.findIndex((device) => {
                if(device.code === deviceCode){
                    return true;
                }
            });
            if(device){
                state.follow = deviceCode;
            }
            else {
                state.follow = null;
            }
        }
    },
    toggleDeviceVisibility(state, deviceCode){
        const device = _.find(state.devices, {code: deviceCode});
        if(device){
            device.visible = !device.visible;
        }
    },
    toggleDeviceTrack(state, deviceCode){
        const device = _.find(state.devices, {code: deviceCode});
        if(device){
            device.track = !device.track;
        }
    },
    setMapContextMenu(state, mapContextMenu){
        _.assign(state.mapContextMenu, mapContextMenu);
    }
};

const actions = {
    loadDevices(context, companyId){
        const params = { companyId };
        context.commit('setDevicesLoading', true);
        return DevicesAPI.getAll(params).then((result) => {
            context.commit('setDevicesLoading', false);
            context.commit('loadDevices', result.data);
            return result.data;
        });
    },
    updateDevice(context,device){
        return DevicesAPI.updateOne(device.data.id,device.form).then(() => {
            return DevicesAPI.getOne(device.data.id).then((deviceResult) => {
                context.commit('updateDevice',deviceResult.data);
                return deviceResult;
            });
        });
    },
    addDevicePosition(context, {deviceCode, position}){
        context.commit('addDevicePosition', {deviceCode, position});
    },
    selectDevice(context,deviceCode){
        return new Promise(function(resolve){
            context.commit('selectDevice',deviceCode);
            resolve();
        });
    },
    toggleDevice(context,deviceCode){
        context.commit('toggleDevice',deviceCode);
    },
    followDevice(context,deviceCode){
        context.commit('followDevice',deviceCode);
    }
};

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
}
