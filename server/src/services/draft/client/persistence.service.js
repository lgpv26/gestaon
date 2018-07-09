const _ = require('lodash')
const sequelize = require('sequelize')
const Op = require('sequelize').Op
import EventResponse from '~server/models/EventResponse'

module.exports = (server) => { 
    //PRIVATES
    let _client = null
    let _saveInRequest = null
    let _companyId = null

    return {
    name: "draft/client/persistence",
    actions: {
        /**
         * @param {Object} client, {Int} companyId, {Object} transaction (optional)
         * @returns {Promise.<object>} client
         */    
        start(ctx){
            //SET PRIVATES
            this._client = ctx.params.client
            this._companyId = ctx.params.companyId
            this._saveInRequest = (ctx.params.saveInRequest) ? true : false

            return ctx.call("draft/client/persistence.checkTempIds").then(() => {
                return server.sequelize.transaction((t) => {

                    //SAVE INITIAL CLIENT 
                    return ctx.call("draft/client/persistence.saveClient").then((client) => {
                        let clientPromisses = []
                        
                        if(_.has(this._client, "clientAddresses")){
                            clientPromisses.push(ctx.call("draft/client/persistence.setClientAddresses", {
                                data: {
                                    clientId: client.id
                                }
                            }).then((clientAddresses) => {
                                _.set(client, "clientAddresses", clientAddresses)
                            })
                        )
                        }
                        if(_.has(this._client, "clientPhones")){
                            clientPromisses.push(ctx.call("draft/client/persistence.setClientPhones", {
                                data: {
                                    clientId: client.id
                                }
                            }).then((clientPhones) => {
                                _.set(client, "clientPhones", clientPhones)
                            })
                            )
                        }
                        if(_.has(this._client, "clientCustomFields")){
                            clientPromisses.push(ctx.call("draft/client/persistence.setClientCustomFields", {
                                data: {
                                    clientId: client.id
                                }
                            }).then((clientCustomFields) => {
                                _.set(client, "clientCustomFields", clientCustomFields)
                            })
                        )
                        }
                        
                        client.saveInRequest = true
                        this._client = client
                        
                        return Promise.all(clientPromisses).then(() => {
                            return this._client
                        })
                    }).catch((err) => {
                        console.log(err, "Erro em: draft/client/persistence.saveClient")
                        return Promise.reject("Erro ao salvar o cliente.")
                    })
                }).then((client) => {
                    //COMMIT
                    if(this._saveInRequest) {
                        return client
                    }
                    else {
                        return ctx.call("draft/client/persistence.saveES")
                        .then(() => {
                            return client
                        })
                    }
                }).catch((err) => {
                    if(this._saveInRequest) {
                        return Promise.reject(err)
                    }
                    else{
                        return new EventResponse(new Error(err))
                    }
                })
            })
        },

        /**
         * SAVE (create or update) INITIAL DATA CLIENT
         * @returns {Promise.<object>} client
         */    
        saveClient(ctx){
            if(this._saveInRequest && (this._client.name === '' || this._client.name === null) && !this._client.id){
                return {
                    id: null
                }
            }
            else {
                if (this._client.id) { // update client
                    return ctx.call("data/client.update", {
                        data: _.assign(this._client, {
                            companyId: this._companyId
                        }),
                        where: {
                            id: this._client.id,
                            companyId: this._companyId 
                        }
                    }).then((client) => {
                        return client
                    }).catch((err) => {
                        console.log("Erro em: data/client.update")
                        return Promise.reject(err)
                    })   
                }
                else { // create client
                    return ctx.call("data/client.create", {
                        data: _.assign(this._client, {
                            companyId: this._companyId
                        })
                    }).then((client) => {
                        return client
                    }).catch((err) => {
                        console.log("Erro em: data/client.create")
                        return Promise.reject(err)
                    })   
                }
            }
        },
        /**
         * set data and call service data/client.setClientAddresses to save data
         * @returns {Promise.<array>} clientAddresses
         */   
        setClientAddresses(ctx){
            return ctx.call("data/client.setClientAddresses", {
                data: _.assign(this._client.clientAddresses, {
                    clientId: ctx.params.data.clientId,
                    companyId: this._companyId
                })
            }).then((clientAddresses) => {
                return clientAddresses
            })
        },
        /**
         * set data and call service data/client.saveClientPhones to save data
         * @returns {Promise.<array>} clientPhones
         */   
        setClientPhones(ctx){
            return ctx.call("data/client.saveClientPhones", {
                data: _.map(this._client.clientPhones, clientPhone => {
                    return _.assign(clientPhone, {
                        clientId: ctx.params.data.clientId,
                    })
                }),
                clientId: ctx.params.data.clientId
            }).then((clientPhones) => {
                return clientPhones
            })
        },
        /**
         * set data and call service data/client.saveClientCustomFields to save data
         * @returns {Promise.<array>} clientCustomFields
         */  
        setClientCustomFields(ctx){
            return ctx.call("data/client.saveClientCustomFields", {
                data: _.map(this._client.clientCustomFields, clientCustomField => {
                    return _.assign(clientCustomField, {
                        clientId: ctx.params.data.clientId,
                        customFieldId: clientCustomField.id
                    })
                }),
                clientId: ctx.params.data.clientId,
                companyId: this._companyId
            }).then((clientCustomFields) => {
                return clientCustomFields
            })
        },
        /**
         * save in ES client's data
         * @returns {Promise.<array>} saves ES
         */ 
        saveES(ctx) {
            return ctx.call("draft/client/persistence.setES")
            .then((responseClient) => {
                return server.elasticSearch.bulk({
                    body: responseClient                    
                }, function (esErr, esRes, esStatus) {
                    if (esErr) {
                        console.log(esErr, "Erro em: draft/client/persistence.setES")
                        console.log('Erro ao salvar dados no ElasticSearch!')
                        new Error('Erro ao salvar dados no ElasticSearch!')
                        return Promise.reject("Erro ao salvar dados no ElasticSearch!")
                    }
                    return true
                })
            }).catch((err) => {
                console.log("Erro em: draft/client/persistence.saveES (general)")
                return Promise.reject(err)
            })                
        },
        
        checkTempIds(ctx){
            let removeTemps = []

            if(_.has(this._client, "clientAddresses")){
                removeTemps.push(ctx.call("draft/client/persistence.removeTempIds", {
                        path: 'clientAddresses',
                        select: 'clientAddressId'
                    })
                )
            }
            if(_.has(this._client, "clientPhones")){
                removeTemps.push(ctx.call("draft/client/persistence.removeTempIds", {
                        path: 'clientPhones',
                        select: 'clientPhoneId'
                    })
                )
            }
            if(_.has(this._client, "clientCustomFields")){
                removeTemps.push(ctx.call("draft/client/persistence.removeTempIds", {
                        path: 'clientCustomFields'
                    })
                )
            }

            return Promise.all(removeTemps).then(() => {
                return true
            })
        },

        removeTempIds(ctx){
            let newValue = []
            _.map(_.get(this._client, ctx.params.path), (obj) => {
                if(ctx.params.select && _.has(this._client, ctx.params.select)){
                    if(obj.id === _.get(this._client, ctx.params.select)){
                        obj.select = true
                    }
                    else{
                        obj.select = false
                    }                        
                }
                if(_.get(obj, 'id', false) && !_.isNumber(obj.id) && obj.id.substring(0,4) === "tmp/"){
                    obj.id = null              
                }
                newValue.push(obj)
            })
            return _.set(this._client, ctx.params.path, newValue)
        },

        /**
         * set data to ES 
         * @param {Object} transaction (optional)
         * @returns {Promise.<object>} client and addresses
         */ 
        setES(ctx){
            return ctx.call("data/client.get", {
                where: {
                    id: (ctx.params.clientId) ? ctx.params.clientId : this._client.id
                },
                include: [{
                    model: server.mysql.ClientPhone,
                    as: 'clientPhones'
                }, {
                    model: server.mysql.ClientAddress,
                    as: 'clientAddresses',
                    include: [{
                        model: server.mysql.Address,
                        as: 'address'
                    }]
                }, {
                    model: server.mysql.ClientCustomField,
                    as: 'clientCustomFields',
                    include: [{
                        model: server.mysql.CustomField,
                        as: 'customField'
                    }]
                }, {
                    model: server.mysql.ClientGroup,
                    as: 'clientGroup'
                }]
            }).then((client) => {

                let addressesES = []
                let clientES = [{
                    index: {
                        _index: 'main',
                        _type: 'client',
                        _id: client.id
                    }
                },{
                    companyId: client.companyId,
                    name: client.name,
                    obs: client.obs,
                    legalDocument: client.legalDocument
                }]

                if(_.has(client, "clientAddresses")){
                    let clientAddresses = []
                     client.clientAddresses.forEach((clientAddress) => {
                        clientAddresses.push({
                            clientAddressId: clientAddress.id,
                            complement: clientAddress.complement,
                            address: clientAddress.address.name,
                            number: clientAddress.number,
                            cep: clientAddress.address.cep,
                            neighborhood: clientAddress.address.neighborhood
                        })
                        addressesES.push({
                            index: {
                                _index: 'main',
                                _type: 'address',
                                _id: clientAddress.address.id
                            }
                        }, {
                                companyId: clientAddress.address.companyId,
                                name: clientAddress.address.name,
                                neighborhood: clientAddress.address.neighborhood,
                                city: clientAddress.address.city,
                                state: clientAddress.address.state,
                                cep: clientAddress.address.cep,
                                dateUpdated: clientAddress.address.dateUpdated,
                                dateCreated: clientAddress.address.dateCreated,
                                status: clientAddress.address.status
                        })
                    })
                    _.set(clientES[1], 'addresses', clientAddresses)
                }

                if(_.has(client, "clientPhones")){
                    let clientPhones = []
                     client.clientPhones.forEach((clientPhone) => {
                        clientPhones.push({
                            clientPhoneId: clientPhone.id,
                            number: clientPhone.number
                        })
                    })
                    _.set(clientES[1], 'phones', clientPhones)
                }

                if(_.has(client, "clientCustomFields")){
                    let clientCustomFields = []
                     client.clientCustomFields.forEach((clientCustomField) => {
                        clientCustomFields.push({
                            clientCustomFieldId: clientCustomField.id,
                            documentType: clientCustomField.customField.name, 
                            documentValue: clientCustomField.value
                        })
                    })
                    _.set(clientES[1], 'customFields', clientCustomFields)
                }
                
                return _.concat(clientES, addressesES)
            })
        }
    }
}}