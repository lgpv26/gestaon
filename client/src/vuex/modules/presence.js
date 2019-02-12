import _ from 'lodash'
import CallsAPI from '../../api/calls'

const state = {
    connectedUsers: []
}

const getters = {

}

const mutations = {
    REMOVE(state, { userId, socketId }){
        state.connectedUsers = _.filter(state.connectedUsers, (connectedUser) => {
            return socketId !== connectedUser.socketId
        })
    },
    ADD(state, connectedUser){
        if(_.has(connectedUser,'socketId') && !_.find(state.connectedUsers, { socketId: connectedUser.socketId})){
            state.connectedUsers.push(connectedUser)
        }
    },
    SET(state, connectedUsers = []){
        state.connectedUsers = connectedUsers
    }
}

const actions = {
    removeConnectedUser(context, { userId, socketId }){
        context.commit('REMOVE', { userId, socketId })
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