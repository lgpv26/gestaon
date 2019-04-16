export const setAppTitle = ({ commit }, payload) => {
  commit('setAppTitle', payload)
}

export const setLastDataSyncedDate = ({ commit }, date) => {
    commit('SET_LAST_DATA_SYNCED_DATE', date)
}

export const setLastRequestsLoadedDate = ({ commit }, date) => {
    commit('SET_LAST_REQUESTS_LOADED_DATE', date)
}

export const setIsSearchReady = ({ commit }, isSearchReady) => {
    commit('SET_IS_SEARCH_READY', isSearchReady)
}