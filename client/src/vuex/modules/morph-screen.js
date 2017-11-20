import _ from 'lodash';

const state = {
    screens: [{
        name: 'Pedido #10000',
        draftId: 1,
        active: false
    }, {
        name: 'Pedido #10001',
        draftId: 2,
        active: false
    }, {
        name: 'Pedido #10002',
        draftId: 3,
        active: false
    }, {
        name: 'Pedido #10003',
        draftId: 4,
        active: false
    }, {
        name: 'Pedido #10004',
        draftId: 5,
        active: false
    }, {
        name: 'Pedido #10004',
        draftId: 6,
        active: false
    }],
    sourceEl: null,
    sourceElBgColor: null,
    mimicBorderRadius: 0,
    isShowing: false
};

const getters = {
    activeMorphScreen(state,getters){
        return _.find(state.screens, { active: true });
    }
};

const mutations = {
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
                state.sourceEl = obj.sourceEl;
                state.sourceElBgColor = obj.sourceElBgColor;
                state.mimicBorderRadius = obj.mimicBorderRadius;
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
    addMorphScreen(state){
        state.screens.push({
            name: 'Screen ' + state.screens.length
        });
    },
    removeMorthScreen(state, index){
        state.screen.splice(index, 1);
    },
    changeMorthScreen(state){

    }
};

const actions = {
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
    state,
    getters,
    mutations,
    actions
}
