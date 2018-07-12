import GeofencesAPI from '../../api/geofences';
import moment from 'moment';
import _ from 'lodash';

const state = {
    show: true,
    isEditingGeofences: false,
    geofences: []
};

const getters = {
    showGeofences(state){
        return state.show && !state.isEditingGeofences;
    }
};

const mutations = {
    setGeofences(state, geofences){
        if(Array.isArray(geofences)){
            state.geofences = geofences;
        }
        else {
            state.geofences = [];
        }
    },
    addGeofence(state, geofence){
        state.geofences.push(geofence);
    },
    updateGeofence(state, geofence){
        let foundGeofence = _.find(state.geofences, { id: geofence.id });
        if(foundGeofence) _.assignIn(foundGeofence, geofence);
    },
    removeGeofence(state, geofenceId){
        const geofenceIndex = _.findIndex(state.geofences, { id: geofenceId });
        if(Number.isInteger(geofenceIndex) && geofenceIndex >= 0){
            state.geofences.splice(geofenceIndex, 1);
        }
    },
    setShowGeofences(state, show){
        state.show = show;
    },
    setIsEditingGeofences(state, isEditing){
        state.isEditingGeofences = isEditing;
    }
};

const actions = {
    loadGeofences(context, companyId){
        const params = { companyId };
        return GeofencesAPI.getAll(params).then(({data}) => {
            context.commit('setGeofences', data);
            return data;
        });
    }
};

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
}
