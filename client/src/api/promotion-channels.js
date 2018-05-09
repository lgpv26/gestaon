import Vue from "vue"
import config from '../config'

export default {
    getOne(id, params = {}){
        return Vue.http.get(config.apiBaseUrl + '/promotion-channels/' + id, { params }).then((response) => response.json());
    },
    getList(params = {}){
        return Vue.http.get(config.apiBaseUrl + '/promotion-channels', { params }).then((response) => response.json());
    },
    createOne(body, params = {}){
        return Vue.http.post(config.apiBaseUrl + '/promotion-channels', body, { params }).then((response) => response.json());
    },
    updateOne(id, body, params = {}){
        return Vue.http.patch(config.apiBaseUrl + '/promotion-channels/' + id, body, { params }).then((response) => response.json());
    },
    removeOne(id, params = {}){
        return Vue.http.delete(config.apiBaseUrl + '/promotion-channels/' + id, { params }).then((response) => response.json());
    }
}
