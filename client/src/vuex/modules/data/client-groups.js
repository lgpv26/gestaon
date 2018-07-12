import _ from 'lodash'
import ClientGroupsAPI from '../../../api/client-groups'

const state = {
    clientGroups: []
}

const getters = {
    clientGroupsSelectItems(state){
        return _.map(state.clientGroups, (clientGroup) => {
            return {
                value: clientGroup.id,
                text: clientGroup.name
            }
        })
    }
}

const mutations = {
    SET_ALL(state, clientGroups){
        state.clientGroups = clientGroups
    },
    SET_ONE(state, clientGroup){
        const stateClientGroupIndex = _.findIndex(state.clientGroups, { id: clientGroup.id })
        if(stateClientGroupIndex !== -1){
            state.clientGroups[stateClientGroupIndex] = clientGroup
        }
        else {
            state.clientGroups.push(clientGroup)
        }
    },
    REMOVE_ONE(state, id){
        const stateClientGroupIndex = _.findIndex(state.clientGroups, { id })
        if(stateClientGroupIndex !== -1){
            state.clientGroups.splice(stateClientGroupIndex, 1)
        }
    }
}

const actions = {
    loadAll(context, { companyId }){
        return ClientGroupsAPI.getList({
            companyId: companyId
        }).then((result) => {
            context.commit('SET_ALL', result.data)
            return result
        })
    },
    setClientGroups(context, clientGroups){
        context.commit('SET_ALL', clientGroups)
    },
    setClientGroup(context, clientGroup){
        context.commit('SET_ONE', clientGroup)
    },
    createOneClientGroup(context, data){
        return ClientGroupsAPI.createOne( data.clientGroup, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    updateOneClientGroup(context, data){
        return ClientGroupsAPI.updateOne( data.id, data.clientGroup, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    removeOneClientGroup(context, data){
        return ClientGroupsAPI.removeOne( data.id, { companyId: data.companyId }).then((response) => {
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