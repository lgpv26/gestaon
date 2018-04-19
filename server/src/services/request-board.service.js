import _ from 'lodash'
import {Op} from 'sequelize'
import EventResponse from '~server/models/EventResponse'
import config from '~config'

module.exports = (server) => { return {
    name: "request-board",
    actions: {
        /**
         * Load the request-board in a company context
         * @param {Number} data.companyId
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
                            model: server.mysql.Order,
                            as: "order",
                            include: [{
                                model: server.mysql.OrderProduct,
                                as: 'orderProducts',
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
                }).catch((err) => {
                    server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionCreate', new Error(err))
                })
            })
        },
        moveSection(ctx){
        },
        removeSection(ctx){
        },
        createCard(ctx){
        },
        moveCard(ctx){
        },
        removeCard(ctx){
        }
    }
}}