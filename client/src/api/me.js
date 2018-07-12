import Vue from "vue"
import config from '../config'

export default {
    get(){
        return Vue.http.get(config.apiBaseUrl + '/me').then((response) => response.json());
    }
}