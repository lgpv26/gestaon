import Vue from 'vue'
import _ from 'lodash'
import config from '../../config'
import servicesAPI from '../../api/services'
import clientsAddressesAPI from '../../api/clients-addresses'
import clientsAPI from '../../api/clients'
import addressesAPI from '../../api/addresses'

const emptyService = {
    state: null,
    active: false,
    loading: false,
    client: null,
    clientAddress: null,
    address: null,
    needToSave: false
};

const state = {
    services: []
};

const getters = {
    activeService(state){
        const service = _.find(state.services, (service) => {
            if(service.active) return true;
        });
        return service;
    },
    currentActiveAction(state){
        const service = _.find(state.services, (service) => {
            if(service.active) return true;
        });
        return service.state;
        /*
        if(service && service.state){
            return 'serviceCreation';
        }
        else if(service && !service.state){
            return 'openDirectSell'
        }*/
    }
};

const mutations = {
    addService(state, service){
        _.assign(service,_.cloneDeep(emptyService));
        state.services.push(service);
    },
    resetActiveService(state){
        const serviceIndex = _.findIndex(state.services, (service) => {
            if(service.active) return true;
        });
        if(typeof state.services[serviceIndex] !== 'undefined') {
            _.assign(state.services[serviceIndex], _.pick(_.cloneDeep(emptyService), _.keys(state.services[serviceIndex])));
        }
    },
    focusService(state, focusedService){
        _.forEach(state.services, (service, index) => {
            if(index === state.services.indexOf(focusedService)){
                if(service.active === true){
                    service.active = false;
                }
                else {
                    service.active = true;
                }
            }
            else{
                service.active = false;
            }
            Vue.set(state.services, index, service);
        });
    },
    removeService(state, serviceId){
        let serviceIndex = state.services.findIndex((service) => service.id === serviceId);
        state.services.splice(serviceIndex,1);
    },
    setServiceState(state, { serviceId, serviceState }){
        const service = _.find(state.services, (service) => {
            if(service.id === serviceId) return true;
        });

        service.state = serviceState;
    },
    setServiceNeedToSave(state, { serviceId, needToSave }){
        const service = _.find(state.services, (service) => {
            if(service.id === serviceId) return true;
        });

        service.needToSave = needToSave;
    },
    setServiceLoading(state, {serviceId,loading}){
        let serviceIndex = null;
        let service = state.services.find((service, index) => {
            if(service.id === serviceId){
                serviceIndex = index;
                return service;
            }
        });
        service.loading = loading;
        Vue.set(state.services, serviceIndex, service);
    },
    newClient(state, serviceId){
        let serviceIndex = null;
        let service = null;
        state.services.forEach((loopService, index) => {
            if(loopService.id === serviceId){
                serviceIndex = index;
                service = loopService;
            }
        });
        service.state = 'addressForm';
        service.clientAddress = null;
        service.client = null;
        service.address = null;
        Vue.set(state.services, serviceIndex, service);
    },
    selectClient(state, {serviceId, client}){
        let serviceIndex = null;
        let service = null;
        state.services.forEach((loopService, index) => {
            if(loopService.id === serviceId){
                serviceIndex = index;
                service = loopService;
            }
        });
        service.state = 'addressForm';
        service.clientAddress = null;
        service.client = client;
        service.address = null;
        Vue.set(state.services, serviceIndex, service);
    },
    selectAddress(state, {serviceId, address}){
        let serviceIndex = null;
        let service = null;
        state.services.forEach((loopService, index) => {
            if(loopService.id === serviceId){
                serviceIndex = index;
                service = loopService;
            }
        });
        console.log("selectAddress");
        service.state = 'addressForm';
        service.clientAddress = null;
        service.client = null;
        service.address = address;
        Vue.set(state.services, serviceIndex, service);
    },
    selectClientAddress(state, {serviceId, clientAddress}){
        let serviceIndex = null;
        let service = null;
        state.services.forEach((loopService, index) => {
            if(loopService.id === serviceId){
                serviceIndex = index;
                service = loopService;
            }
        });
        service.state = 'clientForm';
        service.clientAddress = clientAddress;
        service.client = clientAddress.client;
        service.address = clientAddress.address;
        Vue.set(state.services, serviceIndex, service);
    },
    removeClientAddress(state, {serviceId, clientAddressId}){
        let serviceIndex = null;
        let service = null;
        state.services.forEach((loopService, index) => {
            if(loopService.id === serviceId){
                serviceIndex = index;
                service = loopService;
            }
        });
        const clientAddressToRemove = service.client.clientAddresses.findIndex((clientAddress) => {
            if(clientAddress.id === clientAddressId){
                return true;
            }
        });
        service.client.clientAddresses.splice(clientAddressToRemove, 1);
        Vue.set(state.services, serviceIndex, service);
    },
    removeClientPhone(state, {serviceId, clientPhoneId}){
        let serviceIndex = null;
        let service = null;
        state.services.forEach((loopService, index) => {
            if(loopService.id === serviceId){
                serviceIndex = index;
                service = loopService;
            }
        });
        const clientPhoneToRemove = service.client.clientPhones.findIndex((clientPhone) => {
            if(clientPhone.id === clientPhoneId){
                return true;
            }
        });
        service.client.clientPhones.splice(clientPhoneToRemove, 1);
        console.log(service);
        Vue.set(state.services, serviceIndex, service);
    },
    deselectAction(state){
        state.throughClient = false;
        state.throughAddress = false;
    }
};

