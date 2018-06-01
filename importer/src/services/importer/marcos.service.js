const _ = require('lodash')
const sequelize = require('sequelize')
const Op = require('sequelize').Op

import moment from 'moment'
var utils = require('../../utils/index')
import xlsx from 'node-xlsx'


module.exports = (server) => { 
    //PRIVATES
    let _baseName = null
    let _companyId = null
    let _transaction = null
    let _imported = []
    let counts = 1

    let parser = {
        id: 0,
        name: 1,
        phone: 2,
        dateCreated: 3,
        Data_da_Última_Compra: 4,
        cep: 5,
        addressFull: 6,
        address: 7,
        number: 8,
        complement: 9,
        neighborhood: 10,
        city: 11,
        state: 12,
        ref: 13,
        obs: 14,
        day_birthday: 15,
        month_birthday: 16,
        appUse: 17,
        setor: 18,
        group: 19
    }

    return {

    name: "importer/import/marcos",
    actions: {

        start(ctx){

            this._baseName = ctx.params.baseImport    
            this._companyId = ctx.params.companyId

            let base = xlsx.parse(ctx.params.data.path, {cellDates: true})
            console.log('Base lida, padrão utilizado: ', base[0].data[0])
            base = _.drop(base[0].data, 1)
            ctx.call('importer/import/marcos.setTransaction').then(() => {
                ctx.call('importer/import/marcos.consultES', {
                    list: base
                }).then((baseClients) => {
                    ctx.call('importer/import/marcos.setClient', {
                        base: baseClients
                    }).then((clients) => {

                        let limitPerConsult = 50
                        let initialOffset = 0
                        let limitReached = false

                        const totalItemsLimit = clients.length

                        const listConsult = []

                        const bunch = function (offset) {
                            
                            if ((offset + limitPerConsult) > totalItemsLimit) {  
                                limitPerConsult = ((totalItemsLimit - offset) !== 0) ? totalItemsLimit - offset : limitPerConsult 
                                limitReached = true
                            }
                            return ctx.call('importer/import/marcos.limitArray', {
                                base: clients,
                                limit: limitPerConsult,
                                offset: offset
                            }).then((resultList) => {
                                console.log("Limitou o Array com offset " + offset + "-" + (offset + limitPerConsult) + "/" + totalItemsLimit + ' - Total de interações: ' + counts)

                                return ctx.call('importer/import/marcos.saveClient', {
                                    data: resultList
                                }).then((clients) => {
                                    //console.log(clients)
                                    
                                    let promises = []
                                    
                                    promises.push(ctx.call('importer/import/marcos.saveClientAddresses', {
                                            data: clients
                                        })
                                    )

                                    promises.push(ctx.call('importer/import/marcos.saveClientCustomFields', {
                                            data: clients
                                        })
                                    )

                                    promises.push(ctx.call('importer/import/marcos.saveClientPhones', {
                                            data: clients
                                        })
                                    )

                                    _imported = _.concat(_imported, _.map(clients, (client) => {
                                        return client.client.id
                                    }))

                                    return Promise.all(promises).then(() => {
                                        offset += limitPerConsult
                                        counts++
                                        
                                        if (!limitReached) {
                                            if((totalItemsLimit - (offset + limitPerConsult)) === 0) limitReached = true 
                                            bunch(offset)
                                        }
                                        else {
                                            return ctx.call('importer/import/marcos.commit').
                                            then(() => {
                                                return ctx.call('importer/import/marcos.consultClients', {
                                                    where: {
                                                        id: {
                                                            [Op.in]: _imported
                                                        }
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
                                                }).then((clients) => {
                                                    console.log("Importação para MySQL concluida! Total: ", clients.length + '. Salvando no elastic search!')
                                                    return ctx.call('importer/import.saveES', {
                                                        data: clients
                                                    }).catch((err) => {
                                                        console.log(err, "erro do importer/import.saveES")
                                                    })
                                                })
                                            }).catch((err) => {
                                                console.log(err, "erro do commit")
                                                return ctx.call('importer/import.rollback')
                                            })
                                        }
                                    }).catch((err) => {
                                        console.log(err, "erro do promise all")
                                        return ctx.call('importer/import.rollback')
                                    })
                                   
                                })
                            
                                
                            })
                        }

                        bunch(initialOffset)
                    
                    }) 
                })
            })
        },

        setTransaction() {
            return server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
            })
        },

        limitArray(ctx){
            return ctx.params.base.slice(ctx.params.offset, (ctx.params.offset + ctx.params.limit))
        },

        saveClient(ctx){           
            return server.mysql.Client.bulkCreate(ctx.params.data, {
                returning: true,
                transaction: this._transaction
            }).then((response) => {
                if (!response) {
                    console.log('Registro não encontrado. importer/importer.saveClient')
                    throw new Error("Nenhum registro encontrado.")
                }
                return _.map(JSON.parse(JSON.stringify(response)), (client, index) => {
                    return _.assign(ctx.params.data[index], {client})
                })
            }).catch((err) => {
                console.log(err)
            })
        },

        setClient(ctx){
            let clientPromises = []
            let clients = []
            ctx.params.base.forEach((client, index) => {
                clientPromises.push(new Promise((resolve, reject) => {
                        let promises =[]

                        let clientGroupId = null
                        let customFieldGroup = null

                        let clientCustomFields = []
                        let clientAddresses = []

                        promises.push(ctx.call('importer/import/marcos.setClientGroup', {
                            data: client[parser.group]
                        }).then((response) => {
                            if(response.clientGroupId) clientGroupId = response.clientGroupId
                            if(response.customFieldGroup) customFieldGroup = response.customFieldGroup
                        }))

                        promises.push(ctx.call('importer/import/marcos.setClientAddresses', {
                            data: client
                        }).then((response) => {
                            clientAddresses = response
                        }))

                        promises.push(ctx.call('importer/import/marcos.setClientCustomFields', {
                            data: client
                        }).then((response) => {
                            clientCustomFields = response
                        }))

                        return Promise.all(promises).then(() => {
                            clients.push({
                                name: (utils.removeDiacritics(client[parser.name])).trim() ? utils.removeDiacritics(client[parser.name]).trim() : 'Nenhum nome digitado',
                                companyId: parseInt(this._companyId),
                                dateCreated: (client[parser.dateCreated]) ? moment(client[parser.dateCreated]).toDate() : moment().toDate(),
                                clientGroupId: clientGroupId,
                                clientAddresses: clientAddresses,
                                clientPhones: [{
                                    number: (client[parser.phone]) ? client[parser.phone] : null
                                }],
                                clientCustomFields: clientCustomFields,
                                origin: 'kp'
                            })
                            resolve()
                        })
                    })
                )
            })
            return Promise.all(clientPromises).
            then(() => {
                return clients
            })
        },

        setClientGroup(ctx){
            let clientGroupId = null
            let customFieldGroup = null
            if(!ctx.params.data){
                return {clientGroupId, customFieldGroup}
            }
            else {
                switch (ctx.params.data) {
                    case 'AUTOMATICA': 
                    clientGroupId =  3 // AUTOMÁTICO
                      break
                    case 'COMERCIO': 
                    clientGroupId =  4 // COMÉRCIO
                      break
                    case 'TELENTREGA': 
                    clientGroupId =  1 // DISK
                      break
                    case 'PORTARIA': 
                    clientGroupId =  5 // BALCÃO
                      break
                    default: // OUTROS
                    clientGroupId = null // VAREJO
                      break
                  }

                  return {clientGroupId, customFieldGroup}
            }
        },

        setClientAddresses(ctx){
            const client = ctx.params.data
            const clientAddress = (client.address.id) ? [{
                addressId: parseInt(client.address.id),
                number: (client[parser.number]) ? parseInt(client[parser.number]) : null,
                complement: (client[parser.complement]) ? client[parser.complement] : null,
                name: (client[parser.ref]) ? client[parser.ref] : null
            }] : false
            return clientAddress
        },

        setClientCustomFields(ctx){
            let clientCustomFields = []
            const client = ctx.params.data
            if(_.has(client, 'address') && !client.address.id){
                const address = (client[parser.address]) ? client[parser.address] : '' 
                const number = (client[parser.number]) ? parseInt(client[parser.number]) : ''
                const complement = (client[parser.complement]) ? client[parser.complement] : ''
                const neighborhood =(client[parser.neighborhood]) ? client[parser.neighborhood] : ''
                const city = (client[parser.city]) ? client[parser.city] : ''
                const state = (client[parser.state]) ? client[parser.state] : ''
                const ref = (client[parser.ref]) ? ' - Complemento: ' +  client[parser.ref] : ''
                clientCustomFields.push({
                    customFieldId: 5, // HARD CODED
                    value: address + ', ' + number + '  ' + complement + ' - ' + neighborhood + 
                    city + '/' + state + ref
                })
            }
            if(!_.isEmpty(client[parser.obs])){
                clientCustomFields.push({
                    customFieldId: 4, // HARD CODED
                    value: client[parser.obs]
                })
            }
            return clientCustomFields
        },

        saveClientAddresses(ctx){
            let clientAddresses = []
            ctx.params.data.forEach((client, index) => {
                if(_.has(client, 'clientAddresses') && client.clientAddresses.length){
                    client.clientAddresses.forEach((address) => {
                    clientAddresses.push(_.assign(address, {clientId: client.client.id}))
                    })
                }  
            })
            return server.mysql.ClientAddress.bulkCreate(clientAddresses, {
                returning: true,
                transaction: this._transaction
            }).then((response) => {
                if (!response) {
                    console.log('Registro não encontrado. importer/importer/marcos.setClientAddresses')
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(response))
            }).catch((err) => {
                console.log(err, 'Catch . importer/importer/marcos.setClientAddresses')
            })
        },

        saveClientCustomFields(ctx){
            let clientCustomFields = []
            ctx.params.data.forEach((client, index) => {
                if(_.has(client, 'clientCustomFields') && client.clientCustomFields.length){
                    client.clientCustomFields.forEach((customField) => {
                         clientCustomFields.push(_.assign(customField, {clientId: client.client.id}))
                    })
                } 
            })
            return server.mysql.ClientCustomField.bulkCreate(clientCustomFields, {
                returning: true,
                transaction: this._transaction
            }).then((response) => {
                if (!response) {
                    console.log('Registro não encontrado. importer/importer/marcos.setClientCustomFields')
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(response))
            }).catch((err) => {
                console.log(err, 'Catch . importer/importer/marcos.setClientCustomFields')
            })
        },

        saveClientPhones(ctx){
            let phones = []
            ctx.params.data.forEach((client, index) => {
                if(_.has(client, 'clientPhones') && client.clientPhones.length){
                    client.clientPhones.forEach((clientPhone) => {
                        phones.push(_.assign(clientPhone, {clientId: client.client.id}))
                    })
                } 
            })
            
            return server.mysql.ClientPhone.bulkCreate(phones, {
                returning: true,
                transaction: this._transaction
            }).then((response) => {
                if (!response) {
                    console.log('Registro não encontrado. importer/importer.setClientPhones')
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(response))
            }).catch((err) => {
                console.log(err, 'Catch . importer/importer.setClientPhones')
            })    
        
        },

        consultES(ctx){
            return new Promise((resolve, reject) => {
                let address = []
                ctx.params.list.forEach((client, index) => {

    
                    address.push({
                        index: 'main',
                        type: 'address'
                    }, {
                        "query": {
                            "bool": {
                                "must": {
                                    "multi_match": {
                                        "query": (client[parser.cep]) ? client[parser.cep] : utils.removePlace(utils.removeDiacritics(client[parser.address].trim())),
                                        "fields": [
                                            "name",
                                            "cep"
                                        ],
                                        "operator": "or",
                                        "analyzer": (client[parser.cep]) ? "standard" : "autocomplete"
                                    }
                                },
                                "minimum_should_match": "90%", 
                                "filter": {
                                    "match": {
                                    "city": {
                                        "query": utils.removeDiacritics(client[parser.city]),
                                        "analyzer": "autocomplete"
                                        }
                                    }
                                }
                            }
                        }
                    })
                })
               
                resolve(address)
            }) .then((address) => {
                return new Promise((resolve, reject) => {
                    server.elasticSearch.msearch({
                        body: address
                    }, function (esErr, esRes, esStatus) {
                        if (esErr) {
                            console.error("Search error: ", esErr);
                        } else {
                            let dataSearches = []
                            _.map(esRes.responses, (response, index) => {
                                if(response.hits.hits.length){
                                    dataSearches.push(_.assign(ctx.params.list[index],
                                        {
                                            address: {
                                                name: _.first(response.hits.hits)._source.name,
                                                id: _.first(response.hits.hits)._id
                                            }                         
                                        })
                                    )
                                }
                                else{
                                    dataSearches.push(_.assign(
                                        ctx.params.list[index],
                                        {
                                            address: {
                                                name: false,
                                                id: false  
                                            }                                               
                                        })
                                    )
                                }
                            })
                            resolve(dataSearches)
                        }
                    }) 
                   
                }) .then((data) => {
                    return data
                })
            }).catch((err) => {
                console.log(err)
            })
        },

        consultClients(ctx){
            return server.mysql.Client.findAll({
                where: ctx.params.where,
                include: ctx.params.include
            }).then((clients) => {
                return JSON.parse(JSON.stringify(clients))
            })
        },

        /**
         * save in ES client's data
         * @param {Object} transaction (optional)
         * @returns {Promise.<array>} saves ES
         */ 
        saveES(ctx) {
            return ctx.call("importer/import.setES", {
                data: ctx.params.data
            }).then((responseClient) => {

                const esIndexPromises = []
                responseClient.forEach((client) => {
                        esIndexPromises.push({
                            index: {
                                _index: 'main',
                                _type: 'client',
                                _id: client.id }
                            },
                            _.omit(client, 'id')
                        )
                })

                return server.elasticSearch.bulk({
                    body: esIndexPromises                    
                }, function (esErr, esRes, esStatus) {
                    if (esErr) {
                        console.log(esErr, "Erro em: importer/import.saveES")
                        console.log('Erro ao salvar dados no ElasticSearch!')
                        console.log("Importação encerrada!")
                        return 
                    }
                    console.log('Dados salvos no ElasticSearch!')
                    console.log("Importação encerrada!")
                    return true
                })
            }).catch((err) => {
                console.log("Erro em: importer/import.saveES (general)")
                //throw new Error(err)
            })                
        },
        /**
         * set data to ES 
         * @param {Object} transaction (optional)
         * @returns {Promise.<object>} client and addresses
         */ 
        setES(ctx){
            let clientES = []
            
            ctx.params.data.forEach((client, index) => {
                clientES.push({
                    id: client.id,
                    companyId: client.companyId,
                    name: client.name,
                    obs: client.obs,
                    legalDocument: client.legalDocument
                })
    
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
                    })
                    _.set(clientES[index], 'addresses', clientAddresses)
                }
    
                if(_.has(client, "clientPhones")){
                    let clientPhones = []
                        client.clientPhones.forEach((clientPhone) => {
                        clientPhones.push({
                            clientPhoneId: clientPhone.id,
                            number: (parseInt(clientPhone.number) >= 999999999 || parseInt(clientPhone.number) < 99999999999) ? clientPhone.number.slice(2) : clientPhone.number
                        })
                    })
                    _.set(clientES[index], 'phones', clientPhones)
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
                    _.set(clientES[index], 'customFields', clientCustomFields)
                }
            })
           
            return clientES           
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