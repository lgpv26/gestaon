const _ = require('lodash')
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

        this._defaultPosition = 65535

        this._setListeners()
    }

    /**
     * @private
     * Set listeners
     */
    _setListeners() {

        const vm = this

        /**
         * Load the chat for the socket
         * @param {object} evData = { cardId:Number }
         */
        vm.socket.instance.on('request-chat:load', (evData) => {
            return vm.server.mongodb.Card.findOne({ _id: evData.cardId }, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                if(!card) return vm.socket.instance.emit('request-chat:load', new EventResponse(new Error('Erro ao recuperar o Card!')))
                _.set(card, 'chatUnRead', 0)
                card.save()
                vm.socket.instance.join('company/' + vm.socket.activeCompany.id + '/request-chat/' + card.requestId + '/chat')
                    // if from database, call the service
                    return vm.server.mysql.RequestChatItem.findAll({
                        where: {
                            requestId: parseInt(card.requestId)
                        },
                        order: [['dateCreated', 'DESC']],
                        include: [{
                            model: vm.server.mysql.User,
                            as: "user",
                            attributes: ['id', 'name','email','type']
                        }]        
                    }).then((requestChatItems) => {
                        vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('request-board:chat', new EventResponse({
                            cardId: evData.cardId,
                            chatUnRead: 0
                        }))
                        return vm.socket.instance.emit('request-chat:load', new EventResponse(requestChatItems))
                })
            })      
        })

        /**
         * Socket is leaving the chat, remove the socket from its listeners
         * @param {object} evData = { draftId:Number }
         */
        vm.socket.instance.on('request-chat:leave', (evData) => {
            return vm.server.mongodb.Card.findOne({ _id: evData.cardId }, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                if(!card) return vm.socket.instance.emit('request-chat:leave', new EventResponse(new Error('Erro ao recuperar o Card!')))
                vm.socket.instance.leave('company/' + vm.socket.activeCompany.id + '/request-chat/' + card.requestId + '/chat')
            })
        })

        /**
         * On send message
         */
        vm.socket.instance.on('request-chat:itemSend', (evData) => {
            return vm.server.mongodb.Card.findOne({ _id: evData.cardId }, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                if(!card) return vm.socket.instance.emit('request-chat:itemSend', new EventResponse(new Error('Erro ao recuperar o Card!')))
                
                    return vm.server.broker.call('data/request.sendChatItem', {
                        data: _.assign(evData,
                            {requestId: parseInt(card.requestId), 
                            userId: vm.socket.user.id})
                    }).then((requestChat) => {
                    vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-chat/' + card.requestId + '/chat').emit('request-chat:itemSend', new EventResponse(requestChat))
                    return vm.server.broker.call('data/request.getOne', {
                        where: {
                            id: parseInt(card.requestId),
                            companyId: parseInt(card.companyId)
                        }
                    }).then((request) => {
                        vm.server.broker.call("push-notification.push", {
                            data: {
                                userId: '' + request.userId,
                                title: (evData.type == 'message' ) ? 'Nova mensagem no pedido #' + request.id + '.' : 'Um alerta foi enviado no pedido #' + request.id + '.',
                                message: (evData.type == 'message' ) ? vm.socket.user.name + ': ' + _.truncate(requestChat.data, {
                                    'length': 50,
                                    'separator': ' ',
                                    'omission': '...'
                                  }) : 'Abra a notificação para ver mais detalhes',
                                payload: {
                                    type: 'request.chat',
                                    id: '' + request.requestId
                                },
                                sound: (evData.type == 'message' ) ? 'message1' : 'deny2'
                            },
                            notRejectNotLogged: true
                        })
                    })
                })
            })
        })

    }

}