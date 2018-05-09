import Vue from "vue"
import config from '../config'

export default {
    persistence(body, params = {}){
        return Vue.http.post(config.apiBaseUrl + '/requests/persistence', body, { params }).then((response) => response.json())
    },
    getOne(id, params = {}){
        return Vue.http.get(config.apiBaseUrl + '/requests/' + id, { params }).then((response) => response.json());
    },
    getList(params = {}){
        return Vue.http.get(config.apiBaseUrl + '/requests', { params }).then((response) => response.json());
    },
    updateOne(){

    },
    removeOne(id, params = {}){
        return Vue.http.delete(config.apiBaseUrl + '/requests/' + id, { params }).then((response) => response.json());
    }
}
