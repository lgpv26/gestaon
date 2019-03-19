import _ from 'lodash'
import CustomFieldsAPI from '../../../api/custom-fields'

const state = {
    customFields: []
}

const getters = {

}

const mutations = {
    SET_ALL(state, customFields){
        state.customFields = customFields
    },
    SET_ONE(state, customField){
        const stateCustomFieldIndex = _.findIndex(state.customFields, { id: customField.id })
        if(stateCustomFieldIndex !== -1){
            state.customFields[stateCustomFieldIndex] = customField
        }
        else {
            state.customFields.push(customField)
        }
    },
    REMOVE_ONE(state, id){
        const stateCustomFieldIndex = _.findIndex(state.customFields, { id })
        if(stateCustomFieldIndex !== -1){
            state.customFields.splice(stateCustomFieldIndex, 1)
        }
    }
}

const actions = {
    setCustomFields(context, customFields){
        context.commit('SET_ALL', customFields)
    },
    setCustomField(context, customField){
        context.commit('SET_ONE', customField)
    },
    createOneCustomField(context, data){
        return CustomFieldsAPI.createOne( data.customField, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    updateOneCustomField(context, data){
        return CustomFieldsAPI.updateOne( data.id, data.customField, { companyId: data.companyId }).then((response) => {
            context.commit('SET_ONE', response.data)
            return response.data
        })
    },
    removeOneCustomField(context, data){
        return CustomFieldsAPI.removeOne( data.id, { companyId: data.companyId }).then((response) => {
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