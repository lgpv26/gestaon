import Vue from "vue"
import config from '../config'

export default {
    getAll(params){
        return Vue.http.get(config.apiBaseUrl + '/drafts', { params }).then((response) => response.json());
    },
    createOne(body, params){
        return Vue.http.post(config.apiBaseUrl + '/drafts', body, { params }).then((response) => response.json());
    }
}