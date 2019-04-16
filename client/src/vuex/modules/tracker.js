import DevicesAPI from '../../api/devices';
import moment from 'moment';
import _ from 'lodash';

const state = {
    followingDeviceId: null
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
    FOLLOW_DEVICE(state, deviceId){
        if(state.followingDeviceId === deviceId){
            state.followingDeviceId = null
            return
        }
        state.followingDeviceId = deviceId
    }
};

const actions = {
    followDevice(context, deviceId){
        context.commit('FOLLOW_DEVICE', deviceId);
    }
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
}
