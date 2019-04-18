import Vue from "vue"
import config from '../config'

export default {
    filter(body){
        return Vue.http.post(config.apiBaseUrl + '/positions/filter', body).then((response) => response.json());
    }
}