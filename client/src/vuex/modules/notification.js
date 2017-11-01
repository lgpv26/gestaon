const state = {
    show: false,
    type: "error",
    title: 'Ops!',
    text: 'Houve um problema...'
}

const getters = {
    nType(state,getters){
        switch(state.type){
            case "error":
                return "danger";
            default:
                return state.type;
        }
    }
}

const mutations = {
    show(state){
        state.show = true;
    },
    hide(state){
        state.show = false;
    },
    setNotification(state,payload){
        if(payload.hasOwnProperty("type") && payload['type'].length > 0 && payload["type"] !== "") {
            state.type = payload.type;
        }
        if(payload.hasOwnProperty("title") && payload['title'].length > 0 && payload["title"] !== "")
            state.title = payload.title;
        if(payload.hasOwnProperty("text") && payload['text'].length > 0 && payload["text"] !== "")
            state.text = payload.text;
    }
}

const actions = {
    showNotification(context){
        context.commit('show');
    },
    hideNotification(context){
        context.commit('hide');
    },
    setNotification(context,payload){
        context.commit('setNotification',payload);
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
