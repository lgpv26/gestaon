import _ from "lodash"
import config from "~config"
import EventResponse from "../models/EventResponse"
import { base64encode, base64decode } from "nodejs-base64"
import moment from "moment"
import fs from "fs"
import ss from "socket.io-stream"
import { Op } from "sequelize"
import shortid from "shortid"
import pako from "pako"

module.exports = server => {
    return {
        name: "socket",

        actions: {
            control(ctx) {
                if (ctx.params.ignore) return Promise.resolve()

                return server.io.of("/").adapter.clientRooms(ctx.params.socketId, (err, rooms) => {
                    
                    if (err) return Promise.reject("erro no redis + socket io")

                    rooms.splice(0, 1)
                    
                    const index = _.indexOf(rooms, "company/" + ctx.params.companyId)
                    if (index !== -1) rooms.splice(index, 1)                    
                    if (!rooms.length) {
                        return server.redisClient.hdel("userId:" + _.toString(ctx.params.userId), "rooms", (err, res) => {
                            if (err) {
                                console.log("Erro no redis.")
                                return Promise.reject("Erro no redis.")
                            }
                            else {
                                return Promise.resolve()
                            }
                        })
                    }
                    else {
                        return server.redisClient.hmset("userId:" + ctx.params.userId, "rooms", rooms.toString(), (err, res) => {
                            if (err) {
                                console.log("Erro no redis.")
                                return Promise.reject("Erro no redis.")
                            }
                            else {
                                return Promise.resolve()
                            }
                        })
                    }
                })
            },

            consult(ctx) {
                return server.redisClient.hgetall(_.toString(ctx.params.key), (err, redisConsult) => {
                        if (err) {
                            return Promise.reject("Erro na consulta")
                        } 
                        else {
                            if (!redisConsult) return Promise.resolve()
                            return Promise.resolve(redisConsult)
                        }
                    })
            },

            async stream(ctx) {
                const socket = server.io.sockets.sockets[ctx.params.socketId]

                ss(socket).on(ctx.params.event, async (stream, data) => {
                    const importPromises = []
                    const where = {}

                    if (data && data.dateLastSynced) {
                        where.dateUpdated = {
                            [Op.gte]: moment(data.dateLastSynced).toDate()
                        }
                    }

                    // import requests
                    importPromises.push(server.mysql.Request.findAll({ where }))
                    importPromises.push(server.mysql.RequestClientAddress.findAll({ where }))
                    importPromises.push(server.mysql.RequestClientPhone.findAll({ where }))
                    importPromises.push(server.mysql.RequestOrder.findAll({ where }))
                    importPromises.push(server.mysql.RequestOrderProduct.findAll({ where }))
                    importPromises.push(server.mysql.RequestPayment.findAll({ where }))

                    // import clients
                    importPromises.push(server.mysql.Client.findAll({ where }))
                    importPromises.push(server.mysql.ClientAddress.findAll({ where }))
                    importPromises.push(server.mysql.ClientPhone.findAll({ where }))
                    importPromises.push(server.mysql.ClientCustomField.findAll({ where }))

                    // import necessary data
                    importPromises.push(server.mysql.User.findAll({ where }))
                    importPromises.push(server.mysql.Product.findAll({ where }))
                    importPromises.push(server.mysql.Device.findAll({
                        where,
                        include: [{
                            model: server.mysql.Position,
                            as: 'positions',
                            limit: 10,
                            order: [['dateCreated', 'DESC']]
                        }]
                    }))
                    importPromises.push(server.mysql.PromotionChannel.findAll({ where }))
                    importPromises.push(server.mysql.PaymentMethod.findAll({ where }))
                    importPromises.push(server.mysql.ClientGroup.findAll({ where }))
                    importPromises.push(server.mysql.CustomField.findAll({ where }))

                    // import addresses

                    importPromises.push(server.mysql.Address.findAll({
                        where: _.assign(where, {
                            city: {
                                [Op.or]: ["MARINGÁ", "SARANDI", "PAIÇANDU"]
                            }
                        })
                    }))

                    // resolve promises

                    await Promise.all(importPromises).then(([
                        requests,
                        requestClientAddresses,
                        requestClientPhones,
                        requestOrders,
                        requestOrderProducts,
                        requestPayments,

                        clients,
                        clientAddresses,
                        clientPhones,
                        clientCustomFields,

                        users,
                        products,
                        devices,
                        promotionChannels,
                        paymentMethods,
                        clientGroups,
                        customFields,

                        addresses
                    ]) => {
                        const fileName = shortid.generate()
                        const gzipJson = pako.gzip(JSON.stringify({
                            requests,
                            requestClientAddresses,
                            requestClientPhones,
                            requestOrders,
                            requestOrderProducts,
                            requestPayments,

                            clients,
                            clientAddresses,
                            clientPhones,
                            clientCustomFields,

                            users,
                            products,
                            devices,
                            promotionChannels,
                            paymentMethods,
                            clientGroups,
                            customFields,

                            addresses
                        }))

                        fs.writeFile("src/tmp/" + fileName + ".txt.gz", gzipJson, "utf8", (err) => {
                            if (err) {
                                console.log("Erro", err)
                            }
                            else {
                                const stats = fs.statSync("src/tmp/" + fileName + ".txt.gz")
                                const fileSize = stats["size"]

                                if (ctx.params.event === "import") {
                                    socket.emit("import", {
                                        fileName: fileName,
                                        fileExt: "gz",
                                        fileSize
                                    })
                                }
                                fs.createReadStream("src/tmp/" + fileName + ".txt.gz").pipe(stream)
                            }
                        })
                    })
                })
            },

            checkUserIdBySocketId(ctx){
                return server.redisClient.get("socket:" + ctx.params.socketId)
                .then((userId) => {
                    if(!userId) return Promise.resolve(null)
                    return Promise.resolve(parseInt(userId))
                })
            },

            checkSocketId(ctx){      
                return new Promise((resolve, reject) => { 
                    const checkSocketConfirm = function () {
                        return new Promise((resolve, reject) => {
                            async function start() {
                                try {
                                    var stream = server.redisClient.scanStream({
                                        match: "socket:*"
                                    })
                    
                                    stream.on("data", resultKeys => {
                                        if (resultKeys.length) {
                                            resultKeys.forEach((key, index) => {
                                                server.redisClient.get(_.toString(key), (err, res) => {
                                                    if (_.parseInt(res) === ctx.params.userId) return resolve(key.replace("socket:", ""))
                                                    if (resultKeys.length === index + 1) return resolve()
                                                })
                                            })
                                        }
                                    })
                                }

                                catch (err) {
                                    console.log(err)
                                    reject()
                                }
                            }

                            start()
                        })
                        .then((userSocketId) => {
                            if(!userSocketId) {
                                setTimeout(() => { 
                                    console.log("não confirmou o socket, tentando denovo...")
                                    checkSocketConfirm()
                                                    
                                }, 1000)
                            }
                            else {
                                return resolve(userSocketId)
                            }
                        })
                    }

                    checkSocketConfirm()
                })
            },

            streamRequestQueue(ctx){
                return new Promise((resolve, reject) => {
                
                    async function streamQueueStart() {
                        try {
                            let response

                            const data = ctx.params.data

                            if (data.error) {
                                response = new Error(JSON.stringify({
                                    triggeredBy: ctx.params.userId,
                                    processedQueue: data.data,
                                    offset: data.offset,
                                    error: data.errorMessage
                                }))
                            }
                            else {
                                response = {
                                    triggeredBy: data.userId,
                                    processedQueue: data.data
                                }
                            }

                            let userSocketId = await server.broker.call('socket.checkSocketId', {userId: ctx.params.userId})

                            console.log("Send to Socket:", userSocketId, " userId: ", ctx.params.userId, moment().toISOString(), ctx.params.messageID)
                            server.io.to(userSocketId).emit("request-queue:sync", new EventResponse(response))
                            
                            return resolve()
                        }
                        catch(err) {
                            console.log(err)
                            return reject()
                        }    
                   
                    }

                    streamQueueStart()
                })                
            },

            streamChatQueue(ctx){
                return new Promise((resolve, reject) => {
                
                    async function streamQueueStart() {
                        try {
                            let response

                            const data = ctx.params.data
    /*
                            // if (data.error) {
                            //     response = new Error(JSON.stringify({
                            //         triggeredBy: ctx.params.userId,
                            //         processedQueue: data.data,
                            //         offset: data.offset,
                            //         error: data.errorMessage
                            //     }))
                            // }
                            // else {
                            //     response = {
                            //         triggeredBy: data.userId,
                            //         processedQueue: data.data
                            //     }
                            // }
    */
                            const userSocketId = await server.broker.call('socket.checkSocketId', {userId: ctx.params.userId})
                            let promises = []

                            data.data.forEach((chat, index) => {
                                promises.push(new Promise( async (resolve, reject) => {
                                    const stremTo = await new Promise((resolve, reject) => {
                                        switch (chat.op) {
                                            case "open":
                                                resolve("request-chat:opened")
                                                break
                                            case "leave":
                                                resolve("request-chat:left")
                                                break
                                            case "send":
                                                resolve("request-chat:send")
                                            break
                                            default:
                                                reject("erro")
                                        }
                                    })

                                    console.log("Send to Socket:", userSocketId, " userId: ", ctx.params.userId, moment().toISOString(), ctx.params.messageID)
                                    server.io.to(userSocketId).emit(stremTo, new EventResponse(chat))
                                    resolve()
                                }))

                            })
                            await Promise.all(promises)
                            return resolve()
                        }
                        catch(err) {
                            console.log(err)
                            return reject()
                        }    
                   
                    }

                    streamQueueStart()
                })                
            },

            processedQueue(ctx) {
                //ctx.call("socket.streamRequestQueue", ctx.params)  

                let response

                if (ctx.params.error) {
                    response = new Error({
                        triggeredBy: ctx.params.userId,
                        processedQueue: ctx.params.data,
                        offset: ctx.params.offset,
                        error: ctx.params.errorMessage
                    })
                } 
                else {
                    response = {
                        triggeredBy: ctx.params.userId,
                        processedQueue: ctx.params.data
                    }
                }
                console.log("Processed Queue")
                //processedQueue
                server.io.in('company/' + ctx.params.companyId).emit("request-queue:sync", new EventResponse(response))
    
            },

            conected(ctx) {
                let promises = []
                promises.push(ctx.call("socket.presenceLoad", {
                        companyId: ctx.params.companyId,
                        activeSocketId: ctx.params.activeSocketId
                    })
                )

                promises.push(ctx.call("socket.requestBoardLoad", {
                        companyId: ctx.params.companyId,
                        activeSocketId: ctx.params.activeSocketId,
                        userId: ctx.params.userId
                    })
                )

                return Promise.all(promises)
            },

            requestBoardLoad(ctx) {
                //server.io.sockets.sockets[ctx.params.activeSocketId].join("company/" + ctx.params.companyId + "/request-board") // subscribe the user to its request-board company channel

                return ctx.call("socket.control", {
                        userId: ctx.params.userId,
                        socketId: ctx.params.activeSocketId,
                        companyId: ctx.params.companyId
                    })
                    .then(() => {
                        return ctx.call("request-board.load", {
                                data: {
                                    filter: base64encode(JSON.stringify({ deliveryDate: moment().startOf("day").toISOString() })),
                                    companyId: ctx.params.companyId
                                },
                                userId: ctx.params.userId
                            })
                            .then((sections) => {
                                server.io.sockets.sockets[ctx.params.activeSocketId].emit("requestBoardLoad", new EventResponse({ sections }))
                                return Promise.resolve()
                            })
                            .catch(err => {
                                //console.log('aquii', err)
                            })
                    })
            },

            presenceLoad(ctx) {
                const presenceRoom = _.get(server.io.sockets.adapter.rooms, "[company/" + ctx.params.companyId + "]", 0)

                let online = []

                if (presenceRoom) {
                    let promises = []
                    _.forEach(_.keys(presenceRoom.sockets), (socketId) => {
                        promises.push(new Promise((resolve, reject) => {
                                server.redisClient.get("socket:" + socketId)
                                .then((userId) => {
                                    if (!userId) return resolve()
                                    userId = parseInt(userId)

                                    return server.broker.call("data/user.getOne", {
                                            where: {
                                                id: userId
                                            },
                                            attributes: ["id", "name", "email"],
                                            include: [
                                                {
                                                    model: server.mysql.CompanyUser,
                                                    as: "userCompanies",
                                                    where: {
                                                        companyId: ctx.params.companyId
                                                    }
                                                }
                                            ]
                                        })
                                        .then((user) => {
                                            user = JSON.parse(JSON.stringify(user))
                                            _.set(user, "socketId", socketId)
                                            online.push(user)
                                            resolve()
                                        })
                                })
                            })
                        )
                    })

                    return Promise.all(promises)
                    .then(() => {
                        server.io.to(ctx.params.activeSocketId).emit("presence:load", new EventResponse(online))
                        return Promise.resolve(online)
                    })
                } 
                else {
                    return Promise.resolve(online)
                }
            },

            active(ctx) {
                return server.redisClient.set("socket:" + _.toString(ctx.params.activeSocketId), _.toString(ctx.params.userId), (err, res) => {
                        if (err) {
                            console.log("Erro no redis.")
                            return Promise.reject("Erro no redis.")
                        } 
                        else {
                            return Promise.resolve()
                        }
                    }
                )
            },

            cleanRedis(ctx) {
                var stream = server.redisClient.scanStream({
                    match: "socket:*"
                })

                const promises = []

                stream.on("data", resultKeys => {
                    if (resultKeys.length) {
                        resultKeys.forEach(key => {
                            promises.push(new Promise((resolve, reject) => {
                                    return server.redisClient.del(_.toString(key), (err, res) => {
                                        if (err) {
                                            console.log("Erro no redis, ao setar sockets.")
                                            return reject()
                                        } 
                                        else {
                                            return resolve()
                                        }
                                    })
                                })
                            )
                        })
                    }
                })
                return Promise.all(promises)
            },

            remove(ctx) {
                return server.redisClient.del(
                    "socket:" + _.toString(ctx.params.activeSocketId), (err, res) => {
                        if (err) {
                            console.log("Erro no redis.")
                            return Promise.reject("Erro no redis.")
                        } 
                        else {
                            return Promise.resolve()
                        }
                    }
                )
            }
        }
    }
}
