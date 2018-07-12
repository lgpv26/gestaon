const state = {
    loading: false,
    loadingText: 'Aguarde...'
};

const mutations = {
    start(state){
        state.loading = true;
    },
    stop(state){
        state.loading = false;
    },
    setText(state,payload){
        state.loadingText = payload;
    }
};

const actions = {
    startLoading(context){
        context.commit('start');

    },
    stopLoading(context){
        context.commit('stop');
    },
    setLoadingText(context,payload){
        context.commit('setText',payload);
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
