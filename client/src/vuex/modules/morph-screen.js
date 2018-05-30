import _ from 'lodash'
import DraftsAPI from '../../api/drafts'

const state = () => ({
    screens: [],
    searchData: null,
    isShowing: false
});

const getters = {
    activeMorphScreen(state, getters){
        return _.find(state.screens, { active: true })
    },
    tags(state, getters){
        if(state.searchData && state.searchData.tags && state.searchData.tags.length){
            return state.searchData.tags
        }
        return []
    }
};

const mutations = {
    SET_SEARCH_DATA(state, data){
        if(_.has(data, 'text')){
            data.tags = data.text.trim().split(" ")
        }
        state.searchData = data
    },
    RESET(currentState){
        const initialState = state()
        Object.keys(initialState).forEach(k => { currentState[k] = initialState[k] })
    },
    SET_ALL_MS_SCREENS(state, screenObj){
        state.screens.forEach((screen) => {
            _.assign(screen, screenObj)
        })
    },
    SHOW_MS(state, value){
        if(_.isObject(value)) {
            state.isShowing = value.show
        }
        else {
            state.isShowing = value
        }
    },
    SET_MS(state, {draftId = null, screen = {}}){
        state.screens.forEach((stateScreen) => {
            stateScreen.active = false
        })
        let stateScreen = _.find(state.screens, (stateScreen) => {
            return stateScreen.draft.draftId === draftId
        })
        if(stateScreen){
            _.assign(stateScreen, screen)
        }
    },
    ADD_DRAFT(state, draft){
        state.screens.push({
            draft,
            isPersisting: false,
            active: false
        })
    },
    REMOVE_DRAFT(state, draftId){
        const screenIndex = _.findIndex(state.screens, (stateScreen) => {
            return stateScreen.draft.draftId === draftId
        })
        if(screenIndex !== -1){
            state.screens.splice(screenIndex, 1)
        }
    }
};

const actions = {
    loadMorphScreenData(context, companyId){
        return DraftsAPI.getAll({companyId}).then((response) => {
            context.commit('RESET')
            response.data.forEach((draft) => {
                context.commit('ADD_DRAFT', draft)
            })
            return response;
        })
    },
    createDraft(context, {body, companyId}){
        return DraftsAPI.createOne(body, {companyId})
    },
    removeDraft(context, {draftId, companyId}){
        return DraftsAPI.removeOne(draftId, {companyId})
    }
};

export default {
    namespaced: true,
    state: state(),
    getters,
    mutations,
    actions
}
