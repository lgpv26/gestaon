import Vue from "vue"
import config from '../config'

export default {
    search(params = {}){
        return Vue.http.get(config.apiBaseUrl + '/addresses/search', { params }).then((response) => response.json());
    },
    createOne(body){
        return Vue.http.post(config.apiBaseUrl + '/addresses', body).then((response) => response.json());
    },
    getOne(id, params = {}){
        return Vue.http.get(config.apiBaseUrl + '/addresses/' + id, { params }).then((response) => response.json());
    },
    updateOne(id, body){
        return Vue.http.patch(config.apiBaseUrl + '/addresses/' + id, body).then((response) => response.json());
    },
    removeOne(id){
        return Vue.http.delete(config.apiBaseUrl + '/addresses/' + id).then((response) => response.json());
    }
}
