import _ from "lodash"
const Op = require("sequelize").Op
import EventResponse from "~models/EventResponse"

module.exports = (server) => {
    return {
        name: "data/chat-queue",
        actions: {

            start(ctx) {
                const vm = this

                const companyId = ctx.params.companyId
                const triggeredBy = ctx.params.user

                if (ctx.params.data && ctx.params.data.length) {
                    //console.log(ctx.params)

                    let initialOffset = 0
                    let limitReached = false
                    const totalItemsLimit = ctx.params.data.length - 1

                    const objReturn = []

                    return new Promise((resolve, reject) => {
                        const bunch = function (offset) {
                            console.log("Objeto index " + (offset + 1) + "/" + (totalItemsLimit + 1))

                            return new Promise((resolve, reject) => {
                                async function start() {
                                    let obj = ctx.params.data[offset]
                                    try {
                                        const fnc = await vm.path(obj) // send
                                        const checkId = await vm.checkId(obj) // 221

                                        if(!checkId) {
                                            await vm.awaitRequest(obj, companyId, triggeredBy)
                                            return resolve()
                                        }

                                        const tmpId = obj.data.id
                                        delete obj.data.id

                                        _.set(obj.data, "requestId", checkId)
                                        _.set(obj.data, "dateCreated", obj.date)

                                        /*console.log("Chegou 1/3", obj.data)
                                        console.log("Chegou 2/3", companyId)
                                        console.log("Chegou 3/3", triggeredBy)*/

                                        const chat = await vm[fnc](obj.data, companyId, triggeredBy)
                                        
                                        _.set(chat, "tmpId", tmpId)
                                        _.set(chat, "type", obj.type)

                                        objReturn.push(chat)

                                        resolve(objReturn)

                                    }
                                    catch (err) {
                                        console.log(err, "catch try - chat queue")
                                        reject(err)
                                    }
                                }

                                start()
                            })
                                .then(() => {
                                    offset++
                                    if (totalItemsLimit && !limitReached) {
                                        if (totalItemsLimit - offset === 0) limitReached = true
                                        bunch(offset)
                                    }
                                    else {
                                        async function finish() {
                                            try {
                                                console.log("Sincronização concluida! Total: ", offset)

                                                const message = JSON.stringify({
                                                    type: "chat",
                                                    data: {
                                                        userId: ctx.params.userId,
                                                        companyId: ctx.params.companyId,
                                                        data: _.map(objReturn, (item) => {
                                                            const op = item.op
                                                            delete item.op

                                                            return {
                                                                success: true,
                                                                data: item,
                                                                op
                                                            }
                                                        })
                                                    }
                                                })

                                                const company = await server.mysql.Company.findOne({
                                                    where: {
                                                        id: ctx.params.companyId
                                                    },
                                                    include: [{
                                                        model: server.mysql.CompanyUser,
                                                        as: 'companyUsers'
                                                    }]
                                                })

                                                const companyUsers = JSON.parse(JSON.stringify(company.companyUsers))

                                                const promises = []

                                                companyUsers.forEach(async (companyUser) => {
                                                    await vm.checkUserQueue(companyUser.userId)
                                                    promises.push(await vm.queueToUser(companyUser.userId, message))
                                                })

                                                await Promise.all(promises)

                                                return resolve()
                                            }

                                            catch (err) {
                                                console.log(err, "catch try - queue")
                                                reject(err)
                                            }
                                        }

                                        finish()
                                    }
                                })
                                .catch((err) => {
                                    async function finishWithError() {
                                        try {
                                            const response = await new Promise((resolve, reject) => {
                                                let dataResponse = _.map(ctx.params.data, (item, index) => {
                                                    const op = item.op
                                                    delete item.op

                                                    if(index < offset){
                                                        return {
                                                            success: true,
                                                            data: item,
                                                            op
                                                        }
                                                    }
                                                    else if(index == offset) {
                                                        return{
                                                            success: false,
                                                            message: err.message,
                                                            data: item,
                                                            op
                                                        }
                                                    }
                                                    else {
                                                        return{
                                                            success: false,
                                                            data: item,
                                                            op
                                                        }
                                                    }
                                                })

                                                resolve(dataResponse)
                                            })

                                            const message = JSON.stringify({
                                                type: "chat",
                                                data: {
                                                    userId: ctx.params.userId,
                                                    companyId: ctx.params.companyId,
                                                    data: response
                                                }
                                            })

                                            const company = await server.mysql.Company.findOne({
                                                where: {
                                                    id: ctx.params.companyId
                                                },
                                                include: [{
                                                    model: server.mysql.CompanyUser,
                                                    as: 'companyUsers'
                                                }]
                                            })

                                            const companyUsers = JSON.parse(JSON.stringify(company.companyUsers))

                                            const promises = []

                                            companyUsers.forEach(async (companyUser) => {
                                                await vm.checkUserQueue(companyUser.userId)

                                                promises.push(await vm.queueToUser(companyUser.userId, message))
                                            })

                                            await Promise.all(promises)
                                            
                                            return resolve()
                                        }

                                        catch (err) {
                                            console.log(err, "catch try - queue")
                                            reject(err)
                                        }
                                    }

                                    finishWithError()
                                })

                        }

                        bunch(initialOffset)
                    })
                }
            }
        },

        methods: {
            path(obj) {
                return new Promise((resolve, reject) => {
                    switch (obj.type) {
                        case "request":
                            switch (obj.op) {
                                case "chat-open":
                                    resolve("open")
                                    break
                                case "chat-leave":
                                    resolve("leave")
                                    break
                                // case "chat-load":
                                //     resolve("load")
                                //     break
                                case "chat-send":
                                    resolve("send")
                                    break
                                default:
                                    reject("Não foi possivel identificar a ação feita no chat!")
                            }
                            break
                        default:
                            console.log("Erro ao definir o tipo de chat!")
                            reject("Erro ao definir o tipo de chat!")
                    }
                })
            },
            checkId(obj) {
                return new Promise((resolve, reject) => {
                    if (_.get(obj, "data.requestId") && _.isNumber(obj.data.requestId)) return resolve(obj.data.requestId)
                    if (obj.data.requestId.substring(0, 4) === "tmp/") {
                        server.redisClient.get(obj.data.requestId.replace("/", ":"), (err, res) => {
                            if(!res) resolve(null)
                            resolve(parseInt(res))
                        })
                    }
                    else {
                        return reject("Não foi possível verificar o Request para onde irá essa mensagem!")
                    }
                })
            },
            awaitRequest(obj, companyId, triggeredBy){
                const vm = this
                return new Promise((resolve, reject) => {
                    async function start() {
                        await vm.chatInRedis(obj)
                        await vm.setCronJob(obj, companyId, triggeredBy)
                        return resolve()
                    }
                    
                    start()
                })
                
            },
            chatInRedis(obj){
                return server.redisClient.get("chat:" + _.toString(obj.data.requestId), (err, res) => {
                    if(res) {
                        res = JSON.parse(res)
                        res.push(obj)
                    }
                    else{
                        res = [obj]
                    }

                    return server.redisClient.set("chat:" + _.toString(obj.data.requestId), JSON.stringify(res), (err, res) => {
                        if (err) {
                            console.log("Erro no redis.")
                            return Promise.reject("Erro no redis.")
                        } 
                        else {
                            return Promise.resolve()
                        }
                    })
                })
            },

            setCronJob(obj, companyId, triggeredBy){
                return new Promise((resolve, reject) => {
                    async function start(){
                        const cronJob = await server.broker.call("cronJob.consult", {cronJobName: obj.data.requestId})
                        if(!cronJob) await server.broker.call("cronJob.saveRedis", {cronJobName: obj.data.requestId, companyId, triggeredBy})
                        
                        if(await server.broker.call("cronJob.checkJob", {cronJobName: obj.data.requestId})) return resolve()

                        server.broker.call("cronJob.createChatJob", {cronJobName: obj.data.requestId, companyId, triggeredBy})

                        await server.broker.call("cronJob.start", {cronJobName: obj.data.requestId})
                        
                        resolve()
                    }
                    start()                        
                })
                

            },
            open(data, companyId, triggeredBy){
                //console.log(data)

                return server.broker.call("socket.checkSocketId", {userId: triggeredBy.id})
                .then( async (socketId) => {
                    server.io.sockets.sockets[socketId].join('company/' + companyId + '/request/' + data.requestId + '/chat')
                    // if from database, call the service
                    await server.broker.call('socket.control', {
                        userId: triggeredBy.id,
                        socketId: socketId,
                        companyId: companyId
                    })

                    const requestChatItems = await server.mysql.RequestChatItem.findAll({
                                where: {
                                    requestId: data.requestId,
                                    userId: {
                                        [Op.notIn]: [triggeredBy.id]
                                    },
                                    dateCreated: {
                                        [Op.lte]: data.dateCreated
                                    }
                                },
                                order: [['dateCreated', 'ASC']],
                                include:[{
                                    model: server.mysql.RequestChatItemRead,
                                    as: "usersRead"
                                }]
                            })
                            .then((resultChatItems) =>{
                                return JSON.parse(JSON.stringify(resultChatItems))
                            })

                            const read = await Promise.all(_.map(_.filter(requestChatItems, (chat) => {
                                            if(chat.usersRead && !_.some(chat.usersRead, ['userId', triggeredBy.id])) return chat
                                        }), (chatItem) => {
                                        return {requestChatItemId: chatItem.id, userId: triggeredBy.id}
                                    }))

                            await server.mysql.RequestChatItemRead.bulkCreate(read)     

                            server.io.sockets.sockets[socketId].emit('request-chat:updateReadChatItems', new EventResponse({
                                requestId: data.requestId,
                                readChatItemsId: _.map(read, "requestChatItemId")
                            }))

                            const chat = {op: "open", requestId: data.requestId}

                            return chat

                            return server.io.sockets.sockets[socketId].emit('request-chat:opened', new EventResponse(read))
                })

            },
            leave(data, companyId, triggeredBy){
                return server.broker.call("socket.checkSocketId", {userId: triggeredBy.id})
                .then( async (socketId) => {
                    server.io.sockets.sockets[socketId].leave('company/' + companyId + '/request/' + data.requestId + '/chat')

                    await server.broker.call('socket.control', {
                        userId: triggeredBy.id,
                        socketId: socketId,
                        companyId: companyId
                    })

                    const chat = {op: "leave", requestId: data.requestId}

                    return chat

                    return server.io.sockets.sockets[socketId].emit('request-chat:left')
                })
            },
            send(data, companyId, triggeredBy){
                const vm = this
                return new Promise((resolve, reject) => {
                    async function sendMessage() {
                        _.set(data, "companyId", companyId)

                        const requestChat = await vm.sendChatItem(data)

                        const request = await server.broker.call('data/request.getOne', {
                            where: {
                                id: requestChat.requestId,
                                companyId
                            }
                        })

                        const checkOnline = await vm.checkOnline(requestChat, companyId, request)

                        if(checkOnline.read.length) await server.mysql.RequestChatItemRead.bulkCreate(checkOnline.read)

                        server.io.in('company/' + companyId + '/request/' + request.requestId + '/chat').emit('request-chat:itemSend', new EventResponse(requestChat))

                        const allChatItems = await server.mysql.RequestChatItem.findAll({
                            where: {
                                requestId: request.id
                            },
                            order: [['dateCreated', 'ASC']],
                            attributes: ['id', 'userId', 'requestId'],
                            include: [{
                                model: server.mysql.RequestChatItemRead,
                                as: 'usersRead',
                                attributes: ['id', 'userId']
                            }]
                        })
                        .then((chats) => {
                            return JSON.parse(JSON.stringify(chats))
                        })

                        await vm.updateUsersOutChat(companyId, request, allChatItems)

                        // if(triggeredBy.id !== request.userId) await vm.pushNotification(checkOnline, allChatItems, request, requestChat, triggeredBy)

                        _.set(requestChat, "op", "send")

                        resolve(requestChat)

                    }
                    sendMessage()
                })
            },

            pushNotification(checkOnline, allChatItems, request, chatItem, triggeredBy){
                return new Promise((resolve, reject) => {
                    async function start() {
                        if(!checkOnline.responsableSocketRoomOnline){
                            
                            const responsableSocketId = await server.broker.call('socket.checkSocketId', {
                                userId: request.userId
                            })

                            if(!responsableSocketId) return

                            const unRead = _.filter(allChatItems, (chat) => {
                                if(chat.userId !== triggeredBy.id  && !_.some(chat.usersRead, ['userId', triggeredBy.id])) return chat
                            })    
                            /// VER NOME DO EVENTO E DADOS 
                            server.io.sockets.sockets[responsableSocketId].emit('request:unreadChatItemCountUpdate', new EventResponse({
                                requestId: request.id,
                                unreadChatItemCount: unRead.length
                            })) 
                            // ATÉ AQUI
                        }

                        let soundToSend = 'message1'
                        if(chatItem.type === 'message'){
                        }
                        else if(chatItem.type === 'alert'){
                            soundToSend = 'horn1'
                        }
                        else {
                            soundToSend = 'deny2'
                        }

                        server.broker.call("push-notification.push", {
                            data: {
                                userId: '' + request.userId,
                                title: (chatItem.type === 'message' ) ? 'Nova mensagem no pedido #' + request.id + '.' : 'Um alerta foi enviado no pedido #' + request.id + '.',
                                message: (chatItem.type === 'message' ) ? triggeredBy.name + ': ' + _.truncate(chatItem.data, {
                                    'length': 50,
                                    'separator': ' ',
                                    'omission': '...'
                                }) : 'Abra a notificação para ver o chat',
                                payload: {
                                    type: 'request.chat',
                                    itemType: chatItem.type,
                                    id: '' + request.id
                                },
                                sound: soundToSend
                            },
                            notRejectNotLogged: true
                        }) 
                    }

                    start()
                })
            },

            updateUsersOutChat(companyId, request, allChatItems){
                return new Promise((resolve, reject) => {
                    async function start() {
                        const requestBoardRoom = _.get(server.io.sockets.adapter.rooms, '[company/' + companyId + '/request-board]', 0)
                        if(!requestBoardRoom.length) return resolve()

                        let promises = []

                        _.forEach(_.keys(requestBoardRoom.sockets), (socketId) => {
                            promises.push(new Promise((resolve, reject) => {
                                async function each() {
                                    const userId = await server.broker.call("socket.checkUserIdBySocketId", {socketId})

                                    if(!userId) return resolve()
                                
                                    const unRead = _.filter(allChatItems, (chat) => {
                                        if(chat.userId !== userId  && !_.some(chat.usersRead, ['userId', userId])) return chat
                                    })

                                    if(_.isArray(unRead) && !unRead.length) return resolve()

                                    _.forEach(_.groupBy(unRead, 'requestId'), (chatUnread, requestId) => {
                                        if(request.id !== parseInt(requestId) && !chatUnread.length) return resolve()
                                        server.io.sockets.sockets[socketId].in('company/' + companyId + '/request-board').emit('request-board:chat', new EventResponse({
                                            requestId: request.id,
                                            unreadChatItemCount: chatUnread.length
                                        }))
                                        resolve()
                                    })
                                }
                                each()
                            }))
                        })

                        await Promise.all(promises)

                        return resolve()
                    }
                start()
                })
            },

            checkOnline(requestChat, companyId, request){
                return new Promise((resolve, reject) => {
                    const room = _.get(server.io.sockets.adapter.rooms, '[company/' + companyId + '/request/' + request.id + '/chat]', 0)
                    let promises = []
                    let read = []
    
                    let responsableSocketRoomOnline = false
    
                    if(room){
                        _.forEach(_.keys(room.sockets),(socketId) => {
                            promises.push(new Promise((resolve, reject) => {
                                    server.redisClient.get("socket:" + socketId)
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
                    return Promise.all(promises)
                    .then(() => {
                        return resolve({read, responsableSocketRoomOnline})
                    })
                })                
            },

            sendChatItem(data){
                return server.mysql.RequestChatItem.create(data)
                .then((createChat) => {
                    return server.mysql.RequestChatItem.findByPk(createChat.id, {
                        include: [{
                            model: server.mysql.User,
                            as: "user",
                            attributes: ['id', 'name','email','type']
                        }]
                    })
                    .then((chatItem) => {
                        return JSON.parse(JSON.stringify(chatItem))
                    })
               })
            },

            queueToUser(userId, message) {
                return server.rsmq.sendMessage({ qname: 'userId-' + userId, message })
                    .then(() => {
                        return Promise.resolve()
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            },

            checkUserQueue(userId) {
                return new Promise((resolve, reject) => {
                    return server.rsmq.listQueues()
                        .then((queues) => {
                            if (_.includes(queues, "userId-" + userId)) return resolve()
                            return server.rsmq.createQueue({ qname: "userId-" + userId, maxsize: -1 })
                                .then(() => {
                                    console.log("queue userId:" + userId + " created")
                                    return resolve()
                                })

                        })
                        .catch((err) => console.log(err))
                })

            }
            
        }
    }
}
