const _ = require('lodash');
const utils = require('../utils');

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
                            dataSearch[index] = {source: _.assign({}, {id: addressId}, hit._source)}
                        })
                                                
                        if (dataSearch < 1) {
                            return next(
                                new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                            );
                        }
                        else{
                            return res.send(200, {
                                data: dataSearch
                            });
                        }                      
                    }
                }
            )
        },
        getOne: (req, res, next) => {
            server.models.Address.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((address) => {
                if (!address) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: address
                });
            });
        },
        exportToES(req, res, next) {
            let esRequestBody = [];
            server.models.Address.findAll({}).then((addresses) => {
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
