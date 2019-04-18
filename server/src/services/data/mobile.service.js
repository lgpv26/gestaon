import _ from "lodash"
import moment from "moment"
const Op = require("sequelize").Op

module.exports = server => {
    return {
        name: "data/mobile",
        actions: {

            queue(ctx) {
                const vm = this
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
                                        const path = await vm.path(obj)
                                        await vm.validDate(obj)
                         
                                        const action = await vm[path](_.assign(obj, {
                                                companyId: ctx.params.companyId,
                                                createdBy: ctx.params.user
                                            }),
                                            obj.actionDate)

                                            
                                        objReturn.push(action)

                                        resolve(action)
                                    }

                                    catch (err) {
                                        console.log(err, "catch try - queue mobile service")
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

                                                const message =  _.map(objReturn, (item) => {
                                                            return {
                                                                success: true,
                                                                data: item
                                                            }
                                                        })

                                                return ctx.call("socket.processedQueue", {
                                                    userId: ctx.params.user.id,
                                                    companyId: ctx.params.companyId,
                                                    data: message
                                                })
                                                .then(() => {
                                                    return resolve(message)
                                                })
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
                                                    if(index < offset){
                                                        return {
                                                            success: true,
                                                            data: objReturn[index]
                                                        }
                                                    }
                                                    else if(index == offset) {
                                                        return{
                                                            success: false,
                                                            message: err.message,
                                                            data: item
                                                        }
                                                    }
                                                    else {
                                                        return{
                                                            success: false,
                                                            data: item
                                                        }
                                                    }
                                                })

                                                resolve(dataResponse)
                                            })                                           

                                            return ctx.call("socket.processedQueue", {
                                                userId: ctx.params.user.id,
                                                companyId: ctx.params.companyId,
                                                data: response
                                            })
                                            .then(() => {
                                                return reject(response)
                                            })
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
            },

            changeStatusNew(ctx) {
                console.log(ctx.params.data)
                
            },

        },
        
        methods: {
            path(obj) {
                return new Promise((resolve, reject) => {
                    switch (obj.type) {
                        case "request": 
                            switch (obj.op) {
                                case "update-status":
                                    resolve("updateStatus")
                                break
                            }
                        break
                        default:
                            reject("Não foi possivel verificar o caminho da ação requisitada!")
                    }
                })
            },

            validDate(obj) {
                switch (obj.type) {
                    case "request":
                        return server.mysql.Request.findOne({
                            where: {
                                id: obj.id
                            }
                        }).then(request => {
                            if (!request) return Promise.reject("Request não encontrado")
                            console.log(request.dateUpdated, moment(obj.actionDate).toDate())
                            if (request.dateUpdated > moment(obj.actionDate).toDate()) return Promise.reject("Não é possivel realizar está ação! Pedido já foi alterado após essa ação offline!")
                            return Promise.resolve()
                        })
                        break
                    default:
                        return Promise.reject("Não foi possivel validar a data da alteração!")
                }
            },

            updateStatus(data, dateAction) {
                return new Promise(async (resolve, reject) => {

                    const requestWithTimeline = await server.broker.call('data/request.getOne', {
                        where: {
                            id: data.id,
                            companyId: data.companyId
                        },
                        include: [{
                            model: server.mysql.RequestTimeline,
                            as: "requestTimeline"
                        }]
                    })

                    if(!requestWithTimeline) return reject({id: data.id, tempId: data.tempId, Error: 'Request não encontrado!', actionDate: dateAction})
                    if(requestWithTimeline.userId !== data.createdBy.id) return reject({id: data.id, tempId: data.tempId, Error: 'Este request não está mais com o atendente!', actionDate: dateAction})
                    if((requestWithTimeline.status === 'finished' || requestWithTimeline.status === 'canceled')) return reject({id: data.id, tempId: data.tempId, Error: 'Este request está finalizado ou cancelado!', actionDate: dateAction})

                    requestWithTimeline.requestTimeline.sort((a,b) => {
                        return b.id - a.id
                    })

                    return server.sequelize.transaction((transaction) => {
                        return new Promise((resolve, reject) => {
                            async function save() {
                                try {

                                    const dataUpdate = await new Promise((resolve, reject) => {
                                        const updateData = {
                                            id: data.id,
                                            status: data.status,
                                            dateUpdated: moment(dateAction).toDate()
                                        }

                                        if (data.status === "finished") {
                                            _.set(updateData, "deliveredBy", data.createdBy.id) // quem entregou
                                            _.set(updateData, "finishedBy", data.createdBy.id) // quem finalizou
                                            _.set(updateData, "deliveredDate", moment(dateAction).toDate()) // Horário que foi feito a entrega
                                        }
                                        else {
                                            _.set(updateData, "deliveredBy", null) // quem entregou
                                            _.set(updateData, "finishedBy", null) // quem finalizou
                                            _.set(updateData, "deliveredDate", null) // Horário que foi feito a entrega
                                        }

                                        resolve(updateData)
                                    })

                                    const update = await server.broker.call('data/request.update', {
                                        data: dataUpdate,
                                        where: {
                                            id: data.id
                                        },
                                        transaction
                                    })

                                    const requestTimelineItem = await server.broker.call('data/request.createTimeline', {
                                        data: {
                                            requestId: data.id,
                                            triggeredBy: data.createdBy.id,
                                            companyId: data.companyId,
                                            action: 'update-status',
                                            userId: _.first(requestWithTimeline.requestTimeline).userId,
                                            status: data.status,
                                            dateCreated: moment(dateAction).toDate()
                                        },
                                        transaction
                                    })

                                    resolve({id: data.id, tempId: data.tempId, actionDate: data.actionDate, processedDate: requestTimelineItem.dateCreated, status: requestTimelineItem.status, requestTimelineItem})
                                }
                                catch(err){
                                    console.log(err)
                                    reject(err)
                                }
                            }
                            save()
                        })
                    
                    })
                    .then((result) => {
                        return resolve(result)
                    })
                    .catch((err) => {
                        console.log(err, "catch transaction no updateStatus in mobile service")
                        return reject(err)
                    })
                })
            }
        }
    }
}