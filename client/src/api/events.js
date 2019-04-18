import Vue from "vue"
import config from '../config'

export default {
    filter(body, params){
        return Vue.http.post(config.apiBaseUrl + '/events/filter', body, { params }).then((response) => response.json());
    },
    getAll(params){
        return Vue.http.get(config.apiBaseUrl + '/events', { params }).then((response) => response.json());
    },
    getOne(id, params){
        return Vue.http.get(config.apiBaseUrl + '/events/' + id, { params }).then((response) => response.json());
    },
    createOne(body, params){
        return Vue.http.post(config.apiBaseUrl + '/events', body, { params }).then((response) => response.json());
    },
    updateOne(id, body, params){
        return Vue.http.patch(config.apiBaseUrl + '/events/' + id, body, { params }).then((response) => response.json());
    },
    removeOne(id, params){
        return Vue.http.delete(config.apiBaseUrl + '/events/' + id, { params }).then((response) => response.json());
    },
    sendCommand(id, body, params){
        return Vue.http.post(config.apiBaseUrl + '/events/' + id + '/commands', body, { params }).then((response) => response.json());
    }
}