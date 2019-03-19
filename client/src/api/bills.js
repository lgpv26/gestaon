import Vue from "vue"
import config from '../config'

export default {
    markAsPaid(billId, params = {}){
        return Vue.http.post(config.apiBaseUrl + '/bills/' + billId + '/mark-as-paid', {}, { params }).then((response) => response.json())
    }
}
