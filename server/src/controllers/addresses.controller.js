const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op

module.exports = (server, restify) => {
    return {
        search: (req, res, next) => {
            let actingCitiesString = "";
            if (typeof req.params.actingCities !== "undefined") {
                req.params.actingCities.forEach(function (actingCity, index) {
                    actingCitiesString += " " + actingCity;
                });
                actingCitiesString = utils.removeDiacritics(actingCitiesString.trim());
            }
            server.elasticSearch.search(
                {
                    index: 'main',
                    type: 'address',
                    body: {
                        "from": 0, "size": 10,
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
                },
                function (esErr, esRes, esStatus) {
                    if (esErr) {
                        console.error("Search error: ", esErr);
                        return next(
                            new restify.ResourceNotFoundError("Erro no ElasticSearch.")
                        );
                    }
                    else {
                        let dataSearch = []
                        _.map(esRes.hits.hits, (hit, index) => {
                            const addressId = parseInt(hit._id)
                            dataSearch[index] = { source: _.assign({}, { id: addressId }, hit._source) }
                        })

                        if (dataSearch < 1) {
                            return next(
                                new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                            );
                        }
                        else {
                            return res.send(200, {
                                data: dataSearch
                            });
                        }
                    }
                }
            )
        },
        
        getOne(req) {
           return server.mysql.Address.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((address) => {
                return address
            })
        },

        saveAddresses(req) {
            let addressCantChange = []
            return new Promise((resolve, reject) => {
                let addressesResolverPromisses = []
                
                addressesResolverPromisses.push(new Promise((resolve, reject) => {
                    let addressesIds = []
                    req.params.addresses.forEach((forEachAddress, index) => {
                        if (forEachAddress.id) {
                            addressesIds.push(forEachAddress.id)
                        }
                        else {
                            req.params.addresses[index].companyId = parseInt(req.params.companyId)
                        }
                    })
                    server.mysql.Address.findAll({
                        where: {
                            id: {
                                [Op.in]: addressesIds
                            }
                        }
                    }).then((addressesConsult) => {
                        addressesConsult.forEach((result) => {
                            const index = _.findIndex(req.params.addresses, (addressesFind) => {
                                return addressesFind.id === result.id
                            })
                            if (result.companyId === 0) {
                                addressCantChange.push(result)
                                req.params.addresses.splice(index, 1)
                            }
                        })
                        resolve(req.params.addresses)
                    })
                })
                )

                return Promise.all(addressesResolverPromisses).then(() => {
                   
                    server.mysql.Address.bulkCreate(req.params.addresses, {
                        updateOnDuplicate: ['name', 'neighborhood', 'city', 'state', 'cep'],
                        returning: true
                    }).then((addressesBulk) => {
                        if (!addressesBulk) {
                            reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                        }
                        let addressChange = []

                        let esRequestBody = []
                        _.map(addressesBulk, (address) => {
                            addressChange.push(address)

                            let metaObj = {}
                            metaObj.index = {
                                _index: 'main',
                                _type: 'address',
                                _id: address.id
                            }
                            esRequestBody.push(metaObj)
                            let docObj = {
                                companyId: address.companyId,
                                name: address.name,
                                neighborhood: address.neighborhood,
                                city: address.city,
                                state: address.state,
                                cep: address.cep,
                                dateUpdated: address.dateUpdated,
                                dateCreated: address.dateCreated,
                                status: address.status
                            }
                            esRequestBody.push(docObj)
                        })
                        
                        server.elasticSearch.bulk({
                            body: esRequestBody
                        }, function (esErr) {
                            if (esErr) {
                                reject(addressChange)
                            }
                            else {
                                resolve(addressChange)
                            }
                        })
                        resolve(addressChange)
                    }).catch((error) => {
                        reject(error);
                    })

                })
            }).then((response) => {
                return _.concat((response) ? response : [], (addressCantChange) ? addressCantChange : [])
            }).catch((error) => {
                return error
            })
        },

        removeOne(req) {
            return server.sequelize.transaction(function (t) {
                return server.mysql.Address.destroy({
                    where: {
                        id: req.params.addressId,
                        companyId: {
                            [Op.not]: 0,
                            [Op.eq]: parseInt(req.params.companyId)
                        }
                    },
                    transaction: t
                }).then((address) => {
                    if (!address) {
                        return new restify.ResourceNotFoundError("Registro não encontrado.");
                    }
                    return server.elasticSearch.delete({
                        index: 'main',
                        type: 'address',
                        id: req.params.addressId,
                    }, function (esErr, esRes) {
                        if (esErr) {
                            throw esErr;
                        }
                        return address;
                    });
                });
            }).then(function (address) {
                // Transaction has been committed
                return address
            }).catch(function (err) {
                return err
            });
        },

        exportToES(req, res, next) {
            let esRequestBody = [];
            server.mysql.Address.findAll({}).then((addresses) => {
                addresses.forEach((address) => {
                    let metaObj = {};
                    metaObj.index = {
                        _index: 'main',
                        _type: 'address',
                        _id: address.id
                    }
                    esRequestBody.push(metaObj);
                    let docObj = {
                        companyId: address.companyId,
                        name: address.name,
                        neighborhood: address.neighborhood,
                        city: address.city,
                        state: address.state,
                        cep: address.cep,
                        dateUpdated: address.dateUpdated,
                        dateCreated: address.dateCreated,
                        status: address.status
                    }
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
    }
};
