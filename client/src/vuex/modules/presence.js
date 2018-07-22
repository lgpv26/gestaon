import _ from 'lodash'
import CallsAPI from '../../api/calls'

const state = {
    connectedUsers: []
}

const getters = {

}

const mutations = {
    REMOVE(state, userId){
        state.connectedUsers = _.filter(state.connectedUsers, (connectedUser) => {
            return userId !== connectedUser.id
        })
    },
    ADD(state, connectedUser){
        if(connectedUser){
            state.connectedUsers.push(connectedUser)
        }
    },
    SET(state, connectedUsers = []){
        state.connectedUsers = connectedUsers
    }
}

const actions = {
    removeConnectedUser(context, userId){
        context.commit('REMOVE', userId)
    },
    addConnectedUser(context, connectedUser){
        context.commit('ADD', connectedUser)
    },
    setConnectedUsers(context, connectedUsers){

        context.commit('SET', connectedUsers)
    }
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
}