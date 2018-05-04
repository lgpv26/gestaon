import Vue from 'vue'
import _ from 'lodash'
import { getField, updateField } from 'vuex-map-fields'
import shortid from 'shortid'

import {createClient} from '@/models/ClientModel'
import {createClientAddress} from '@/models/ClientAddressModel'
import {createClientAddressForm} from '@/models/ClientAddressFormModel'
import {createAddress} from '@/models/AddressModel'

const state = {
    form: {
        activeStep: null,
        client: {
            id: '',
            name: '',
            legalDocument: '',
            clientGroupId: null,
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
            clientCustomFields: [],
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
    SET_CLIENT(state, client = {}){
        state.form.client = _.assign(state.form.client,createClient(client))
    },
    ADD_CLIENT_ADDRESS(state, clientAddress = {}){
        clientAddress.id = 'tmp/' + shortid.generate()
        state.form.client.clientAddresses.push(createClientAddress(clientAddress))
    },
    SAVE_CLIENT_ADDRESS(state, clientAddress = {}){
        const clientAddressIndex = _.findIndex(state.form.client.clientAddresses, { id: clientAddress.id })
        if(clientAddressIndex !== -1 && clientAddress.id){
            state.form.client.clientAddresses[clientAddressIndex] = _.assign(state.form.client.clientAddresses[clientAddressIndex], createClientAddress(clientAddress))
        }
    },
    SET_CLIENT_ADDRESS_FORM(state, clientAddressForm = {}){
        state.form.client.clientAddressForm = _.assign(state.form.client.clientAddressForm, createClientAddressForm(clientAddressForm))
    },
    SET_CLIENT_ADDRESS_FORM_ADDRESS(state, clientAddressFormAddress = {}){
        state.form.client.clientAddressForm.address = _.assign(state.form.client.clientAddressForm.address, createAddress(clientAddressFormAddress))
    },
    ADD_CLIENT_PHONE(state, clientPhone = {}){
        clientPhone.id = 'tmp/' + shortid.generate()
        state.form.client.clientPhones.push(clientPhone)
    },
    REMOVE_CLIENT_PHONE(state, clientPhoneId){
        const index = _.findIndex(state.form.client.clientPhones, {id: clientPhoneId})
        console.log("Chegou aqui com o index", index)
        if(index !== -1){
            state.form.client.clientPhones.splice(index, 1)
        }
    },
    updateField
}

const actions = {
    setRequest(context, request){
        context.commit('SET_REQUEST', request || {})
        context.commit('SET_CLIENT', _.get(request, 'client', {}))
        context.commit('SET_CLIENT_ADDRESS_FORM', _.get(request, 'client.clientAddressForm', {}))
    },
    setClient(context, client){
        context.commit('SET_CLIENT', client)
        context.commit('SET_CLIENT_ADDRESS_FORM', _.get(client, 'clientAddressForm', {}))
    },
    addClientAddress(context, clientAddress){
        context.commit('ADD_CLIENT_ADDRESS', clientAddress)
    },
    saveClientAddress(context, clientAddress){
        context.commit('SAVE_CLIENT_ADDRESS', clientAddress)
    },
    setClientAddressForm(context, clientAddressForm){
        context.commit('SET_CLIENT_ADDRESS_FORM', clientAddressForm)
    },
    setClientAddressFormAddress(context, clientAddressFormAddress = {}){
        context.commit('SET_CLIENT_ADDRESS_FORM_ADDRESS', clientAddressFormAddress)
    },
    addClientPhone(context, clientPhone){
        context.commit('ADD_CLIENT_PHONE', clientPhone)
    },
    removeClientPhone(context, clientPhoneId){
        context.commit('REMOVE_CLIENT_PHONE', clientPhoneId)
    },
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
