import _ from 'lodash'
import PaymentMethodsAPI from '../../../api/payment-methods'

const state = {
    paymentMethods: []
}

const getters = {

}

const mutations = {
    SET_ALL(state, paymentMethods){
        state.paymentMethods = paymentMethods
    },
    SET_ONE(state, paymentMethod){
        const statePaymentMethodIndex = _.findIndex(state.paymentMethods, { id: paymentMethod.id })
        if(statePaymentMethodIndex !== -1){
            state.paymentMethods[statePaymentMethodIndex] = paymentMethod
        }
        else {
            state.paymentMethods.push(paymentMethod)
        }
    },
    REMOVE_ONE(state, id){
        const statePaymentMethodIndex = _.findIndex(state.paymentMethods, { id })
        if(statePaymentMethodIndex !== -1){
            state.paymentMethods.splice(statePaymentMethodIndex, 1)
        }
    }
}

const actions = {
    loadAll(context, { companyId }){
        return PaymentMethodsAPI.getList({
            companyId: companyId
        }).then((result) => {
            context.commit('SET_ALL', result.data)
            return result
        })
    },
    setPaymentMethods(context, paymentMethods){
        context.commit('SET_ALL', paymentMethods)
    },
    setPaymentMethod(context, paymentMethod){
        context.commit('SET_ONE', paymentMethod)
    },
    createOnePaymentMethod(context, data){
        return PaymentMethodsAPI.createOne( data.paymentMethod, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    updateOnePaymentMethod(context, data){
        return PaymentMethodsAPI.updateOne( data.id, data.paymentMethod, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    removeOnePaymentMethod(context, data){
        return PaymentMethodsAPI.removeOne( data.id, { companyId: data.companyId }).then((response) => {
            context.commit('REMOVE_ONE', response.data.removedId)
            return response.data
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