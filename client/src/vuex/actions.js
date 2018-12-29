export const setAppTitle = ({ commit }, payload) => {
  commit('setAppTitle', payload)
};

export const setLastDataSyncedDate = ({ commit }, date) => {
    commit('SET_LAST_DATA_SYNCED_DATE', date)
};