import Vue from "vue"
import config from '../config'

export default {
    getAll(params){
        return Vue.http.get(config.apiBaseUrl + '/geofences', { params }).then((response) => response.json());
    },
    getOne(id, params){
        return Vue.http.get(config.apiBaseUrl + '/geofences/' + id, { params }).then((response) => response.json());
    },
    createOne(body, params){
        return Vue.http.post(config.apiBaseUrl + '/geofences', body, { params }).then((response) => response.json());
    },
    updateOne(id, body, params){
        return Vue.http.patch(config.apiBaseUrl + '/geofences/' + id, body, { params }).then((response) => response.json());
    },
    removeOne(id, params){
        return Vue.http.delete(config.apiBaseUrl + '/geofences/' + id, { params }).then((response) => response.json());
    }
}