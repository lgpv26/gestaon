const _ = require('lodash')
const sequelize = require('sequelize')

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
                    

                    this._client = client
                    
                    return Promise.all(clientPromisses).then(() => {
                        return ctx.call("draft/client/persistence.saveES", {
                            transaction: this._transaction
                        }).then(() => {
                            if(_saveInRequest) {
                                return this._client
                            }
                            else{
                                return ctx.call("draft/client/persistence.commit").then(() => {
                                    return this._client
                                })
                            }
                        }).catch(() => {
                            return ctx.call("draft/client/persistence.saveES", {
                                transaction: null
                            }).then(() => {
                                if(_saveInRequest) {
                                    throw new Error("Nenhum registro encontrado.")
                                }
                                else{
                                    return ctx.call("draft/client/persistence.rollback")
                                }
                            }).catch((err) => {
                                console.log("Erro em: draft/client/persistence.saveES (catch para transaction)")
                                return ctx.call("draft/client/persistence.rollback")
                            })
                        })
                    }).catch((err) => {
                        console.log("Erro em: draft/client/persistence.setClient")
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
        },
        /**
         * @returns {Promise} set transaction
         */ 
        setTransaction() {
            if(!this._transaction){
                return server.sequelize.transaction().then((transaction) => {
                    this._transaction = transaction
                })
            }
            else {
                _saveInRequest = true
                return true
            }
        },

        /**
         * SAVE (create or update) INITIAL DATA CLIENT
         * @returns {Promise.<object>} client
         */    
        saveClient(ctx){
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
         * @param {Object} transaction (optional)
         * @returns {Promise.<array>} saves ES
         */ 
        saveES(ctx) {
            return ctx.call("draft/client/persistence.setES", {
                transaction: ctx.params.transaction
            }).then((responseClient) => {
                const esIndexPromises = []
                if (_.has(responseClient, "client")) {
                        esIndexPromises.push(server.elasticSearch.index({
                            index: 'main',
                            type: 'client',
                            id: responseClient.client.id,
                            body: _.omit(responseClient.client, 'id')
                        }, function (esErr, esRes, esStatus) {
                            if (esErr) {
                                console.log("Erro em: draft/client/persistence.saveES (client)")
                                throw new Error(esErr)
                            }
                        })
                    )
                }
                if (_.has(responseClient, "addresses")) {
                    responseClient.addresses.forEach((address) => {
                        esIndexPromises.push(server.elasticSearch.index({
                                index: 'main',
                                type: 'address',
                                id: address.id,
                                body: _.omit(address, 'id')
                            }, function (esErr, esRes, esStatus) {
                                if (esErr) {
                                    console.log("Erro em: draft/client/persistence.saveES (address)")
                                    throw new Error(esErr)
                                }
                            })
                        )
                    })
                }
                return Promise.all(esIndexPromises)
            }).catch((err) => {
                console.log("Erro em: draft/client/persistence.saveES (general)")
                throw new Error(err)
            })                
        },
        /**
         * set data to ES 
         * @param {Object} transaction (optional)
         * @returns {Promise.<object>} client and addresses
         */ 
        setES(ctx){
            return ctx.call("data/client.get", {
                where: {
                    id: this._client.id
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
                }],
                transaction: (ctx.params.transaction) ? ctx.params.transaction : null
            }).then((client) => {
                let addressesES = []
                let clientES = {
                    id: client.id,
                    companyId: client.companyId,
                    name: client.name,
                    obs: client.obs,
                    legalDocument: client.legalDocument
                }

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
                                id: clientAddress.address.id,
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
                    _.set(clientES, 'addresses', clientAddresses)
                }

                if(_.has(client, "clientPhones")){
                    let clientPhones = []
                     client.clientPhones.forEach((clientPhone) => {
                        clientPhones.push({
                            clientPhoneId: clientPhone.id,
                            number: clientPhone.number
                        })
                    })
                    _.set(clientES, 'phones', clientPhones)
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
                    _.set(clientES, 'customFields', clientCustomFields)
                }

                return {client: clientES, addresses: addressesES}
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