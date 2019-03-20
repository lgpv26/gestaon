import _ from "lodash"
import moment from "moment"
const Op = require("sequelize").Op

module.exports = server => {
    return {
        name: "data/client",
        actions: {
            start(ctx) {
                const vm = this
                const companyId = ctx.params.companyId
                console.log("NO CLIENT SERVICE", moment().toDate())

                return new Promise((resolve, reject) => {
                    async function start() {
                        try {
                            console.log("INICIO DA FUNCAO ASYNC DO CLIENT", moment().toDate())

                            vm.saveInRequest = ctx.params.transaction ? true : false
                            ctx.params.data = _.assign(ctx.params.data, { companyId })
                            
                            console.log("CHECANDO TRANSACTION", moment().toDate())
                            const transaction = await vm.checkTransaction(ctx.params.transaction || null)
                            console.log("CHECADO TRANSATION OK", moment().toDate())

                            const request = ctx.params.request

                            ctx.params.data = await vm.checkTempIds(ctx.params.data, request)
                            console.log("REMOVI OS TEMP IDS", moment().toDate())

                            console.log("VOU SALVAR O CLIENT", moment().toDate())
                            const client = await vm.saveClient(ctx.params.data, transaction)
                            console.log("SALVEI O CLIENT", moment().toDate())

                            if (_.has(ctx.params.data, "clientAddresses")) {
                                console.log("PREPARANDO O CLIENT ADDRESSES", moment().toDate())
                                _.set(client, "clientAddresses", await vm.setClientAddresses(ctx.params.data.clientAddresses, (client) ? client.id : null, companyId, transaction) )
                                console.log("CLIENT ADDRESSES: OK", moment().toDate())
                            }

                            if (_.has(ctx.params.data, "clientPhones")) {
                                const clientPhones = _.map(ctx.params.data.clientPhones, (clientPhone) => {
                                        return _.assign(clientPhone, {clientId: (client) ? client.id : null})
                                    })
                                console.log("PREPARANDO O CLIENT PHONES", moment().toDate())
                                _.set(client, "clientPhones", await vm.saveClientPhones(clientPhones, (client) ? client.id : null, transaction))
                                console.log("CLIENT PHONES: OK", moment().toDate())
                            }

                            if (_.has(ctx.params.data, "clientCustomFields")) {
                                const clientCustomFields = _.map(ctx.params.data.clientCustomFields, (clientCustomField) => {
                                        return _.assign(clientCustomField, {
                                            clientId: (client) ? client.id : null,
                                            customFieldId: clientCustomField.customField.id
                                        })
                                    })
                                console.log("PREPARANDO O CLIENT CUSTOM FIELD", moment().toDate())
                                _.set(client, "clientCustomFields", await vm.saveClientCustomFields(clientCustomFields, (client) ? client.id : null, transaction))
                                console.log("CLIENT CUSTOM FIELD: OK", moment().toDate())
                            }

                            console.log("TUDO CERTO COM O CLIENT, VOLTANDO PARA O REQUEST", moment().toDate())

                            return resolve(client)
                            //console.log(client)
                        } catch (err) {
                            console.log("try catch do client, erro no client")
                            return reject(err)
                        }
                    }

                    start()
                })
            },

            getRequestHistory(ctx) {
                const vm = this
                const companyId = ctx.params.companyId

                return new Promise((resolve, reject) => {
                    async function start() {
                        try {
                            const requestHistory = await ctx.call("data/request.getListAndCount", {
                                where: {
                                    clientId: ctx.params.data.id,
                                    status: 'finished',
                                    companyId
                                },
                                order: [
                                    ['deliveryDate', 'DESC']
                                ],
                                include: [{
                                    model: server.mysql.RequestOrder,
                                    as: 'requestOrder',
                                    include: [{
                                        model: server.mysql.RequestOrderProduct,
                                        as: 'requestOrderProducts'
                                    }]
                                }, {
                                    model: server.mysql.RequestPayment,
                                    as: 'requestPayments',
                                    include: [{
                                        model: server.mysql.PaymentMethod,
                                        as: 'paymentMethod'
                                    }]
                                }],
                                limit: ctx.params.limit,
                                offset: ctx.params.offset
                            })

                            return resolve({
                                offset: ctx.params.offset,
                                limit: ctx.params.limit,
                                total: requestHistory.count,
                                previousRequests: requestHistory.rows
                            })
                        }
                        catch (err) {
                            console.log("try catch do getRequestHistory, erro no client")
                            return reject(err)
                        }
                    }

                    start()
                })
            },
        },
        methods: {
            checkTransaction(transaction) {
                if(transaction) return Promise.resolve(transaction)
                return server.sequelize.transaction(t => {
                    return Promise.resolve(t)
                })
            },

            checkTempIds(data, request) {
                let removeTemps = []

                if (_.has(data, "clientAddresses")) {
                    removeTemps.push(
                        this.removeArrayTempIds(data, "clientAddresses", "clientAddressId", request)
                        .then((clientAddresses) => {
                            _.set(data, "clientAddresses", clientAddresses)
                        })
                    )
                }

                if (_.has(data, "clientPhones")) {
                    removeTemps.push(
                        this.removeArrayTempIds(data, "clientPhones", "clientPhoneId", request)
                        .then((clientPhones) => {
                            _.set(data, "clientPhones", clientPhones)
                        })
                    )
                }

                if (_.has(data, "clientCustomFields")) {
                    removeTemps.push(
                        this.removeArrayTempIds(data, "clientCustomFields")
                        .then((clientCustomFields) => {
                                _.set(data, "clientCustomFields", clientCustomFields)
                            })
                    )
                }

                return Promise.all(removeTemps).then(() => {
                    const id = _.get(data, "id", false)
                    if (typeof id == "string" && id.substring(0, 4) === "tmp/") {
                        _.set(data, "tmpId", id)
                        _.set(data, "id", null)
                    }

                    return Promise.resolve(data)
                })
            },

            removeArrayTempIds(data, path, select, request) {
                let newValue = []
                const promises = []
                _.map(_.get(data, path), (obj, index) => {
                    promises.push(new Promise((resolve, reject) => {
                            if (select && _.has(request, select)) {
                                if (obj.id === _.get(request, select)) {
                                    obj.select = true
                                }
                                else {
                                    obj.select = false
                                }
                            }
                            if (_.has(obj, "address") && obj.address && obj.address.id && !_.isNumber(obj.address.id) && obj.address.id.substring(0, 4) === "tmp/") {
                                _.set(obj.address, "tmpId", obj.address.id)
                                _.set(obj.address, "id", null)
                            }
                            if (_.get(obj, "id", false) && !_.isNumber(obj.id) && obj.id.substring(0, 4) === "tmp/") {
                                obj.tmpId = obj.id
                                obj.id = null
                            }
                            newValue.push(obj)
                            resolve()
                        })
                    )
                })
                return Promise.all(promises).then(() => {
                    return newValue
                })
            },
            /**
             * SAVE (create or update) INITIAL DATA CLIENT
             * @returns {Promise.<object>} client
             */
            saveClient(data, transaction) {
                if ((data.name === "" || data.name === null) && !data.id) return Promise.resolve(data)
                if (data.id) {
                    return server.mysql.Client.update(data, {
                        where: {
                            id: data.id
                        },
                        transaction
                    })
                    .then(() => {
                        return server.mysql.Client.findByPk(data.id, { transaction })
                            .then((client) => {
                                return JSON.parse(JSON.stringify(client))
                            })
                            .catch((err) => {
                                console.log("erro consult by id - client service update")
                                return Promise.reject("Erro ao recuperar os dados do cliente.")
                            })
                    })
                    .catch(err => {
                        console.log(err,"Nenhum registro encontrado. Update.")
                        return Promise.reject("Erro ao atualizar o cliente.")
                    })
                }
                else {
                    // create client
                    return server.mysql.Client.create(data, { transaction })
                        .then(client => {
                            client = JSON.parse(JSON.stringify(client))
                            if (data.tmpId) _.set(client, "tmpId", data.tmpId)
                            return client
                        })
                        .catch(() => {
                            console.log("Nenhum registro encontrado. Create.")
                            return Promise.reject("Erro ao cadastrar o cliente.")
                        })
                }
            },
            /**
             * set data and save clientAddresses
             * @returns {Promise.<array>} clientAddresses
             */

            setClientAddresses(data, clientId, companyId, transaction) {
                return server.broker.call("data/address.saveAddresses", {
                        data,
                        companyId,
                        transaction
                    })
                    .then((clientAddressWithAddress) => {
                        let clientAddressesArray = []
                        clientAddressWithAddress.forEach((result) => {
                        if(!result.name && !result.number && !result.address.id) return
                            clientAddressesArray.push({
                                id: (result.id) ? result.id : null,
                                status: "activated",
                                clientId: (clientId) ? parseInt(clientId) : null,
                                addressId: (result.address.id) ? parseInt(result.address.id) : null,
                                address: (result.address) ? result.address : null,
                                name: (result.name) ? result.name : null,
                                number: (result.number) ? result.number : null,
                                complement: (result.complement) ? result.complement : null,
                                type: [1, 3, 5],
                                tmpId: (result.tmpId) ? result.tmpId : null,
                                select: result.select
                            })
                        })

                        return this.saveClientAddresses(clientAddressesArray, clientId, transaction)
                            .then((clientAddresses) => {
                                return Promise.resolve(clientAddresses)
                            })
                            .catch((err) => {
                                console.log("Nenhum registro encontrado. ClientAddress")
                                return Promise.reject("Erro ao salvar endereços do cliente.")
                            })
                    })
                    .catch((err) => {
                        console.log(err)
                        console.log("Nenhum registro encontrado. Address")
                        return Promise.reject("Erro ao salvar os endereços.")
                    })
            },

            /**
             * @param {Object} data, {Int} clientId, {Object} transaction (optional)
             * @returns {Promise.<Array>} clientAddresses
             */

            saveClientAddresses(data, clientId, transaction) {
                if(!data.length) return Promise.resolve(null)
                
                /*
                 * Delete all client's clientAddress
                 */
                return server.mysql.ClientAddress.destroy({
                    where: {
                        clientId: clientId
                    },
                    transaction
                }).then(() => {
                    let clientAddressesPromises = []
                    data.forEach(clientAddress => {
                        if (clientAddress.id) {
                            clientAddressesPromises.push(
                                server.mysql.ClientAddress.update(_.assign(clientAddress, {dateRemoved: null}),{
                                    where: {
                                        id: clientAddress.id
                                    },
                                    paranoid: false,
                                    transaction
                                })
                                .then((clientAddressUpdate) => {
                                    /*
                                    if (parseInt(_.toString(clientAddressUpdate)) < 1) {
                                        console.log("Nenhum registro encontrado. Update. clientAddressUpdate")
                                        return Promise.reject("Erro ao atualizar endereço do cliente.")
                                    }*/
                                    return server.mysql.ClientAddress.findByPk(clientAddress.id, {
                                        transaction
                                    }).then((ClientAddress) => {
                                        return _.assign(JSON.parse(JSON.stringify(ClientAddress)), { type: clientAddress.type, select: clientAddress.select, address: clientAddress.address })
                                    })
                                })
                            )
                        } 
                        else {
                            clientAddressesPromises.push(
                                server.mysql.ClientAddress.create(clientAddress, {
                                    transaction
                                }).then(clientAddressCreate => {
                                    if (!clientAddressCreate) {
                                        console.log("Nenhum registro encontrado. Create.")
                                        return Promise.reject("Erro ao cadastrar endereço do cliente.")
                                    }
                                    return _.assign(JSON.parse(JSON.stringify(clientAddressCreate)), {type: clientAddress.type, select: clientAddress.select, tmpId: clientAddress.tmpId, address: clientAddress.address})
                                })
                            )
                        }
                    })

                    return Promise.all(clientAddressesPromises)
                        .then(clientAddresses => {
                            return clientAddresses
                        })
                        .catch(err => {
                            return Promise.reject("Erro ao atualizar endereços do cliente.")
                        })
                })
            },
            /**
             * @param {Object} data, {Int} clientId, {Object} transaction (optional)
             * @returns {Promise.<Array>} clientPhones
             */

            saveClientPhones(data, clientId, transaction) {
                /*
                 * Delete all client's clientPhone
                 */

                return server.mysql.ClientPhone.destroy({
                    where: {
                        clientId: clientId
                    },
                    transaction
                }).then(() => {
                    let clientPhonesPromises = []
                    data.forEach(clientPhone => {
                        if (clientPhone.id) {
                            clientPhonesPromises.push(
                                server.mysql.ClientPhone.update(_.assign(clientPhone, {dateRemoved: null}), {
                                        where: {
                                            id: clientPhone.id
                                        },
                                        paranoid: false,
                                        transaction
                                    })
                                    .then((clientPhoneUpdate) => {
                                    /*
                                    if (parseInt(_.toString(clientPhoneUpdate)) < 1) {
                                        console.log("Nenhum registro encontrado. Update. clientPhone")
                                        return Promise.reject("Erro ao atualizar telefone do cliente.")
                                    }
                                    */
                                    return server.mysql.ClientPhone.findByPk(clientPhone.id, {
                                        transaction
                                    }).then((clientPhoneUpdated) => {
                                        return _.assign(JSON.parse(JSON.stringify(clientPhoneUpdated)), {select: clientPhone.select})
                                    })
                                })
                            )
                        } 
                        else {
                            clientPhonesPromises.push(
                                server.mysql.ClientPhone.create((clientPhone), {
                                    transaction
                                }).then((clientPhoneCreate) => {
                                    if (!clientPhoneCreate) {
                                        console.log("Nenhum registro encontrado. Create clientPhone.")
                                        return Promise.reject("Erro ao cadastrar telefone do cliente.")
                                    }
                                    return _.assign(
                                        JSON.parse(JSON.stringify(clientPhoneCreate)), { select: clientPhone.select, tmpId: clientPhone.tmpId })
                                })
                            )
                        }
                    })

                    return Promise.all(clientPhonesPromises)
                        .then((clientPhones) => {
                            return clientPhones
                        })
                        .catch((err) => {
                            console.log("Erro em: data/client.saveClientPhones - Promise ALL")
                            return Promise.reject("Erro ao atualizar telefones do cliente.")
                        })
                })
            },
            /**
             * @param {Object} data, {Int} clientId, {Object} transaction (optional)
             * @returns {Promise.<Array>} clientCustomFields
             */

            saveClientCustomFields(data, clientId, transaction) {
                /*
                 * Delete all client's clientCustomFields
                 */

                return server.mysql.ClientCustomField.destroy({
                    where: {
                        clientId: clientId
                    },
                    transaction
                }).then(() => {
                    let clientCustomFieldsPromises = []
                    data.forEach(clientCustomField => {
                        if (clientCustomField.id) {
                            clientCustomFieldsPromises.push(
                                server.mysql.ClientCustomField.update(
                                    _.assign(clientCustomField, {
                                        dateRemoved: null
                                    }), {
                                        where: {
                                            id: clientCustomField.id
                                        },
                                        transaction
                                    }).then(clientCustomFieldUpdate => {
                                        /*
                                        if (parseInt(_.toString(clientCustomFieldUpdate)) < 1) {
                                            console.log("Nenhum registro encontrado. Update. clientCustomField")
                                            return Promise.reject("Erro ao atualizar dados do cliente.")
                                        }
                                        */
                                        return server.mysql.ClientCustomField.findByPk(clientCustomField.id, { transaction })
                                            .then(clientCustomFieldUpdated => {
                                                return JSON.parse(JSON.stringify(clientCustomFieldUpdated))
                                            })
                                    }))
                        }
                        else {
                            clientCustomFieldsPromises.push(
                                server.mysql.ClientCustomField.create(clientCustomField, {
                                    transaction
                                }).then(clientCustomFieldCreate => {
                                    if (!clientCustomFieldCreate) {
                                        console.log("Nenhum registro encontrado. Create clientCustomField.")
                                        return Promise.reject("Erro ao cadastrar dados do cliente.")
                                    }
                                    return _.assign(JSON.parse(JSON.stringify(clientCustomFieldCreate)), { tmpId: clientCustomField.tmpId })
                                })
                            )
                        }
                    })

                    return Promise.all(clientCustomFieldsPromises)
                        .then(clientCustomFields => {
                            return clientCustomFields
                        })
                        .catch(err => {
                            console.log("Erro em: data/client.saveClientCustomFields - Promise ALL")
                            return Promise.reject("Erro ao interagi com os dados do cliente.")
                        })
                })
            }
        }
    }
}
