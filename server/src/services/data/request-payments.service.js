import _ from 'lodash'
import moment from 'moment'
const Op = require('sequelize').Op

module.exports = (server) => {
        return {
        name: "data/request-payments",
        actions: {

            start(ctx){
                const vm = this

                const request = ctx.params.request
                const userId = ctx.params.userId
                const transaction = ctx.params.transaction
                
                return new Promise((resolve, reject) => {
                        async function start() {
                            try {
                                const requestPayments = await vm.requestPayments(ctx.params.data, request.id, userId, transaction)
                                return resolve(requestPayments)
                            }
                            catch(err) {
                                console.log('try catch do requestPayments', err)
                                return reject(err)
                            }
                        }
                    start() 
                })
            }

        },
        methods: {
            requestPayments(data, requestId, userId, transaction) {
                /*
                * Delete all
                */
               return server.mysql.RequestPayment.destroy({
                where: {
                    requestId: requestId
                },
                transaction
                }).then(() => {

                    const paymentMethodsPromises = []
                    data.forEach((requestPayment) => {
                        if (requestPayment.id) {
                            paymentMethodsPromises.push(
                                server.mysql.RequestPayment.update(
                                    _.assign(requestPayment, {
                                        lastTriggeredUserId: userId,
                                        lastReceivedFromUserId: (requestPayment.received) ? userId : null,
                                        receivedDate: (requestPayment.received) ? (requestPayment.receivedDate) ? requestPayment.receivedDate : moment() : null,
                                        received: (requestPayment.received) ? requestPayment.received : false,
                                        deadlineDatetime: (requestPayment.deadlineDatetime) ? requestPayment.deadlineDatetime : null,
                                        requestId: requestId,
                                        dateRemoved: null
                                    }),{ 
                                    where: {
                                        id: requestPayment.id
                                    },
                                    paranoid: false,
                                    transaction
                                }).then((paymentMethodUpdate) => {
                                    if(parseInt(_.toString(paymentMethodUpdate)) < 1 ){
                                        console.log("Nenhum registro encontrado. Update.")
                                        return Promise.reject("Erro ao atualizar a forma de pagamento")
                                    }
                                    return server.mysql.RequestPayment.findById(requestPayment.id)
                                    .then((paymentMethod) => {
                                        return JSON.parse(JSON.stringify(paymentMethod))
                                    })
                                }).catch((err) => {
                                    console.log('ERRO: data.request.paymentMethodUpdate')
                                    return Promise.reject(err)
                                })
                            )
                        }
                        else {
                            paymentMethodsPromises.push(
                                server.mysql.RequestPayment.create(_.assign(requestPayment, {
                                    lastTriggeredUserId: userId,
                                    lastReceivedFromUserId: userId,
                                    receivedDate: (requestPayment.received) ? (requestPayment.receivedDate) ? requestPayment.receivedDate : moment() : null,
                                    received: (requestPayment.received) ? requestPayment.received : false,
                                    deadlineDatetime: (requestPayment.deadlineDatetime) ? requestPayment.deadlineDatetime : null,
                                    requestId: requestId,
                                }),
                                {transaction})
                                .then((paymentMethod) => {
                                    if (!paymentMethod) {
                                        console.log("Nenhum registro encontrado. Create.")
                                        return Promise.reject('Erro ao criar a forma de pagamento.')
                                    }
                                    return JSON.parse(JSON.stringify(paymentMethod))
                                }).catch((err) => {
                                    console.log('ERRO: data.request.paymentMethodCreate')
                                    return Promise.reject(err)
                                })
                            )
                        }
                    })
                    return Promise.all(paymentMethodsPromises).then((paymentMethods) => {
                        return Promise.resolve(paymentMethods)
                    }).catch((err) => {
                        console.log("Erro em: data/request-payments.paymentMethods - Promise ALL")
                        return Promise.reject("Erro ao atualizar formas de pagamento do pedido.")
                    })
                }).catch((err) => {
                    console.log('Erro no requestPayments em request payments service ao destroy payments') 
                    return Promise.reject(err)
                })
            }
        }
    }
}