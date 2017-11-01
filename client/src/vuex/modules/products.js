import productsAPI from '../../api/products';

const state = {
    products: []
}

const getters = {
    selectProducts(state,getters){
        return state.products.map((product) => {
            return {
                value: product.id,
                text: product.name
            }
        });
    }
}

const mutations = {
    removeOne(state,productId){
        const index = state.products.findIndex((product) => {
            if(product.id === productId){
                return true;
            }
        });
        state.products.splice(index, 1);
    },
    getAll(state,products){
        state.products = products;
    },
    add(state,product){
        state.products.push(product);
    }
}

const actions = {
    removeProduct(context, productId){
        return productsAPI.removeOne(productId).then((response) => {
            context.commit('removeOne', productId);
            return response;
        });
    },
    getProducts(context){
        return productsAPI.getAll().then((response) => {
            context.commit('getAll', response.data);
            return response;
        });
    },
    createProduct(context, body){
        return productsAPI.createOne(body).then((response) => {
            context.commit('add',response.data);
            return response;
        });
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
