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
    constructor(server, socket, connectedSocketList) {
        // global variabels
        this.server = server
        this.socket = socket

        this.connectedSocketList = connectedSocketList

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
            return vm.server.mongodb.Card.findOne({requestId: evData.requestId}, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                if(!card) return vm.socket.instance.emit('request-chat:load', new EventResponse(new Error('Erro ao recuperar o Card!')))
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
                        let read =[]
                        let promise = []

                        requestChatItems.forEach((chatItem) => {
                            promise.push(vm.server.mysql.RequestChatItemRead.findOne({
                                    where: {
                                        userId: vm.socket.user.id,
                                        requestChatItemId: chatItem.id
                                    }
                                }).then((chat) => {
                                    if(!chat && chatItem.userId !== vm.socket.user.id) read.push({requestChatItemId: chatItem.id, userId: vm.socket.user.id})
                                })
                            )
                        })

                        return Promise.all(promise).then(() => {
                            return vm.server.mysql.RequestChatItemRead.bulkCreate(read)
                            .then(() => {
                                return vm.server.mysql.Request.findOne({
                                    where: {
                                        id: parseInt(card.requestId)
                                    },
                                    attributes: ['id','userId']
                                }).then((request) => {
                                    if(request.userId !== vm.socket.user.id){
                                        vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('request-board:chat', new EventResponse({
                                            cardId: card._id,
                                            unreadChatItemCount: 0
                                        }))
                                        return vm.socket.instance.emit('request-chat:load', new EventResponse(requestChatItems))
                                    }
                                    else{
                                        vm.socket.instance.emit('request:unreadChatItemCountUpdate', new EventResponse({
                                            requestId: request.id,
                                            unreadChatItemCount: 0
                                        }))
                                        return vm.socket.instance.emit('request-chat:load', new EventResponse(requestChatItems))
                                    }
                            })                            
                        })                       
                    })   
                })
            })      
        })

        /**
         * Socket is leaving the chat, remove the socket from its listeners
         * @param {object} evData = { draftId:Number }
         */
        vm.socket.instance.on('request-chat:leave', (evData) => {
            return vm.server.mongodb.Card.findOne({requestId: evData.requestId}, {}, { sort: { position: 1 } }, function (err, card) {
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
            return vm.server.mongodb.Card.findOne({requestId: evData.requestId}, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                if(!card) return vm.socket.instance.emit('request-chat:itemSend', new EventResponse(new Error('Erro ao recuperar o Card!')))

                    return vm.server.broker.call('data/request.sendChatItem', {
                        data: _.assign(evData,
                            {requestId: parseInt(card.requestId),
                            userId: vm.socket.user.id})
                    }).then((requestChat) => {
                    requestChat = JSON.parse(JSON.stringify(requestChat))

                    return vm.server.broker.call('data/request.getOne', {
                        where: {
                            id: parseInt(card.requestId),
                            companyId: parseInt(card.companyId)
                        }
                    }).then((request) => {
                        request = JSON.parse(JSON.stringify(request))
                        const room = _.get(vm.server.io.sockets.adapter.rooms, '[company/' + vm.socket.activeCompany.id + '/request-chat/' + card.requestId + '/chat]', {length: 0})
                        let promises = []
                        let read = []

                        let chatRoomOnline = false
                        
                        if(room.length){
                            _.forEach(_.keys(room.sockets),(socketId) => {
                                const socket = this.connectedSocketList[socketId]

                                if(socket.user.id === request.userId) chatRoomOnline = true

                                promises.push(new Promise((resolve, reject) => {
                                        if(socket.user.id !== requestChat.userId) resolve({requestChatItemId: requestChat.id, userId: socket.user.id})
                                        resolve()
                                    }).then((response) => {
                                        if(response) return read.push(response)
                                    })
                                )
                            })
                        }

                        return Promise.all(promises).then(() => {
                            return vm.server.mysql.RequestChatItemRead.bulkCreate(read)
                            .then(() => {
                                return vm.server.mysql.RequestChatItem.findAll({
                                    where: {
                                        requestId: request.id
                                    },
                                    attributes: ['id'],
                                    include: [{
                                        model: vm.server.mysql.RequestChatItemRead,
                                        as: 'usersRead'
                                    }]
                                }).then((chatItems) => {
                                    chatItems = JSON.parse(JSON.stringify(chatItems))
                                    const count = _.filter(chatItems, (chat) => {
                                        if(!chat.usersRead.length) return chat
                                    })
                                    vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-chat/' + card.requestId + '/chat').emit('request-chat:itemSend', new EventResponse( _.assign(requestChat, {tempId: evData.tempId})))

                                    if(count && vm.socket.user.id === request.userId) {
                                            vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-board').emit('request-board:chat', new EventResponse({
                                            cardId: card._id,
                                            unreadChatItemCount: count.length
                                        }))
                                    }
                                        
                                    if(vm.socket.user.id !== request.userId){

                                        if(!chatRoomOnline){
                                            const socket = _.find(this.connectedSocketList, (connected) => {
                                                return connected.user.id === request.userId
                                            })
                                            if(socket){
                                                socket.instance.emit('request:unreadChatItemCountUpdate', new EventResponse({
                                                    requestId: request.id,
                                                    unreadChatItemCount: count.length
                                                }))
                                            }
                                            
                                        }

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
                                    }
                                })
                            })
                        })     
                    })
                })
            })
        })

    }

}