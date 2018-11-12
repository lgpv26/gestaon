import _ from 'lodash'
import CallsAPI from '../../api/calls'

const state = {
    disabled: false
}

const getters = {

}

const mutations = {
    DISABLE(state){
        state.disabled = true
    },
    ACTIVATE(state){
        state.disabled = false
    }
}

const actions = {
    disableCallerId(context){
        context.commit('DISABLE')
    },
    activateCallerId(context){
        context.commit('ACTIVATE')
    }
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
}