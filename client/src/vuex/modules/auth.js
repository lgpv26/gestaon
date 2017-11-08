import Vue from 'vue'
import meAPI from '../../api/me'
import oAuth2API from '../../api/oauth'
import companiesAPI from '../../api/companies'
import config from '../../config'

import _ from 'lodash';

const state = {
    authenticated: false,
    token: null,
    user: {},
    company: {},
    settings: {},
    permissions: [],
    companySettings: {},
};

const getters = {
    userUsername(state){
        if(state.user.hasOwnProperty("username")){
            return state.user.username;
        }
        else{
            return "Carregando...";
        }
    },
    userHumor(state){
        if(state.user.hasOwnProperty("humor")){
            return state.user.humor;
        }
        else{
            return "Aguarde...";
        }
    },
    hasPermission(state){
        return (checkingPermission) => {
            const userCompany = _.find(state.user.userCompanies, (userCompany) => {
                if(userCompany.company.id === state.company.id){
                    return true;
                }
            });
            if(userCompany && userCompany.isCreator){
                return true;
            }
            return _.some(state.permissions, (permission) => {
                return permission === checkingPermission;
            });
        }
    }
};

const mutations = {
    authenticate(state,token){
        localStorage.setItem("token", JSON.stringify(token));
        state.token = token;
        state.user = {};
        state.authenticated = true;
    },
    setAuthUser(state,user){
        state.user = user;
    },
    setActiveCompany(state, company){
        state.company = company;
    },
    setCompanySettings(state,settings){
        state.companySettings = {};
        settings.forEach((setting) => {
            Vue.set(state.companySettings, setting.name, setting.value);
        });
    },
    setPermissions(state,permissions){
        state.permissions = permissions.map((permission) => {
            return permission.resourceName;
        });
    },
    logout(state){
        localStorage.removeItem("token");
        state.token = null;
        state.user = {};
        state.authenticated = false;
    }
};

const actions = {
    authenticate(context, {email, password}){
        return oAuth2API.token({email, password}).then((result) => {
            const data = result.data;
            if(data.hasOwnProperty('accessToken')){
                context.commit("authenticate", data);
                context.commit("setAuthUser", data.user);
            }
            return result;
        });
    },
    refreshToken(context){
        return oAuth2API.refreshToken(context.state.token.refreshToken).then((result) => {
            const data = result.data;
            if(data.hasOwnProperty('accessToken')){
                context.commit("authenticate", data);
                context.commit("setAuthUser", data.user);
            }
            return result;
        });
    },
    setAuthUser(context){
        return meAPI.get().then(({data}) => {
            context.commit('setAuthUser', data);
            let activeCompany = null;
            if(_.has(data, 'userCompanies') && data.userCompanies.length > 0){
                let activeUserCompany = _.find(data.userCompanies, {id: data.activeCompanyUserId});
                if(!activeUserCompany) activeUserCompany = data.userCompanies[0];
                activeCompany = activeUserCompany.company;
                context.commit("setCompanySettings", activeCompany.companySettings);
                context.commit("setPermissions", activeUserCompany.permissions);
                context.commit('setActiveCompany', activeCompany);
            }
            else{
                context.commit("setCompanySettings",[]);
                context.commit("setPermissions",[]);
                context.commit('setActiveCompany', {});
            }
        }, (error) => {
            context.dispatch('logout');
        });
    },
    changeCompany(context, companyId){
        return companiesAPI.getOneAndSetActive(companyId).then(({data}) => {
            let activeCompanyUsers = _.find(data.companyUsers, {id: data.activeCompanyUserId});
            if(!activeCompanyUsers) activeCompanyUsers = data.companyUsers[0];
            context.commit('setCompanySettings', data.companySettings);
            context.commit('setPermissions', activeCompanyUsers.permissions);
            context.commit('setActiveCompany', data);
        });
    },
    saveCompanySettings(context, settings){
        return companiesAPI.updateOneSettings(context.state.company.id, {
            companySettings: settings
        }).then(({data}) => {
            context.commit("setCompanySettings", data.companySettings);
            return data;
        })
    },
    logout(context){
        return new Promise(function (resolve, reject){
            setTimeout(() => {
                context.commit('logout');
                resolve(context.state.authenticated);
            }, 300)
        });
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}