const actions = {
    loadServices(context, payload){
        return servicesAPI.getAll().then(({data}) => {
            _.forEach(data, (service) => {
                context.commit('addService', service);
            });
        });
    },
    resetActiveService(context){
        context.commit('resetActiveService');
    },
    addService(context, payload){
        return servicesAPI.createOne().then(({data}) => {
            context.commit('addService', data);
        });
    },
    focusService(context, service){
        context.commit('focusService', service);
    },
    removeService(context, serviceId){
        return servicesAPI.removeOne(serviceId).then(({data}) => {
            context.commit('removeService', serviceId);
        });
    },
    setServiceLoading(context, {serviceId, loading}){
        context.commit('setServiceLoading', {serviceId, loading})
    },
    setServiceState(context, {serviceId, serviceState}){
        context.commit('setServiceState', {serviceId, serviceState})
    },
    setServiceNeedToSave(context, {serviceId, needToSave}){
    context.commit('setServiceNeedToSave', {serviceId, needToSave})
    },
    newClient(context, serviceId){
        context.commit('newClient', serviceId);
    },
    selectClient(context, {serviceId, clientId}){
        clientId = parseInt(clientId);
        let service = context.state.services.find((service, index) => {
            if(service.id === serviceId){
                return service;
            }
        });
        context.commit('setServiceLoading', { serviceId, loading: true });
        return clientsAPI.getOne(clientId).then((response) => {
            context.commit('setServiceLoading', { serviceId, loading: false });
            context.commit('selectClient', { serviceId, client: response.data });
        });
    },
    selectClientAddress(context, {serviceId, clientAddressId}){
        let service = context.state.services.find((service, index) => {
            if(service.id === serviceId){
                return service;
            }
        });
        context.commit('setServiceLoading', { serviceId, loading: true });
        return clientsAddressesAPI.getOne(clientAddressId).then((response) => {
            context.commit('setServiceLoading', { serviceId, loading: false });
            context.commit('selectClientAddress', { serviceId, clientAddress: response.data });
        });
    },
    selectAddress(context, {serviceId, addressId}){
        addressId = parseInt(addressId);
        const service = context.state.services.find((service, index) => {
            if(service.id === serviceId){
                return service;
            }
        });
        context.commit('setServiceLoading', { serviceId, loading: true });
        return addressesAPI.getOne(addressId).then((response) => {
            context.commit('setServiceLoading', { serviceId, loading: false });
            context.commit('selectAddress', { serviceId, address: response.data });
        });
    },
    removeClientAddress(context, payload){
        context.commit('removeClientAddress', payload);
    },
    removeClientPhone(context, payload){
        context.commit('removeClientPhone', payload);
    },
    deselectAction(context){
        context.commit('deselectAction');
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
