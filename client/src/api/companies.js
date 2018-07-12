import Vue from "vue"
import config from '../config'

export default {
    getAll(){
        return Vue.http.get(config.apiBaseUrl + '/companies').then((response) => response.json());
    },
    getOne(id){
        return Vue.http.get(config.apiBaseUrl + '/companies/' + id).then((response) => response.json());
    },
    getOneAndSetActive(id){
        return Vue.http.get(config.apiBaseUrl + '/companies/' + id + '/active').then((response) => response.json());
    },
    createOne(body){
        return Vue.http.post(config.apiBaseUrl + '/companies', body).then((response) => response.json());
    },
    updateOne(id, body){
        return Vue.http.patch(config.apiBaseUrl + '/companies/' + id, body).then((response) => response.json());
    },
    updateOneSettings(id, body){
        return Vue.http.patch(config.apiBaseUrl + '/companies/' + id + '/settings', body).then((response) => response.json());
    },
    removeOne(id){
        return Vue.http.delete(config.apiBaseUrl + '/companies/' + id).then((response) => response.json());
    },
    companyUsersGetAll(companyId){
        return Vue.http.get(config.apiBaseUrl + '/companies/' + companyId + '/users').then((response) => response.json());
    },
    companyUsersRemoveOne(companyId, userId){
        return Vue.http.delete(config.apiBaseUrl + '/companies/' + companyId + '/users/' + userId).then((response) => response.json());
    },
    companyUsersPermissionsSaveMultiple(companyId, body){
        return Vue.http.post(config.apiBaseUrl + '/companies/' + companyId + '/users/permissions', body).then((response) => response.json());
    }
}
