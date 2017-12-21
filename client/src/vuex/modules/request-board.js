import Vue from 'vue'
import _ from 'lodash'
import models from '@/models'
import utils from '@/utils'

const state = {
    sections: [],
    requests: []
};

const getters = {
    activeRequest(state, getters){
        return _.find(state.requests, { active: true });
    },
    sectionRequests(state, getters){
        return (sectionId) => _.map(state.requests, { sectionId })
    }
};

const mutations = {
    SET_SECTIONS(state, sections){
        if(Array.isArray(sections) && sections.length){
            state.sections = sections.map((section) => {
                const newSection = models.createRequestBoardSectionModel()
                _.assign(newSection, section)
                return newSection
            })

        }
    },
    ADD_SECTION(state, sectionObj = {}){
        const section = models.createRequestBoardSectionModel()
        // _.assign(request, {})
        _.assign(section, sectionObj)
        state.sections.push(section)
    },
    REMOVE_SECTION(state, sectionId){
        const sectionIndex = _.findIndex(state.sections, { id: sectionId })
        if(sectionIndex !== -1){
            state.sections.splice(sectionIndex, 1)
        }
    },
    SET_SECTION(state, {sectionId, section}){
        const sectionIndex = _.findIndex(state.sections, { id: sectionId })
        if(sectionIndex !== -1){
            _.assign(state.sections[sectionIndex], section)
        }
    },
    RESET_REQUESTS(){
        state.requests = []
    },
    ADD_REQUEST(state, requestObj = {}){
        const request = models.createRequestBoardCardModel()
        _.assign(request, { active: false })
        _.assign(request, requestObj)
        state.requests.push(request)
    },
    REMOVE_REQUEST(state, requestId){
        const requestIndex = _.findIndex(state.requests, { id: requestId })
        if(requestIndex !== -1){
            state.requests.splice(requestIndex, 1)
        }
    }
};

const actions = {
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
