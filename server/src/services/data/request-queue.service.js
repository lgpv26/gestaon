import _ from "lodash"
import moment from "moment"
const Op = require("sequelize").Op
import EventResponse from "~models/EventResponse"

module.exports = (server) => {
    return {
        name: "data/request-queue",
        actions: {

            start(ctx) {
                const vm = this
                if (ctx.params.data && ctx.params.data.length) {
                    //console.log(ctx.params)

                    let initialOffset = 0
                    let limitReached = false
                    const totalItemsLimit = ctx.params.data.length - 1

                    const mapIds = {}

                    const objReturn = []

                    return new Promise((resolve, reject) => {
                        const bunch = function (offset) {
                            console.log("Objeto index " + (offset + 1) + "/" + (totalItemsLimit + 1))

                            return new Promise((resolve, reject) => {
                                async function start() {
                                    let obj = ctx.params.data[offset]
                                    try {
                                        const objId = obj.data.id
                                        const path = await vm.path(obj)
                                        const checkId = await vm.checkId(obj, mapIds)

                                        delete obj.data.id
                                        if (checkId) obj.data.id = checkId

                                        // const params = await vm.checkParams(obj, mapIds)
                                        // if (params) obj.params = params

                                        obj.data = await vm.cleanTempIds(obj, mapIds)

                                        if (obj.data.id) await vm.validDate(obj)

                                        const newData = await vm.validParams(obj)
                                        if (newData) obj.data = newData

                                        const action = await ctx.call(path, {
                                            data: _.assign(obj.data, {
                                                companyId: ctx.params.companyId,
                                                createdBy: ctx.params.user
                                            }),
                                            date: obj.date
                                        })

                                        if (!checkId) _.set(mapIds, objId, action.id)
                                        if (obj.type == "request" && obj.op == "create") _.set(action, "tmpId", objId)

                                        objReturn.push(action)

                                        resolve(action)
                                    }

                                    catch (err) {
                                        console.log(err, "catch try - queue")
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
                                                    type: "request",
                                                    data: {
                                                        userId: ctx.params.userId,
                                                        companyId: ctx.params.companyId,
                                                        data: objReturn
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

                                                return Promise.all(promises)
                                                    .then(() => {
                                                        resolve()
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
                                    const message = JSON.stringify({
                                        type: "request",
                                        data: {
                                            userId: ctx.params.userId,
                                            companyId: ctx.params.companyId,
                                            data: objReturn,
                                            offset,
                                            errorMessage: err.message,
                                            error: true
                                        }
                                    })

                                    return server.mysql.Company.findOne({
                                        where: {
                                            id: ctx.params.companyId
                                        },
                                        include: [{
                                            model: server.mysql.CompanyUser,
                                            as: 'companyUsers'
                                        }]
                                    })
                                        .then((company) => {
                                            const companyUsers = JSON.parse(JSON.stringify(company.companyUsers))

                                            const promises = []

                                            companyUsers.forEach((companyUser) => {
                                                promises.push(vm.queueToUser(companyUser.userId, message))
                                            })

                                            return Promise.all(promises)
                                                .then(() => {
                                                    reject()
                                                })
                                        })
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
                        case "card":
                            switch (obj.op) {
                                case "create":
                                    resolve("request-board.createCard")
                                    break
                                case "move":
                                    resolve("request-board.moveCard")
                                    break
                                default:
                                    reject("Não foi possivel identificar a ação feita no Card!")
                            }
                            break
                        case "section":
                            switch (obj.op) {
                                case "create":
                                    resolve("request-board.createSection")
                                    break
                                case "move":
                                    resolve("request-board.moveSection")
                                    break
                                default:
                                    reject("Não foi possivel identificar a ação feita na Section!")
                            }
                            break
                        default:
                            switch (obj.op) {
                                case "create":
                                    resolve("data/request.start")
                                    break
                                case "update":
                                    resolve("data/request.start")
                                    break
                                case "update-user":
                                    resolve("data/request.updateUser")
                                    break
                                case "update-status":
                                    resolve("data/request.updateStatus")
                                    break
                                default:
                                    reject("Não foi possivel identificar a ação feita no Request!")
                            }
                    }
                })
            },

            checkId(obj, mapIds) {
                return new Promise((resolve, reject) => {
                    if (_.get(obj, "data.id") && _.isNumber(obj.data.id)) return resolve(obj.data.id)
                    if (_.includes(["update-user", "update-status"], obj.op)) return resolve(null)
                    if (obj.data.id.substring(0, 4) === "tmp/" && mapIds[obj.data.id]) return resolve(_.get(mapIds, obj.data.id))
                    if (obj.op == "create") return resolve(null)
                    else {
                        return reject("Não foi possível verificar o item!")
                    }
                })
            },

            checkParams(obj, mapIds) {
                if ((!_.get(obj, "params"), false)) return Promise.resolve(null)

                return new Promise((resolve, reject) => {
                    const promises = []

                    _.forEach(obj.params, (value, param) => {
                        promises.push(new Promise((resolve, reject) => {
                            if (_.get(obj, "params." + param) && _.isNumber(value)) return resolve()
                            if (value.substring(0, 4) === "tmp/" && mapIds[value]) {
                                _.set(obj.params, param, _.get(mapIds, value))
                                return resolve()
                            }
                            else {
                                _.set(obj.params, param, null)
                                resolve()
                            }
                        })
                        )
                    })
                    return Promise.all(promises)
                        .then(() => {
                            resolve(obj.params)
                        })
                })
            },

            cleanTempIds(obj, mapIds) {
                return new Promise((resolve, reject) => {
                    const promises = []

                    _.forEach(obj.data, (value, key) => {
                        promises.push(new Promise((resolve, reject) => {
                            if ((_.get(obj, "data." + key) && _.isNumber(value)) || key.substring(0, 1) === "$") return resolve()

                            if (key === "clientAddressId" || key === "clientPhoneId") return resolve()

                            if (typeof _.get(obj, "data." + key) == "object" && _.has(obj.data[key], "id") && !_.isNumber(obj.data[key].id)) {
                                if (obj.data[key].id.substring(0, 4) === "tmp/") {
                                    _.set(obj.data[key], "tmpId", obj.data[key].id)
                                    _.set(obj.data[key], "id", null)
                                }
                            }

                            if (typeof _.get(obj, "data." + key) != "object" && value.substring(0, 4) === "tmp/") {
                                if (mapIds[value]) {
                                    _.set(obj.data, key, _.get(mapIds, value))
                                    resolve()
                                }
                                else {
                                    _.set(obj.data, key, null)
                                    resolve()
                                }
                            }
                            else resolve()
                        })
                        )
                    })
                    return Promise.all(promises)
                        .then(() => {
                            return resolve(obj.data)
                        })
                })
            },

            validDate(obj) {
                if (obj.op === "create") return Promise.resolve()

                switch (obj.type) {
                    case "card":
                        return server.mysql.RequestCard.findOne({
                            where: {
                                id: parseInt(obj.data.id)
                            }
                        })
                            .then((card) => {
                                if (!card) return Promise.reject("Card não encontrado")

                                if (card.dateUpdated > moment(obj.date).toDate()) return Promise.reject("Não é possivel realizar está ação! Card já foi alterado após essa ação offline!")
                                return Promise.resolve()
                            })
                        break
                    case "section":
                        return server.mysql.RequestSection.findOne({
                            where: {
                                id: parseInt(obj.data.id)
                            }
                        }).then((section) => {
                            if (!section) return Promise.reject("Section não encontrado")

                            if (section.dateUpdated > moment(obj.date).toDate()) return Promise.reject("Não é possivel realizar está ação! Section já foi alterado após essa ação offline!")
                            return Promise.resolve()
                        })
                        break
                    case "request":
                        return server.mysql.Request.findOne({
                            where: {
                                id: parseInt(obj.data.id)
                            }
                        }).then(request => {
                            if (!request) return Promise.reject("Request não encontrado")
                            if (request.dateUpdated > moment(obj.date).toDate()) return Promise.reject("Não é possivel realizar está ação! Request já foi alterado após essa ação offline!")
                            return Promise.resolve()
                        })
                        break
                    default:
                        return Promise.reject("Não foi possivel validar a data da alteração!")
                }
            },

            validParams(obj) {
                if ((!_.get(obj, "params"), false)) return Promise.resolve(null)

                return new Promise((resolve, reject) => {
                    const promises = []

                    _.forEach(obj.params, (value, key) => {
                        promises.push(new Promise((resolve, reject) => {
                            if (!value) return resolve()

                            _.set(obj.data, key, value)
                            return resolve()
                        })
                        )
                    })

                    return Promise.all(promises).then(() => {
                        resolve(obj.data)
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
