import Vue from "vue"
import config from '../config'

export default {
    sendChatQueue(body, options = {}){
        return Vue.http.post(config.apiBaseUrl + '/chat-queue', body, options).then((response) => response.json())
    },
    sendRequestQueue(body, options = {}){
        return Vue.http.post(config.apiBaseUrl + '/request-queue', body, options).then((response) => response.json())
    }
}
