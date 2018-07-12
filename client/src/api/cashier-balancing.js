import Vue from "vue"
import config from '../config'

export default {
    getList(params = {}){
        return Vue.http.get(config.apiBaseUrl + '/cashier-balancing', { params }).then((response) => response.json());
    },
    markAsReceived(body, params = {}){
        return Vue.http.post(config.apiBaseUrl + '/cashier-balancing/mark-as-received', body, { params }).then((response) => response.json());
    }
}
