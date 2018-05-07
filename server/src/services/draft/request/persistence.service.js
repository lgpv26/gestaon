/*
const request = {
    client: {
        id: 7,
        name: 'MAILON RUAN DE LIMA',
        legalDocument: '06941033908',
        clientAddresses: [ 
            {
                "id" : 41,
                "complement" : "CASA",
                "number" : 70,
                "address" : {
                    "id" : 50594,
                    "name" : "RUA ONESIO FRANCISCO DE FARIAS",
                    "cep" : "87140000",
                    "neighborhood" : "CENTRO",
                    "city" : "PAIÇANDU",
                    "state" : "PR"
                }
            },
            selectedTypeIds: [  // <--- still needs implementation 
                {
                    id: '', 
                    name: ''
                }
            ]
        }],
        clientPhones : [ 
            {
                "id" : '', <-- if there is id update, if there isn't create
                "clientId" : '',
                "number" : ',
                "name" : ',
                "dateUpdated" : '',
                "dateCreated" : '',
                "dateRemoved" : 'null',
                "status" : ''
            }
        ]
    },
    order: {
    },
    task: {
    }
}
*/
const _ = require('lodash')
const sequelize = require('sequelize')
const { MoleculerError } = require('moleculer').Errors

module.exports = (server) => { 
    //PRIVATES
    let _request = null
    let _transaction = null

    return {
    name: "draft/request/persistence",
    actions: {
        start(ctx){
            this._request = ctx.params.request

            return ctx.call("draft/request/persistence.setTransaction").then(() => {
            
                let promises = []
                if(_.has(this._request, "client")){
                    promises.push(ctx.call("draft/request/persistence.setClient"))                        
                      
                }

                Promise.all(promises).then((result) => {
                    return ctx.call("draft/request/persistence.setElasticSearch", {
                        data: result,
                        transaction: this._transaction
                    }).then(() => {
                        return ctx.call("draft/request/persistence.commit")
                    }).catch(() => {
                        return ctx.call("draft/request/persistence.setElasticSearch", {
                            data: result,
                            transaction: null
                        }).then(() => {
                            return ctx.call("draft/request/persistence.rollback")
                        }).catch((err) => {
                            console.log("Erro em: draft/request/persistence.setElasticSearch (catch para transaction)")
                            return ctx.call("draft/request/persistence.rollback")
                        })
                    })
                }).catch((err) => {
                    return ctx.call("draft/request/persistence.rollback")                
                })
            })
        },

        setTransaction() {
            return server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
            })
        },

        setClient(ctx) {
            return ctx.call("draft/request/persistence.saveClient").then((client) => {
                
                let clientPromisses = []
                if(_.has(this._request.client, "clientAddresses")){
                    clientPromisses.push(ctx.call("draft/request/persistence.setClientAddresses", {
                        data: {
                            clientId: client.id
                        }
                    }).then((clientAddresses) => {
                        _.set(client, "clientAddresses", clientAddresses)
                    })
                )
                }
                if(_.has(this._request.client, "clientPhones")){
                    clientPromisses.push(ctx.call("draft/request/persistence.setClientPhones", {
                        data: {
                            clientId: client.id
                        }
                    }).then((clientPhones) => {
                        _.set(client, "clientPhones", clientPhones)
                    })
                )
                }
                
                return Promise.all(clientPromisses).then(() => {
                    
                    return {client: client}
                    
                }).catch(() => {
                    console.log("Erro em: draft/request/persistence.setClient")
                    throw new MoleculerError
                })           
            }).catch((err) => {
                console.log("Erro em: draft/request/persistence.saveClient", err)
                throw new MoleculerError
            }) 
        },
        /**
         * @returns {Promise.<Object>} client 
         */
        saveClient(ctx){
            if (this._request.client.id) { // update client
                return ctx.call("data/client.update", {
                    data: _.assign(this._request.client, {
                        companyId: 1 // HARD CODED
                    }),
                    where: {
                        id: this._request.client.id,
                        companyId: 1 // HARD CODED
                    },
                    transaction: this._transaction
                }).then((client) => {
                    return client
                }).catch(() => {
                    console.log("Erro em: data/client.update")
                    throw new MoleculerError
                })   
            }
            else { // create client
                return ctx.call("data/client.create", {
                    data: _.assign(this._request.client, {
                        companyId: 1 /// HARD CODED
                    }),
                    transaction: this._transaction
                }).then((client) => {
                    return client
                }).catch(() => {
                    console.log("Erro em: data/client.create")
                    throw new MoleculerError
                })   
            }
        },

        setClientAddresses(ctx){
            return ctx.call("data/client.setClientAddress", {
                data: _.assign(this._request.client.clientAddresses, {
                    clientId: ctx.params.data.clientId,
                    companyId: 1 /// HARD CODED
                }),
                transaction: this._transaction
            }).then((clientAddresses) => {
                return clientAddresses
            })
        },

        setClientPhones(ctx){
            return ctx.call("data/client.saveClientPhones", {
                data: _.assign(this._request.client.clientPhones, {
                    clientId: ctx.params.data.clientId,
                    companyId: 1 /// HARD CODED
                }),
                transaction: this._transaction
            }).then((clientPhones) => {
                return clientPhones
            })
        },
        
        setElasticSearch(ctx) {
            ctx.params.data.forEach((data) => {
                if (_.has(data, "client")) {
                    return ctx.call("draft/request/persistence.setClientElasticSearch", {
                        data: data.client,
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
                                        console.log("Erro em: draft/request/persistence.setElasticSearch (client)")
                                        throw new MoleculerError
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
                                            console.log("Erro em: draft/request/persistence.setElasticSearch (address)")
                                            throw new MoleculerError
                                        }
                                    })
                                )
                            })
                        }
                        return Promise.all(esIndexPromises)
                    }).catch(() => {
                        console.log("Erro em: draft/request/persistence.setElasticSearch (general)")
                        throw new MoleculerError
                    })
                }
            })
        },

        setClientElasticSearch(ctx){
            return ctx.call("data/client.get", {
                where: {
                    id: ctx.params.data.id
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
        }
    }
}}