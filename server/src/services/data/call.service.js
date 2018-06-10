import _ from 'lodash'
const Op = require('sequelize').Op
import EventResponse from '~models/EventResponse'

module.exports = (server) => { return {
    name: "data/call",
    actions: {
        getOne(ctx) {
            return server.mongodb.Call.findOne({
                _id: ctx.params.data.id,
                companyId: ctx.params.data.companyId
            }).then((data) => {
                return data.toJSON()
            })
        },
        getList(ctx){
            return server.mongodb.Call.find({
                // companyId: ctx.params.data.companyId
            }).sort({createdAt: -1}).limit(10).exec().then((data) => {
                return JSON.parse(JSON.stringify(data))
            }).then((calls) => {
                if(_.isArray(calls) && calls.length > 0){
                    const phoneNumbers = _.map(calls, (call) => {
                        return call.number
                    })
                    return server.mysql.ClientPhone.findAll({
                        where: {
                            number: {
                                [Op.in]: phoneNumbers
                            }
                        },
                        include: [
                            {
                                model: server.mysql.Client,
                                as: "client"
                            }
                        ]
                    }).then((data) => {
                        return JSON.parse(JSON.stringify(data))
                    }).then((clientPhones) => {
                        return _.map(calls, (call) => {
                            call.clients = []
                            _.forEach(clientPhones, (clientPhone) => {
                                if(clientPhone.number === call.number){
                                    const alreadyAddedToClients = _.find(call.clients, {id: clientPhone.clientId})
                                    if(!alreadyAddedToClients){
                                        call.clients.push(clientPhone.client)
                                    }
                                }
                            })
                            return call
                        })
                    })
                }
                return []
            })
        },
        create(ctx){

            // remove leading 0 if there is
            let number = ctx.params.data.number
            let isValid = true
            let isAnonymous = false

            if(number.charAt(0) === '0'){
                number = number.substring(1)
            }

            if(number === 'anonymous'){
                number = null
                isAnonymous = true
            }

            if(number.length !== 11 && number.length !== 10){
                number = null
                isValid = false
            }

            const createData = {
                number: number,
                destination: ctx.params.data.destination,
                isValid,
                isAnonymous
            }

            return server.mongodb.Call.create(createData).then((data) => {
                return data.toJSON()
            }).then((call) => {
                if(call.number){
                    return server.mysql.ClientPhone.findAll({
                        where: {
                            number: call.number
                        },
                        include: [
                            {
                                model: server.mysql.Client,
                                as: "client"
                            }
                        ]
                    }).then((data) => {
                        return JSON.parse(JSON.stringify(data))
                    }).then((clientPhones) => {
                        call.clients = []
                        _.forEach(clientPhones, (clientPhone) => {
                            if(clientPhone.number === call.number){
                                const alreadyAddedToClients = _.find(call.clients, {id: clientPhone.clientId})
                                if(!alreadyAddedToClients){
                                    call.clients.push(clientPhone.client)
                                }
                            }
                        })
                        server.io.emit('caller-id.new', new EventResponse(call))
                        return call
                    })
                }
                server.io.emit('caller-id.new', new EventResponse(call))
                return call
            })
        },
        update(ctx){
            return server.mongodb.Call.update({_id: ctx.params.data.id, companyId: ctx.params.data.companyId}, {$set: ctx.params.data}).then((data) => {
                if(!data){
                    throw new Error("Nenhum registro encontrado.")
                }
                return data.toJSON()
            })
        },
        remove(ctx){
            return server.mongodb.Device.findOneAndRemove({_id: ctx.params.data.id, companyId: ctx.params.data.companyId}).exec().then((data) => {
                if(!data){
                    throw new Error("Nenhum registro encontrado.")
                }
                return {
                    removedId: ctx.params.data.id
                }
            })
        }
    }
}}