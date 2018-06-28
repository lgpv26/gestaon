import _ from 'lodash'
import moment from 'moment'
import {Op} from 'sequelize'
import EventResponse from '~server/models/EventResponse'
import config from '~config'

import { base64encode, base64decode } from 'nodejs-base64'

module.exports = (server) => { return {
    name: "request-board",
    actions: {
        /**
         * Load the request-board in a company context
         * @param {Object} ctx.params.data = { companyId:Number }
         * @returns {Promise.<Array>} sections
         */
        load(ctx){

            const searchObj = {
                dateCreated: null
            }

            if(_.get(ctx.params,'data.filter',false)){
                _.assign(searchObj,JSON.parse(base64decode(ctx.params.data.filter)))
            }

            const where = {}

            // set date created

            if(_.get(searchObj,'dateCreated',false)){
                _.assign(where, {
                    createdAt: {
                        "$gte": moment(searchObj.dateCreated).startOf("day").toDate(),
                        "$lte": moment(searchObj.dateCreated).endOf("day").toDate()
                    }
                })
            }
            else {
                _.assign(where, {
                    createdAt: {
                        "$gte": moment().startOf("day").toDate(),
                        "$lte": moment().endOf("day").toDate()
                    }
                })
            }

            return server.mongodb.Section.find({}, null, {
                sort: {
                    position: 1
                }
            }).populate({
                path: 'cards',
                match: where
            }).exec().then((sections) => {
                const cardsRequestsIds = []
                // get all requestIds to consult mysql just once
                sections.forEach((section) => {
                    section.cards.forEach((card) => {
                        cardsRequestsIds.push(parseInt(card.requestId))
                    })
                })
                sections = JSON.parse(JSON.stringify(sections))
                return ctx.call("data/request.getList", {
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
                        },{
                            model: server.mysql.RequestPayment,
                            as: "requestPayments",
                            include: [{
                                model: server.mysql.PaymentMethod,
                                as: 'paymentMethod'
                            }]
                        },{
                            model: server.mysql.RequestChatItem,
                            as: "requestChatItems",
                            include: [{
                                model: server.mysql.User,
                                as: "user",
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
        consultSectionOne(ctx){
            return server.mongodb.Section.findOne(ctx.params.where)
                .sort({ position: 1 }).then((section) => {
                    if (!section) {
                        return ctx.call("request-board.createSection", {
                            data: {
                                companyId: ctx.params.companyId
                            }
                        }).then((section) => {
                            return section
                        })
                    }
                    else {
                        return section
                    }
                }).catch((err) => {
                    return err
                })
        },
        /**
         * Create a section associated to the company request-board
         * @param {Number} data.companyId
         * @returns {Promise.<Object>} section
         */
        createSection(ctx){
            return new Promise((resolve, reject) => {
                server.mongodb.Section.findOne({}, {}, { sort: { position : -1 } }, function(err, lastSection) {
                    let position = config.requestBoard.defaultPosition
                    if(lastSection) position += lastSection.position
                    server.mongodb.Section.create({
                        companyId: ctx.params.data.companyId,
                        position
                    }).then((section) => {
                        server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionCreate', new EventResponse(section))
                        resolve(section)
                    }).catch((err) => {
                        console.log('Erro create section, erro:', err)
                        reject()
                    })
                })
            }).then((section) => {
                return section
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
            //requestId
            //position
            //sectionId
            return server.mongodb.Card.create(ctx.params.data).then((card) => {
                if(!card) throw new Error ('Erro ao criar Card')
                // check socket connections and emit 
                server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('cardCreated', {
                    data: card, sectionId: ctx.params.section.id
                })
                card = card.toJSON()
                card.request = ctx.params.request
                ctx.call("request-board.saveCardInSection", {
                    sectionId: ctx.params.section.id,
                    cardId: card.id
                }).then((section) => {
                    server.io.sockets.emit('requestBoardCardCreate', {
                        data: {
                            card,
                            section
                        }
                    })
                    return card
                })
            }).catch((err) => {
                console.log(err)
                return err
            })
        },
        reloadCard(ctx){
            return server.mongodb.Card.findOne({requestId: ctx.params.request.id})
            .then((card) => {
                if(!card){
                    console.log("CAPTUREI VOCÊ, SEU DANADO!!!", ctx.params, card)
                    throw new Error ('Erro ao atualizar Card')
                }
                // check socket connections and emit 
                card = card.toJSON()
                card.request = ctx.params.request
            
                server.io.in('company/' + ctx.params.companyId + '/request-board').emit('requestBoardCardUpdate', new EventResponse(card))

                return card
            })
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
                    return server.mongodb.Card.findOne({ section: ctx.params.data.toSection}, {}, { sort: { position: 1 } }).exec().then((firstCard) => {
                        let position = firstCard.position / 2
                        return vm.saveRequestBoardCard(ctx.params.data.cardId, ctx.params.data.toSection, position).then((card) => {
                            return {
                                location: 'first',
                                card: card
                            }
                        })
                    })
                break;
                case "last":
                    return server.mongodb.Card.findOne({ section: ctx.params.data.toSection }, {}, { sort: { position: -1 } }).exec().then((lastCard) => {
                        let position = config.requestBoard.defaultPosition
                        if(lastCard) position += lastCard.position
                        return vm.saveRequestBoardCard(ctx.params.data.cardId, ctx.params.data.toSection, position).then((card) => {
                            return {
                                location: 'last',
                                card: card
                            }
                        })
                    })
                break;
                case "middle":
                    return server.mongodb.Card.find({ section: ctx.params.data.toSection, _id: { $in: [ctx.params.data.prevCard, ctx.params.data.nextCard] }}).then((prevAndNextCard) => {
                        prevAndNextCard.sort((a, b) => {
                            return b.position - a.position
                        })
                        const position = ( prevAndNextCard[0].position + prevAndNextCard[1].position ) / 2
                        return vm.saveRequestBoardCard(ctx.params.data.cardId, ctx.params.data.toSection, position).then((card) => {
                            return {
                                location: 'middle',
                                card: card
                            }
                        })
                    })
                break;
                case "last-and-only":
                    let position = config.requestBoard.defaultPosition
                    return vm.saveRequestBoardCard(ctx.params.data.cardId, ctx.params.data.toSection, position).then((card) => {
                        return {
                            location: 'last-and-only',
                            card: card
                        }
                    })
                break;
            }
        },
        removeCard(ctx){
            return server.mongodb.Card.findOne({ _id: ctx.params.data.cardId}).then((card) => {
                return ctx.call("request-board.consultSectionOne", {
                    where: {
                        _id: card.section
                    }
                }).then((section) => {
                    let index = _.findIndex(section.cards, (cardSection) => {
                        return cardSection.valueOf() == card.id
                    })
           
                    if(index == -1){
                        return new Error('Card não encontrado!')
                    }
                    section.cards.splice(index,1)
                    return section.save().then(() => {
                        return server.mongodb.Card.remove({
                            _id: ctx.params.data.cardId
                        }).then(() => {
                            server.io.emit('requestBoardCardRemove', new EventResponse({
                                removedCardId: ctx.params.data.cardId
                            }))
                            /*server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardCardRemove', new EventResponse({
                                removedCardId: ctx.params.data.cardId
                            }))*/
                            return ctx.params.data.cardId
                        })
                        
                    })           
                })
            })
        },
        saveCardInSection(ctx){
            return ctx.call("request-board.consultSectionOne", {
                where: {
                    _id: ctx.params.sectionId
                }
            }).then((section) => {
                section.cards.push(ctx.params.cardId)
                return section.save()
            })
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
                        return Promise.all([removeCardFromPrevSection, addCardToNextSection]).then(() => {
                            return card
                        })
                    }
                    return card
                })
            })
        }
    }
}}