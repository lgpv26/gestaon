import Vue from "vue"
import config from '../config'

export default {
    getList(params = {}){
        return Vue.http.get(config.apiBaseUrl + '/cashier-balancing', { params }).then((response) => response.json());
    }
}
