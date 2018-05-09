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
    }
};

const actions = {
    loadMorphScreenData(context, companyId){
        return DraftsAPI.getAll({companyId}).then((response) => {
            context.commit('RESET');
            response.data.forEach((draft) => {
                context.commit('ADD_DRAFT', draft);
            });

            // temp

            /*context.commit('ADD_DRAFT', {
                companyId: 1,
                createdAt: "2017-12-19T20:24:18.668Z",
                createdBy: "THIAGO ROCHA",
                draftId: 55,
                form: {},
                id: "5a397572351480387e573cde",
                type: "client",
                updatedAt: "2018-01-10T18:36:26.870Z"
            })

            context.commit('ADD_DRAFT', {
                companyId: 1,
                createdAt: "2017-12-19T20:24:18.668Z",
                createdBy: "THIAGO ROCHA",
                draftId: 78,
                form: {},
                id: "5a397572351480387e573cdx",
                type: "accounts",
                updatedAt: "2018-01-10T18:36:26.870Z"
            })

            context.commit('ADD_DRAFT', {
                companyId: 1,
                createdAt: "2017-12-19T20:24:18.668Z",
                createdBy: "THIAGO ROCHA",
                draftId: 99,
                form: {},
                id: "5a397572351480gfwgffdcdx",
                type: "expense",
                updatedAt: "2018-01-10T18:36:26.870Z"
            })

            */

            return response;
        });
    },
    createDraft(context, {body, companyId}){
        return DraftsAPI.createOne(body, {companyId})
    }
};

export default {
    namespaced: true,
    state: state(),
    getters,
    mutations,
    actions
}
