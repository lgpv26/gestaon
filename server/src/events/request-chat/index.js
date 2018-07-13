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
            return vm.server.mongodb.Card.findOne({requestId: evData.requestId}, {}, { sort: { position: 1 } }, function (err, card) {
                return card
            }).then((card) => {
                if(!card) return vm.socket.instance.emit('request-chat:load', new EventResponse(new Error('Erro ao recuperar o Card!')))
                vm.socket.instance.join('company/' + vm.socket.activeCompany.id + '/request-chat/' + card.requestId + '/chat')

                    // if from database, call the service
                return vm.server.broker.call('socket.control', {
                    userId: vm.socket.user.id,
                    socketId: vm.socket.instance.id,
                    companyId: vm.socket.activeCompany.id
                }).then(() => {
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

                                        if(request.userId === vm.socket.user.id){
                                            vm.socket.instance.emit('request:unreadChatItemCountUpdate', new EventResponse({
                                                requestId: request.id,
                                                unreadChatItemCount: 0
                                            }))
                                        }
                                        
                                        vm.socket.instance.emit('request-board:chat', new EventResponse({
                                            cardId: card._id,
                                            unreadChatItemCount: 0
                                        }))
                                        
                                        return vm.socket.instance.emit('request-chat:load', new EventResponse(requestChatItems))
                                    
                                })                            
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
                
                return vm.server.broker.call('socket.control', {
                    userId: vm.socket.user.id,
                    socketId: vm.socket.instance.id,
                    companyId: vm.socket.activeCompany.id
                })
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
                        const room = _.get(vm.server.io.sockets.adapter.rooms, '[company/' + vm.socket.activeCompany.id + '/request-chat/' + card.requestId + '/chat]', 0)
                        let promises = []
                        let read = []

                        let responsableSocketRoomOnline = false

                        if(room){
                            _.forEach(_.keys(room.sockets),(socketId) => {
                                promises.push(new Promise((resolve, reject) => {
                                        this.server.redisClient.get("socket:" + socketId)
                                        .then((userId) => {
                                            if(!userId) return resolve()
                                            userId = parseInt(userId)

                                            if(userId === request.userId) responsableSocketRoomOnline = true
                                            if(userId !== requestChat.userId) read.push({requestChatItemId: requestChat.id, userId: userId})
                                            resolve()                                
                                        })
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
                                    attributes: ['id', 'userId', 'requestId'],
                                    include: [{
                                        model: vm.server.mysql.RequestChatItemRead,
                                        as: 'usersRead',
                                        attributes: ['id', 'userId']
                                    }]
                                }).then((chatItems) => {
                                    chatItems = JSON.parse(JSON.stringify(chatItems))

                                    vm.server.io.in('company/' + vm.socket.activeCompany.id + '/request-chat/' + card.requestId + '/chat').emit('request-chat:itemSend', new EventResponse( _.assign(requestChat, {tempId: evData.tempId})))
                                    const requestBoardRoom = _.get(vm.server.io.sockets.adapter.rooms, '[company/' + vm.socket.activeCompany.id + '/request-board]', {length: 0})

                                    if(requestBoardRoom.length){
                                        _.forEach(_.keys(requestBoardRoom.sockets), (socketId) => {
                                            return new Promise((resolve, reject) => {   
                                                this.server.redisClient.get("socket:" + socketId, (err, redisConsult) => {
                                                    if (err) {
                                                        resolve()
                                                    }
                                                    else {
                                                        if(!redisConsult) return resolve()
                                                        resolve(parseInt(redisConsult))
                                                    }
                                                })
                                            }).then((userId) => {
                                                if(!userId) return 
                                                
                                                const count = _.filter(_.filter(chatItems, (filter) => {
                                                    if(filter.userId !== userId) return filter
                                                }), (chat) => {
                                                    const read = _.find(chat.usersRead, {userId: userId})
                                                    if(!read) return chat
                                                })
           
                                                _.forEach(_.groupBy(count, 'requestId'), (chatUnread, requestId) => {
                                                    if(card.requestId === parseInt(requestId) && chatUnread.length){
                                                            vm.server.broker.call('socket.checkSocketId', {
                                                                userId: _.first(chatUnread).userId
                                                            }).then((userSocketId) => {
                                                                vm.server.io.sockets.sockets[userSocketId].in('company/' + vm.socket.activeCompany.id + '/request-board').emit('request-board:chat', new EventResponse({
                                                                    cardId: card._id,
                                                                    unreadChatItemCount: chatUnread.length
                                                                }))
                                                            })
                                                    }
                                                })
                                            })
                                        })
                                    }
                                    if(vm.socket.user.id !== request.userId){
                                        if(!responsableSocketRoomOnline){
                                            vm.server.broker.call('socket.checkSocketId', {
                                                userId: request.userId
                                            }).then((responsableSocketId) => {
                                                if(!responsableSocketId) return 
                                                const responsableChatUnread = _.filter(_.filter(chatItems, (filter) => {
                                                    if(filter.userId !== request.userId) return filter
                                                }), (chat) => {
                                                    const read = _.find(chat.usersRead, {userId: request.userId})
                                                    if(!read) return chat
                                                })
                                                vm.server.io.sockets.sockets[responsableSocketId].emit('request:unreadChatItemCountUpdate', new EventResponse({
                                                    requestId: request.id,
                                                    unreadChatItemCount: responsableChatUnread.length
                                                }))  
                                            })
                                        }

                                        let soundToSend = 'message1'
                                        if(evData.type === 'message'){
                                        }
                                        else if(evData.type === 'alert'){
                                            soundToSend = 'horn1'
                                        }
                                        else {
                                            soundToSend = 'deny2'
                                        }


                                        vm.server.broker.call("push-notification.push", {
                                            data: {
                                                userId: '' + request.userId,
                                                title: (evData.type === 'message' ) ? 'Nova mensagem no pedido #' + request.id + '.' : 'Um alerta foi enviado no pedido #' + request.id + '.',
                                                message: (evData.type === 'message' ) ? vm.socket.user.name + ': ' + _.truncate(requestChat.data, {
                                                    'length': 50,
                                                    'separator': ' ',
                                                    'omission': '...'
                                                }) : 'Abra a notificação para ver o chat',
                                                payload: {
                                                    type: 'request.chat',
                                                    itemType: evData.type,
                                                    id: '' + request.id
                                                },
                                                sound: soundToSend
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