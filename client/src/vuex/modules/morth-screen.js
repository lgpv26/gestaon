import productsAPI from '../../api/products';

const state = {
    screens: []
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
    addMorphScreen(context, productId){
        return productsAPI.removeOne(productId).then((response) => {
            context.commit('removeOne', productId);
            return response;
        });
    },
    removeMorthScreen(context){
        return productsAPI.getAll().then((response) => {
            context.commit('getAll', response.data);
            return response;
        });
    },
    changeMorthScreen(context){

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
