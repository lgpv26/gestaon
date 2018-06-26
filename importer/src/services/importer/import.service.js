const _ = require('lodash')
const sequelize = require('sequelize')
const Op = require('sequelize').Op

import moment from 'moment'
import EventResponse from '~server/models/EventResponse'
var utils = require('../../utils/index')

module.exports = (server) => { 
    //PRIVATES
    let _baseName = null
    let _companyId = null
    let _transaction = null
    let _imported = []
    let counts = 1

    return {
    name: "importer/import",
    actions: {

        start(ctx){
            this._baseName = ctx.params.baseImport    
            this._companyId = ctx.params.companyId

            return ctx.call('importer/import.setTransaction').then(() => {

                return ctx.call('data/import.count').then((count) => {
                let limitPerConsult = 50
                let initialOffset = 0
                let limitReached = false

                const totalItemsLimit = count

                const listConsult = []

                const bunch = function (offset) {
                    
                    if ((offset + limitPerConsult) > totalItemsLimit) {  
                        limitPerConsult = ((totalItemsLimit - offset) !== 0) ? totalItemsLimit - offset : limitPerConsult 
                        limitReached = true
                    }
                    return ctx.call('data/import.list', {
                        include: [{
                            model: server.importer.telefones,
                            as: 'telefones'
                        },{
                            model: server.importer.tipocliente,
                            as: 'tipocliente'
                        }],
                        limit: limitPerConsult,
                        offset: offset
                    }).then((resultList) => {
                        console.log("Consultou com offset " + offset + "-" + (offset + limitPerConsult) + "/" + totalItemsLimit + ' - Total de interações: ' + counts)
                        
                        return ctx.call('importer/import.consultES', {
                            list: resultList,
                            set:{
                                offset: offset,
                                limit: (offset + limitPerConsult)
                            }
                        }).then((consultES) => {
                            return ctx.call('importer/import.setClient', {
                                list: consultES,
                                set:{
                                    offset: offset,
                                    limit: (offset + limitPerConsult)
                                }
                            }).then((setClients) => {
                                
                                return ctx.call('importer/import.saveClient', {
                                    data: setClients
                                }).then((clients) => {
                                    
                                    let promises = []

                                    promises.push(ctx.call('importer/import.setClientAddresses', {
                                            data: clients
                                        })
                                    )

                                    promises.push(ctx.call('importer/import.setClientCustomFields', {
                                            data: clients
                                        })
                                    )

                                    promises.push(ctx.call('importer/import.setClientPhones', {
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
                                            return ctx.call('importer/import.commit').
                                            then(() => {
                                                return ctx.call('importer/import.consultClients', {
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
                        })
                        
                    })
                }

                bunch(initialOffset)
                })    
            })  
        },

        setTransaction() {
            return server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
            })
        },

        setClient(ctx){
            let clients = []
            ctx.params.list.forEach((client, index) => {
                clients.push({
                    client: client,
                    data: {
                        name: (client.nome) ? client.nome : null,
                        companyId: parseInt(this._companyId),
                        dateCreated: (client.DataCadastro) ? moment(client.DataCadastro).toDate() : numoment().toDate(),
                        origin: 'gestaoazul'
                    }
                })
          
            })
            return clients
        },

        saveClient(ctx){
            return server.mysql.Client.bulkCreate(_.map(ctx.params.data, (data, index) => {
                if(_.has(data.client, 'tipocliente') && data.client.tipocliente){
                    switch (data.client.tipocliente.codigo) {
                        case 1: // BALCÃO
                        _.set(data.data, 'clientGroupId', 5) // BALCÃO
                         break
                        case 2: // DISK
                        _.set(data.data, 'clientGroupId', 1) // DISK
                          break
                        case 3: // Comércio
                        _.set(data.data, 'clientGroupId', 4) // COMÉRCIO
                          break
                        case 4: // Automática/VD
                        _.set(data.data, 'clientGroupId', 3) // AUTOMÁTICO
                          break
                        case 17: // Atacado
                        _.set(data.data, 'clientGroupId', 2) // ATACADO
                          break
                        default: // OUTROS
                        _.set(data.data, 'clientGroupId', null) // VAREJO
                          break
                      }
                }
                return data.data
            }), {
                returning: true,
                transaction: this._transaction
            }).then((response) => {
                if (!response) {
                    console.log('Registro não encontrado. importer/importer.saveClient')
                    throw new Error("Nenhum registro encontrado.")
                }
                return _.map(JSON.parse(JSON.stringify(response)), (client, index) => {
                    return _.assign(ctx.params.data[index].client, {client})
                })
            }).catch((err) => {
                console.log(err)
            })
        },

        setClientAddresses(ctx){
            const mapped = _.map(_.filter(ctx.params.data, (client) => {
                return _.has(client, 'address') && client.address.id
            }), (client, index) => {
                    return {
                        name: "PADRÃO",
                        clientId: parseInt(client.client.id),
                        addressId: parseInt(client.address.id),
                        number: (client.numero) ? client.numero : null,
                        complement: (client.complemento.trim()) ? client.complemento : null
                    }
            })
            return server.mysql.ClientAddress.bulkCreate(mapped, {
                returning: true,
                transaction: this._transaction
            }).then((response) => {
                if (!response) {
                    console.log('Registro não encontrado. importer/importer.setClientAddresses')
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(response))
            }).catch((err) => {
                console.log(err, 'Catch . importer/importer.setClientAddresses')
            })
            
        },

        setClientCustomFields(ctx){
            let clientCustomFields = []
            ctx.params.data.forEach((client, index) => {
                if(_.has(client, 'address') && !client.address.id){
                    const address = (client.endereco) ? client.endereco : '' 
                    const number = client.numero ? client.numero : ''
                    const complement = (client.complemento) ? client.complemento : ''
                    const neighborhood =(client.bairro) ? client.bairro : ''
                    const city = (client.cidade) ? client.cidade : ''
                    const state = (client.estado) ? client.estado : ''
                    clientCustomFields.push({
                        clientId: client.client.id,
                        customFieldId: 5, // HARD CODED
                        value: address + ', ' + number + ((complement) ? ' ' + complement : '') + ' - ' + neighborhood + ' - ' + city + '/' + state
                    })
                }
                if(_.has(client, 'OBS')){
                    if(!_.isEmpty(_.toString(client.OBS).trim())){
                        clientCustomFields.push({
                            clientId: client.client.id,
                            customFieldId: 4, // HARD CODED
                            value: client.OBS
                        })
                    }
                }
            })
            return server.mysql.ClientCustomField.bulkCreate(clientCustomFields, {
                returning: true,
                transaction: this._transaction
            }).then((response) => {
                if (!response) {
                    console.log('Registro não encontrado. importer/importer.setClientCustomFields')
                    throw new Error("Nenhum registro encontrado.")
                }
                return JSON.parse(JSON.stringify(response))
            }).catch((err) => {
                console.log(err, 'Catch . importer/importer.setClientCustomFields')
            })            
        },

        setClientPhones(ctx){
            let phones = []
            _.forEach(ctx.params.data, (client, index) => {
                if(_.has(client, 'telefones')){
                    client.telefones.forEach((phone, index) => {
                        const number = _.toString(phone.Telefone).trim()
                        if(!_.isEmpty(number)){
                            if(number.length == 10 || number.length == 11) phones.push(_.assign({number}, {clientId: client.client.id}))
                            if(number.length == 12 && _.startsWith(number, 0)) phones.push(_.assign({number: number.splice(0,1)}, {clientId: client.client.id}))
                        }
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
                let esIndexPromises = []
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
                console.log(err, "Erro em: importer/import.saveES (general)")
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
                            if(!_.isEmpty(clientPhone)){
                                clientPhones.push({
                                    clientPhoneId: clientPhone.id,
                                    number: clientPhone.number
                                })
                            }                        
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

        consultES(ctx){
            return new Promise((resolve, reject) => {
                let address = []
                ctx.params.list.forEach((client) => {
                    address.push({
                        index: 'main',
                        type: 'address'
                    }, {
                        "query": {
                            "bool": {
                                "must": {
                                    "match": {
                                        "name": {
                                        "query": utils.removeDiacritics(client.endereco.trim()),
                                        "analyzer": "autocomplete",
                                        "operator": "and"
                                        }
                                    }
                                },
                                "minimum_should_match": "90%", 
                                "filter": {
                                    "match": {
                                    "city": {
                                        "query": utils.removeDiacritics(client.cidade.trim()),
                                        "analyzer": "autocomplete"
                                    }
                                    }
                                }
                            }
                        }
                    })
                })
                resolve(address)
            }).then((address) => {
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
                }).then((data) => {
                    return data
                })
            }).catch((err) => {
                console.log(err)
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