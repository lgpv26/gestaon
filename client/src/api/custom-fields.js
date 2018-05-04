import Vue from "vue"
import config from '../config'

export default {
    getOne(id, params = {}){
        return Vue.http.get(config.apiBaseUrl + '/custom-fields/' + id, { params }).then((response) => response.json());
    },
    getList(params = {}){
        return Vue.http.get(config.apiBaseUrl + '/custom-fields', { params }).then((response) => response.json());
    },
    updateOne(){

    },
    removeOne(id, params = {}){
        return Vue.http.delete(config.apiBaseUrl + '/custom-fields' + id, { params }).then((response) => response.json());
    }
}
