const _ = require('lodash')
const sequelize = require('sequelize')
const Op = require('sequelize').Op

module.exports = (server) => { 
    //PRIVATES
    let _client = null
    let _transaction = null
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
            this._transaction = ctx.params.transaction || null
            this._companyId = ctx.params.companyId

            return ctx.call("draft/client/persistence.checkTempIds").then(() => {
                return ctx.call("draft/client/persistence.setTransaction").then(() => {
                    
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
                            if(this._saveInRequest) {
                                return this._client
                            }
                            else{
                                return ctx.call("draft/client/persistence.commit").then(() => {
                                    return ctx.call("draft/client/persistence.saveES")
                                    .then(() => {
                                       return this._client
                                    })
                                })
                            }
                        }).catch((err) => {
                            console.log(err, "Erro em: draft/client/persistence.setClient")
                            throw new Error("Nenhum registro encontrado.")
                        })           
                    }).catch((err) => {
                        console.log(err, "Erro em: draft/client/persistence.saveClient")
                        if(_saveInRequest) {
                            throw new Error(err)
                        }
                        else{
                            return ctx.call("draft/client/persistence.rollback")
                        }
                    }) 
                })
            })
        },
        /**
         * @returns {Promise} set transaction
         */ 
        setTransaction() {
            if(!this._transaction){
                return server.sequelize.transaction().then((transaction) => {
                    this._transaction = transaction
                    this._saveInRequest = false
                })
            }
            else {
                this._saveInRequest = true
                return true
            }
        },

        /**
         * SAVE (create or update) INITIAL DATA CLIENT
         * @returns {Promise.<object>} client
         */    
        saveClient(ctx){
            if(this._saveInRequest && (this._client.name == '' | this._client.name == null) && !this._client.id){
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
                        },
                        transaction: this._transaction
                    }).then((client) => {
                        return client
                    }).catch((err) => {
                        console.log("Erro em: data/client.update")
                        throw new Error(err)
                    })   
                }
                else { // create client
                    return ctx.call("data/client.create", {
                        data: _.assign(this._client, {
                            companyId: this._companyId
                        }),
                        transaction: this._transaction
                    }).then((client) => {
                        return client
                    }).catch((err) => {
                        console.log("Erro em: data/client.create")
                        throw new Error(err)
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
                }),
                transaction: this._transaction
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
                clientId: ctx.params.data.clientId,
                transaction: this._transaction
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
                companyId: this._companyId,
                transaction: this._transaction
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
                    }
                    return true
                })
            }).catch((err) => {
                console.log("Erro em: draft/client/persistence.saveES (general)")
                throw new Error(err)
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
            }).catch((err) => {
                console.log("Erro em: draft/client/persistence.checkTempIds")
                throw new Error(err)
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
                            number: (parseInt(clientPhone.number) >= 999999999 || parseInt(clientPhone.number) < 99999999999) ? clientPhone.number.slice(2) : clientPhone.number
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
        },

        /**
         * Commit persistence
         */
        commit() {
            console.log("Commit everything!")
            this._transaction.commit()
        },

        /**
         * Rollback persistence
         */
        rollback() {
            console.log("Oh God, just rollback!")
            this._transaction.rollback()
            throw new Error()
        }
    }
}}