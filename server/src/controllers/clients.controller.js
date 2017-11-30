const _ = require('lodash');
const utils = require('../utils');

module.exports = (server, restify) => {
    return {
        search(req) {
            let actingCitiesString = "";
            if (typeof req.params.actingCities !== "undefined") {
                req.params.actingCities.forEach(function (actingCity, index) {
                    actingCitiesString += " " + actingCity;
                });
                actingCitiesString = utils.removeDiacritics(actingCitiesString.trim());
            }
            
            return new Promise((resolve, reject) => {
                if (!req.params.companyId) {
                    return reject(new restify.BadDigestError("CompanyId is requerid."))
                }
                server.elasticSearch.msearch({
                    body: [
                        {
                            index: 'main',
                            type: 'client'
                        },
                        {
                            "from": 0, "size": 5,
                            "query": {
                                "bool": {
                                    "should": [
                                        {
                                            "nested": {
                                                "path": "addresses",
                                                "inner_hits": {},
                                                "query": {
                                                    "bool": {
                                                        "must": {
                                                            "multi_match": {
                                                                "query": utils.removeDiacritics(req.params.q.trim()),
                                                                "fields": ["addresses.address^3", "addresses.number^2", "addresses.complement^2", "addresses.cep^5",
                                                                "name", "obs"],
                                                                "analyzer": "standard",
                                                                "operator": "OR",
                                                                "type": "cross_fields"
                                                            }
                                                        }
                                                    }
                                                    /*"multi_match": {
                                                        "query": utils.removeDiacritics(req.params.q.trim()),
                                                        "fields": ["addresses.address^3", "addresses.number^2", "addresses.complement^2", "addresses.cep^5"],
                                                        "analyzer": "standard",
                                                        "operator": "or",
                                                        "minimum_should_match": "2"
                                                    }*/
                                                },
                                                "boost": 2
                                            }
                                        },
                                        {
                                            "nested": {
                                                "path": "phones",
                                                "inner_hits": {},
                                                "query": {
                                                    "multi_match": {
                                                        "query": utils.removeDiacritics(req.params.q.trim()),
                                                        "fields": ["phones.number"],
                                                        "analyzer": "standard",
                                                        "operator": "AND"
                                                    }
                                                },
                                                "boost": 2
                                            }
                                        },
                                        {
                                            "multi_match": {
                                                "query": utils.removeDiacritics(req.params.q.trim()),
                                                "fields": ["name", "obs", "cpf/cnpj"],
                                                "analyzer": "standard",
                                                "operator": "OR"
                                            }
                                        }
                                    ],
                                    "must": {
                                        "term": { "companyId": parseInt(req.params.companyId) }
                                    },
                                    "minimum_should_match": "1"
                                }
                            }
                        },
                        {
                            index: 'main',
                            type: 'address'
                        },
                        {
                            "from": 0, "size": 5,
                            "query": {
                                "bool": {
                                    "must": {
                                        "multi_match": {
                                            "query": utils.removeDiacritics(req.params.q.trim()),
                                            "fields": ["name", "cep"],
                                            "analyzer": "standard",
                                            "operator": "AND"
                                        }
                                    },
                                    "filter": {
                                        "multi_match": {
                                            "query": actingCitiesString,
                                            "fields": ["city"],
                                            "analyzer": "standard"
                                        }
                                    }
                                }
                            }
                        }
                    ]
                },
                    function (esErr, esRes, esStatus) {
                        if (esErr) {
                            return reject(new restify.ResourceNotFoundError("Erro no ElasticSearch."))
                            console.error("Search error: ", esErr);
                        }
                        else {
                            //set logic to return data: dataSearches
                            let dataSearches = []
                            _.map(esRes.responses, (response, index) => { // first MAP to check 2 array (one about 'clients', two about 'address')
                                if (parseInt(index) === 0) {
                                    let responseHits = []  // Array that will be returned by the client's data
                                    _.map(response.hits.hits, (hit, index) => {
                                        let address = {} // Object of the address to be returned
                                        if (hit._source.addresses) { //Check if the client has a registered address
                                            if (hit.inner_hits.addresses.hits.total > 0) { //Checks for innerhits in client's addresses
                                                address = hit.inner_hits.addresses.hits.hits[0]._source //Get the highest score 
                                            }
                                            else {
                                                address = hit._source.addresses[0] // if don't catch the first address
                                            }
                                        }
                                        hit._source = _.omit(hit._source, 'addresses') // remove proprety 'addresses'

                                        let phones = [] // Array of the phones to be returned
                                        if (hit._source.phones) { //Check if the client has a registered phones
                                            if (hit.inner_hits.phones.hits.total > 0) { //Checks for innerhits in client's phones
                                                _.map(hit.inner_hits.phones.hits.hits, (innerHitPhone) => {
                                                    phones.push(innerHitPhone._source) // First added the innerHits sorted by score
                                                })
                                                _.map(hit._source.phones, (phone) => {
                                                    if (!_.find(phones, phone)) {
                                                        phones.push(phone) // After the others phones
                                                    }
                                                })
                                            }
                                            else {
                                                phones = hit._source.phones // if don't return all phones
                                            }
                                        }
                                        else {
                                            hit._source = _.omit(hit._source, 'phones') // remove proprety 'phones'
                                        }
                                        responseHits.push({ source: _.assign({}, { id: hit._id }, hit._source, { address: address }, { phones: phones }) }) // Create object and push to array
                                    })
                                    dataSearches[0] = (responseHits || responseHits != null) ? responseHits : []
                                }
                                else {
                                    let addresses = []
                                    _.map(response.hits.hits, (hit, index) => { //easy pizzy
                                        const addressId = parseInt(hit._id)
                                        addresses.push({ source: _.assign({}, { id: addressId }, hit._source) })
                                    })
                                    dataSearches[1] = (addresses || addresses != null) ? addresses : []
                                }
                            })
                            resolve(dataSearches)
                        }
                    })
            }).then((dataSearch) => {
                return dataSearch
            }).catch((err) => {
                return err.body
            })
        },

        getAll: (req, res, next) => {
            server.models.Client.findAll().then((clients) => {
                if (!clients) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: clients
                });
            });
        },
        getOne: (req, res, next) => {
            server.models.Client.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.models.ClientPhone,
                    as: 'clientPhones'
                }, {
                    model: server.models.ClientAddress,
                    as: 'clientAddresses',
                    include: [{
                        model: server.models.Address,
                        as: 'address'
                    }]
                }, {
                    model: server.models.ClientCustomField,
                    as: 'clientCustomFields',
                    include: [{
                        model: server.models.CustomField,
                        as: 'customField'
                    }]
                }]
            }).then((client) => {
                if (!client) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado.")
                    );
                }
                return res.send(200, {
                    data: client
                });
            });
        },
        createOne: (req, res, next) => {
            const createData = _.cloneDeep(req.body);
            server.models.Client.create(createData, {
                include: [{
                    model: server.models.ClientPhone,
                    as: 'clientPhones'
                }, {
                    model: server.models.ClientAddress,
                    as: 'clientAddresses',
                    include: [{
                        model: server.models.Address,
                        as: 'address'
                    }]
                }, {
                    model: server.models.ClientCustomField,
                    as: 'clientCustomFields',
                    include: [{
                        model: server.models.CustomField,
                        as: 'customField'
                    }]
                }]
            }).then((client) => {
                if (!client) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado.")
                    );
                }
                server.elasticSearch.index({
                    index: 'main',
                    type: 'client',
                    id: client.id,
                    body: {
                        companyId: client.companyId,
                        name: client.name,
                        obs: client.obs
                    }
                }, function (esErr, esRes, esStatus) {
                    if (esErr) {
                        console.error(esErr);
                        return next(
                            new restify.ResourceNotFoundError(esErr)
                        );
                    }
                    if ((_.has(createData, "clientAddresses") && createData.clientAddresses.length > 0) ||
                        (_.has(createData, "clientPhones") && createData.clientPhones.length > 0) ||
                        (_.has(createData, "clientCustomFields") && createData.clientCustomFields.length > 0)) {
                        if (_.has(createData, "clientAddresses") && createData.clientAddresses.length > 0) {
                            req.params['id'] = client.id;
                            saveAddresses(req, res, next).then((client) => {
                                return res.send(200, {
                                    data: client
                                });
                            }).catch((err) => {
                                next(err);
                            });
                        }
                        else if (_.has(createData, "clientPhones") && createData.clientPhones.length > 0) {
                            req.params['id'] = client.id;
                            savePhones(req, res, next).then((client) => {
                                return res.send(200, {
                                    data: client
                                });
                            }).catch((err) => {
                                next(err);
                            });
                        }
                        else if (_.has(createData, "clientCustomFields") && createData.clientCustomFields.length > 0) {
                            req.params['id'] = client.id;
                            saveCustomFields(req, res, next).then((client) => {
                                return res.send(200, {
                                    data: client
                                });
                            }).catch((err) => {
                                console.log(err);
                                next(err);
                            });
                        }
                    }
                    else {
                        return res.send(200, {
                            data: client
                        });
                    }
                });
            })
        },
        updateOne: (req, res, next) => {
            const updateData = _.cloneDeep(req.body);
            server.models.Client.update(updateData, {
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((client) => {
                if (!client) {
                    return next(
                        new restify.ResourceNotFoundError("Registro não encontrado.")
                    );
                }
                server.models.Client.findById(req.params.id, {
                    where: {
                        id: req.params.id,
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.ClientPhone,
                        as: 'clientPhones'
                    }, {
                        model: server.models.ClientAddress,
                        as: 'clientAddresses',
                        include: [{
                            model: server.models.Address,
                            as: 'address'
                        }]
                    }, {
                        model: server.models.ClientCustomField,
                        as: 'clientCustomFields',
                        include: [{
                            model: server.models.CustomField,
                            as: 'customField'
                        }]
                    }]
                }).then((client) => {
                    if (!client) {
                        return next(
                            new restify.ResourceNotFoundError("Registro não encontrado.")
                        );
                    }
                    server.elasticSearch.update({
                        index: 'main',
                        type: 'client',
                        id: client.id,
                        body: {
                            doc: {
                                companyId: client.companyId,
                                name: client.name,
                                obs: client.obs,
                                dateUpdated: client.dateUpdated,
                                dateCreated: client.dateCreated,
                                status: client.status
                            }
                        }
                    }, function (esErr, esRes) {
                        if (esErr) {
                            return next(
                                new restify.ResourceNotFoundError(esErr)
                            );
                        }

                        if ((_.has(updateData, "clientAddresses") && updateData.clientAddresses.length > 0) ||
                            (_.has(updateData, "clientPhones") && updateData.clientPhones.length > 0) ||
                            (_.has(updateData, "clientCustomFields") && updateData.clientCustomFields.length > 0)) {
                            if (_.has(updateData, "clientAddresses") && updateData.clientAddresses.length > 0) {
                                req.params['id'] = client.id;
                                saveAddresses(req, res, next).then((client) => {
                                    return res.send(200, {
                                        data: client
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                    next(err);
                                });
                            }
                            else if (_.has(updateData, "clientPhones") && updateData.clientPhones.length > 0) {
                                req.params['id'] = client.id;
                                savePhones(req, res, next).then((client) => {
                                    return res.send(200, {
                                        data: client
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                    next(err);
                                });
                            }
                            else if (_.has(updateData, "clientCustomFields") && updateData.clientCustomFields.length > 0) {
                                req.params['id'] = client.id;
                                saveCustomFields(req, res, next).then((client) => {
                                    return res.send(200, {
                                        data: client
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                    next(err);
                                });
                            }
                        }
                        else {
                            return res.send(200, {
                                data: client
                            });
                        }
                    })
                })
            });
        },

        removeOneAddress(req) {
            return server.sequelize.transaction(function (t) {
                return server.models.ClientAddress.destroy({
                    where: {
                        id: req.params.clientAddressId
                    },
                    transaction: t
                }).then((clientAddress) => {
                    if (!clientAddress) {
                        return new restify.ResourceNotFoundError("Registro não encontrado.");
                    }
                    return server.elasticSearch.update({
                        index: 'main',
                        type: 'client',
                        id: req.params.id,
                        body: {
                            script: {
                                lang: "groovy",
                                inline: "item_to_remove = null; ctx._source.addresses.each { elem -> if (elem.clientAddressId == clientAddressId) { item_to_remove=elem; } }; if (item_to_remove != null) ctx._source.addresses.remove(item_to_remove);",
                                params: { "clientAddressId": parseInt(req.params.clientAddressId) }
                            }
                        }
                    }, function (esErr, esRes) {
                        if (esErr) {
                            throw esErr;
                        }
                        return clientAddress;
                    });
                });
            }).then(function (clientAddress) {
                // Transaction has been committed
                return clientAddress
            }).catch(function (err) {
                return err
            });
        },
        getAddresses(req) {
            return server.models.ClientAddress.findAll({
                where: {
                    clientId: req.params.id,
                    status: 'activated'
                },
                include: [{
                    model: server.models.Address,
                    as: 'address'
                }]
            }).then((clientAddresses) => {
                if (!clientAddresses) {
                    return new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                }
                return clientAddresses
            });
        },
        saveAddresses(req, draftId) {
            draftId = (draftId) ? draftId : null
            return saveAddresses(req).then((address) => {
                if (draftId) {
                    let ids = Object.keys(server.io.sockets.connected)
                    ids.forEach(function (id) {
                        const socket = server.io.sockets.connected[id]
                        socket.in('draft/' + draftId).emit('updateDraft', { draftId: draftId, form: { client: { clientAddresses: address } } })
                    })
                }
                return address
            }).catch((err) => {
                return err
            });
        },
        removeOnePhone: (req, res, next) => {
            return server.sequelize.transaction(function (t) {
                return server.models.ClientPhone.destroy({
                    where: {
                        id: req.params.clientPhoneId
                    },
                    transaction: t
                }).then((clientPhone) => {
                    if (!clientPhone) {
                        throw new restify.ResourceNotFoundError("Registro não encontrado.");
                    }
                    return server.elasticSearch.update({
                        index: 'main',
                        type: 'client',
                        id: req.params.id,
                        body: {
                            script: {
                                lang: "groovy",
                                inline: "item_to_remove = null; ctx._source.phones.each { elem -> if (elem.clientPhoneId == clientPhoneId) { item_to_remove=elem; } }; if (item_to_remove != null) ctx._source.phones.remove(item_to_remove);",
                                params: { "clientPhoneId": parseInt(req.params.clientPhoneId) }
                            }
                        }
                    }, function (esErr, esRes) {
                        if (esErr) {
                            throw esErr;
                        }
                        return clientPhone;
                    });
                });
            }).then(function (clientPhone) {
                // Transaction has been committed
                return res.send(200, {
                    data: clientPhone
                });
            }).catch(function (err) {
                // Transaction has been rolled back
                console.log(err);
                return next(err);
            });

        },
        getPhones: (req, res, next) => {
            server.models.ClientPhone.findAll({
                where: {
                    clientId: req.params.id,
                    status: 'activated'
                }
            }).then((clientPhones) => {
                if (!clientPhones) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: clientPhones
                });
            });
        },
        savePhones(req, res, next) {
            savePhones(req, res, next).then((phone) => {
                return res.send(200, {
                    data: phone
                });
            }).catch((err) => {
                next(err);
            });
        },
        removeOneCustomField: (req, res, next) => {
            return server.sequelize.transaction(function (t) {
                return server.models.ClientCustomField.destroy({
                    where: {
                        id: req.params.customFieldId
                    },
                    transaction: t
                }).then((customField) => {
                    if (!customField) {
                        throw new restify.ResourceNotFoundError("Registro não encontrado.")
                    }
                    return customField
                })
            }).then((customField) => {
                // Transaction has been committed
                return res.send(200, {
                    data: customField
                });
            }).catch((err) => {
                // Transaction has been rolled back
                console.log(err);
                return next(err);
            });

        },
        getCustomFields: (req, res, next) => {
            server.models.ClientCustomField.findAll({
                where: {
                    clientId: req.params.id
                },
                include: [{
                    model: server.models.CustomField,
                    as: 'customField'
                }]
            }).then((customFields) => {
                if (!customFields) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: customFields
                });
            });
        },
        saveCustomFields(req, res, next) {
            saveCustomFields(req).then((customField) => {
                return res.send(200, {
                    data: customField
                });
            }).catch((err) => {
                next(err);
            });
        },
        exportToES: (req, res, next) => {
            let esRequestBody = [];
            server.models.Client.findAll({
                include: [{
                    model: server.models.ClientPhone,
                    as: 'clientPhones'
                }, {
                    model: server.models.ClientAddress,
                    as: 'clientAddresses',
                    include: [{
                        model: server.models.Address,
                        as: 'address'
                    }]
                }]
            }).then((clients) => {
                clients.forEach((client) => {
                    let metaObj = {};
                    metaObj.index = {
                        _index: 'main',
                        _type: 'client',
                        _id: client.id
                    }
                    esRequestBody.push(metaObj);
                    let docObj = {
                        companyId: client.companyId,
                        name: client.name,
                        obs: client.obs,
                        addresses: _.map(client.clientAddresses, clientAddress => {
                            return {
                                clientAddressId: clientAddress.id,
                                complement: clientAddress.complement,
                                address: clientAddress.address.name,
                                cep: clientAddress.address.cep,
                                neighborhood: clientAddress.address.neighborhood,
                                number: clientAddress.number
                            };
                        }),
                        phones: _.map(client.clientPhones, clientPhone => {
                            return {
                                clientPhoneId: clientPhone.id,
                                ddd: clientPhone.ddd,
                                number: clientPhone.number
                            };
                        }),
                        dateUpdated: client.dateUpdated,
                        dateCreated: client.dateCreated,
                        status: client.status
                    };
                    esRequestBody.push(docObj);
                });
                server.elasticSearch.bulk({
                    body: esRequestBody
                }, function (esErr, esRes) {
                    if (esErr) {
                        console.error(esErr);
                        return next(
                            new restify.ResourceNotFoundError(esErr)
                        );
                    }
                    return res.send(200, {
                        data: esRes
                    });
                });
            });
        }
    };

    /* -------------------------------------- */
    /* --- Reusable request functions ------------------------------------------
    /* -------------------------------------- */

    function saveAddresses(req) {
        if (!req.params.id || req.params.id === 0) {
            if (req.body.clientAddresses.addressId) {
                let createData = []
                _.map(req.body.clientAddresses, (address, index) => {
                    createData[index] = _.forOwn(address, (value, key) => {

                    })
                })
                //server.models.Address.bulkCreate(createData)
            }
        }
        return new Promise((resolve, reject) => {
            let clientAddresses = _.map(req.body.clientAddresses, clientAddress => _.extend({
                addressId: parseInt(clientAddress.addressId),
                clientId: parseInt(req.params.id)
            }, clientAddress));

            server.models.ClientAddress.bulkCreate(clientAddresses, {
                updateOnDuplicate: ['clientId', 'addressId', 'name', 'number', 'complement'],
                returning: true
            }).then((response) => {
                if (!response) {
                    reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                }
                let clientAddresses = _.map(response.clientAddresses, clientAddress => {
                    return {
                        clientAddressId: clientAddress.id,
                        complement: clientAddress.complement,
                        address: clientAddress.address.name,
                        number: clientAddress.number,
                        cep: clientAddress.address.cep,
                        neighborhood: clientAddress.address.neighborhood
                    };
                });
                server.elasticSearch.update({
                    index: 'main',
                    type: 'client',
                    id: response.clientId,
                    body: {
                        doc: {
                            addresses: clientAddresses
                        }
                    }
                }, (esErr, esRes) => {

                    resolve(response);
                })
            }).catch((error) => {
                reject(error);
            });
        })
    }

    function savePhones(req, res, next) {
        return new Promise((resolve, reject) => {
            let clientPhones = _.map(req.body.clientPhones, clientPhone => _.extend({
                clientId: parseInt(req.params.id)
            }, clientPhone));
            console.log(clientPhones);
            server.models.ClientPhone.bulkCreate(clientPhones, {
                updateOnDuplicate: ['clientId', 'name', 'ddd', 'number']
            }).then((response) => {
                server.models.Client.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.ClientPhone,
                        as: 'clientPhones'
                    }, {
                        model: server.models.ClientAddress,
                        as: 'clientAddresses',
                        include: [{
                            model: server.models.Address,
                            as: 'address'
                        }]
                    }]
                }).then((client) => {
                    if (!client) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }
                    let clientPhones = _.map(client.clientPhones, clientPhone => {
                        return {
                            clientPhoneId: clientPhone.id,
                            ddd: clientPhone.ddd,
                            number: clientPhone.number
                        };
                    });
                    server.elasticSearch.update({
                        index: 'main',
                        type: 'client',
                        id: client.id,
                        body: {
                            doc: {
                                phones: clientPhones
                            }
                        }
                    }, function (esErr, esRes) {
                        resolve(client);
                    })
                }).catch((error) => {
                    reject(error);
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    function saveCustomFields(req, res, next) {
        return new Promise((resolve, reject) => {
            let clientCustomFields = _.map(req.body.clientCustomFields, clientCustomField => _.extend({
                clientId: parseInt(req.params.id)
            }, clientCustomField));

            console.log(clientCustomFields);

            server.models.ClientCustomField.bulkCreate(clientCustomFields, {
                updateOnDuplicate: ['clientId', 'customFieldId', 'value']
            }).then(() => {
                server.models.Client.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.ClientPhone,
                        as: 'clientPhones'
                    }, {
                        model: server.models.ClientAddress,
                        as: 'clientAddresses',
                        include: [{
                            model: server.models.Address,
                            as: 'address'
                        }]
                    }, {
                        model: server.models.ClientCustomField,
                        as: 'clientCustomFields',
                        include: [{
                            model: server.models.CustomField,
                            as: 'customField'
                        }]
                    }]
                }).then((client) => {
                    if (!client) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }
                    resolve(client);
                }).catch((error) => {
                    reject(error);
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    }

};