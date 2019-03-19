const state = {
    lunrIndex: null
}

const getters = {

}

const mutations = {
    SET(state, lunrIndex){
        state.lunrIndex = lunrIndex
    }
}

const actions = {
    setLunrIndex(context, lunrIndex){
        context.commit('SET', lunrIndex)
    }
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
}