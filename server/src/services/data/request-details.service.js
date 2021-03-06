import _ from 'lodash'
import moment from 'moment'
const Op = require('sequelize').Op

module.exports = (server) => {
        return {
        name: "data/request-details",
        actions: {

            start(ctx){
                const vm = this

                const request = ctx.params.request
                const userId = ctx.params.userId
                const transaction = ctx.params.transaction

                //console.log(ctx.params.data, request)
                
                return new Promise((resolve, reject) => {
                        async function start() {
                            try {
                                const requestClient = {}

                                if(_.has(ctx.params.data, "requestClientAddresses")) {
                                    await vm.setRequestClientAddresses(ctx.params.data.requestClientAddresses, request.id, transaction)
                                    .then((clientAddresses) => {
                                        _.set(requestClient, 'requestClientAddresses', clientAddresses)
                                    })
                                }
                            
                                if(_.has(ctx.params.data, "requestClientPhones")) {

                                    await vm.setRequestClientPhones(ctx.params.data.requestClientPhones, request.id, transaction)
                                    .then((clientPhones) => {
                                        _.set(requestClient, 'requestClientPhones', clientPhones)
                                    })
                                }
                                                                                            
                                return resolve(requestClient)
                            }
                            catch(err) {
                                console.log('try catch do requestDetails', err)
                                return reject(err)
                            }
                        }
                    start() 
                })
            }

        },
        methods: {
            setRequestClientAddresses(data, requestId, transaction){
                const promises = []

                data.forEach((requestClientAddressGeo, index) => {

                    promises.push(new Promise(async (resolve,reject) => {
                        await this.getGeo(requestClientAddressGeo.clientAddressId, transaction)
                            .then((geo) => {
                                if(_.isEmpty(geo)) return resolve()
                                _.set(data[index], 'lat', geo.lat)
                                _.set(data[index], 'lng', geo.lng)
                                return resolve()
                            })
                        })
                    )
                })  

                
                return Promise.all(promises).then(() => {
                return server.mysql.RequestClientAddress.destroy({
                        where: {
                            requestId: requestId
                        },
                        transaction
                    }).then(() => {
                        let promisesRequest = []

                        data.forEach((requestClientAddress) => {
                            if (requestClientAddress.id) {
                                promisesRequest.push(
                                    server.mysql.RequestClientAddress.update(_.assign(requestClientAddress, {dateRemoved: null}),{
                                        where: {
                                            id: requestClientAddress.id
                                        },
                                        paranoid: false,
                                        transaction
                                    })
                                    .then(() => {
                                        return server.mysql.RequestClientAddress.findByPk(requestClientAddress.id, {
                                            transaction
                                        }).then((RequestClientAddress) => {
                                            return JSON.parse(JSON.stringify(RequestClientAddress))
                                        })
                                    })
                                )
                            } 
                            else {
                                promisesRequest.push(
                                    server.mysql.RequestClientAddress.create(requestClientAddress, {
                                        transaction
                                    }).then((requestClientAddressCreate) => {
                                        if (!requestClientAddressCreate) return Promise.reject("Erro ao cadastrar endereço do cliente.")
                                        return JSON.parse(JSON.stringify(requestClientAddressCreate))
                                    })
                                )
                            }
                        })
     

                        return Promise.all(promisesRequest)
                            .then((requestClientAddresses) => {
                                return requestClientAddresses
                            })
                            .catch((err) => {
                                return Promise.reject(err,"Erro ao atualizar endereços do cliente no pedido.")
                            })
                    })
                })
            },
    
            getGeo(clientAddressId, transaction){
                return new Promise((resolve, reject ) => {
                    return server.mysql.ClientAddress.findByPk(parseInt(clientAddressId), {
                        include: [{
                            model: server.mysql.Address,
                            as: 'address'
                        }],
                        transaction
                    })
                    .then((clientAddress) => {
                        if(!clientAddress) return resolve({})
                        const name = (clientAddress.address.name) ? clientAddress.address.name : ''
                        const number = (clientAddress.number) ? ', ' + clientAddress.number : ''
                        const complement = (clientAddress.complement) ? ' ' + clientAddress.complement : ''
                        const city = (clientAddress.address.city) ? ' ' + clientAddress.address.city : ''
                        const state = (clientAddress.address.state) ? '/' + clientAddress.address.state : ''
                        const cep = (clientAddress.address.cep) ? clientAddress.address.cep : ''
    
                        return server.googleMaps.geocode({ address: name + number + complement + city + state + ' - ' + cep })
                            .asPromise()
                            .then((response) => {
                                if (response.length) return resolve({})
                                const geo = _.first(response.json.results)
                                return resolve ({ lat: geo.geometry.location.lat, lng: geo.geometry.location.lng })
                            })
                            .catch((error) => {
                                console.log("Erro: no geo code, Erro ao salvar o endereço do cliente no pedido, service request.getGeo" + new Date())
                                return resolve({})
                            })
                    })
                })
            },
            
            setRequestClientPhones(data, requestId, transaction){
                return server.mysql.RequestClientPhone.destroy({
                    where: {
                        requestId: requestId
                    },
                    transaction
                }).then(() => {
                    let promisesRequest = []
                    data.forEach((requestClientPhone) => {
                        if (requestClientPhone.id) { 
                            promisesRequest.push(
                                server.mysql.RequestClientPhone.update(_.assign(requestClientPhone, {dateRemoved: null}),{
                                    where: {
                                        id: requestClientPhone.id
                                    },
                                    paranoid: false,
                                    transaction
                                })
                                .then(() => {
                                    return server.mysql.RequestClientPhone.findByPk(requestClientPhone.id, {
                                        transaction
                                    }).then((RequestClientPhone) => {
                                        return _.assign(JSON.parse(JSON.stringify(RequestClientPhone)), {tmpId: requestClientPhone.tmpId})
                                    })
                                })
                            )
                        } 
                        else {
                            promisesRequest.push(
                                server.mysql.RequestClientPhone.create(requestClientPhone, {
                                    transaction
                                }).then((requestClientPhoneCreate) => {
                                    if (!requestClientPhoneCreate) return Promise.reject("Erro ao cadastrar endereço do cliente.")
                                    return _.assign(JSON.parse(JSON.stringify(requestClientPhoneCreate)), {tmpId: requestClientPhone.tmpId})
                                })
                            )
                        }
                    })

                    return Promise.all(promisesRequest)
                    .then((requestClientPhones) => {
                        return requestClientPhones
                    })
                    .catch((err) => {
                        return Promise.reject(err,"Erro ao atualizar endereços do cliente no pedido.")
                    })
                })
            }
        }
    }
}