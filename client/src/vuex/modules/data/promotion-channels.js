import _ from 'lodash'
import PromotionChannelsAPI from '../../../api/promotion-channels'

const state = {
    promotionChannels: []
}

const getters = {
}

const mutations = {
    SET_ALL(state, promotionChannels){
        state.promotionChannels = promotionChannels
    },
    SET_ONE(state, promotionChannel){
        const statePromotionChannelIndex = _.findIndex(state.promotionChannels, { id: promotionChannel.id })
        if(statePromotionChannelIndex !== -1){
            state.promotionChannels[statePromotionChannelIndex] = promotionChannel
        }
        else {
            state.promotionChannels.push(promotionChannel)
        }
    },
    REMOVE_ONE(state, id){
        const statePromotionChannelIndex = _.findIndex(state.promotionChannels, { id })
        if(statePromotionChannelIndex !== -1){
            state.promotionChannels.splice(statePromotionChannelIndex, 1)
        }
    }
}

const actions = {
    loadAll(context, { companyId }){
        return PromotionChannelsAPI.getList({
            companyId: companyId
        }).then((result) => {
            context.commit('SET_ALL', result.data)
            return result
        })
    },
    setPromotionChannels(context, promotionChannels){
        context.commit('SET_ALL', promotionChannels)
    },
    setPromotionChannel(context, promotionChannel){
        context.commit('SET_ONE', promotionChannel)
    },
    createOnePromotionChannel(context, data){
        return PromotionChannelsAPI.createOne( data.promotionChannel, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    updateOnePromotionChannel(context, data){
        return PromotionChannelsAPI.updateOne( data.id, data.promotionChannel, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    removeOnePromotionChannel(context, data){
        return PromotionChannelsAPI.removeOne( data.id, { companyId: data.companyId }).then((response) => {
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