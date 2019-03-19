import Vue from "vue"
import config from '../config'

export default {
    getOne(id){
        return Vue.http.get(config.apiBaseUrl + '/clients-phones/' + id).then((response) => response.json());
    },
    removeOne(id){
        console.log('removendo ' + id);
        return Vue.http.delete(config.apiBaseUrl + '/clients-phones/' + id).then((response) => response.json());
    }
}
