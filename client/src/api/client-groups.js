import Vue from "vue"
import config from '../config'

export default {
    getOne(id, params = {}){
        return Vue.http.get(config.apiBaseUrl + '/client-groups/' + id, { params }).then((response) => response.json());
    },
    getList(params = {}){
        return Vue.http.get(config.apiBaseUrl + '/client-groups', { params }).then((response) => response.json());
    },
    updateOne(){

    },
    removeOne(id, params = {}){
        return Vue.http.delete(config.apiBaseUrl + '/client-groups/' + id, { params }).then((response) => response.json());
    }
}
