const _ = require('lodash');
const utils = require('../utils/index');
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

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

        saveAddresses: (controller) => {
            let addressCantChange = []
            return new Promise((resolve, reject) => {
                let addressesResolverPromisses = []

                let setData = _.cloneDeep(controller.request.data)

                addressesResolverPromisses.push(new Promise((resolve, reject) => {
                        let addressesIds = []
                        setData.forEach((forEachAddress, index) => {
                            if (forEachAddress.address.id) {
                                addressesIds.push(forEachAddress.address.id)
                            }
                            else {
                                setData[index].address.companyId = parseInt(controller.request.companyId)
                            }
                        })
                        server.mysql.Address.findAll({
                            where: {
                                id: {
                                    [Op.in]: addressesIds
                                }
                            },
                            transaction: controller.transaction
                        }).then((addressesConsult) => {
                            addressesConsult.forEach((result) => {
                                const index = _.findIndex(setData, (addressesFind) => {
                                    return addressesFind.address.id === result.id
                                })
                                if (result.companyId === 0) {
                                    addressCantChange.push(_.assign(setData[index], {address: JSON.parse(JSON.stringify(result))}))
                                    setData.splice(index, 1)
                                }
                            })
                            resolve(setData)
                        })
                    })
                )

                return Promise.all(addressesResolverPromisses).then((setData) => {
                    let addressChangePromises = []
                    _.first(setData).forEach((clientAddress) => {
                        if (clientAddress.address.id) {
                            const addressUpdate = new Controller({
                                request: {
                                    data: clientAddress.address
                                },
                                transaction: controller.transaction
                            })
                            addressChangePromises.push(updateOne(addressUpdate).then((updatedAddress) => {
                                    return _.assign(clientAddress, {address: updatedAddress.address}, {addressES: updatedAddress.esAddress})
                                })
                            )
                        }
                        else {
                            const addressCreate = new Controller({
                                request: {
                                    companyId: controller.request.companyId,
                                    data: clientAddress.address
                                },
                                transaction: controller.transaction
                            })
                            addressChangePromises.push(createOne(addressCreate).then((createdAddress) => {
                                    return _.assign(clientAddress, {address: createdAddress.address}, {addressES: createdAddress.esAddress})
                                })
                            )
                        }
                    })

                    return Promise.all(addressChangePromises).then((addresses) => {
                        resolve(addresses)
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
        },

        saveAddressesInES: (controller) => {
            return new Promise((resolve, reject) => {
                let setData = _.cloneDeep(controller.request.data)
                if(setData.createES){
                    return server.elasticSearch.index({
                        index: 'main',
                        type: 'address',
                        id: setData.id,
                        body: setData.body

                    }, function (esErr, esRes, esStatus) {
                        if (esErr) {
                            reject(esErr)
                        }
                        resolve()
                    })
                }
                else{
                    return server.elasticSearch.update({
                        index: 'main',
                        type: 'address',
                        id: setData.id,
                        body: {
                            doc: setData.body
                        }
                    }, function (esErr, esRes, esStatus) {
                        if (esErr) {
                            reject(esErr)
                        }
                        resolve()
                    })

                }
            })
        }

    }

    function createOne(controller) {
        return new Promise((resolve, reject) => {

            const createData = _.cloneDeep(controller.request.data)
            return server.mysql.Address.create(createData, {
                transaction: controller.transaction
            }).then((address) => {
                if (!address) {
                    reject("Não foi possível encontrar o address criado.")
                }
                address = JSON.parse(JSON.stringify(address))

                const esAddress = {
                    id: address.id,
                    body: {
                        companyId: address.companyId,
                        name: address.name,
                        neighborhood: address.neighborhood,
                        city: address.city,
                        state: address.state,
                        cep: address.cep,
                        dateUpdated: address.dateUpdated,
                        dateCreated: address.dateCreated,
                        status: address.status
                    },
                    createES: true
                }
                resolve({address: address, esAddress: esAddress})
            })
        }).then((address) => {
            return address
        }).catch((err) => {
            return err
        })
    }

    function updateOne(controller) {
        return new Promise((resolve, reject) => {

            const updateData = _.cloneDeep(controller.request.data)
            return server.mysql.Address.update(updateData, {
                where: {
                    id: updateData.id
                },
                transaction: controller.transaction
            }).then((addressUpdate) => {
                if (!addressUpdate) {
                    reject("Não foi possível encontrar o address editado.")
                }
                return server.mysql.Address.findById(controller.request.data.id, {
                    transaction: controller.transaction
                }).then((address) => {
                    address = JSON.parse(JSON.stringify(address))

                    const esAddress = {
                        id: address.id,
                        body: {
                            companyId: address.companyId,
                            name: address.name,
                            neighborhood: address.neighborhood,
                            city: address.city,
                            state: address.state,
                            cep: address.cep,
                            dateUpdated: address.dateUpdated,
                            dateCreated: address.dateCreated,
                            status: address.status
                        },
                        createES: false
                    }
                    resolve({address: address, esAddress: esAddress})
                })
            })
        }).then((address) => {
            return address
        }).catch((err) => {
            return err
        })
    }
};
