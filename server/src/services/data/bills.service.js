import _ from 'lodash'
import sequelize from 'sequelize'
import {Op} from 'sequelize'
import moment from 'moment'

module.exports = (server) => {
    return {

        name: "data/bills",
        actions: {

            getOne(ctx){
                return server.mysql.RequestPayment.findOne({
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
                        id: ctx.params.id,
                        billPaymentDate: null
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
                                    as: 'responsibleUser',
                                    attributes: ['id', 'activeCompanyUserId', 'accountId', 'name', 'email']
                                }
                            ]
                        }]
                }).then((bill) => {
                    if(!bill) throw new Error ('Notinha não encontrada')
                 
                    return server.sequelize.transaction().then((transaction) => {
   
                                return ctx.call('data/transaction.create', {
                                    data: {
                                        amount: Math.abs(bill.amount),
                                        createdById: ctx.params.createdById,
                                        accountId: bill.request.responsibleUser.accountId,
                                        companyId: ctx.params.companyId,
                                        description: 'Adição do valor do pagamento da Notinha "'+ bill.code +'" pedido #' + bill.request.id + ' na conta de destino',
                                    },
                                    transaction: transaction
                                }).then((transactionData) => {
                                    return server.mysql.RequestPaymentTransaction.create({                   
                                        requestPaymentId: bill.id,
                                        transactionId: transactionData.id,
                                        action: 'payment',
                                        operation: 'bill',
                                        revert: false
                                        }, {
                                        transaction: transaction
                                    }).then(() => {
                                        return server.mysql.RequestPayment.update({
                                            lastTriggeredUserId: ctx.params.createdById,
                                            lastReceivedFromUserId: (bill.receivedDate) ? bill.lastTriggeredUserId : bill.request.userId,
                                            billPaymentDate: (ctx.params.data.billPaymentDate) ? ctx.params.data.billPaymentDate : moment()
                                        }, {
                                            where: {
                                                id: bill.id
                                            },
                                            transaction: transaction
                                        }).then((requestPaymentUpdate) => {
                                            if (parseInt(_.toString(requestPaymentUpdate)) < 1) {
                                                console.log("Nenhum registro encontrado. Update.")
                                                throw new Error("Nenhum registro encontrado.")
                                            }
        
                                            return server.mysql.RequestPayment.findById(ctx.params.id, {
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
                    })
            }

        }
    }
}
