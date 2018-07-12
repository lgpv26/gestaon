import _ from 'lodash'
import UsersAPI from '../../../api/users.js'

const state = {
    users: []
}

const getters = {
    usersSelectItems(state){
        return _.map(state.users, (user) => {
            return {
                value: user.id,
                text: user.name
            }
        })
    }
}

const mutations = {
    SET_ALL(state, users){
        state.users = _.orderBy(users, [user => user.name], ['asc'])
    },
    SET_ONE(state, user){
        const stateUserIndex = _.findIndex(state.users, { id: user.id })
        if(stateUserIndex !== -1){
            state.users[stateUserIndex] = user
        }
        else {
            state.users.push(user)
        }
    },
    REMOVE_ONE(state, id){
        const stateUserIndex = _.findIndex(state.users, { id })
        if(stateUserIndex !== -1){
            state.users.splice(stateUserIndex, 1)
        }
    }
}

const actions = {
    loadAll(context, { companyId }){
        return UsersAPI.getList({
            companyId: companyId
        }).then((result) => {
            context.commit('SET_ALL', result.data)
            return result
        })
    },
    setUsers(context, users){
        context.commit('SET_ALL', users)
    },
    setUser(context, user){
        context.commit('SET_ONE', user)
    },
    createOneUser(context, data){
        return UsersAPI.createOne( data.user, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    updateOneUser(context, data){
        return UsersAPI.updateOne( data.id, data.user, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    removeOneUser(context, data){
        return UsersAPI.removeOne( data.id, { companyId: data.companyId }).then((response) => {
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