import Vue from "vue"
import config from '../config'

export default {
    createOne(body){
        return Vue.http.post(config.apiBaseUrl + '/clients', body).then((response) => response.json());
    },
    getOne(clientId){
        return Vue.http.get(config.apiBaseUrl + '/clients/' + clientId).then((response) => response.json());
    },
    updateOne(clientId, body){
        return Vue.http.patch(config.apiBaseUrl + '/clients/' + clientId, body).then((response) => response.json());
    },
    removeOneClientAddress(clientId, addressId){
        return Vue.http.delete(config.apiBaseUrl + '/clients/' + clientId + '/addresses/' + addressId).then((response) => response.json());
    },
    getOneClientAddress(clientId, addressId){
        return Vue.http.get(config.apiBaseUrl + '/clients/' + clientId + '/addresses/' + addressId).then((response) => response.json());
    },
    saveAddresses(clientId, body){
        return Vue.http.patch(config.apiBaseUrl + '/clients/' + clientId + '/addresses', { clientAddresses: body }).then((response) => response.json());
    },
    removeOneClientPhone(clientId, phoneId){
        return Vue.http.delete(config.apiBaseUrl + '/clients/' + clientId + '/phones/' + phoneId).then((response) => response.json());
    },
    getOneClientPhone(clientId, phoneId){
        return Vue.http.get(config.apiBaseUrl + '/clients/' + clientId + '/phones/' + phoneId).then((response) => response.json());
    },
    saveClientPhones(clientId, body){
        return Vue.http.patch(config.apiBaseUrl + '/clients/' + clientId + '/phones', { clientPhones: body }).then((response) => response.json());
    },
    search(params){
        return Vue.http.get(config.apiBaseUrl + '/service/search', { params }).then((response) => response.json());
    }
}
