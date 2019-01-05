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
                                    
                                    const requestClientAddresses = _.map(ctx.params.data.requestClientAddresses, (requestClientAddress) => {
                                        return _.assign({clientAddressId: requestClientAddress.id,
                                            requestId: request.id
                                        })
                                    })
                                    
                                    await vm.setRequestClientAddresses(
                                    requestClientAddresses,
                                    request.id,
                                    transaction)
                                    .then((clientAddresses) => {
                                        _.set(requestClient, 'requestClientAddresses', clientAddresses)
                                    })
                                }
                            
                                if(_.has(ctx.params.data, "requestClientPhones")) {

                                    const requestClientPhones = _.map(ctx.params.data.requestClientPhones, (requestClientPhone) => {
                                        return _.assign({clientPhoneId: requestClientPhone.id,
                                            requestId: request.id
                                        })
                                    })
                                    await vm.setRequestClientPhones(
                                    requestClientPhones,
                                    request.id,
                                    transaction)
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
                data.forEach((clientAddress, index) => {
                    promises.push(
                        this.getGeo(clientAddress.clientAddressId, transaction)
                        .then((geo) => {
                            if (!_.isEmpty(geo)) {
                                _.set(data[index], 'lat', geo.lat)
                                _.set(data[index], 'lng', geo.lng)
                            }
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
                        return server.mysql.RequestClientAddress.bulkCreate(data, {
                            updateOnDuplicate: ['requestId', 'clientAddressId', 'type', 'lat', 'lng', 'dateUpdated', 'dateRemoved', 'status'],
                            transaction
                        }).then((response) => {
                            return response
                        }).catch((error) => {
                            console.log("Erro: no bulkCreate do data/request.setRequestClientAddresses")
                            return Promise.reject("Erro ao salvar o endereço do cliente no pedido (google maps)")
                        })
                    })
                })
            },
    
            getGeo(clientAddressId, transaction){
                return new Promise((resolve, reject ) => {
                    return server.mysql.ClientAddress.findById(parseInt(clientAddressId), {
                        include: [{
                            model: server.mysql.Address,
                            as: 'address'
                        }]
                    },
                    transaction)
                    .then((clientAddress) => {
                        const name = (clientAddress.address.name) ? clientAddress.address.name : ''
                        const number = (clientAddress.number) ? ', ' + clientAddress.number : ''
                        const complement = (clientAddress.complement) ? ' ' + clientAddress.complement : ''
                        const city = (clientAddress.address.city) ? ' ' + clientAddress.address.city : ''
                        const state = (clientAddress.address.state) ? '/' + clientAddress.address.state : ''
                        const cep = (clientAddress.address.cep) ? clientAddress.address.cep : ''
    
                        return server.googleMaps.geocode({ address: name + number + complement + city + state + ' - ' + cep })
                            .asPromise()
                            .then((response) => {
                                if (response.length) return {}
                                const geo = _.first(response.json.results)
                                return resolve ({ lat: geo.geometry.location.lat, lng: geo.geometry.location.lng })
                            })
                            .catch((error) => {
                                console.log("Erro: no geo code, Erro ao salvar o endereço do cliente no pedido, service request.getGeo" + new Date())
                                return Promise.resolve()
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
                    return server.mysql.RequestClientPhone.bulkCreate(data, {
                        updateOnDuplicate: ['requestId', 'clientPhoneId', 'type', 'dateUpdated', 'dateRemoved', 'status'],
                        transaction
                    }).then((response) => {
                        return response
                    }).catch((error) => {
                        console.log("Erro: no bulkCreate do data/request.setRequestClientPhones")
                        return Promise.reject("Erro ao salvar o telefone do cliente no pedido")
                    })
                })
            }
        }
    }
}