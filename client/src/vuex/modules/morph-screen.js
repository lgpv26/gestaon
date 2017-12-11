import _ from 'lodash';
import DraftsAPI from '../../api/drafts';

const state = () => ({
    screens: [],
    isShowing: false
});

const getters = {
    activeMorphScreen(state, getters){
        return _.find(state.screens, { active: true });
    }
};

const mutations = {
    RESET(currentState){
        const initialState = state();
        Object.keys(initialState).forEach(k => { currentState[k] = initialState[k] })
    },
    SET_ALL_MS_SCREENS(state, screenObj){
        state.screens.forEach((screen) => {
            _.assign(screen, screenObj);
        });
    },
    SHOW_MS(state, value){
        if(_.isObject(value)) {
            const obj = value;
            if(obj.show) {
                state.isShowing = true;
            }
            else {
                state.isShowing = false;
            }
        }
        else {
            state.isShowing = value;
        }
    },
    SET_MS_SCREEN(state, screenObj){
        state.screens.forEach((screen) => {
            screen.active = false;
        });
        let screen = _.find(state.screens, (screen) => {
            if(screenObj.draft && screen.draft.draftId === screenObj.draft.draftId) return true;
        });
        if(screen){
            delete screenObj.draft;
            _.assign(screen, screenObj);
        }
    },
    SHOW_DRAFT(state, value){
        if(_.isObject(value)) {
            const obj = value;
            if(obj.show) {
                state.isShowing = true;
            }
            else {
                state.isShowing = false;
            }
        }
        else {
            state.isShowing = value;
        }
    },
    ADD_DRAFT(state, draft){
        state.screens.push({
            draft: draft,
            active: false
        });
    },
    removeMorthScreen(state, index){
        state.screen.splice(index, 1);
    },
    changeMorthScreen(state){

    }
};

const actions = {
    loadMorphScreenData(context, companyId){
        return DraftsAPI.getAll({companyId}).then((response) => {
            context.commit('RESET');
            response.data.forEach((draft) => {
                context.commit('ADD_DRAFT', draft);
            });
            return response;
        });
    },
    createDraft(context, {body, companyId}){
        return DraftsAPI.createOne(body, {companyId}).then((response) => {
            console.log(response.data);
            context.commit('ADD_DRAFT', response.data);
            return response;
        });
    }
};

export default {
    namespaced: true,
    state: state(),
    getters,
    mutations,
    actions
}
