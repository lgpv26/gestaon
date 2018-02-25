import moment from 'moment'
import _ from 'lodash'
import UsersAPI from '@/api/users.js'

const state = {
    users: []
}

const getters = {

}

const mutations = {
    SET_USERS(state, users){
        state.users = users
    }
}

const actions = {
    loadAll(context, { companyId }){
        return UsersAPI.getAll({
            companyId: companyId
        }).then((result) => {
            context.commit('SET_USERS', result.data)
            return result
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