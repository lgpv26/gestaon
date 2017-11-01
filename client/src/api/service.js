import Vue from "vue"
import config from '../config'

export default {
    search(options){
        return Vue.http.get(config.apiBaseUrl + '/service/search', options).then((response) => response.json());
    },
    findClients(options){
        return Vue.http.get(config.apiBaseUrl + '/service/find-clients', options).then((response) => response.json());
    },
    findAddresses(options){
        return Vue.http.get(config.apiBaseUrl + '/service/find-addresses', options).then((response) => response.json());
    }
}
