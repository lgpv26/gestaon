import _ from 'lodash'
import AccountsAPI from '../../../api/accounts'

const state = {
    accounts: []
}

const getters = {

}

const mutations = {
    SET_ALL(state, accounts){
        state.accounts = accounts
    },
    SET_ONE(state, account){
        const stateAccountIndex = _.findIndex(state.accounts, { id: account.id })
        if(stateAccountIndex !== -1){
            state.accounts[stateAccountIndex] = account
        }
        else {
            state.accounts.push(account)
        }
    },
    REMOVE_ONE(state, id){
        const stateAccountIndex = _.findIndex(state.accounts, { id })
        if(stateAccountIndex !== -1){
            state.accounts.splice(stateAccountIndex, 1)
        }
    }
}

const actions = {
    setAccounts(context, accounts){
        context.commit('SET_ALL', accounts)
    },
    setAccount(context, account){
        context.commit('SET_ONE', account)
    },
    createOneAccount(context, data){
        return AccountsAPI.createOne( data.account, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    updateOneAccount(context, data){
        return AccountsAPI.updateOne( data.id, data.account, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    removeOneAccount(context, data){
        return AccountsAPI.removeOne( data.id, { companyId: data.companyId }).then((response) => {
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