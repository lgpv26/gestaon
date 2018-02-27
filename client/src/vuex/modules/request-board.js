import Vue from 'vue'
import _ from 'lodash'
import models from '@/models'
import utils from '@/utils'

const state = {
    sections: [],
    filters: {}
};

const getters = {
};

function setFilter(state, {type, data}){
    switch(type){
        case "usersInCharge": // data comes with all users in charge ids
            state.sections.map((section) => {
                return section.cards.map((card) => {
                    if(!data.length){
                        card.state.showCard = true
                    }
                    else {
                        const criteryMatch = data.find((cardId) => {
                            return card.createdBy === cardId
                        })
                        card.state.showCard = !!criteryMatch
                    }
                    return card
                })
            })
            break;
    }
}

const mutations = {
    SET_FILTER(state, filterData){
        setFilter(state, filterData)
        state.filters[filterData.type] = filterData.data
    },
    REAPLY_FILTERS(state){
        _.forOwn(state.filters, function(value, key){
            setFilter(state, {type: key, data: value})
        });
    },
    SORT_SECTIONS(state){
        state.sections.sort(function(a, b){
            return a.position - b.position
        })
    },
    SET_SECTIONS(state, sections){
        if(Array.isArray(sections)){
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

        if(_.has(sectionObj, 'cards') && sectionObj.cards.length){
            _.map(sectionObj.cards, (card) => {
                const tCard = models.createRequestBoardCardModel()
                utils.assignToExistentKeys(tCard, card)
                _.assign(card, {
                    state: {
                        showCard: true
                    }
                })
                return card
            })
        }

        _.assign(section, {size: 1}, sectionObj)

        state.sections.push(section)
    },
    REMOVE_SECTION(state, sectionId){
        const sectionIndex = _.findIndex(state.sections, { id: sectionId })
        if(sectionIndex !== -1){
            state.sections.splice(sectionIndex, 1)
        }
    },
    SET_SECTION(state, {sectionId, section}){
        const tSection = _.find(state.sections, { id: sectionId })
        if(tSection){
            _.assign(tSection, section)
        }
    },
    RESET_REQUESTS(){
        state.requests = []
    },
    SET_SECTION_REQUESTS(state, {sectionId, requests}){
        const section = _.find(state.sections, { id: sectionId })
        if(section){
            requests.map((request) => {
                _.assign(request, {
                    state: {
                        showCard: true
                    }
                })
            })
            console.log(section)
            section.cards = requests
        }
    },
    ADD_REQUEST(state, requestObj = {}){
        const request = models.createRequestBoardCardModel()
        _.assign(request, requestObj, {
            state: {
                showCard: true
            }
        })

        const section = _.find(state.sections, { id: requestObj.sectionId })
        if(section){
            section.cards.push(request)
        }

        /*state.requests.push(request)*/
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
