import _ from 'lodash'
import ProductsAPI from '../../../api/products'

const state = {
    products: []
}

const getters = {
    productsSelectItems(state){
        return _.map(state.products, (product) => {
            return {
                value: product.id,
                text: product.name
            }
        })
    }
}

const mutations = {
    SET_ALL(state, products){
        state.products = products
    },
    SET_ONE(state, product){
        const stateProductIndex = _.findIndex(state.products, { id: product.id })
        if(stateProductIndex !== -1){
            state.products[stateProductIndex] = product
        }
        else {
            state.products.push(product)
        }
    },
    REMOVE_ONE(state, id){
        const stateProductIndex = _.findIndex(state.products, { id })
        if(stateProductIndex !== -1){
            state.products.splice(stateProductIndex, 1)
        }
    }
}

const actions = {
    loadAll(context, { companyId }){
        return ProductsAPI.getList({
            companyId: companyId
        }).then((result) => {
            context.commit('SET_ALL', result.data)
            return result
        })
    },
    setProducts(context, products){
        context.commit('SET_ALL', products)
    },
    setProduct(context, product){
        context.commit('SET_ONE', product)
    },
    createOneProduct(context, data){
        return ProductsAPI.createOne( data.product, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    updateOneProduct(context, data){
        return ProductsAPI.updateOne( data.id, data.product, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    removeOneProduct(context, data){
        return ProductsAPI.removeOne( data.id, { companyId: data.companyId }).then((response) => {
            context.commit('REMOVE_ONE', response.data.removedId)
            return response.data
        })
    }
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
}