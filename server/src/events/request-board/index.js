const _ = require('lodash')
const Controller = require('../../models/Controller')

const RequestRecoverance = require('../../modules/Draft/Recoverance/RequestRecoverance')
const EventResponse = require('~server/models/EventResponse')

const {PermissionError} = require('~errors')

module.exports = class RequestBoard {

    /**
     * @param {Object} server
     * @param {Object} socket = { instance, user, activeCompany, activeUserCompany}
     */
    constructor(server, socket) {
        // global variabels
        this.server = server
        this.socket = socket

        this.requestsController = require('../../controllers/requests.controller')(server)
        this.requestTimelineController = require('../../controllers/requests-timeline.controller')(server)
        this.requestRecoverance = new RequestRecoverance(server)

        this._defaultPosition = 65535

        this._setListeners()
    }

    /**
     * Events on Request Listeners
     */
    _setListeners() {

        const vm = this

        this.socket.instance.on('request-board:request-recoverance', (evData) => {
            /**
             * Request Recoverance
             * @desc Send to all sockets in Draft/:id the recoverance event
             *
             * @param {object} evData - expected: cardId, companyId
             * @return {object} *Draft @property {Socket}
             */

            return vm.server.mongodb.Card.findOne({ _id: evData.cardId }, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                this.requestRecoverance.setRequestId(card.requestId)
                this.requestRecoverance.setCompanyId(evData.companyId)
                this.requestRecoverance.setRecoverancedBy(this.socket.user)

                this.requestRecoverance.start().then((draft) => {
                    vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('requestBoardRequestRecoverance', draft)
                }).catch((err) => {
                    console.log('ERRO: REQUEST RECOVERANCE: ', err)
                })
            })
        })

        this.socket.instance.on('request-board:load', () => {
            vm.socket.instance.join('company/' + vm.socket.activeCompany.id + '/request-board') // subscribe the user to its request-board company channel
            vm.server.broker.call('request-board.load', {
                data: {
                    companyId: vm.socket.activeCompany.id
                }
            }).then((sections) => {
                vm.socket.instance.emit('requestBoardLoad', new EventResponse({sections}))
            }).catch((err) => {
                console.log(err)
            })
        })

        /**
         * On section create
         */
        this.socket.instance.on('request-board:section-create', () => {
            vm.server.broker.call('request-board.createSection', {
                data: {
                    companyId: vm.socket.activeCompany.id
                }
            }).catch((err) => {
                vm.socket.instance.emit('requestBoardSectionCreate', new EventResponse(err))
                console.log(err)
            })
        })

        /**
         * On section remove
         */
        this.socket.instance.on('request-board:section-remove', (evData) => {
            vm.server.broker.call('request-board.removeSection', {
                data: {
                    companyId: vm.socket.activeCompany.id,
                    sectionId: evData.sectionId
                }
            }).then((removedSectionId) => {
                vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('requestBoardSectionRemove', new EventResponse({
                    sectionId: removedSectionId
                }))
            }).catch((err) => {
                vm.socket.instance.emit('requestBoardSectionCreate', new EventResponse(err))
                console.log(err)
            })
        })

        /**
         * On section move
         */
        this.socket.instance.on('request-board:section-move', (evData) => {
            console.log("Section moved", evData)
            vm.server.broker.call('request-board.moveSection', {
                data: {
                    companyId: vm.socket.activeCompany.id,
                    sectionId: evData.sectionId,
                    location: evData.location,
                    position: evData.position || null
                }
            }).catch((err) => {
                vm.socket.instance.emit('requestBoardSectionCreate', new EventResponse(err))
                console.log(err)
            })
        })

        /**
         * On card move
         */
        this.socket.instance.on('request-board:card-move', (evData) => {
            console.log("Card moved", evData)
            vm.server.broker.call('request-board.moveCard', {
                data: {
                    location: evData.location,
                    companyId: vm.socket.activeCompany.id,
                    toSection: evData.toSection,
                    cardId: evData.cardId
                }
            }).catch((err) => {
                vm.socket.instance.emit('requestBoardSectionCreate', new EventResponse(err))
                console.log(err)
            })
        })

        /**
         * On change request's status
         */
        this.socket.instance.on('request-board:request-timeline:change-status', (evData) => {
            return vm.server.mongodb.Card.findOne({ _id: evData.cardId }, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                return new Promise((resolve, reject) => {
                    const controller = new Controller({
                        request: {
                            id: card.requestId,
                            companyId: card.companyId
                        }
                    })
                    this.requestsController.getOne(controller).then((request) => {
                        const statusController = new Controller({
                            request: {
                                request: request,
                                data: {
                                    status: evData.status,
                                    triggeredBy: vm.socket.user.id
                                }
                            }
                        })

                        this.requestTimelineController.changeStatus(statusController).then((response) => {
                            const data = {
                                success: true,
                                data: {
                                    cardId: evData.cardId,
                                    requestTimelineItem: response
                                }
                            }
                            resolve(data)
                        }).catch((err) => {
                            const error = {
                                success: false,
                                message: "Não é possivel alterar o status do pedido!",
                                errorCode: "ERROR"
                            }
                            reject(error)
                        })
                    })
                }).then((data) => {
                    vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardRequestTimelineChangeStatus', data)
                }).catch((err) => {
                    vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardRequestTimelineChangeStatus', err)
                })
            })
        })

        /**
         * On change request's user
         */
        this.socket.instance.on('request-board:request-timeline:change-user', (evData) => {
            return vm.server.mongodb.Card.findOne({ _id: evData.cardId }, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                return new Promise((resolve, reject) => {
                    const controller = new Controller({
                        request: {
                            id: card.requestId,
                            companyId: card.companyId
                        }
                    })
                    this.requestsController.getOne(controller).then((request) => {
                        const statusController = new Controller({
                            request: {
                                request: request,
                                data: {
                                    userId: evData.userId,
                                    triggeredBy: vm.socket.user.id
                                },
                                companyId: vm.socket.activeCompany.id
                            }
                        })

                        this.requestTimelineController.changeUser(statusController).then((response) => {
                            const data = {
                                success: true,
                                data: {
                                    cardId: evData.cardId,
                                    requestTimelineItem: response
                                }
                            }
                            resolve(data)
                        }).catch((err) => {
                            const error = {
                                success: false,
                                message: "Não é possivel alterar o usuario do pedido!",
                                errorCode: "ERROR"
                            }
                            reject(error)
                        })
                    })
                }).then((data) => {
                    vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('requestBoardRequestTimelineChangeUser', data)
                }).catch((err) => {
                    vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('requestBoardRequestTimelineChangeUser', err)
                })
            })
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