const _ = require('lodash');
const utils = require('../utils');

module.exports = (server, restify) => {
    return {
        search: (req, res, next) => {
            
            /* preparing settings data */

            let actingCitiesString = "";
            if(typeof req.params.actingCities !== "undefined"){
                req.params.actingCities.forEach(function(actingCity, index){
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
                        "from" : 0, "size" : 10,
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "nested": {
                                            "path": "addresses",
                                            "inner_hits" : {},
                                            "query": {
                                                "multi_match": {
                                                    "query": utils.removeDiacritics(req.params.q.trim()),
                                                    "fields": ["addresses.address^3","addresses.number^2","addresses.complement^2"],
                                                    "analyzer": "standard",
                                                    "operator": "OR"
                                                }
                                            },
                                            "boost": 2
                                        }
                                    },
                                    {
                                        "multi_match": {
                                            "query": utils.removeDiacritics(req.params.q.trim()),
                                            "fields": ["name","obs"],
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
                        "from" : 0, "size" : 10,
                        "query": {
                            "bool": {
                                "must": {
                                    "multi_match": {
                                        "query": utils.removeDiacritics(req.params.q.trim()),
                                        "fields": ["name","cep"],
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
            function (esErr,esRes,esStatus) {
                if (esErr){
                    console.error("Search error: ", esErr);
                    return next(
                        new restify.ResourceNotFoundError("Erro no ElasticSearch.")
                    );
                }
                else{
                    return res.send(200, {
                        data: esRes
                    });
                }
            })
        },
        findClients: (req, res, next) => {
            let searchString = "";
            if(typeof req.params.chips !== "undefined"){
                req.params.chips.forEach(function(chip, index){
                    searchString += " " + chip;
                });
                searchString = utils.removeDiacritics(searchString.trim());
            }

            server.elasticSearch.search(
                {
                    index: 'main',
                    type: 'client',
                    body: {
                        "from" : 0, "size" : 10,
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "nested": {
                                            "path": "addresses",
                                            "inner_hits" : {},
                                            "query": {
                                                "multi_match": {
                                                    "query": searchString,
                                                    "fields": ["addresses.address^3","addresses.number^2","addresses.complement^2"],
                                                    "analyzer": "standard"
                                                }
                                            },
                                            "boost": 2
                                        }
                                    },
                                    {
                                        "multi_match": {
                                            "query": searchString,
                                            "fields": ["name","obs"],
                                            "analyzer": "standard"
                                        }
                                    }
                                ]
                            }
                        },
                        "highlight" : {
                            "pre_tags" : ["<em>"],
                            "post_tags" : ["</em>"],
                            "fields" : {
                                "_all" : {}
                            }
                        }
                    }
                },
                function (esErr,esRes,esStatus) {
                    if (esErr){
                        console.error("Search error: ", esErr);
                        return next(
                            new restify.ResourceNotFoundError("Erro no ElasticSearch.")
                        );
                    }
                    else{
                        return res.send(200, {
                            data: esRes
                        });
                    }
                }
            )
        }
    }
};
