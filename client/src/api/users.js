import Vue from "vue"
import config from '../config'

export default {
    getAll(){
        return Vue.http.get(config.apiBaseUrl + '/users').then((response) => response.json());
    },
    getOne(id){
        return Vue.http.get(config.apiBaseUrl + '/users/' + id).then((response) => response.json());
    },
    createOne(body, params){
        return Vue.http.post(config.apiBaseUrl + '/users', body, { params }).then((response) => response.json());
    },
    updateOne(id, body){
        return Vue.http.patch(config.apiBaseUrl + '/users/' + id, body).then((response) => response.json());
    },
    removeOne(id){
        return Vue.http.delete(config.apiBaseUrl + '/users/' + id).then((response) => response.json());
    }
}