const _ = require('lodash');
const utils = require('../utils');

module.exports = (server, restify) => {
    return {
        search: (req, res, next) => {

            /* preparing settings data */

            let actingCitiesString = "";
            if (typeof req.params.actingCities !== "undefined") {
                req.params.actingCities.forEach(function (actingCity, index) {
                    actingCitiesString += " " + actingCity;
                });
                actingCitiesString = utils.removeDiacritics(actingCitiesString.trim());
            }

            server.elasticSearch.msearch({
                body: [
                    {
                        index: 'main',
                        type: 'client'
                    },
                    {
                        "from": 0, "size": 10,
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "nested": {
                                            "path": "addresses",
                                            "inner_hits": {},
                                            "query": {
                                                "multi_match": {
                                                    "query": utils.removeDiacritics(req.params.q.trim()),
                                                    "fields": ["addresses.address^3", "addresses.number^2", "addresses.complement^2", "addresses.cep^5"],
                                                    "analyzer": "standard",
                                                    "operator": "or",
                                                    "minimum_should_match": "2"
                                                }
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
                                                    "operator": "or"
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
                                ]
                            }
                        }
                    },
                    {
                        index: 'main',
                        type: 'address'
                    },
                    {
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
                ]
            },
                function (esErr, esRes, esStatus) {
                    if (esErr) {
                        console.error("Search error: ", esErr);
                        return next(
                            new restify.ResourceNotFoundError("Erro no ElasticSearch.")
                        );
                    }
                    else {

                        // substituir o addresses por um unico obj (se der InnerHits por ele, e se tiver + de 1 inner (retorna com o maior score), se não pelo primeiro).
                        // E se não tiver address cadastrado, nem retornar (address)
                        // retornar todos os phones, ordenar por _.score (onde o innerHits são os primeiros). E se não tiver phones cadastrado, nem retornar (address)
                        // fazer a documetnação 
                        // remover o telefone duplicado no innerHit
                        let dataSearches = []
                        _.map(esRes.responses, (response, index) => {
                            if (parseInt(index) === 0) {
                                if (response.hits.total > 0) {
                                    let responseHits = []
                                    _.map(response.hits.hits, (hit, index) => {

                                        let address = {}
                                        if (hit._source.addresses) {
                                            if (hit.inner_hits.addresses.hits.total > 0) {
                                                _.map(hit.inner_hits.addresses.hits.hits, (innerHitAddress) => {
                                                    address = innerHitAddress._source
                                                })
                                            }

                                            else {
                                                address = hit._source.addresses[0]
                                            }
                                        }
                                        hit._source = _.omit(hit._source, 'addresses')

                                        let phones = []
                                        if (hit._source.phones) {
                                            if (hit.inner_hits.phones.hits.total > 0) {
                                                _.map(hit.inner_hits.phones.hits.hits, (innerHitPhone) => {
                                                    phones.push(innerHitPhone._source)
                                                })
                                                _.map(hit._source.phones, (phone) => {
                                                    if (!_.includes(phones, phone)) {
                                                        phones.push(phone)
                                                    }
                                                })
                                            }
                                            else {
                                                phones = hit._source.phones
                                            }
                                        }
                                        else {
                                            _.omit(hit._source, 'phones')
                                        }

                                        responseHits.push({ source: _.assign({}, {id: hit._id}, hit._source, { address: address }, { phones: phones }) })
                                    })
                                    dataSearches.push(responseHits)
                                }
                            }
                            else {
                                if (response.hits.total > 0) {
                                    _.map(response.hits.hits, (hit, index) => {
                                        const addressId = parseInt(hit._id)
                                        dataSearches.push({ source: _.assign({}, { id: addressId }, hit._source) })
                                    })
                                }
                            }
                        })

                        return res.send(200, {
                            data: dataSearches
                        });
                    }
                })
        },
        findClients: (req, res, next) => {
            let searchString = "";
            if (typeof req.params.chips !== "undefined") {
                req.params.chips.forEach(function (chip, index) {
                    searchString += " " + chip;
                });
                searchString = utils.removeDiacritics(searchString.trim());
            }

            server.elasticSearch.search(
                {
                    index: 'main',
                    type: 'client',
                    body: {
                        "from": 0, "size": 10,
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "nested": {
                                            "path": "addresses",
                                            "inner_hits": {},
                                            "query": {
                                                "multi_match": {
                                                    "query": searchString,
                                                    "fields": ["addresses.address^3", "addresses.number^2", "addresses.complement^2"],
                                                    "analyzer": "standard"
                                                }
                                            },
                                            "boost": 2
                                        }
                                    },
                                    {
                                        "multi_match": {
                                            "query": searchString,
                                            "fields": ["name", "obs"],
                                            "analyzer": "standard"
                                        }
                                    }
                                ]
                            }
                        },
                        "highlight": {
                            "pre_tags": ["<em>"],
                            "post_tags": ["</em>"],
                            "fields": {
                                "_all": {}
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
                            dataSearch[index] = _.assign({}, { id: addressId }, hit._source)
                        })
                        return res.send(200, {
                            data: esRes
                        });
                    }
                }
            )
        }
    }
};
