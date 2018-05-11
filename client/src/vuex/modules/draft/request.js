import _ from 'lodash'
import utils from '@/utils/index'
import { getField, updateField } from 'vuex-map-fields'
import shortid from 'shortid'

import ClientsAPI from '@/api/clients'
import RequestsAPI from '@/api/requests'

import {createRequest} from '@/models/RequestModel'

import {createClient} from '@/models/ClientModel'
import {createClientAddress} from '@/models/ClientAddressModel'
import {createClientAddressForm} from '@/models/ClientAddressFormModel'
import {createAddress} from '@/models/AddressModel'

import {createOrder} from '@/models/OrderModel'
import {createOrderProduct} from '@/models/OrderProductModel'
import {createProduct} from '@/models/ProductModel'

import {createRequestPaymentMethod} from '@/models/RequestPaymentMethodModel'
import {createPaymentMethod} from '@/models/PaymentMethodModel'

const state = {
    form: {
        activeStep: null,
        useSuggestedDeadlineDatetime: false,
        deadlineDatetime: null,
        obs: '',
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
            orderProducts: [],
            promotionChannelId: null
        },
        task: {
        },
        requestPaymentMethods: [],
        accountId: null,
        responsibleUserId: null
    }
}

const getters = {
    getField,
    isClientSummaryAvailable(state, getters){
        if(state.form.activeStep === 'client') return false
        if(state.form.client.id){
            return true
        }
        else if(state.form.client.name && state.form.client.name.length > 2){
            return true
        }
        return false
    }
}

/* mutations */

const clientMutations = {
    SET_CLIENT(state, client = {}){
        _.assign(state.form.client,createClient(client))
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
        if(index !== -1){
            state.form.client.clientPhones.splice(index, 1)
        }
    },
    ADD_CLIENT_PHONE(state, clientPhone = {}){
        clientPhone.id = 'tmp/' + shortid.generate()
        state.form.client.clientPhones.push(clientPhone)
    },
    REMOVE_CLIENT_PHONE(state, clientPhoneId){
        const index = _.findIndex(state.form.client.clientPhones, {id: clientPhoneId})
        if(index !== -1){
            state.form.client.clientPhones.splice(index, 1)
        }
    }
}
const orderMutations = {
    SET_ORDER(state, order = {}){
        _.assign(state.form.order,createOrder(order))
    },
    ADD_ORDER_PRODUCT(state, orderProduct = {}){
        orderProduct.id = 'tmp/' + shortid.generate()
        state.form.order.orderProducts.push(createOrderProduct(orderProduct))
    },
    REMOVE_ORDER_PRODUCT(state, orderProductId){
        const index = _.findIndex(state.form.order.orderProducts, {id: orderProductId})
        if(index !== -1){
            state.form.order.orderProducts.splice(index, 1)
        }
    },
    SET_ORDER_PRODUCT_PRODUCT(state, {orderProductId,product}){
        const orderProduct = _.find(state.form.order.orderProducts, {id: orderProductId})
        if(orderProduct){
            _.assign(orderProduct.product,createProduct(product))
        }
    }
}
const mutations = {
    SET_REQUEST(state, request = {}){
        _.assign(state.form, createRequest(request))
    },
    ADD_REQUEST_PAYMENT_METHOD(state, requestPaymentMethod = {}){
        requestPaymentMethod.id = 'tmp/' + shortid.generate()
        state.form.requestPaymentMethods.push(createRequestPaymentMethod(requestPaymentMethod))
    },
    REMOVE_REQUEST_PAYMENT_METHOD(state, requestPaymentMethodId){
        const index = _.findIndex(state.form.requestPaymentMethods, {id: requestPaymentMethodId})
        if(index !== -1){
            state.form.requestPaymentMethods.splice(index, 1)
        }
    },
    SET_REQUEST_PAYMENT_METHOD_PAYMENT_METHOD(state, {requestPaymentMethodId,paymentMethod}){
        const requestPaymentMethod = _.find(state.form.requestPaymentMethods, {id: requestPaymentMethodId})
        if(requestPaymentMethod){
            _.assign(requestPaymentMethod.paymentMethod,createPaymentMethod(paymentMethod))
        }
    },
    ...clientMutations,
    ...orderMutations,
    updateField
}

/* actions */

const clientActions = {
    runClientPersistence(context, {client, companyId}){
        client =  utils.removeReactivity(client)
        return ClientsAPI.persistence({
            client: {
                id: client.id,
                name: client.name,
                legalDocument: client.legalDocument,
                clientGroupId: client.clientGroupId,
                clientPhones: _.map(client.clientPhones, (clientPhone) => {
                    if(!_.isNumber(clientPhone.id) && clientPhone.id.substring(0,4) === "tmp/"){
                        clientPhone.id = null
                    }
                    return clientPhone
                }),
                clientAddresses: _.map(client.clientAddresses, (clientAddress) => {
                    if(!_.isNumber(clientAddress.id) && clientAddress.id.substring(0,4) === "tmp/"){
                        clientAddress.id = null
                    }
                    return clientAddress
                })
            }
        },{
            companyId
        })
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
    }
}
const orderActions = {
    setOrder(context, order){
        context.commit('SET_ORDER', order)
    },
    addOrderProduct(context, orderProduct){
        context.commit('ADD_ORDER_PRODUCT', orderProduct)
    },
    removeOrderProduct(context, orderProductId){
        context.commit('REMOVE_ORDER_PRODUCT', orderProductId)
    },
    setOrderProductProduct(context, {orderProductId, product}){
        context.commit('SET_ORDER_PRODUCT_PRODUCT', {orderProductId, product})
    },
}
const actions = {
    runRequestPersistence(context, {request, companyId}){
        request =  utils.removeReactivity(request)
        return RequestsAPI.persistence({
            order: {
                orderProducts: _.map(request.order.orderProducts, (orderProduct) => {
                    if(_.get(orderProduct, 'id', false) && !_.isNumber(orderProduct.id) && orderProduct.id.substring(0,4) === "tmp/"){
                        orderProduct.id = null
                    }
                    return orderProduct
                })
            }
        },{
            companyId
        }).then((response) => {
            console.log("SUCESSO", response)
        }).catch((err) => {
            console.log("ERRO", err)
        })
    },
    setRequest(context, request){
        context.commit('SET_REQUEST', request || {})
        context.commit('SET_CLIENT', _.get(request, 'client', {}))
        context.commit('SET_CLIENT_ADDRESS_FORM', _.get(request, 'client.clientAddressForm', {}))
        context.commit('SET_ORDER', _.get(request, 'order', {}))
    },
    addRequestPaymentMethod(context, requestPaymentMethod){
        context.commit('ADD_REQUEST_PAYMENT_METHOD', requestPaymentMethod)
    },
    removeRequestPaymentMethod(context, requestPaymentMethodId){
        context.commit('REMOVE_REQUEST_PAYMENT_METHOD', requestPaymentMethodId)
    },
    setRequestPaymentMethodPaymentMethod(context, {requestPaymentMethodId, paymentMethod}){
        context.commit('SET_REQUEST_PAYMENT_METHOD_PAYMENT_METHOD', {requestPaymentMethodId, paymentMethod})
    },
    ...clientActions,
    ...orderActions
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
