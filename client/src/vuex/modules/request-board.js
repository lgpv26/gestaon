import _ from 'lodash'
import { getField, updateField } from 'vuex-map-fields'
import { RequestBoardCardModel, RequestBoardSectionModel } from '../../models/index'
import utils from '../../utils'

const state = {
    sections: [],
    filters: {
        deliveryDate: new Date()
    }
};

const getters = {
    getField,
};

function setFilter(state, {type, data}){
    switch(type){
        case "responsibleUsers": // data comes with all responsible users ids
            state.sections.map((section) => {
                return section.cards.map((card) => {
                    if(!data.length){
                        card.state.showCard = true
                    }
                    else {
                        const criteryMatch = data.find((userId) => {
                            return card.createdBy === userId
                        })
                        card.state.showCard = !!criteryMatch
                    }
                    return card
                })
            })
            break;
        case "clientGroups":
            state.sections.map((section) => {
                return section.cards.map((card) => {
                    if(!data.length){
                        card.state.showCard = true
                    }
                    else {
                        const criteryMatch = data.find((clientGroupId) => {
                            return card.request.client.clientGroupId === clientGroupId
                        })
                        card.state.showCard = !!criteryMatch
                    }
                    return card
                })
            })
            break;
        case "promotionChannels":
            state.sections.map((section) => {
                return section.cards.map((card) => {
                    if(!data.length){
                        card.state.showCard = true
                    }
                    else {
                        const criteryMatch = data.find((promotionChannelId) => {
                            return card.request.requestOrder.promotionChannelId === promotionChannelId
                        })
                        card.state.showCard = !!criteryMatch
                    }
                    return card
                })
            })
            break;
        case "status":
            state.sections.map((section) => {
                return section.cards.map((card) => {
                    if(!data.length){
                        card.state.showCard = true
                    }
                    else {
                        const criteryMatch = data.find((status) => {
                            return card.request.status === status
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
                const newSection = new RequestBoardSectionModel()
                _.assign(newSection, section)
                return newSection
            })
        }
    },
    ADD_SECTION(state, sectionObj = {}){
        const section = new RequestBoardSectionModel()
        // _.assign(request, {})

        if(_.has(sectionObj, 'cards') && sectionObj.cards.length){
            _.map(sectionObj.cards, (card) => {
                const tCard = new RequestBoardCardModel()
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
            section.cards = requests
        }
    },
    SORT_CARDS(state){
        state.sections.forEach((section) => {
            section.cards.sort(function(a, b){
                return a.position - b.position
            })
        })
    },
    UPDATE_CARD(state, {cardId, card}){
        state.sections.forEach((section) => {
            section.cards.forEach((stateCard) => {
                if(stateCard.id === cardId){
                    _.assign(stateCard, card)
                }
            })
        })
    },
    REMOVE_CARD(state, cardId){
        state.sections.forEach((stateSection) => {
            const cardIndex = _.findIndex(stateSection.cards, {id: cardId})
            if(cardIndex !== -1){
                stateSection.cards.splice(cardIndex, 1)
            }
        })
    },
    MOVE_CARD(state, card){
        let targetCard
        state.sections.forEach((stateSection) => {
            stateSection.cards.forEach((stateCard, index) => {
                if(stateCard.id === card.id){
                    targetCard = _.assign({}, stateCard, card)
                    stateSection.cards.splice(index, 1)
                }
            })
        })
        state.sections.forEach((stateSection) => {
            if(stateSection.id === targetCard.sectionId){
                stateSection.cards.push(targetCard)
            }
        })
    },
    ADD_REQUEST(state, requestObj = {}){
        const request = new RequestBoardCardModel()
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
    },
    UPDATE_CARD_UNREAD_CHAT_ITEM_COUNT(state, { cardId, unreadChatItemCount }){
        state.sections.forEach((section) => {
            section.cards.forEach((stateCard) => {
                if(stateCard.id === cardId){
                    _.assign(stateCard.request, {
                        unreadChatItemCount
                    })
                }
            })
        })
    },
    updateField
};

const actions = {
    updateCard(context, { cardId, card }){
        context.commit('UPDATE_CARD', { cardId, card })
        context.commit('REAPLY_FILTERS')
        context.commit('SORT_CARDS')
    },
    moveCard(context, card){
        context.commit('MOVE_CARD', card)
        context.commit('REAPLY_FILTERS')
        context.commit('SORT_CARDS')
    },
    removeCard(context, cardId){
        context.commit('REMOVE_CARD', cardId)
    },
    updateCardUnreadChatItemCount(context, { cardId, unreadChatItemCount }){
        context.commit('UPDATE_CARD_UNREAD_CHAT_ITEM_COUNT', { cardId, unreadChatItemCount })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
