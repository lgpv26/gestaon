const _ = require('lodash');
const utils = require('../utils');

module.exports = (server, restify) => {
    const addressesController = require('./../controllers/addresses.controller')(server, restify);
    const clientsAddressesController = require('./../controllers/clients-addresses.controller')(server, restify);
    const clientsPhonesController = require('./../controllers/clients-phones.controller')(server, restify);
    const clientsCustomFieldsController = require('./../controllers/clients-custom-fields.controller')(server, restify);

    return {
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
            let createData = _.cloneDeep(req.body);
            createData.companyId = req.params.companyId
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

        ///////////////////
        //    ADDRESS    //
        ///////////////////
        removeOneAddress(req) {
            return clientsAddressesController.removeClientAddress(req).then((removeClientAddress) => {
                return removeClientAddress
            })
        },
        getAddresses(req) {
            return clientsAddressesController.getClientAddresses(req).then((getAll) => {
                return getAll
            })
        },
        saveAddresses(req) {
            return saveAddresses(req).then((address) => {
                /*if (draftId) {
                    let ids = Object.keys(server.io.sockets.connected)
                    ids.forEach(function (id) {
                        const socket = server.io.sockets.connected[id]
                        socket.in('draft/' + draftId).emit('updateDraft', { draftId: draftId, form: { client: { clientAddresses: address } } })
                    })
                }*/
                return address
            }).catch((err) => {
                return err
            });
        },

        ///////////////////
        //     PHONES    //
        ///////////////////
        removeOnePhone(req) {
            return clientsPhonesController.removeOne(req).then((phoneDeleted) => {
                return phoneDeleted
            })
        },
        getPhones(req) {
            return clientsPhonesController.getPhones(req).then((getAllPhones) => {
                return getAllPhones
            })
        },
        savePhones(req) {
            return clientsPhonesController.savePhones(req).then((phone) => {
                return phone
            }).catch((err) => {
                return err
            });
        },

        ///////////////////
        // CUSTOM FIELDS //  
        ///////////////////
        removeOneCustomField(req) {
            return clientsCustomFieldsController.removeOne(req).then((customFieldDeleted) => {
                return customFieldDeleted
            })
        },
        getCustomFields(req) {
            return clientsCustomFieldsController.getClientCustomFields(req).then((allCustomField) => {
                return allCustomField
            })
        },
        getOneCustomField(req) {
            return clientsCustomFieldsController.getOne(req).then((oneCustomField) => {
                return oneCustomField
            })
        },
        saveCustomFields(req) {
            return clientsCustomFieldsController.saveClientCustomFields(req).then((customField) => {
                return customField
            }).catch((err) => {
                return err
            });
        },

        ///////////////////
        // EXPORT TO ES  //  
        ///////////////////
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
                },{
                    model: server.models.ClientCustomField,
                    as: 'clientCustomFields',
                    include: [{
                        model: server.models.CustomField,
                        as: 'customField'
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
                        legaldocuments: _.map(client.clientCustomFields, clientCustomField => {
                            return {
                                clientCustomFieldId: clientCustomField.id,
                                documentType: clientCustomField.customField.name, 
                                documentNumber: clientCustomField.value
                            };
                        }),
                        dateUpdated: client.dateUpdated,
                        dateCreated: client.dateCreated,
                        status: client.status
                    };
                    esRequestBody.push(docObj);
                });
                console.log(esRequestBody);
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
    /* --- Reusable request functions ------- */
    /* -------------------------------------- */

    function saveAddresses(req) {
        return new Promise((resolve, reject) => {
            let errors = []
            server.sequelize.transaction().then(function (t) {
                let addressesResolverPromisses = []

                req.params.addresses = _.map(req.body.clientAddresses, (clientAddress) => {
                    return _.assign(clientAddress.address, { companyId: parseInt(req.params.companyId), status: "activated" })
                })

                addressesResolverPromisses.push(addressesController.saveAddresses(req).then((response) => {
                    return response
                }))

                return Promise.all(addressesResolverPromisses).then((resolvedAddressPromisses) => {

                    _.first(resolvedAddressPromisses).forEach((result) => {
                        const index = _.findIndex(req.body.clientAddresses, (findAddress) => {
                            if (!findAddress.address.id) return null === null
                            return findAddress.address.id === result.id
                        })
                        req.body.clientAddresses[index].clientId = parseInt(req.params.id)
                        req.body.clientAddresses[index].addressId = result.id
                        req.body.clientAddresses[index].address = result
                    })

                    let clientAddressesPromisses = []
                    clientAddressesPromisses.push(clientsAddressesController.saveClientAddresses(req).then((response) => {
                        return response
                    }))


                    return Promise.all(clientAddressesPromisses).then((resultAddressPromise) => {
                        if (errors.length && _.first(errors).rollback) {
                            t.rollback()
                            reject(_.first(errors).error)
                        }
                        else {
                            t.commit()
                            _.map(resultAddressPromise, (result) => {
                                resolve(result)
                            })
                        }
                    }).catch((err) => {
                        //console.log(err)
                        t.rollback()
                        reject(err)
                    })
                }).catch((err) => {
                    t.rollback()
                    reject(err)
                })
            })
        })
    }
};