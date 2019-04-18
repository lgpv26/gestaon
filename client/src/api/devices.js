import Vue from "vue"
import config from '../config'

export default {
    getAll(params){
        return Vue.http.get(config.apiBaseUrl + '/devices', { params }).then((response) => response.json());
    },
    getOne(id){
        return Vue.http.get(config.apiBaseUrl + '/devices/' + id).then((response) => response.json());
    },
    createOne(body, params){
        return Vue.http.post(config.apiBaseUrl + '/devices', body, { params }).then((response) => response.json());
    },
    updateOne(id, body, params){
        return Vue.http.patch(config.apiBaseUrl + '/devices/' + id, body, { params }).then((response) => response.json());
    },
    removeOne(id, params){
        return Vue.http.delete(config.apiBaseUrl + '/devices/' + id, { params }).then((response) => response.json());
    },
    sendCommand(id, body, params){
        return Vue.http.post(config.apiBaseUrl + '/devices/' + id + '/commands', body, { params }).then((response) => response.json());
    }
}