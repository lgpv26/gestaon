import _ from "lodash"
import moment from "moment"
const Op = require("sequelize").Op

module.exports = server => {
    return {
        name: "data/request-payments",
        actions: {
            start(ctx) {
                const vm = this

                const request = ctx.params.request
                const client = (ctx.params.client) ? ctx.params.client : null
                const oldRequest = (ctx.params.oldRequest) ? ctx.params.oldRequest : null
                const triggeredBy = ctx.params.triggeredBy
                const transaction = ctx.params.transaction

                return new Promise((resolve, reject) => {
                    async function start() {
                        try {
                            //ctx.params.data = await vm.changeTempIdDEV(ctx.params.data) // DEPOIS DE FALAR COM O YOSHI REMOVER

                            //request.status

                            if(ctx.params.editingRequest && request.status === "canceled") return resolve(ctx.params.data)

                            const removedRequestPayments = await vm.checkRemovedRequestPayments(ctx.params.data, oldRequest, (client) ? client : null)
                            
                            const dataRequestPayments = await vm.checkChanges(ctx.params.data, request, client, oldRequest)

                            await vm.revertPayments(removedRequestPayments, dataRequestPayments, triggeredBy, transaction)
                            await vm.clientLimit(client, removedRequestPayments, dataRequestPayments, oldRequest, transaction)
                      
                            const requestPayments = await vm.requestPayments(dataRequestPayments, removedRequestPayments, request, triggeredBy, transaction)
         
                            // await vm.fakeConsult(ctx.params.oldRequest, transaction)  // APENAS PARA DEV - REMOVER DEPOIS

                            return resolve(requestPayments)
                        } 
                        catch (err) {
                            console.log("try catch do requestPayments", err)
                            return reject(err)
                        }
                    }
                    start()
                })
            }
        },
        methods: {
            checkRemovedRequestPayments(data, oldRequest, client) {
                const oldRequestPayments = (oldRequest && _.has(oldRequest, "requestPayments")) ? oldRequest.requestPayments : null

                if (!oldRequestPayments) return Promise.resolve(null)

                const removedRequestPayments = _.differenceBy(oldRequestPayments, data, "id")

                if (removedRequestPayments.length) {
                    const promises = []
                    removedRequestPayments.forEach((requestPayment, index) => {
                        promises.push(new Promise((resolve, reject) => {
                                if (requestPayment.settled) return reject("Não é possível remover o pagamento " + requestPayment.paymentMethod.name + " no valor de R$ " + parseFloat(requestPayment.amount) + ' por já estar marcado como "Acertado"!')
                                //Check if is "autoPay" (notinha ou que use limite) e identifica o cliente para estorno do Limite
                                if (!requestPayment.paymentMethod.autoPay) {
                                    _.set(removedRequestPayments[index], "request.client", client)
                                    _.set(removedRequestPayments[index], "oldAmount", requestPayment.amount)
                                }
                                if(requestPayment.paid) {
                                    _.set(removedRequestPayments[index], "oldPaid", requestPayment.paid)
                                    _.set(removedRequestPayments[index], "request", oldRequest)
                                } 
                                resolve()
                            })
                        )
                    })
                    return Promise.all(promises)
                        .then(() => {
                            return Promise.resolve(removedRequestPayments)
                        })
                        .catch(err => {
                            return Promise.reject(err)
                        })
                }
                return Promise.resolve(null)
            },

            checkChanges(data, request, client, oldRequest) {
                const oldRequestPayments = (oldRequest && _.has(oldRequest, "requestPayments")) ? oldRequest.requestPayments : null
                if (!oldRequestPayments) {
                    const promises = _.map(data, (requestPayment, index) => {
                        return new Promise((resolve, reject) => {
                            _.set(data[index], "requestId", request.id)
                            resolve()
                        })
                    })
                    return Promise.all(promises)
                    .then(() => {
                        return Promise.resolve(data)
                    })
                }

                let checkChanges = {}

                if (request.status !== oldRequest.status) checkChanges.requestStatus = true
                if (client.id !== oldRequest.client.id) checkChanges.client = true

                const promises = []
                data.forEach((payment, index) => {
                    promises.push(new Promise((resolve, reject) => {
                            const indexOldPayment = _.findIndex(oldRequestPayments, (oldPayment) => {
                                    return oldPayment.id === payment.id
                                })

                            if(!payment.request) _.set(payment, "request", request)

                            if(checkChanges.requestStatus) {
                                _.set(payment, "changeStatus", request.status)
                                _.set(payment, "oldStatus", oldRequest.status)
                                _.set(payment, "oldAmount", parseFloat(oldRequestPayments[indexOldPayment].amount))
                                _.set(payment, "oldPaid", oldRequestPayments[indexOldPayment].paid)
                                _.set(payment, "oldDeadlineDatetime", oldRequestPayments[indexOldPayment].deadlineDatetime)
                                _.set(payment, "oldPaymentMethod", oldRequestPayments[indexOldPayment].paymentMethod)
                                _.set(payment, "oldResponsibleUser", oldRequest.responsibleUser)
                                _.set(payment, "requestPaymentTransactions", oldRequestPayments[indexOldPayment].requestPaymentTransactions)
                            } 

                            if(checkChanges.client) {
                                _.set(payment, "changeUser", true)
                                _.set(payment, "oldStatus", oldRequest.status)
                                _.set(payment, "oldAmount", parseFloat(oldRequestPayments[indexOldPayment].amount))
                                _.set(payment, "oldPaid", oldRequestPayments[indexOldPayment].paid)
                                _.set(payment, "oldDeadlineDatetime", oldRequestPayments[indexOldPayment].deadlineDatetime)
                                _.set(payment, "oldPaymentMethod", oldRequestPayments[indexOldPayment].paymentMethod)
                                _.set(payment, "oldResponsibleUser", oldRequest.responsibleUser)
                                _.set(payment, "requestPaymentTransactions", oldRequestPayments[indexOldPayment].requestPaymentTransactions)
                            }

                            if (indexOldPayment !== -1 && parseFloat(payment.amount) !== parseFloat(oldRequestPayments[indexOldPayment].amount)) {
                                //console.log('OLD-AMOUNT', index, parseFloat(payment.amount), parseFloat(oldRequestPayments[indexOldPayment].amount), (parseFloat(payment.amount) !== parseFloat(oldRequestPayments[indexOldPayment].amount)))
                                _.set(payment, "changedAmount", true)
                                _.set(payment, "oldAmount", parseFloat(oldRequestPayments[indexOldPayment].amount))
                                _.set(payment, "oldPaid", oldRequestPayments[indexOldPayment].paid)
                                _.set(payment, "oldDeadlineDatetime", oldRequestPayments[indexOldPayment].deadlineDatetime)
                                _.set(payment, "oldPaymentMethod", oldRequestPayments[indexOldPayment].paymentMethod)
                                _.set(payment, "oldResponsibleUser", oldRequest.responsibleUser)
                                _.set(payment, "requestPaymentTransactions", oldRequestPayments[indexOldPayment].requestPaymentTransactions)

                                //if(oldRequestPayments[indexOldPayment].settled) return reject("Não é possível alterar o valor do pagamento " + payment.paymentMethod.name + " ref: #" + payment.id + ' por já estar marcado como "Acertado"!')
                            }

                            if (indexOldPayment !== -1 && payment.paid !== oldRequestPayments[indexOldPayment].paid) {
                                //console.log('PAID', index, payment.paid, indexOldPayment, oldRequestPayments[indexOldPayment].paid, (payment.paid !== oldRequestPayments[indexOldPayment].paid))
                                _.set(payment, "changedPaid", true)
                                _.set(payment, "oldPaid", oldRequestPayments[indexOldPayment].paid)
                                _.set(payment, "oldAmount", parseFloat(oldRequestPayments[indexOldPayment].amount))
                                _.set(payment, "oldDeadlineDatetime", oldRequestPayments[indexOldPayment].deadlineDatetime)
                                _.set(payment, "oldPaymentMethod", oldRequestPayments[indexOldPayment].paymentMethod)
                                _.set(payment, "oldResponsibleUser", oldRequest.responsibleUser)
                                _.set(payment, "requestPaymentTransactions", oldRequestPayments[indexOldPayment].requestPaymentTransactions)

                                //if(oldRequestPayments[indexOldPayment].settled) return reject("Não é possível alterar o status \"PAGO\" do pagamento " + payment.paymentMethod.name + " ref: #" + payment.id + ' por já estar marcado como "Acertado"!')
                            }

                            if (indexOldPayment !== -1 && payment.paymentMethodId !== oldRequestPayments[indexOldPayment].paymentMethodId) {
                                //console.log('METHOD', index, payment.paymentMethodId, oldRequestPayments[indexOldPayment].paymentMethodId, (payment.paymentMethodId !== oldRequestPayments[indexOldPayment].paymentMethodId))
                                _.set(payment, "changedMethod", true)
                                _.set(payment, "oldPaid", oldRequestPayments[indexOldPayment].paid)
                                _.set(payment, "oldPaymentMethod", oldRequestPayments[indexOldPayment].paymentMethod)
                                _.set(payment, "oldAmount", parseFloat(oldRequestPayments[indexOldPayment].amount))
                                _.set(payment, "oldDeadlineDatetime", oldRequestPayments[indexOldPayment].deadlineDatetime)
                                _.set(payment, "oldResponsibleUser", oldRequest.responsibleUser)
                                _.set(payment, "requestPaymentTransactions", oldRequestPayments[indexOldPayment].requestPaymentTransactions)
                            }

                            if (indexOldPayment !== -1 && request.responsibleUser.id !== oldRequest.responsibleUser.id) {
                                //console.log('METHOD', index, payment.paymentMethodId, oldRequestPayments[indexOldPayment].paymentMethodId, (payment.paymentMethodId !== oldRequestPayments[indexOldPayment].paymentMethodId))
                                _.set(payment, "changedResponsableUser", true)
                                _.set(payment, "oldPaid", oldRequestPayments[indexOldPayment].paid)
                                _.set(payment, "oldPaymentMethod", oldRequestPayments[indexOldPayment].paymentMethod)
                                _.set(payment, "oldAmount", parseFloat(oldRequestPayments[indexOldPayment].amount))
                                _.set(payment, "oldDeadlineDatetime", oldRequestPayments[indexOldPayment].deadlineDatetime)
                                _.set(payment, "oldResponsibleUser", oldRequest.responsibleUser)
                                _.set(payment, "requestPaymentTransactions", oldRequestPayments[indexOldPayment].requestPaymentTransactions)
                            }

                            //console.log(payment)

                            if (indexOldPayment !== -1 && oldRequestPayments[indexOldPayment].settled && (payment.changedPaid || payment.changedAmount || payment.changedMethod)) {
                                const paid = payment.changedPaid ? "o valor" : ""
                                const amount = payment.changedAmount ? 'o status "PAGO"' : ""
                                const method = payment.changedMethod ? "o tipo de pagamento de " + payment.paymentMethod.name + " para " + oldRequestPayments[indexOldPayment].paymentMethod.name : ""
                                const virgula1 = payment.changedAmount || payment.changedMethod ? " e " : ""
                                const virgula2 = payment.changedMethod ? " e " : ""

                                const error = "Não é possível alterar " + paid + virgula1 + amount + virgula2 + method + " do PAGAMENTO ref: #" + payment.id + ' por já estar marcado como "Acertado"!'
                                return reject(error)
                            }

                            return resolve(payment)
                        })
                    )
                })

                return Promise.all(promises)
                .then((changeds) => {
                    return Promise.resolve(changeds)
                })
            },

            revertPayments(removedRequestPayments, requestPaymentsChange, triggeredBy, transaction) {
                if(requestPaymentsChange.length && requestPaymentsChange[0].oldStatus == 'canceled') {
                    return Promise.resolve() 
                } 

                const revertRemovedRequestPayments = _.filter(removedRequestPayments, (removedRequestPayment) => {
                        return removedRequestPayment.paid
                    })

                const requestPaymentsChanges = _.filter(requestPaymentsChange, (requestPayment) => {
                        if (requestPayment.changeStatus == "canceled") return requestPayment
                        if (requestPayment.changedPaid && requestPayment.oldPaid) {
                            return requestPayment
                        }
                        if (requestPayment.changedAmount && requestPayment.oldPaid) {
                            return requestPayment
                        }
                        if (requestPayment.changedResponsableUser && requestPayment.oldPaid) {
                            return requestPayment
                        }
                    })

                const revertsRequestPayments = _.concat(revertRemovedRequestPayments, requestPaymentsChanges)

                const promises = []

                const accountBalances = {}
                revertsRequestPayments.forEach((requestPayment) => {
                    if (requestPayment.oldPaid) {
                        requestPayment.requestPaymentTransactions.sort((a, b) => {
                            return new Date(b.dateCreated && b.id) - new Date(a.dateCreated && a.id)
                        })

                        const requestTransaction = _.first(requestPayment.requestPaymentTransactions)

                        promises.push(new Promise((resolve, reject) => {
                                if (!requestTransaction.revert) {
                                    return server.broker.call("data/transaction.create", {
                                            data: {
                                                amount: -Math.abs(
                                                    requestTransaction.transaction.amount
                                                ),
                                                createdById: triggeredBy,
                                                accountId: requestTransaction.transaction.accountId,
                                                companyId: requestTransaction.transaction.companyId,
                                                description:
                                                    "Redução do valor do pagamento #" +
                                                    requestPayment.id +
                                                    " do pedido #" +
                                                    requestPayment.request.id +
                                                    " na conta de destino"
                                            },
                                            transaction
                                        })
                                        .then((transactionCreate) => {
                                            return server.mysql.Account.findById(transactionCreate.accountId, {transaction})
                                            .then((account) => {
                                                if (!accountBalances[account.id]) accountBalances[account.id] = account.balance
                                                    accountBalances[account.id] = parseFloat(accountBalances[account.id]) + parseFloat(transactionCreate.amount)
                                                return server.mysql.RequestPaymentTransaction.create({
                                                        requestPaymentId: requestPayment.id,
                                                        transactionId: transactionCreate.id,
                                                        action: "payment",
                                                        operation: null,
                                                        revert: true
                                                    },
                                                    { transaction})
                                                    .then(() => {
                                                        return resolve()
                                                })
                                            })
                                        })
                                }
                                return reject("Erro ao reverter o pagamento #" +  requestPayment.id + " não possível confirmar a transação anterior! Favor consultar suporte e informar pedido: #" + requestPayment.request.id)
                            })
                        )
                    }
                })

                return Promise.all(promises).then(() => {
                    const updateAccountBalancesPromise = []
                    _.forEach(_.keys(accountBalances), accountId => {
                        updateAccountBalancesPromise.push(
                            server.mysql.Account.update({
                                    balance: parseFloat(accountBalances[accountId])
                                }, {
                                    where: {
                                        id: parseInt(accountId)
                                    },
                                    transaction
                                })
                        )
                    })
                    return Promise.all(updateAccountBalancesPromise).catch((err) => {
                        console.log('ERRO: NO BALANCES E REVERT DO PAGAMENTO! "request=payments.service.js"', err)
                        return Promise.reject("ERRO: No registro do pagamento! Favor contatar o suporte!")
                    })
                })
            },

            clientLimit(client, removedRequestPayments, requestPayments, oldRequest, transaction) {
                const creditLimitRequired = _.filter(requestPayments, (requestPayment) => {
                        if (!requestPayment.paid && !requestPayment.paymentMethod.autoPay && requestPayment.deadlineDatetime) return requestPayment
                    })

                if (!client && creditLimitRequired.length) return Promise.reject('Não é possivel realizar uma venda com a forma de pagamento "NOTINHA" sem cliente selecionado!')
                if (!client) return Promise.resolve()

                

                const reverseRemovedRequestPayments = _.filter((removedRequestPayments), (removedRequestPayment) => {
                        if (!removedRequestPayment.paid && !removedRequestPayment.paymentMethod.autoPay && removedRequestPayment.deadlineDatetime) return removedRequestPayment
                    })

                const reversePaymentsChanges = _.filter(requestPayments, (requestPayment) => {
                    if ((requestPayment.changedPaid || requestPayment.changedAmount || requestPayment.changedMethod || requestPayment.changeStatus || requestPayment.changeUser) &&
                        ((requestPayment.changedMethod && !requestPayment.oldPaymentMethod.autoPay) || !requestPayment.oldPaymentMethod.autoPay) &&
                        ((requestPayment.changedPaid && requestPayment.oldPaid) || !requestPayment.oldPaid) && 
                        ((requestPayment.changeStatus && requestPayment.changeStatus == "canceled") || requestPayment.oldStatus !== "canceled")) {

                            return requestPayment
                    }
                })
                
                const reverseLimitRequestPayments = _.concat(reverseRemovedRequestPayments, reversePaymentsChanges)

                return new Promise((resolve, reject) => {
                    if (reverseLimitRequestPayments.length && (reverseLimitRequestPayments[0].oldStatus == 'canceled' || (reverseLimitRequestPayments[0].changeUser || reverseLimitRequestPayments[0].changedPaid || reverseLimitRequestPayments[0].changedAmount || reverseLimitRequestPayments[0].changedMethod || reverseLimitRequestPayments[0].changeStatus))) {
                        const clientLimitInUse = _.sumBy(reverseLimitRequestPayments, "oldAmount")
                        
                        return server.mysql.Client.update({
                            limitInUse: (parseFloat(oldRequest.client.limitInUse) - parseFloat(clientLimitInUse))
                        }, {
                            where: {
                                id: oldRequest.client.id
                            },
                            transaction
                        })
                        .then((limiteUpdated) => {
                            if (!parseInt(_.toString(limiteUpdated))) return reject("Não foi possível alterar o limite de credito em uso do cliente!")
                            return resolve()
                        })
                    }

                    return resolve()
                }).then(() => {
                    if (creditLimitRequired.length && (requestPayments[0].changeStatus !== 'canceled' || (requestPayments[0].changeUser || requestPayments[0].changedPaid || requestPayments[0].changedAmount || requestPayments[0].changedMethod))) {
                                             
                        return server.mysql.Client.findById(client.id, {
                            transaction
                        }).then((clientConsult) => {

                            const newLimitInUse = parseFloat(clientConsult.limitInUse) + parseFloat(_.sumBy(creditLimitRequired, "amount"))
                            const checkLimit = _.gte(parseFloat(clientConsult.creditLimit), newLimitInUse)

                            if (!checkLimit) return Promise.reject("Cliente não tem o limite de credito necessario disponivel para realizar este pedido!")

                            return server.mysql.Client.update({
                                    limitInUse: parseFloat(newLimitInUse)
                                }, {
                                    where: {
                                        id: client.id
                                    },
                                    transaction
                                })
                                .then((newLimiteUpdated) => {
                                    if (!parseInt(_.toString(newLimiteUpdated))) return Promise.reject("Não foi possível alterar o limite de credito em uso do cliente!")
                                    return Promise.resolve()
                            })
                        })
                    }
                    return Promise.resolve()
                })
            },

            requestPayments(data, removedRequestPayments, request, triggeredBy, transaction) {
                if(data.length && (data[0].changeStatus == 'canceled' || data[0].changeUser)) {
                    _.map(data, (requestPayment) => {
                        delete requestPayment.request
                        delete requestPayment.changeStatus
                        delete requestPayment.oldStatus
                        delete requestPayment.changedAmount
                        delete requestPayment.oldAmount
                        delete requestPayment.oldPaid
                        delete requestPayment.oldDeadlineDatetime
                        delete requestPayment.oldPaymentMethod
                        delete requestPayment.oldResponsibleUser
                        delete requestPayment.requestPaymentTransactions
                    })
                    return Promise.resolve(data) 
                } 
                /*
                 * Delete removeds
                 */
                return server.mysql.RequestPayment.destroy({
                    where: {
                        id: {
                            [Op.in]: _.map(removedRequestPayments, (removeRequestPayment) => {
                                return removeRequestPayment.id
                            })
                        }
                    },
                    transaction
                })
                .then(() => {
                    let paymentMethodsPromises = []
                    let paymentsPaids = []

                    data.forEach((requestPayment) => {
                        if(!requestPayment.requestId) _.set(requestPayment, "requestId", request.id)

                        if (requestPayment.id) {
                            paymentMethodsPromises.push(
                                server.mysql.RequestPayment.update(_.assign(requestPayment, {
                                        deadlineDatetime: (requestPayment.deadlineDatetime) ? requestPayment.deadlineDatetime : null,
                                        paidDatetime: (requestPayment.paidDatetime) ? requestPayment.paidDatetime : (requestPayment.paid) ? moment() : null,
                                        dateRemoved: null
                                    }), {
                                        where: {
                                            id: requestPayment.id
                                        },
                                        paranoid: false,
                                        transaction
                                    })
                                .then(() => {
                                    return server.mysql.RequestPayment.findById(requestPayment.id, { transaction })
                                    .then((paymentMethod) => {
                                        paymentMethod = JSON.parse(JSON.stringify(paymentMethod))
                                        if (paymentMethod.paid) paymentsPaids.push(paymentMethod) 
                                        return Promise.resolve(_.assign(paymentMethod, {tmpId: (requestPayment.tmpId) ? requestPayment.tmpId : null }))
                                    })
                                })
                            )
                        } 
                        else {
                            paymentMethodsPromises.push(
                                server.mysql.RequestPayment.create(_.assign(requestPayment, {
                                        deadlineDatetime: (requestPayment.deadlineDatetime) ? requestPayment.deadlineDatetime : null,
                                        paidDatetime: (requestPayment.paidDatetime) ? requestPayment.paidDatetime : (requestPayment.paid) ? moment() : null
                                    }),
                                    { transaction })
                                .then((paymentMethod) => {
                                    if (!paymentMethod) return Promise.reject("Erro ao criar a forma de pagamento.")

                                    paymentMethod = JSON.parse(JSON.stringify(paymentMethod))
                                    if (paymentMethod.paid) paymentsPaids.push(paymentMethod)
                                    return Promise.resolve(_.assign(paymentMethod, {tmpId: (requestPayment.tmpId) ? requestPayment.tmpId : null}))
                                })
                            )
                        }
                    })

                    return Promise.all(paymentMethodsPromises).then((requestPayments) => {
                        if (paymentsPaids.length) {
                            const promises = []

                            const accountBalances = {}
                            paymentsPaids.forEach((requestPaymentPaid) => {
                                promises.push(new Promise((resolve, reject) => {
                                        return server.broker.call("data/transaction.create", {
                                                data: {
                                                    amount: Math.abs(requestPaymentPaid.amount),
                                                    createdById: triggeredBy,
                                                    accountId: request.responsibleUser.accountId,
                                                    companyId: request.companyId,
                                                    description: "Adição do valor do pagamento do pedido #" + request.id + " na conta de destino" 
                                                },
                                                transaction
                                            })
                                            .then((transactionCreate) => {
                                                return server.mysql.Account.findById(transactionCreate.accountId, {
                                                        transaction})
                                                    .then((account) => {

                                                    if (!accountBalances[account.id]) accountBalances[account.id] = account.balance
                                                    accountBalances[account.id] = parseFloat(accountBalances[account.id]) + parseFloat(transactionCreate.amount)
                                                    return server.mysql.RequestPaymentTransaction.create({
                                                            requestPaymentId: requestPaymentPaid.id,
                                                            transactionId: transactionCreate.id,
                                                            action: "payment",
                                                            operation: null,
                                                            revert: false
                                                        }, {
                                                        transaction})   
                                                    .then(() => {
                                                        return resolve()
                                                    })
                                                })
                                            })
                                    })
                                )
                            })

                            return Promise.all(promises).then(() => {
                                const updateAccountBalancesPromise = []
                                _.forEach(_.keys(accountBalances), (accountId) => {
                                    updateAccountBalancesPromise.push(server.mysql.Account.update({
                                                balance: parseFloat(accountBalances[accountId])
                                            }, {
                                                where: {
                                                    id: parseInt(accountId)
                                                },
                                                transaction})
                                    )
                                })
                                return Promise.all(updateAccountBalancesPromise)
                                    .then(() => {
                                        return Promise.resolve(requestPayments)
                                    })
                                    .catch((err) => {
                                        console.log('ERRO: NO BALANCES DO PAGAMENTO! "request=payments.service.js"', err)
                                        return Promise.reject("ERRO: No registro da transação do pagamento! Favor contatar o suporte!")
                                    })
                            })
                        }

                        return Promise.resolve(requestPayments)
                    })
                })
            }

        }
    }
}