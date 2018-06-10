import _ from 'lodash'
import CallsAPI from '../../api/calls'

const state = {
    calls: [],
    limit: 10
}

const getters = {

}

const mutations = {
    SET_ALL(state, calls){
        state.calls = _.reverse(_.sortBy(calls, function(call) {
            return call.createdAt;
        }))
        state.calls.splice(state.limit)
    },
    SET_ONE(state, call){
        const stateCallIndex = _.findIndex(state.calls, { id: call.id })
        if(stateCallIndex !== -1){
            state.calls[stateCallIndex] = call
        }
        else {
            state.calls.push(call)
        }
        state.calls = _.reverse(_.sortBy(state.calls, function(call) {
            return call.createdAt;
        }))
        state.calls.splice(state.limit)
    },
    REMOVE_ONE(state, id){
        const stateCallIndex = _.findIndex(state.calls, { id })
        if(stateCallIndex !== -1){
            state.calls.splice(stateCallIndex, 1)
        }
    }
}

const actions = {
    setCalls(context, calls){
        context.commit('SET_ALL', calls)
    },
    setCall(context, call){
        context.commit('SET_ONE', call)
    },
    loadCalls(context, data){
        return CallsAPI.getList({ companyId: data.companyId }).then((response) => {
            console.log(response)
            context.commit('SET_ALL', response.data)
            return response.data
        })
    },
    createOneCall(context, data){
        return CallsAPI.createOne( data.call, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    updateOneCall(context, data){
        return CallsAPI.updateOne( data.id, data.call, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    removeOneCall(context, data){
        return CallsAPI.removeOne( data.id, { companyId: data.companyId }).then((response) => {
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