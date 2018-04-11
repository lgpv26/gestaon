const _ = require('lodash')
const Controller = require('../../models/Controller')
const shortid = require('shortid')
const Op = require('Sequelize').Op
const RequestRecoverance = require('../../modules/Draft/Recoverance/RequestRecoverance')


module.exports = class RequestBoard {

    constructor(server, socket) {
        // global variabels
        this.server = server
        this.socket = socket
  
        this.requestsController = require('../../controllers/requests.controller')(server)
        this.requestTimelineController = require('../../controllers/requests-timeline.controller')(server)
        this.requestRecoverance = new RequestRecoverance(server)

        //private
        this._defaultPosition = 65535
        this._transaction = null

        // functions
        this.setEventListeners()
    }

    /**
     * Events on Request Listeners
     */
    setEventListeners() {

        const vm = this
        const activeCompanyUserId = (vm.socket.user.activeCompanyUserId) ? vm.socket.user.activeCompanyUserId : _.first(vm.socket.user.companies)
        
       this.socket.on('request-board:request-recoverance', (evData) => {
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
                   vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardRequestRecoverance', draft)
               }).catch((err) => {
                   console.log('ERRO: REQUEST RECOVERANCE: ', err)
               })
           })
        })

        this.socket.on('request-board:load', () => {
            vm.socket.join('company/' + activeCompanyUserId + '/request-board') // subscribe user in your request-board's company channel

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
                    vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionCreate', {
                        data: section
                    })
                }).catch((err) => {
                    console.log(err)
                    vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionCreate', new Error(err))
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
                    vm.socket.emit('requestBoardSectionRemove', {
                        success: false,
                        message: "Você não pode remover uma seção que possui pedido(s)."
                    })
                }
                else {
                    vm.server.mongodb.Section.remove({
                        _id: evData.sectionId
                    }, function(){
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionRemove', {
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
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionMove', {
                                data: { location: 'first', section }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionMove', new Error(err))
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
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionMove', {
                                data: { location: 'last', section }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionMove', new Error(err))
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
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionMove', {
                            data: { location: 'middle', section }
                        })
                    }).catch((err) => {
                        console.log(err)
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardSectionMove', new Error(err))
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
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardCardMove', {
                                data: { location: 'first' }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardCardMove', new Error(err))
                        })
                    })
                    break;
                case "last":
                    vm.server.mongodb.Card.findOne({ section: evData.toSection }, {}, { sort: { position: -1 } }, function(err, lastCard) {
                        let position = vm._defaultPosition
                        if(lastCard) position += lastCard.position
                        vm.saveCard(evData.cardId, evData.toSection, position).then(() => {
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardCardMove', {
                                data: { location: 'last' }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardCardMove', new Error(err))
                        })
                    })
                    break;
                case "middle":
                    vm.server.mongodb.Card.find({ section: evData.toSection, _id: { $in: [evData.prevCard, evData.nextCard] } }, function(err, prevAndNextCard) {
                        prevAndNextCard.sort(function(a, b){return b.position - a.position})
                        const position = ( prevAndNextCard[0].position + prevAndNextCard[1].position ) / 2
                        vm.saveCard(evData.cardId, evData.toSection, position).then(() => {
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardCardMove', {
                                data: { location: 'middle' }
                            })
                        }).catch((err) => {
                            console.log(err)
                            vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardCardMove', new Error(err))
                        })
                    })
                    break;
                case "last-and-only":
                    console.log("last-and-only")
                    let position = vm._defaultPosition
                    vm.saveCard(evData.cardId, evData.toSection, position).then(() => {
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardCardMove', {
                            data: { location: 'last-and-only' }
                        })
                    }).catch((err) => {
                        console.log(err)
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardCardMove', new Error(err))
                    })
                    break;
            }
        }),

        /**
         * On change request's status
         */
        this.socket.on('request-board:request-timeline:change-status', (evData) => {

            return vm.server.mongodb.Card.findOne({ _id: evData.cardId }, {}, { sort: { position: 1 } }, function (err, card) {
               return card
            }).then((card) => {
                return new Promise ((resolve, reject) => {
                    this.setTransaction().then(() => {
                        const controller = new Controller({
                            request: {
                                id: card.requestId,
                                companyId: card.companyId
                            },
                            transaction: this._transaction
                        })
                        this.requestsController.getOne(controller).then((request) => {
                            const statusController = new Controller({
                                request: {
                                    id: request.id,
                                    data: {
                                        status: evData.status
                                    },
                                transaction: controller.transaction
                                }
                            })

                            this.requestsController.changeStatus(statusController).then(() => {
                                const timelineController = new Controller({
                                    request: {
                                        data: {
                                            requestId: request.id,
                                            status: evData.status,
                                            triggeredBy: vm.socket.user.id
                                        },
                                        transaction: controller.transaction
                                    }
                                })
                                this.requestTimelineController.changeStatus(timelineController).then((response) => {
                                    const data = {
                                        success: true,
                                        data: {
                                            triggeredBy: vm.socket.user.id,
                                            cardId: evData.id,
                                            status: response.status
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
                        })
                    })
                }).then((data) => {
                    this.commit().then(() => {
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardRequestTimelineChangeUser', data)
                    })
                }).catch((err) => {
                    this.rollback().then(() => {
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardRequestTimelineChangeStatus', err)
                    })
                })
            })
        })


        /**
         * On change request's user
         */
        this.socket.on('request-board:request-timeline:change-user', (evData) => {

            return vm.server.mongodb.Card.findOne({ _id: evData.cardId }, {}, { sort: { position: 1 } }, function (err, card) {
               return card
            }).then((card) => {
                return new Promise ((resolve, reject) => {
                    this.setTransaction().then(() => {
                        const controller = new Controller({
                            request: {
                                id: card.requestId,
                                companyId: card.companyId
                            },
                            transaction: this._transaction
                        })
                        this.requestsController.getOne(controller).then((request) => {
                            const userController = new Controller({
                                request: {
                                    id: request.id,
                                    data: {
                                        userId: evData.userId
                                    },
                                companyId: activeCompanyUserId,
                                transaction: controller.transaction
                                }
                            })

                            this.requestsController.changeUser(userController).then(() => {
                                const timelineController = new Controller({
                                    request: {
                                        data: {
                                            requestId: request.id,
                                            status: request.status,
                                            triggeredBy: vm.socket.user.id
                                        },
                                        transaction: controller.transaction
                                    }
                                })
                                this.requestTimelineController.changeStatus(timelineController).then((response) => {
                                    const data = {
                                        success: true,
                                        data: {
                                            triggeredBy: vm.socket.user.id,
                                            cardId: evData.id,
                                            status: response.status
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
                            }).catch((err) => {
                                reject(err)
                            })
                        })
                    })
                }).then((data) => {
                    this.commit().then(() => {
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardRequestTimelineChangeUser', data)
                    })
                }).catch((err) => {
                    this.rollback().then(() => {
                        vm.server.io.in('company/' + activeCompanyUserId + '/request-board').emit('requestBoardRequestTimelineChangeUser', err)
                    })
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

    setTransaction() {
        return new Promise((resolve,reject) => {
            return this.server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
                resolve(transaction)
            })
        })  
    }

    /**
     * Commit persistence
     */
    commit() {
        return new Promise((resolve, reject) => {
            console.log("Commit everything!");
            if (this._transaction) {
                this._transaction.commit();
            }
            resolve()
        })
    }

    
    /**
     * Rollback persistence
     */
    rollback() {
        return new Promise((resolve, reject) => {
            console.log("Just... Rollback...");
            if (this._transaction) {
                this._transaction.rollback();
            }
            resolve()
        })
    }
    

}