const _ = require('lodash')
const utils = require('../utils')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const addressesController = require('./../controllers/addresses.controller')(server, restify);
    const clientsAddressesController = require('./../controllers/clients-addresses.controller')(server, restify);
    const clientsPhonesController = require('./../controllers/clients-phones.controller')(server, restify);
    const clientsCustomFieldsController = require('./../controllers/clients-custom-fields.controller')(server, restify);
    const clientsGroupController = require('./../controllers/clients-group.controller')(server, restify);

    return {
        getAll: (req, res, next) => {
            server.mysql.Client.findAll().then((clients) => {
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

        getOne(req) {
           return server.mysql.Client.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
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
                }]
            }).then((client) => {
                  return client
            })
        },

        createOne: (controller) => {
            const createData = _.cloneDeep(controller.request.data)
            _.assign(createData, {
                companyId: controller.request.companyId
            })
            return server.mysql.Client.create(createData, {
                transaction: controller.transaction
            }).then((client) => {
                if (!client){
                    throw new Error("Não foi possível encontrar o cliente criado.")
                }
                return new Promise((resolve, reject) => {

                    const promises = [];

                    promises.push(new Promise((resolve, reject) => {
                        const esClient = {
                            id: client.id,
                            body: {
                                companyId: client.companyId,
                                name: client.name,
                                obs: client.obs,
                                legalDocument: client.legalDocument
                            }
                        }
                        resolve({clientES: esClient})
                    }))

                 /* save clientPhones if existent */
                    if(_.has(createData, "clientPhones")) {
                        const clientPhonesControllerObj = new Controller({
                            request: {
                                clientId: client.id || null,
                                data: createData.clientPhones
                            },
                            transaction: controller.transaction
                        })
                        promises.push(clientsPhonesController.setClientPhones(clientPhonesControllerObj))
                    }

                    /* save clientAddresses if existent */
                    if(_.has(createData, "clientAddresses") && createData.clientAddresses.length) {
                        const clientAddressesControllerObj = new Controller({
                            request: {
                                clientId: client.id || null,
                                companyId: createData.companyId,
                                data: createData.clientAddresses
                            },
                            transaction: controller.transaction
                        })
                        promises.push(clientsAddressesController.setClientAddresses(clientAddressesControllerObj))
                    }
        
                    /* save clientCustomFields if existent */
                    if(_.has(createData, "clientCustomFields") && createData.clientCustomFields.length) {

                        const clientCustomFieldControllerObj = new Controller({
                            request: {
                                clientId: client.id,
                                companyId: createData.companyId,
                                data: createData.clientCustomFields
                            },
                            transaction: controller.transaction
                        })
                        promises.push(clientsCustomFieldsController.setClientCustomFields(clientCustomFieldControllerObj))
                    }

                    /* save clientGroups if existent */
                    if(_.has(createData, "clientGroups") && createData.clientGroups.length) {

                        const clientGroupsControllerObj = new Controller({
                            request: {
                                companyId: createData.companyId,
                                data: createData.clientGroups
                            },
                            transaction: controller.transaction
                        })
                        promises.push(clientsGroupController.setClientGroup(clientGroupsControllerObj))
                    }

                    /* return only when all promises are satisfied */
                    return Promise.all(promises).then((clientEs) => {
                        const objES = {}
                        _.map(clientEs, (value) => {
                            _.assign(objES, value)
                        })

                        let addressesESPromise = []
                            if(_.has(objES, "addressesES") && objES.addressesES){
                                objES.addressesES.forEach((addressEs) => {  
                                    const addressESControllerObj = new Controller({
                                        request: {
                                            data: addressEs
                                        },
                                        transaction: controller.transaction
                                    })
                                    addressesESPromise.push(addressesController.saveAddressesInES(addressESControllerObj))
                                })
                            }

                            return Promise.all(addressesESPromise).then(() => {
                                const body = _.assign({}, objES.clientES.body, {addresses: objES.clientAddressesES}, {customFields: objES.customFieldsES}, {phones: objES.phonesES})

                                return server.elasticSearch.index({
                                        index: 'main',
                                        type: 'client',
                                        id: objES.clientES.id,
                                        body: body
                                    }, function (esErr, esRes, esStatus) {
                                        if (esErr) {
                                            return reject(new Error(esErr))
                                        }

                                        return server.mysql.Client.findById(objES.clientES.id, {
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
                                            }],
                                            transaction: controller.transaction
                                        }).then((clientReturn) => {
                                            clientReturn = (clientReturn) ? JSON.parse(JSON.stringify(clientReturn)) : {}
                                            const clientAddressId = (objES.clientAddressId) ? {clientAddressId: objES.clientAddressId} : {}
                                            const clientPhoneId = (objES.clientPhoneId) ? {clientPhoneId: objES.clientPhoneId} : {}
                                            
                                            resolve(_.assign(clientReturn, clientAddressId, clientPhoneId))
                                        })
                                    }
                                )
                            }).catch((err) => {
                                return reject()
                            })
                    }).catch((err) => {
                        return reject(err)
                    })
                })
            })
        },
        updateOne: (controller) => {
            
            const updateData = _.cloneDeep(controller.request.data)
            return server.mysql.Client.update(updateData, {
                where: {
                    id: controller.request.clientId
                },
                transaction: controller.transaction
            }).then((client) => {
                if (!client) {
                    throw new Error("Cliente não encontrado.");
                }
                
                return server.mysql.Client.findById(controller.request.clientId, {
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
                    }],
                    transaction: controller.transaction
                }).then((client) => {
                    if (!client) throw new Error("Cliente não encontrado.");

                    return new Promise((resolve, reject) => {

                        const promises = [];

                        promises.push(new Promise((resolve, reject) => {
                            const esClient = {
                                id: client.id,
                                body: {
                                    companyId: client.companyId,
                                    name: client.name,
                                    obs: client.obs,
                                    legalDocument: client.legalDocument
                                }
                            }
                            resolve({clientES: esClient})
                        }))

                        /* save clientPhones if existent */
                        if(_.has(updateData, "clientPhones") && updateData.clientPhones.length) {
                            const clientPhonesControllerObj = new Controller({
                                request: {
                                    clientId: controller.request.clientId,
                                    data: updateData.clientPhones
                                },
                                transaction: controller.transaction
                            })
                            promises.push(clientsPhonesController.setClientPhones(clientPhonesControllerObj))
                        }

                        /* save clientAddresses if existent */
                        if(_.has(updateData, "clientAddresses") && updateData.clientAddresses.length) {
                            const clientAddressesControllerObj = new Controller({
                                request: {
                                    clientId: controller.request.clientId,
                                    companyId: controller.request.companyId,
                                    data: updateData.clientAddresses
                                },
                                transaction: controller.transaction
                            })
                            promises.push(clientsAddressesController.setClientAddresses(clientAddressesControllerObj))
                        }

                        /* save clientCustomFields if existent */
                        if(_.has(updateData, "clientCustomFields") && updateData.clientCustomFields.length) {

                            const clientCustomFieldControllerObj = new Controller({
                                request: {
                                    clientId: controller.request.clientId,
                                    companyId: controller.request.companyId,
                                    data: updateData.clientCustomFields
                                },
                                transaction: controller.transaction
                            })
                            promises.push(clientsCustomFieldsController.setClientCustomFields(clientCustomFieldControllerObj))
                        }

                        /* save clientGroups if existent */
                        if (_.has(updateData, "clientGroups") && updateData.clientGroups.length) {
                            const clientGroupsControllerObj = new Controller({
                                request: {
                                    companyId: controller.request.clientId,
                                    companyId: controller.request.companyId,
                                    data: updateData.clientGroups
                                },
                                transaction: controller.transaction
                            })
                            promises.push(clientsGroupController.setClientGroup(clientGroupsControllerObj))
                        }
                        

                        /* return only when all promises are satisfied */
                        return Promise.all(promises).then((clientEs) => {
                            const objES = {}
                            _.map(clientEs, (value) => {
                                _.assign(objES, value)
                            })

                            //obs ES rollback check
                            let addressesESPromise = []
                                if(_.has(objES, "addressesES") && objES.addressesES){
                                    objES.addressesES.forEach((addressEs) => {  
                                        const addressESControllerObj = new Controller({
                                            request: {
                                                data: addressEs
                                            },
                                            transaction: controller.transaction
                                        })
                                        addressesESPromise.push(addressesController.saveAddressesInES(addressESControllerObj))
                                    })
                                }

                                return Promise.all(addressesESPromise).then(() => {
                                    const body = _.assign({}, objES.clientES.body, {addresses: objES.clientAddressesES}, {customFields: objES.customFieldsES}, {phones: objES.phonesES})

                                    return server.elasticSearch.index({
                                            index: 'main',
                                            type: 'client',
                                            id: objES.clientES.id,
                                            body: body
                                        }, function (esErr, esRes, esStatus) {
                                            if (esErr) {
                                                return reject(new Error(esErr))
                                            }
                                            return server.mysql.Client.findById(controller.request.clientId, {
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
                                                }],
                                                transaction: controller.transaction
                                            }).then((clientReturn) => {
                                                clientReturn = JSON.parse(JSON.stringify(clientReturn))
                                                const clientAddressId = (objES.clientAddressId) ? {clientAddressId: objES.clientAddressId} : {}
                                                const clientPhoneId = (objES.clientPhoneId) ? {clientPhoneId: objES.clientPhoneId} : {}
                                                
                                                resolve(_.assign(clientReturn, clientAddressId, clientPhoneId))
                                            }).catch((err) => {
                                                console.log('ERRO: NO FIND CLIENT IN CLIENTS FINALE UPDATE: ', err)
                                            })  
                                        }
                                    )                                    
                                }).catch((err) => {
                                    return reject()
                                })
                            })
                        }).catch((err) => {
                            return reject(err)
                    })
                })
            }).catch((err) => {
                console.log('ERRO: client UPDATE: ', err)
            }) 
        },

        ///////////////////
        // CLIENTS GROUP //
        ///////////////////
        saveClientsGroup(req) {
            return server.mysql.Client.update(req.body, {
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include:[{
                    model: server.mysql.ClientsGroup,
                    as: 'clientsGroup',
                    where: {
                        companyId: {
                            [Op.in]: [0, parseInt(req.params.companyId)]
                        }
                    }
                }]
            }).then((client) => {
                if (!client) {
                    return "Registro não encontrado ou registro padrão"
                }
                return _.first(client)
            })
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
            server.mysql.Client.findAll({
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
                        legalDocument: client.legalDocument,
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
                        customFields: _.map(client.clientCustomFields, clientCustomField => {
                            return {
                                clientCustomFieldId: clientCustomField.id,
                                documentType: clientCustomField.customField.name,
                                documentValue: clientCustomField.value
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
                    clientAddressesPromisses.push(clientsAddressesController.setClientAddresses(req).then((response) => {
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