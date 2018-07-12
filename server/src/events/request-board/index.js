const _ = require('lodash')
const Controller = require('../../models/Controller')

const RequestRecoverance = require('../../modules/Draft/Recoverance/RequestRecoverance')
const EventResponse = require('~server/models/EventResponse')

const {PermissionError} = require('~errors')

module.exports = class RequestBoard {

    /**
     * Events emitted and received when user is connected in a company dashboard
     * @constructor
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
     * @private
     * Set listeners
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

        this.socket.instance.on('request-board:load', (evData) => {
            vm.socket.instance.join('company/' + vm.socket.activeCompany.id + '/request-board') // subscribe the user to its request-board company channel

            return vm.server.broker.call('socket.control', {
                userId: vm.socket.user.id,
                socketId: vm.socket.instance.id,
                companyId: vm.socket.activeCompany.id
            }).then(() => {
                vm.server.broker.call('request-board.load', {
                    data: {
                        filter: evData.filter || {},
                        companyId: vm.socket.activeCompany.id,
                    },
                    userId: vm.socket.user.id
                }).then((sections) => {

                    vm.socket.instance.emit('requestBoardLoad', new EventResponse({sections}))
                }).catch((err) => {
                    console.log(err)
                })
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
            vm.server.broker.call('request-board.moveCard', {
                data: {
                    location: evData.location,
                    companyId: vm.socket.activeCompany.id,
                    fromSection: evData.fromSection,
                    toSection: evData.toSection,
                    cardId: evData.cardId,
                    prevCard: evData.prevCard,
                    nextCard: evData.nextCard
                }
            }).then((cardMoveData) => {
                vm.socket.instance.emit('requestBoardCardUpdate', new EventResponse(cardMoveData.card))
                vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/request-board').emit('requestBoardCardMove', new EventResponse(cardMoveData))
            }).catch((err) => {
                vm.socket.instance.emit('requestBoardCardMove', new EventResponse(err))
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
                return vm.server.broker.call('data/request.getOne', {
                    where: {
                        id: parseInt(card.requestId),
                        companyId: parseInt(card.companyId)
                    },
                    include: [
                        {
                            model: vm.server.mysql.RequestTimeline,
                            as: "requestTimeline"
                        },
                        {
                            model: vm.server.mysql.RequestClientPhone,
                            as: "requestClientPhones"
                        },{
                            model: vm.server.mysql.RequestClientAddress,
                            as: "requestClientAddresses"
                        },{
                            model: vm.server.mysql.Client,
                            as: "client",
                            include: [{
                                model: vm.server.mysql.ClientPhone,
                                as: 'clientPhones'
                            }, {
                                model: vm.server.mysql.ClientAddress,
                                as: 'clientAddresses',
                                include: [{
                                    model: vm.server.mysql.Address,
                                    as: 'address'
                                }]
                            }, {
                                model: vm.server.mysql.ClientCustomField,
                                as: 'clientCustomFields',
                                include: [{
                                    model: vm.server.mysql.CustomField,
                                    as: 'customField'
                                }]
                            }, {
                                model: vm.server.mysql.ClientGroup,
                                as: 'clientGroup'
                            }]
                        },{
                            model: vm.server.mysql.RequestPayment,
                            as: "requestPayments",
                            include: [{
                                model: vm.server.mysql.PaymentMethod,
                                as: 'paymentMethod'
                            }]
                        },{
                            model: vm.server.mysql.RequestOrder,
                            as: "requestOrder",
                            include: [{
                                model: vm.server.mysql.RequestOrderProduct,
                                as: 'requestOrderProducts',
                                include: [{
                                    model: vm.server.mysql.Product,
                                    as: 'product'
                                }]
                            }]
                        }
                    ]
                }).then((request) => {
                    request.requestTimeline.sort((a,b) => {
                        return b.id - a.id
                    })
                    return vm.server.sequelize.transaction().then((transaction) => {
                        return vm.server.broker.call('data/request.update', {
                            data: {
                                status: evData.status
                            },
                            where: {
                                id: request.id
                            },
                            transaction: transaction
                        }).then(() => {                           
                            return vm.server.broker.call('data/request.createTimeline', {
                                data: {
                                    requestId: request.id,
                                    triggeredBy: vm.socket.user.id,
                                    companyId: card.companyId,
                                    action: 'status_change',
                                    userId: _.first(request.requestTimeline).userId,
                                    status: evData.status
                                },
                                transaction: transaction
                            }).then((requestTimelineItem) => {
                                transaction.commit().then(() => {
                                    vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('requestBoardRequestTimelineChangeStatus', new EventResponse({
                                        cardId: evData.cardId,
                                        requestTimelineItem
                                    }))
                                    if(evData.status === 'finished' || evData.status === 'canceled'){
                                        return vm.server.broker.call('request-board.removeCard', {
                                            data: {
                                                cardId: evData.cardId
                                            }
                                        }).then(() => {
                                            vm.server.broker.call("push-notification.push", {
                                                data: {
                                                    userId: request.userId,
                                                    title: 'O pedido #' + request.id + ' foi encerrado.',
                                                    sound: 'deny1',
                                                    message: 'Abra a notificação para ver mais detalhes',
                                                    payload: {
                                                        type: 'request.removed',
                                                        id: '' + request.id
                                                    }
                                                },
                                                notRejectNotLogged: true
                                            })
                                        })
                                    }
                                    else {
                                        vm.server.broker.call("push-notification.push", {
                                            data: {
                                                userId: request.userId,
                                                title: 'O Status do pedido #' + request.id + ' foi alterado.',
                                                message: 'Abra a notificação para ver mais detalhes',
                                                payload: {
                                                    type: 'request.changeStatus',
                                                    id: '' + request.id
                                                }
                                            },
                                            notRejectNotLogged: true
                                        })
                                    }
                                })                                
                            })
                        })
                    })
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
                return vm.server.broker.call('data/request.getOne', {
                    where: {
                        id: parseInt(card.requestId),
                        companyId: parseInt(card.companyId)
                    },
                    include: [
                        {
                            model: vm.server.mysql.RequestTimeline,
                            as: "requestTimeline"
                        },
                        {
                            model: vm.server.mysql.RequestClientPhone,
                            as: "requestClientPhones"
                        },{
                            model: vm.server.mysql.RequestClientAddress,
                            as: "requestClientAddresses"
                        },{
                            model: vm.server.mysql.Client,
                            as: "client",
                            include: [{
                                model: vm.server.mysql.ClientPhone,
                                as: 'clientPhones'
                            }, {
                                model: vm.server.mysql.ClientAddress,
                                as: 'clientAddresses',
                                include: [{
                                    model: vm.server.mysql.Address,
                                    as: 'address'
                                }]
                            }, {
                                model: vm.server.mysql.ClientCustomField,
                                as: 'clientCustomFields',
                                include: [{
                                    model: vm.server.mysql.CustomField,
                                    as: 'customField'
                                }]
                            }, {
                                model: vm.server.mysql.ClientGroup,
                                as: 'clientGroup'
                            }]
                        },{
                            model: vm.server.mysql.RequestPayment,
                            as: "requestPayments",
                            include: [{
                                model: vm.server.mysql.PaymentMethod,
                                as: 'paymentMethod'
                            }]
                        },{
                            model: vm.server.mysql.RequestOrder,
                            as: "requestOrder",
                            include: [{
                                model: vm.server.mysql.RequestOrderProduct,
                                as: 'requestOrderProducts',
                                include: [{
                                    model: vm.server.mysql.Product,
                                    as: 'product'
                                }]
                            }]
                        }
                    ]
                }).then((request) => {
                    request.requestTimeline.sort((a,b) => {
                        return b.id - a.id
                    })
                    return vm.server.sequelize.transaction().then((transaction) => {
                        return vm.server.broker.call('data/request.update', {
                            data: {
                                userId: evData.userId,
                                status: (_.first(request.requestTimeline).status === 'in-displacement') ? 'pending' : _.first(request.requestTimeline).status
                            },
                            where: {
                                id: request.id
                            },
                            transaction: transaction
                        }).then(() => {
                        return vm.server.broker.call('data/request.createTimeline', {
                            data: {
                                requestId: request.id,
                                triggeredBy: vm.socket.user.id,
                                companyId: card.companyId,
                                action: 'user_change',
                                userId: evData.userId,
                                status: (_.first(request.requestTimeline).status === 'in-displacement') ? 'pending' : _.first(request.requestTimeline).status
                            },
                            transaction: transaction
                        }).then((requestTimelineItem) => {
                            transaction.commit().then(() => {
                                    vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('requestBoardRequestTimelineChangeUser', new EventResponse({
                                        cardId: evData.cardId,
                                        requestTimelineItem
                                    }))
                                    vm.server.broker.call("push-notification.push", {
                                        data: {
                                            userId: evData.userId,
                                            title: 'Novo pedido #' + request.id,
                                            message: 'Abra a notificação para ver mais detalhes',
                                            payload: {
                                                type: 'request.create',
                                                id: '' + request.id
                                            }
                                        },
                                        notRejectNotLogged: true
                                    })
                                    vm.server.broker.call("push-notification.push", {
                                        data: {
                                            userId: request.userId,
                                            title: 'O pedido #' + request.id + ' foi passado a outro usuário.',
                                            message: 'Abra a notificação para ver mais detalhes',
                                            payload: {
                                                type: 'request.removed',
                                                id: '' + request.id
                                            },
                                            sound: 'deny1'
                                        },
                                        notRejectNotLogged: true
                                    })
                                })
                            })
                        })
                    }).catch((err) => {
                        console.log("Erro", err)
                    })
                })
            })
        })
    }

}