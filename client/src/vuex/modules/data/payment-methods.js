import moment from 'moment'
import _ from 'lodash'
import PaymentMethodsAPI from '@/api/payment-methods.js'

const state = {
    paymentMethods: []
}

const getters = {

}

const mutations = {
    SET_PAYMENT_METHODS(state, paymentMethods){
        state.paymentMethods = paymentMethods
    }
}

const actions = {
    loadAll(context, { companyId }){
        PaymentMethodsAPI.getAll({
            companyId: companyId
        }).then(({data}) => {
            context.commit('SET_PAYMENT_METHODS', data)
        })
    }
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
}