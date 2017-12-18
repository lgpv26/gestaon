import Vue from "vue"
import config from '../config'

export default {
    getAll(){
        return Vue.http.get(config.apiBaseUrl + '/products').then((response) => response.json());
    },
    getOne(id){
        return Vue.http.get(config.apiBaseUrl + '/products/' + id).then((response) => response.json());
    },
    createOne(body){
        return Vue.http.post(config.apiBaseUrl + '/products', body).then((response) => response.json());
    },
    updateOne(id, body){
        return Vue.http.patch(config.apiBaseUrl + '/products/' + id, body).then((response) => response.json());
    },
    removeOne(id){
        return Vue.http.delete(config.apiBaseUrl + '/products/' + id).then((response) => response.json());
    },
    search(params){
        return Vue.http.get(config.apiBaseUrl + '/products/search', { params }).then((response) => response.json());
    }
}
