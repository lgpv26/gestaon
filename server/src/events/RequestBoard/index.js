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

        /*this.requestsController.getAll(new Controller()).then((requests) => {
            console.log(requests)
        }).catch((err) => {
            console.log(err)
        })*/

        this.initializeRequestBoard()

        // functions
        this.setEventListeners()
    }

    /**
     * Emits initial data to request-board
     */
    initializeRequestBoard(){

        const vm = this

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
            vm.server.mysql.Request.findAll({
                where: {
                    id: cardsRequestsIds
                },
                include: [{
                    model: vm.server.mysql.Client,
                    as: 'client'
                }],
            }).then((requests) => {
                sections = JSON.parse(JSON.stringify(sections))
                sections = _.map(sections, (section) => {
                    _.map(section.cards, (card) => {
                        card.request = _.find(requests, {
                            id: card.requestId
                        })
                        return card
                    })
                    return section
                })
                vm.socket.emit('requestBoardSections', {
                    data: sections
                })
            }).catch((err) => {
                console.log(err)
            });
        })

    }

    /**
     * Events on Request Listeners
     */
    setEventListeners() {

        const vm = this

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
            /*
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
            */
        })

    }

}