import _ from 'lodash'
import sequelize from 'sequelize'
import {Op} from 'sequelize'
import moment from 'moment'

module.exports = (server) => {
    return {

        name: "data/bills",
        actions: {

            getOne(ctx){
                return server.mysql.RequestPaymentBill.findOne({
                    where: ctx.params.where,
                    include: ctx.params.include
                }).then((bill) => {
                    return JSON.parse(JSON.stringify(bill))
                })
            },

            markAsPaid(ctx){
                //console.log(ctx.params)
                return ctx.call('data/bills.getOne', {
                    where: {
                        id: ctx.params.id
                    },
                    include: [{
                        model: server.mysql.RequestPaymentBillPayment,
                        as: 'requestPaymentBillPayments'
                        }, {
                        model: server.mysql.RequestPayment,
                        as: 'requestPayments',
                        where: {
                            receivedDate: null,
                        },
                        include: [{
                                model: server.mysql.PaymentMethod,
                                as: 'paymentMethod',
                                where: {
                                    autoPay: 0
                                }
                            },
                            {
                                model: server.mysql.Request,
                                as: 'request',
                                include: [
                                    {
                                        model: server.mysql.User,
                                        as: 'responsibleUser'
                                    }
                                ]
                            }
                        ]
                    }]
                }).then((bill) => {
                    if(!bill) throw new Error ('Notinha não encontrada')

                    return server.sequelize.transaction().then((transaction) => {
                        let promises = []

                        ctx.params.data.forEach((data) => {
                            promises.push(
                                    server.mysql.RequestPaymentBillPayment.create({
                                    requestPaymentBillId: ctx.params.id,
                                    paymentMethodId: data.paymentMethodId,
                                    amount: data.amount
                                }, {
                                transaction: transaction
                                }).then((requestPaymentBill) => {
                                    return ctx.call('data/transaction.create', {
                                        data: {
                                            amount: Math.abs(data.amount),
                                            createdById: ctx.params.createdById,
                                            accountId: bill.requestPayments.request.responsibleUser.accountId,
                                            companyId: ctx.params.companyId,
                                            description: 'Adição do valor do pagamento da Notinha "'+ bill.requestPayments.code +'" pedido #' + bill.requestPayments.request.id + ' na conta de destino',
                                        },
                                        transaction: transaction
                                    }).then((transactionData) => {
                                        return server.mysql.RequestPaymentTransaction.create({                   
                                            requestPaymentBillPaymentId: requestPaymentBill.id,
                                            transactionId: transactionData.id,
                                            action: 'payment',
                                            operation: 'bill',
                                            revert: false
                                            }, {
                                            transaction: transaction
                                        })
                                    })
                                    
                                })
                            )
                        })
                            return Promise.all(promises)
                            .then(() => {
                                return server.mysql.RequestPayment.update({
                                    lastTriggeredUserId: ctx.params.createdById,
                                    lastReceivedFromUserId: bill.requestPayments.request.userId,
                                    receivedDate: moment()
                                }, {
                                    where: {
                                        id: bill.requestPayments.id
                                    },
                                    transaction: transaction
                                }).then((requestPaymentUpdate) => {
                                    if (parseInt(_.toString(requestPaymentUpdate)) < 1) {
                                        console.log("Nenhum registro encontrado. Update.")
                                        throw new Error("Nenhum registro encontrado.")
                                    }

                                    return server.mysql.RequestPaymentBill.findById(ctx.params.id, {
                                        include: [{
                                            model: server.mysql.RequestPaymentBillPayment,
                                            as: 'requestPaymentBillPayments'
                                        }],
                                        transaction: transaction
                                    }).then((billReturn) => {
                                        return transaction.commit().then(() => {
                                            return JSON.parse(JSON.stringify(billReturn))
                                        })
                                    })
                                }).catch((err) => {
                                    return transaction.rollback().then(() => {
                                        return Error(err)
                                    })
                                })
                            })
                        })
                    })
            }

        }
    }
}
