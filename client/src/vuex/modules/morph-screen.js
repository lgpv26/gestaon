import _ from 'lodash';

const state = {
    screens: [],
    sourceEl: null,
    sourceElBgColor: null,
    mimicBorderRadius: 0,
    isShowing: false
};

const getters = {
    /*selectProducts(state,getters){
        return state.products.map((product) => {
            return {
                value: product.id,
                text: product.name
            }
        });
    }*/
};

const mutations = {
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
