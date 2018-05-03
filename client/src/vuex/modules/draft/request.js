import Vue from 'vue'
import _ from 'lodash'
import { getField, updateField } from 'vuex-map-fields'
import shortid from 'shortid'

const state = {
    form: {
        activeStep: null,
        client: {
            id: '',
            name: '',
            legalDocument: '',
            clientAddressForm: {
                id: '',
                show: false,
                complement: '',
                number: '',
                address: {
                    id: '',
                    name: '',
                    cep: '',
                    neighborhood: '',
                    city: '',
                    state: ''
                }
            },
            clientAddresses: [],
            clientPhones: []
        },
        order: {

        },
        task: {

        }
    }
}

const getters = {
    getField
}

const createAddressModel = function(address){
    return {
        id: _.get(address, 'id', null),
        name: _.get(address, 'name', ''),
        cep: _.get(address, 'cep', ''),
        neighborhood: _.get(address, 'neighborhood', ''),
        city: _.get(address, 'city', ''),
        state: _.get(address, 'state', '')
    }
}

const mutations = {
    SET_REQUEST(state, request = {}){
        state.form.activeStep = _.get(request, 'activeStep', null)
    },
    SET_CLIENT(state, client = {}){
        state.form.client.id = _.get(client, 'id', null)
        state.form.client.name = _.get(client, 'name', '')
        state.form.client.legalDocument = _.get(client, 'legalDocument', '')
        if(_.has(client, 'clientAddresses') && client.clientAddresses.length){
            state.form.client.clientAddresses = _.map(client.clientAddresses, (clientAddress) => {
                return {
                    id: _.get(clientAddress, 'id', null),
                    complement: _.get(clientAddress, 'complement', ''),
                    number: _.get(clientAddress, 'number', ''),
                    address: createAddressModel(_.get(clientAddress, 'address', {}))
                }
            })
        }
        else {
            state.form.client.clientAddresses = []
        }
    },
    ADD_CLIENT_ADDRESS(state, clientAddress = {}){
        state.form.client.clientAddresses.push({
            id: 'tmp/' + shortid.generate(),
            complement: _.get(clientAddress, 'complement', ''),
            number: _.get(clientAddress, 'number', ''),
            address: createAddressModel(_.get(clientAddress, 'address', {}))
        })
    },
    SAVE_CLIENT_ADDRESS(state, clientAddress = {}){
        const clientAddressIndex = _.findIndex(state.form.client.clientAddresses, { id: clientAddress.id })
        if(clientAddressIndex !== -1 && clientAddress.id){
            state.form.client.clientAddresses[clientAddressIndex] = {
                id: _.get(clientAddress, 'id', null),
                complement: _.get(clientAddress, 'complement', ''),
                number: _.get(clientAddress, 'number', ''),
                address: createAddressModel(_.get(clientAddress, 'address', {}))
            }
        }
    },
    SET_CLIENT_ADDRESS_FORM(state, clientAddressForm = {}){
        state.form.client.clientAddressForm.show = _.get(clientAddressForm, 'show', false)
        state.form.client.clientAddressForm.id = _.get(clientAddressForm, 'id', null)
        state.form.client.clientAddressForm.complement = _.get(clientAddressForm, 'complement', '')
        state.form.client.clientAddressForm.number = _.get(clientAddressForm, 'number', '')
        state.form.client.clientAddressForm.address = createAddressModel(_.get(clientAddressForm, 'address', {}))
    },
    SET_CLIENT_ADDRESS_FORM_ADDRESS(state, clientAddressFormAddress = {}){
        state.form.client.clientAddressForm.address = createAddressModel(clientAddressFormAddress)
    },
    updateField
}

const actions = {
    setRequest(context, request){
        context.commit('SET_REQUEST', request || {})
        context.commit('SET_CLIENT', _.get(request, 'client', {}))
        context.commit('SET_CLIENT_ADDRESS_FORM', _.get(request, 'client.clientAddressForm', {}))
        context.commit('SET_CLIENT_ADDRESS_FORM_ADDRESS', _.get(request, 'client.clientAddressForm.address', {}))
    },
    setClient(context, client){
        context.commit('SET_CLIENT', client)
        context.commit('SET_CLIENT_ADDRESS_FORM', _.get(client, 'clientAddressForm', {}))
        context.commit('SET_CLIENT_ADDRESS_FORM_ADDRESS', _.get(client, 'clientAddressForm.address', {}))
    },
    addClientAddress(context, clientAddress){
        context.commit('ADD_CLIENT_ADDRESS', clientAddress)
    },
    saveClientAddress(context, clientAddress){
        context.commit('SAVE_CLIENT_ADDRESS', clientAddress)
    },
    setClientAddressForm(context, clientAddressForm){
        context.commit('SET_CLIENT_ADDRESS_FORM', clientAddressForm)
        context.commit('SET_CLIENT_ADDRESS_FORM_ADDRESS', _.get(clientAddressForm, 'address', {}))
    },
    setClientAddressFormAddress(context, clientAddressFormAddress = {}){
        context.commit('SET_CLIENT_ADDRESS_FORM_ADDRESS', clientAddressFormAddress)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
