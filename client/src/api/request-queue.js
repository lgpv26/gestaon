import Vue from "vue"
import config from '../config'

export default {
    send(body, options = {}){
        return Vue.http.post(config.apiBaseUrl + '/request-queue', body, options).then((response) => response.json())
    }
}
