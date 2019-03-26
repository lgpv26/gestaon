import _ from 'lodash'
import moment from 'moment'
const Op = require('sequelize').Op

module.exports = (server) => {
        return {
        name: "data/request-details",
        actions: {

            start(ctx){
                const vm = this

                console.log("ESTOU NO REQUEST DETAILS SERVICE", moment().toDate())  

                const request = ctx.params.request
                const userId = ctx.params.userId
                const transaction = ctx.params.transaction

                //console.log(ctx.params.data, request)
                
                return new Promise((resolve, reject) => {
                        async function start() {
                            try {
                                const requestClient = {}
                                console.log("NA FUNCTION ASYNC DO REQUEST DETAILS", moment().toDate())  

                                if(_.has(ctx.params.data, "requestClientAddresses")) {
                                console.log("NO REQUEST CLIENT ADDRESS - VOU CHAMAR O SET REQUEST CLIENT ADRESSES", moment().toDate())  
                                    await vm.setRequestClientAddresses(ctx.params.data.requestClientAddresses, request.id, transaction)
                                    .then((clientAddresses) => {
                                        console.log("VOLTEI DO REQUEST CLIENT ADDRESS", moment().toDate())  
                                        _.set(requestClient, 'requestClientAddresses', clientAddresses)
                                    })
                                }
                            
                                if(_.has(ctx.params.data, "requestClientPhones")) {
                                    console.log("NO REQUEST CLIENT ADDRESS - VOU CHAMAR O SET REQUEST CLIENT PHONES", moment().toDate())  

                                    await vm.setRequestClientPhones(ctx.params.data.requestClientPhones, request.id, transaction)
                                    .then((clientPhones) => {
                                        console.log("VOLTEI DO REQUEST CLIENT PHONES", moment().toDate())  
                                        _.set(requestClient, 'requestClientPhones', clientPhones)
                                    })
                                }
                            
                                console.log("TUDO CERTO COM O REQUEST DETAILS VOLTANDO PARA O REQUEST", moment().toDate())  
                                                                
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
                console.log("NO SET DO REQUEST CLIENT", moment().toDate())  

                data.forEach((requestClientAddressGeo, index) => {
                    console.log("INDO PARA O GET GEO DO INDEX", index, "DO ARRAY DE REQUEST CLIENT ADDRESS", moment().toDate())  

                    promises.push(new Promise(async (resolve,reject) => {
                        await this.getGeo(requestClientAddressGeo.clientAddressId, transaction)
                            .then((geo) => {
                                console.log("VOLTEI DO GET GEO DO INDEX", index, "DO ARRAY DE REQUEST CLIENT ADDRESS", moment().toDate())  
                                if(_.isEmpty(geo)) return resolve()
                                _.set(data[index], 'lat', geo.lat)
                                _.set(data[index], 'lng', geo.lng)
                                return resolve()
                            })
                        })
                    )
                })  

                
                return Promise.all(promises).then(() => {
                console.log("TUDO OK COM OS GET GEO - DEU PROMISE ALL", moment().toDate())  

                console.log("VOU EXCLUIR TODO OS REQUESTS CLIENT ADDRESSES DESTE PEDIDO", moment().toDate())  
                return server.mysql.RequestClientAddress.destroy({
                        where: {
                            requestId: requestId
                        },
                        transaction
                    }).then(() => {
                        console.log("REQUEST CLIENT ADRESSES EXCLUIDOS", moment().toDate())  

                        let promisesRequest = []
                console.log("VOU COMEÇAR O LOOP PARA ATUALIZAR OU CRIAR O REQUEST CLIENT ADDRESS", moment().toDate())  

                        data.forEach((requestClientAddress) => {
                            if (requestClientAddress.id) {
                                console.log("ATUALIZANDO REQUEST CLIENT ADDRESS", moment().toDate())  
                                promisesRequest.push(
                                    server.mysql.RequestClientAddress.update(_.assign(requestClientAddress, {dateRemoved: null}),{
                                        where: {
                                            id: requestClientAddress.id
                                        },
                                        paranoid: false,
                                        transaction
                                    })
                                    .then(() => {
                console.log("ATUALIZADO", moment().toDate())  
                console.log("VOU CONSULTAR PELA PRIMARY KEY", moment().toDate())  
                                        return server.mysql.RequestClientAddress.findByPk(requestClientAddress.id, {
                                            transaction
                                        }).then((RequestClientAddress) => {
                console.log("CONSULTEI OK", moment().toDate())  
                console.log("ENCERROU ESTE", moment().toDate())  
                                            return JSON.parse(JSON.stringify(RequestClientAddress))
                                        })
                                    })
                                )
                            } 
                            else {
                console.log("CRIANDO O SET DO REQUEST CLIENT ADDRESS", moment().toDate())  
                                promisesRequest.push(
                                    server.mysql.RequestClientAddress.create(requestClientAddress, {
                                        transaction
                                    }).then((requestClientAddressCreate) => {
                                        if (!requestClientAddressCreate) return Promise.reject("Erro ao cadastrar endereço do cliente.")
                console.log("SALVO O REQUEST CLIENT ADDRESS", moment().toDate())  
                                        return JSON.parse(JSON.stringify(requestClientAddressCreate))
                                    })
                                )
                            }
                        })
     

                        return Promise.all(promisesRequest)
                            .then((requestClientAddresses) => {
                console.log("TUDO CERTO VOU VOLTAR O PRINCIPAL", moment().toDate())  
                                return requestClientAddresses
                            })
                            .catch((err) => {
                                return Promise.reject(err,"Erro ao atualizar endereços do cliente no pedido.")
                            })
                    })
                })
            },
    
            getGeo(clientAddressId, transaction){
                console.log("NO GET GEO", moment().toDate())  
                return new Promise((resolve, reject ) => {
                console.log("VOU CONSULTAR O CLIENT ADDRESS", moment().toDate())  
                    return server.mysql.ClientAddress.findByPk(parseInt(clientAddressId), {
                        include: [{
                            model: server.mysql.Address,
                            as: 'address'
                        }],
                        transaction
                    })
                    .then((clientAddress) => {
                console.log("CONSULTEI O CLIENT ADDRESS", moment().toDate())  
                        if(!clientAddress) return resolve({})
                console.log("SETANDO O OBJETO PARA PESQUISA NA GOOGLE", moment().toDate())  
                        const name = (clientAddress.address.name) ? clientAddress.address.name : ''
                        const number = (clientAddress.number) ? ', ' + clientAddress.number : ''
                        const complement = (clientAddress.complement) ? ' ' + clientAddress.complement : ''
                        const city = (clientAddress.address.city) ? ' ' + clientAddress.address.city : ''
                        const state = (clientAddress.address.state) ? '/' + clientAddress.address.state : ''
                        const cep = (clientAddress.address.cep) ? clientAddress.address.cep : ''
    
                console.log("CONSULTANDO NA GOOGLE API O GEOCODE", moment().toDate())  
                        return server.googleMaps.geocode({ address: name + number + complement + city + state + ' - ' + cep })
                            .asPromise()
                            .then((response) => {
                console.log("RETORNOU DO GOOGLE", moment().toDate())  
                                if (response.length) return resolve({})
                                const geo = _.first(response.json.results)
                console.log("TUDO CERTO VOLTANDO", moment().toDate())  
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
                console.log("NO REQUEST CLIENT PHONE", moment().toDate())  
                console.log("EXCLUINDO TODOS OS REQUEST CLIENT PHONE", moment().toDate())  
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