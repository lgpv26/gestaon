import _ from 'lodash'
const Op = require('sequelize').Op
import EventResponse from '~models/EventResponse'

module.exports = (server) => { return {
    name: "data/call",
    actions: {
        getOne(ctx) {
            return server.mysql.Call.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || [],
                transaction: ctx.params.transaction || null,
                attributes: ctx.params.attributes || null
            })
            .then((call) => {
                if(!call.number) return Promise.resolve([])
                call = JSON.parse(JSON.stringify(call))

                return server.mysql.ClientPhone.findAll({
                    where: {
                        number: call.number
                    },
                    include: [{
                            model: server.mysql.Client,
                            as: "client"
                        }]
                }).then((clientPhones) => {
                    clientPhones = JSON.parse(JSON.stringify(clientPhones))
                
                    call.clients = []
                    _.forEach(clientPhones, (clientPhone) => {
                        if(clientPhone.number === call.number){
                            const alreadyAddedToClients = _.find(call.clients, {id: clientPhone.clientId})
                            if(!alreadyAddedToClients){
                                call.clients.push(clientPhone.client)
                            }
                        }
                    })
                    return Promise.resolve(call)
                  
                })
            })
        },

        getList(ctx){
            return server.mysql.Call.findAll({
                limit: 20
            })
            .then((calls) => {
                if(!_.isArray(calls) && !calls.length) return Promise.resolve([])
                calls = JSON.parse(JSON.stringify(calls))

                return server.mysql.ClientPhone.findAll({
                    where: {
                        number: {
                            [Op.in]: _.map(calls, (call) => {
                                return call.number
                            })
                        }
                    },
                    include: [{
                        model: server.mysql.Client,
                        as: "client"
                    }]
                }).then((clientPhones) => {
                    clientPhones = JSON.parse(JSON.stringify(clientPhones))

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
            })
        },

        create(ctx){

            // remove leading 0 if there is
            let number = ctx.params.data.number
            let isValid = true
            let isAnonymous = false

            // specific rules for specific destination
            if(ctx.params.data.destination.includes('_OI')){
                number = number.substring(1)
            }

            if(number.charAt(0) === '0'){
                number = number.substring(1)
            }

            if(number.length === 9 || number.length === 8){
                number = "44" + number
            }

            if(_.includes(['anonymous','Anonymous'], number)){
                number = null
                isAnonymous = true
            }
            else if((number.length !== 11 && number.length !== 10 || _.includes(['unknown','Unknown'], number))){
                number = null
                isValid = false
            }

            const createData = {
                number,
                destination: ctx.params.data.destination,
                companyId: ctx.params.companyId,
                isValid,
                isAnonymous
            }

            return server.mysql.Call.create(createData)
            .then((call) => {
                call = JSON.parse(JSON.stringify(call))

                if(call.number){
                    return server.mysql.ClientPhone.findAll({
                        where: {
                            number: call.number
                        },
                        include: [{
                                model: server.mysql.Client,
                                as: "client"
                            }]
                    }).then((clientPhones) => {
                        clientPhones = JSON.parse(JSON.stringify(clientPhones))
                    
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
                        return Promise.resolve(call)                      
                    })
                }
                else {
                    call.clients = []
                    server.io.emit('caller-id.new', new EventResponse(call))
                    return call
                }
            })
        },
        update(ctx){
            return server.mysql.Call.update(ctx.params.data, {
                where: ctx.params.where || {},
                transaction: ctx.params.transaction || null,
            }).then((data) => {
                return server.mysql.Call.findByPk(data.id, {
                    transaction: ctx.params.transaction || null,
                    include: ctx.params.include || [],
                }).then((call) => {
                    return JSON.parse(JSON.stringify(call))
                })
            })
        }
    }
}}