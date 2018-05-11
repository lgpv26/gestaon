import Vue from "vue"
import config from '../config'

export default {
    getOne(id, params = {}){
        return Vue.http.get(config.apiBaseUrl + '/calls/' + id, { params }).then((response) => response.json());
    },
    getList(params = {}){
        return Vue.http.get(config.apiBaseUrl + '/calls', { params }).then((response) => response.json());
    },
    createOne(body, params = {}){
        return Vue.http.post(config.apiBaseUrl + '/calls', body, { params }).then((response) => response.json());
    },
    updateOne(id, body, params = {}){
        return Vue.http.patch(config.apiBaseUrl + '/calls/' + id, body, { params }).then((response) => response.json());
    },
    removeOne(id, params = {}){
        return Vue.http.delete(config.apiBaseUrl + '/calls/' + id, { params }).then((response) => response.json());
    }
}
