const _ = require('lodash');
const utils = require('../utils/index');

module.exports = (server, restify) => {
    return {
        search(req) {
            /* preparing settings data */
            let actingCitiesString = "";
            if (typeof req.query.actingCities !== "undefined") {
                req.query.actingCities.forEach(function (actingCity, index) {
                    actingCitiesString += " " + actingCity;
                });
                actingCitiesString = utils.removeDiacritics(actingCitiesString.trim());
            }

            return new Promise((resolve, reject) => {
                if (!req.query.companyId) {
                    return reject(new restify.BadDigestError("CompanyId is requerid."))
                }
                server.elasticSearch.msearch({
                    body: [
                        {
                            index: 'main',
                            type: 'client'
                        },
                        {
                            "from": 0,
                            "size": 20,
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": utils.removeDiacritics(req.query.q.trim()),
                                                            "fields": [
                                                                "name^7",
                                                                "obs^2",
                                                                "legalDocument^2"
                                                            ],
                                                            "operator": "or",
                                                            "analyzer": "standard"
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "customFields",
                                                            "query": {
                                                                
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "customFields.documentValue^3"
                                                                    ],
                                                                    "analyzer": "standard",
                                                                    "operator": "and"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "addresses",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "addresses.address^6", "addresses.number^5", "addresses.complement^4", 
                                                                        "addresses.cep^1", "addresses.neighborhood^2"
                                                                    ],
                                                                    "analyzer": "standard",
                                                                    "operator": "and",
                                                                    "type": "cross_fields"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "phones",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "phones.ddd^6", "phones.number^6"
                                                                    ],
                                                                    "analyzer": "standard",
                                                                    "operator": "and",
                                                                    "type": "cross_fields"
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": utils.removeDiacritics(req.query.q.trim()),
                                                            "fields": [
                                                                "name^7",
                                                                "obs^2",
                                                                "legalDocument^2"
                                                            ],
                                                            "operator": "and",
                                                            "analyzer": "standard",
                                                            "type": "cross_fields"
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "addresses",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "addresses.address^6", "addresses.number^5", "addresses.complement^4", 
                                                                        "addresses.cep^1", "addresses.neighborhood^2"
                                                                    ],
                                                                    "analyzer": "standard"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "customFields",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "customFields.documentValue^3"
                                                                    ],
                                                                    "analyzer": "standard"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "phones",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "phones.ddd^6", "phones.number^6"
                                                                    ],
                                                                    "analyzer": "standard"
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": utils.removeDiacritics(req.query.q.trim()),
                                                            "fields": [
                                                                "name^7",
                                                                "obs^2",
                                                                "legalDocument^2"
                                                            ],
                                                            "analyzer": "standard",
                                                            "operator": "or",
                                                            "minimum_should_match": "75%"
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "addresses",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "addresses.address^6", "addresses.number^5", "addresses.complement^4", 
                                                                        "addresses.cep^1", "addresses.neighborhood^2"
                                                                    ],
                                                                    "analyzer": "standard",
                                                                    "operator": "or",
                                                                    "minimum_should_match": "75%"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "customFields",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "customFields.documentValue^3"
                                                                    ],
                                                                    "analyzer": "standard",
                                                                    "operator": "or",
                                                                    "minimum_should_match": "75%"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "nested": {
                                                            "inner_hits": {},
                                                            "path": "phones",
                                                            "query": {
                                                                "multi_match": {
                                                                    "query": utils.removeDiacritics(req.query.q.trim()),
                                                                    "fields": [
                                                                        "phones.ddd^6", "phones.number^6"
                                                                    ],
                                                                    "analyzer": "standard",
                                                                    "operator": "or",
                                                                    "minimum_should_match": "75%"
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    "filter": {
                                        "term": {
                                            "companyId": req.query.companyId
                                        }
                                    }
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
                                            "query": utils.removeDiacritics(req.query.q.trim()),
                                            "fields": ["name^4", "cep", "neighborhood^2"],
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
                                    if(!_.has(response, 'hits.hits')) return
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
                                    if(!_.has(response, 'hits.hits')) return
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
        }

    }
};
