import _ from 'lodash'
import {Op} from 'sequelize'
import EventResponse from '~server/models/EventResponse'
import config from '~config'

module.exports = (server) => { return {
    name: "request-board",
    actions: {
        /**
         * Load the request-board in a company context
         * @param {Object} ctx.params.data = { companyId:Number }
         * @returns {Promise.<Array>} sections
         */
        load(ctx){
            return server.mongodb.Section.find({}, null, {
                sort: {
                    position: 1
                }
            }).populate('cards').exec().then((sections) => {
                const cardsRequestsIds = []
                // get all requestIds to consult mysql just once
                sections.forEach((section) => {
                    section.cards.forEach((card) => {
                        cardsRequestsIds.push(parseInt(card.requestId))
                    })
                })
                sections = JSON.parse(JSON.stringify(sections))
                return ctx.call("data/request.list", {
                    where: {
                        id: {
                            [Op.in]: cardsRequestsIds
                        },
                        companyId: parseInt(ctx.params.data.companyId)
                    },
                    include: [
                        {
                            model: server.mysql.RequestTimeline,
                            as: "requestTimeline",
                            include: [{
                                model: server.mysql.User,
                                as: "triggeredByUser",
                            },{
                                model: server.mysql.User,
                                as: "user",
                            }]
                        },
                        {
                            model: server.mysql.RequestClientPhone,
                            as: "requestClientPhones",
                            include: [{
                                model: server.mysql.ClientPhone,
                                as: "clientPhone",
                            }]
                        },{
                            model: server.mysql.RequestClientAddress,
                            as: "requestClientAddresses",
                            include: [{
                                model: server.mysql.ClientAddress,
                                as: "clientAddress",
                                include:[{
                                    model: server.mysql.Address,
                                    as: "address"
                                }]
                            }]
                        },{
                            model: server.mysql.Client,
                            as: "client",
                            include: [{
                                model: server.mysql.ClientPhone,
                                as: 'clientPhones'
                            }, {
                                model: server.mysql.ClientAddress,
                                as: 'clientAddresses',
                                include: [{
                                    model: server.mysql.Address,
                                    as: 'address'
                                }]
                            }, {
                                model: server.mysql.ClientCustomField,
                                as: 'clientCustomFields',
                                include: [{
                                    model: server.mysql.CustomField,
                                    as: 'customField'
                                }]
                            }, {
                                model: server.mysql.ClientGroup,
                                as: 'clientGroup'
                            }]
                        },{
                            model: server.mysql.RequestOrder,
                            as: "requestOrder",
                            include: [{
                                model: server.mysql.RequestOrderProduct,
                                as: 'requestOrderProducts',
                                include: [{
                                    model: server.mysql.Product,
                                    as: 'product'
                                }]
                            }]
                        }
                    ]
                }).then((requestList) => {
                    return _.map(sections, (section) => {
                        _.map(section.cards, (card) => {
                            card.request = _.find(requestList, { id: card.requestId })
                            return card
                        })
                        section.cards.sort(function(a, b){
                            return a.position - b.position
                        })
                        return section
                    })
                })
            })
        },
        /**
         * Create a section associated to the company request-board
         * @param {Number} data.companyId
         * @returns {Promise.<Object>} section
         */
        createSection(ctx){
            return server.mongodb.Section.findOne({}, {}, { sort: { position : -1 } }, function(err, lastSection) {
                let position = config.requestBoard.defaultPosition
                if(lastSection) position += lastSection.position
                return server.mongodb.Section.create({
                    companyId: ctx.params.data.companyId,
                    position
                }).then((section) => {
                    server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionCreate', new EventResponse(section))
                    return section
                })
            })
        },
        /**
         * Move a section associated to the company request-board
         * @param {String} data.location, {Number} data.companyId, {Number} data.position, {Number} data.sectionId
         * @returns {Promise.<Object>} section
         */
        moveSection(ctx){
            switch(ctx.params.data.location){
                case "first":
                    return server.mongodb.Section.findOne({}, {}, { sort: { position: 1 } }, function(err, firstSection) {
                        let position = firstSection.position / 2
                        return server.mongodb.Section.findOneAndUpdate({
                            _id: ctx.params.data.sectionId
                        }, {
                            $set: {
                                position
                            }
                        }).then((section) => {
                            _.assign(section, { position })
                            server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionMove', new EventResponse(section))
                            return section
                        })
                    })
                    break;
                case "last":
                    return server.mongodb.Section.findOne({}, {}, { sort: { position: -1 } }, function(err, lastSection) {
                        let position = config.requestBoard.defaultPosition
                        if(lastSection) position += lastSection.position
                        return server.mongodb.Section.findOneAndUpdate({
                            _id: ctx.params.data.sectionId
                        }, {
                            $set: {
                                position
                            }
                        }).then((section) => {
                            _.assign(section, { position })
                            server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionMove', new EventResponse(section))
                            return section
                        })
                    })
                    break;
                default:
                    return server.mongodb.Section.findOneAndUpdate({
                        _id: ctx.params.data.sectionId
                    }, {
                        $set: {
                            position: ctx.params.data.position
                        }
                    }).then((section) => {
                        _.assign(section, { position: ctx.params.data.position })
                        server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionMove', new EventResponse(section))
                        return section
                    })
            }
        },
        /**
         * Remove a section associated to the company request-board
         * @param {Number} data.companyId, {Number} data.sectionId
         * @emits {Object} removedSectionId
         * @returns {Promise.<Number>} removedSectionId
         */
        removeSection(ctx){
            return server.mongodb.Card.count({
                section: ctx.params.data.sectionId
            }).then((count) => {
                if(count > 0){
                    throw new Error("Você não pode remover uma seção que possui pedido(s).")
                }
                else {
                    return server.mongodb.Section.remove({
                        _id: ctx.params.data.sectionId
                    }).then(() => {
                        server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionRemove', new EventResponse({
                            removedSectionId: ctx.params.data.sectionId
                        }))
                        return ctx.params.data.sectionId
                    })
                }
            })
        },
        createCard(ctx){
        },
        /**
         * Remove a section associated to the company request-board
         * @param {Number} data.companyId, {String} data.location, {ObjectId} data.toSection, {ObjectId} data.cardId
         * @emits {Object} removedSectionId
         * @returns {Promise.<Number>} removedSectionId
         */
        moveCard(ctx){
            const vm = this
            switch(ctx.params.data.location){
                case "first":
                    return server.mongodb.Card.findOne({ section: ctx.params.data.toSection}, {}, { sort: { position: 1 } }, function(err, firstCard) {
                        console.log('firstCard', firstCard.position)
                        let position = firstCard.position / 2
                        return vm.saveRequestBoardCard(ctx.params.data.cardId, ctx.params.data.toSection, position).then(() => {
                            server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardCardMove', {
                                data: { location: 'first' }
                            })
                        })
                    })
                    break;
                case "last":
                    return server.mongodb.Card.findOne({ section: ctx.params.data.toSection }, {}, { sort: { position: -1 } }, function(err, lastCard) {
                        let position = config.requestBoard.defaultPosition
                        if(lastCard) position += lastCard.position
                        return vm.saveRequestBoardCard(ctx.params.data.cardId, ctx.params.data.toSection, position).then(() => {
                            server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardCardMove', {
                                data: { location: 'last' }
                            })
                        })
                    })
                    break;
                case "middle":
                    server.mongodb.Card.find({ section: ctx.params.data.toSection, _id: { $in: [ctx.params.data.prevCard, ctx.params.data.nextCard] } }, function(err, prevAndNextCard) {
                        prevAndNextCard.sort(function(a, b){return b.position - a.position})
                        const position = ( prevAndNextCard[0].position + prevAndNextCard[1].position ) / 2
                        return vm.saveRequestBoardCard(ctx.params.data.cardId, ctx.params.data.toSection, position).then(() => {
                            server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardCardMove', {
                                data: { location: 'middle' }
                            })
                        })
                    })
                    break;
                case "last-and-only":
                    console.log("last-and-only")
                    let position = config.requestBoard.defaultPosition
                    return vm.saveRequestBoardCard(ctx.params.data.cardId, ctx.params.data.toSection, position).then(() => {
                        server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardCardMove', {
                            data: { location: 'last-and-only' }
                        })
                    })
                    break;
            }
        },
        removeCard(ctx){
        }
    },
    methods: {
        saveRequestBoardCard(cardId, toSectionId, position){
            return server.mongodb.Card.findOne({
                _id: cardId
            }).then((card) => {
                const prevSectionId = card.section.toString()
                _.assign(card, {
                    position,
                    section: toSectionId
                })
                return card.save().then(() => {
                    if(prevSectionId !== toSectionId) { // only execute here if card is going to another section
                        const removeCardFromPrevSection = server.mongodb.Section.findOne({
                            _id: prevSectionId
                        }).then((prevSection) => {
                            const prevSectionCardIndex = _.findIndex(prevSection.cards, card._id)
                            prevSection.cards.splice(prevSectionCardIndex, 1)
                            return prevSection.save()
                        })
                        const addCardToNextSection = server.mongodb.Section.findOne({
                            _id: toSectionId
                        }).then((toSection) => {
                            toSection.cards.push(card._id)
                            return toSection.save()
                        })
                        return Promise.all([removeCardFromPrevSection, addCardToNextSection])
                    }
                })
            })
        }
    }
}}