const _ = require('lodash')
const Controller = require('../../models/Controller')
const shortid = require('shortid')
const Op = require('Sequelize').Op

module.exports = class RequestBoard {

    constructor(server, socket) {
        // global variabels
        this.server = server
        this.socket = socket

        this.requestsController = require('../../controllers/requests.controller')(server)

        this._defaultPosition = 65535

        // functions
        this.setEventListeners()
    }

    /**
     * Events on Request Listeners
     */
    setEventListeners() {

        const vm = this

        this.socket.on('request-board:load', () => {
            vm.server.mongodb.Section.find({}, null, {
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
                const getAll = new Controller({
                    request: {
                        id: cardsRequestsIds,
                        companyId: 1
                    }
                })

                this.requestsController.getAll(getAll).then((requests) => {
                    sections = JSON.parse(JSON.stringify(sections))
                    sections = _.map(sections, (section) => {
                        _.map(section.cards, (card) => {
                            card.request = _.find(requests, { id: card.requestId })
                            return card
                        })
                        section.cards.sort(function(a, b){
                            return a.position - b.position
                        })
                        return section
                    })
                    vm.socket.emit('requestBoardLoad', {
                        data: sections
                    })
                }).catch((err) => {
                    console.log(err)
                });
            })
        })

        /**
         * On section create
         */
        this.socket.on('request-board:section-create', (section) => {
            vm.server.mongodb.Section.findOne({}, {}, { sort: { position : -1 } }, function(err, lastSection) {
                let position = vm._defaultPosition
                if(lastSection) position += lastSection.position
                vm.server.mongodb.Section.create({
                    companyId: 1,
                    position
                }).then((section) => {
                    vm.server.io.sockets.emit('requestBoardSectionCreate', {
                        data: section
                    })
                }).catch((err) => {
                    console.log(err)
                    vm.server.io.sockets.emit('requestBoardSectionCreate', new Error(err))
                })
            });
        })

        /**
         * On section remove
         */
        this.socket.on('request-board:section-remove', (evData) => {
            vm.server.mongodb.Card.count({
                section: evData.sectionId
            }, function(err, count) {
                if(count > 0){
                    vm.server.io.sockets.emit('requestBoardSectionRemove', {
                        success: false,
                        message: "Você não pode remover uma seção que possui pedido(s)."
                    })
                }
                else {
                    vm.server.mongodb.Section.remove({
                        _id: evData.sectionId
                    }, function(){
                        vm.server.io.sockets.emit('requestBoardSectionRemove', {
                            success: true,
                            data: {
                                section: {
                                    id: evData.sectionId
                                }
                            }
                        })
                    })
                }
            })
        })

        /**
         * On section move
         */
        this.socket.on('request-board:section-move', (evData) => {
            console.log("Section moved", evData)
            switch(evData.location){
                case "first":
                    vm.server.mongodb.Section.findOne({}, {}, { sort: { position: 1 } }, function(err, firstSection) {
                        let position = firstSection.position / 2
                        vm.server.mongodb.Section.findOneAndUpdate({
                            _id: evData.sectionId
                        }, {
                            $set: {
                                position
                            }
                        }).then((section) => {
                            _.assign(section, { position })
                            vm.server.io.sockets.emit('requestBoardSectionMove', {
                                data: { location: 'first', section }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.sockets.emit('requestBoardSectionMove', new Error(err))
                        })
                    })
                    break;
                case "last":
                    vm.server.mongodb.Section.findOne({}, {}, { sort: { position: -1 } }, function(err, lastSection) {
                        let position = vm._defaultPosition
                        if(lastSection) position += lastSection.position
                        vm.server.mongodb.Section.findOneAndUpdate({
                            _id: evData.sectionId
                        }, {
                            $set: {
                                position
                            }
                        }).then((section) => {
                            _.assign(section, { position })
                            vm.server.io.sockets.emit('requestBoardSectionMove', {
                                data: { location: 'last', section }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.sockets.emit('requestBoardSectionMove', new Error(err))
                        })
                    })
                    break;
                default:
                    console.log("evData",evData)
                    vm.server.mongodb.Section.findOneAndUpdate({
                        _id: evData.sectionId
                    }, {
                        $set: {
                            position: evData.position
                        }
                    }).then((section) => {
                        _.assign(section, { position: evData.position })
                        vm.server.io.sockets.emit('requestBoardSectionMove', {
                            data: { location: 'middle', section }
                        })
                    }).catch((err) => {
                        console.log(err)
                        vm.server.io.sockets.emit('requestBoardSectionMove', new Error(err))
                    })
            }

        })

        /**
         * On card move
         */
        this.socket.on('request-board:card-move', (evData) => {
            console.log("Card moved", evData)

            switch(evData.location){
                case "first":
                    vm.server.mongodb.Card.findOne({ section: evData.toSection}, {}, { sort: { position: 1 } }, function(err, firstCard) {
                        console.log('firstCard', firstCard.position)
                        let position = firstCard.position / 2
                        vm.saveCard(evData.cardId, evData.toSection, position).then(() => {
                            vm.server.io.sockets.emit('requestBoardCardMove', {
                                data: { location: 'first' }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.sockets.emit('requestBoardCardMove', new Error(err))
                        })
                    })
                    break;
                case "last":
                    vm.server.mongodb.Card.findOne({ section: evData.toSection }, {}, { sort: { position: -1 } }, function(err, lastCard) {
                        let position = vm._defaultPosition
                        if(lastCard) position += lastCard.position
                        vm.saveCard(evData.cardId, evData.toSection, position).then(() => {
                            vm.server.io.sockets.emit('requestBoardCardMove', {
                                data: { location: 'last' }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.sockets.emit('requestBoardCardMove', new Error(err))
                        })
                    })
                    break;
                case "middle":
                    vm.server.mongodb.Card.find({ section: evData.toSection, _id: { $in: [evData.prevCard, evData.nextCard] } }, function(err, prevAndNextCard) {
                        prevAndNextCard.sort(function(a, b){return b.position - a.position})
                        const position = ( prevAndNextCard[0].position + prevAndNextCard[1].position ) / 2
                        vm.saveCard(evData.cardId, evData.toSection, position).then(() => {
                            vm.server.io.sockets.emit('requestBoardCardMove', {
                                data: { location: 'middle' }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.sockets.emit('requestBoardCardMove', new Error(err))
                        })
                    })
                    break;
                case "last-and-only":
                    console.log("last-and-only")
                    let position = vm._defaultPosition
                    vm.saveCard(evData.cardId, evData.toSection, position).then(() => {
                        vm.server.io.sockets.emit('requestBoardCardMove', {
                            data: { location: 'last-and-only' }
                        })
                    }).catch((err) => {
                        console.log(err)
                        vm.server.io.sockets.emit('requestBoardCardMove', new Error(err))
                    })
                    break;
            }
        })
    }

    saveCard(cardId, toSectionId, position){
        const vm = this
        return vm.server.mongodb.Card.findOne({
            _id: cardId
        }).then((card) => {
            const prevSectionId = card.section.toString()
            _.assign(card, {
                position,
                section: toSectionId
            })
            return card.save().then(() => {
                if(prevSectionId !== toSectionId) { // only execute here if card is going to another section
                    const removeCardFromPrevSection = vm.server.mongodb.Section.findOne({
                        _id: prevSectionId
                    }).then((prevSection) => {
                        const prevSectionCardIndex = _.findIndex(prevSection.cards, card._id)
                        prevSection.cards.splice(prevSectionCardIndex, 1)
                        return prevSection.save()
                    })
                    const addCardToNextSection = vm.server.mongodb.Section.findOne({
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