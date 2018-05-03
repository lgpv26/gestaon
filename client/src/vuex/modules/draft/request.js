import Vue from 'vue'
import _ from 'lodash'
import { getField, updateField } from 'vuex-map-fields'
import shortid from 'shortid'

import { ClientModel, ClientAddressModel, AddressModel } from '../../../models/index'

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

const mutations = {
    SET_REQUEST(state, request = {}){
        state.form.activeStep = _.get(request, 'activeStep', null)
    },
    SET_CLIENT(state, client){
        state.form.client = ClientModel(client)
    },
    ADD_CLIENT_ADDRESS(state, clientAddress){
        clientAddress = ClientAddressModel(clientAddress)
        clientAddress.id = 'tmp/' + shortid.generate() // attr a temporary ID
        state.form.client.clientAddresses.push(clientAddress)
    },
    SAVE_CLIENT_ADDRESS(state, clientAddress){
        const clientAddressIndex = _.findIndex(state.form.client.clientAddresses, { id: clientAddress.id })
        if(clientAddressIndex !== -1 && clientAddress.id){
            state.form.client.clientAddresses[clientAddressIndex] = ClientAddressModel(clientAddress)
        }
    },
    SET_CLIENT_ADDRESS_FORM(state, clientAddressForm = {}){
        //state.form.client.clientAddressForm = new ClientAddressModel(clientAddressForm)

        state.form.client.clientAddressForm = {
            id: _.get(clientAddressForm, 'id', null),
            show: _.get(clientAddressForm, 'show', false),
            complement: _.get(clientAddressForm, 'complement', ''),
            number: _.get(clientAddressForm, 'number', ''),
            address: AddressModel(_.get(clientAddressForm, 'address', {}))
        }

        //state.form.client.clientAddressForm.show = _.get(clientAddressForm, 'show', false) // attr form properties
    },
    SET_CLIENT_ADDRESS_FORM_ADDRESS(state, clientAddressFormAddress){
        state.form.client.clientAddressForm.address = AddressModel(clientAddressFormAddress)
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
        /*context.commit('SET_CLIENT_ADDRESS_FORM_ADDRESS', _.get(clientAddressForm, 'address', {}))*/
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
