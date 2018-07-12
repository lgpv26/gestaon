import Vue from "vue"
import config from '../config'

export default {
    getAll(){
        return Vue.http.get(config.apiBaseUrl + '/services').then((response) => response.json());
    },
    getOne(id){
        return Vue.http.get(config.apiBaseUrl + '/services/' + id).then((response) => response.json());
    },
    createOne(body){
        return Vue.http.post(config.apiBaseUrl + '/services', body).then((response) => response.json());
    },
    updateOne(id, body){
        return Vue.http.patch(config.apiBaseUrl + '/services/' + id, body).then((response) => response.json());
    },
    removeOne(id){
        return Vue.http.delete(config.apiBaseUrl + '/services/' + id).then((response) => response.json());
    }
}
