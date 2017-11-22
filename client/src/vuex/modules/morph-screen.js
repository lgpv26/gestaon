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
    setAllMorphScreens(state, obj){
        state.screens.forEach((screen) => {
            _.assign(screen, obj);
        });
    },
    setMorphScreen(state, obj){
        state.screens.forEach((screen) => {
            screen.active = false;
        });
        let draft = _.find(state.screens, { draftId: obj.draftId });
        if(draft){
            _.assign(draft, obj);
        }
    },
    showMorphScreen(state, value){
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
        return DraftsAPI.getAll({ companyId: companyId }).then((response) => {
            context.commit('RESET');
            response.data.forEach((draft) => {
                context.commit('ADD_DRAFT', draft);
            });
            return true;
        });
    }
    /*
    createMorphScreen(context, productId){
        return productsAPI.removeOne(productId).then((response) => {
            context.commit('removeOne', productId);
            return response;
        });
    }
    */
};

export default {
    namespaced: true,
    state: state(),
    getters,
    mutations,
    actions
}
