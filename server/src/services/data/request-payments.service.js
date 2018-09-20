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
                const oldRequest = ctx.params.oldRequest
                const userId = ctx.params.userId
                const companyId = ctx.params.companyId
                const transaction = ctx.params.transaction
                return new Promise((resolve, reject) => {
                        async function start() {
                            try {
                                const alreadyPaid = await vm.checkInitialAlreadyPaid(ctx.params.data, oldRequest)
                                const changePaid = await vm.checkChangePaid(ctx.params.data, oldRequest)
                                const removeRequestPayments = await vm.removeRequestPayments(ctx.params.data, oldRequest)
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
            checkInitialAlreadyPaid(data, oldRequest){
                if(!oldRequest) return Promise.resolve([])
                return new Promise((resolve,reject) => {
                    const alreadyPaid = _.map(_.filter(data, (requestPayment) => {
                        return requestPayment.paid
                    }), (requestPayment) => {
                        return requestPayment
                    })
                    resolve(alreadyPaid)
                })
                
            },
            checkChangePaid(data, oldRequest){
                if(!oldRequest) return Promise.resolve([]) 
                return new Promise((resolve, reject) => {
                    let promises = []
                    data.forEach((payment, index) => {
                        promises.push(new Promise((resolve, reject) => {
                                const indexOldPayment = _.findIndex(oldRequest.requestPayments, (oldPayment) => {
                                    return oldPayment.id === payment.id
                                })
        
                                if(indexOldPayment !== -1 && parseFloat(payment.amount) !== parseFloat(oldRequest.requestPayments[indexOldPayment].amount)){
                                    _.set(payment, 'changed', 'amount')
                                    _.set(payment, 'oldAmount', parseFloat(oldRequest.requestPayments[indexOldPayment].amount))
                                    _.set(payment, 'requestPaymentTransactions', oldRequest.requestPayments[indexOldPayment].requestPaymentTransactions)
                                }
        
                                if(indexOldPayment !== -1 && payment.paid !== oldRequest.requestPayments[indexOldPayment].paid){
                                    _.set(payment, 'changed', 'statusPaid')
                                    _.set(payment, 'oldAmount', parseFloat(oldRequest.requestPayments[indexOldPayment].amount))
                                    _.set(payment, 'requestPaymentTransactions', oldRequest.requestPayments[indexOldPayment].requestPaymentTransactions)
                                }

                                if(indexOldPayment !== -1 && payment.paymentMethodId !== oldRequest.requestPayments[indexOldPayment].paymentMethodId){
                                    _.set(payment, 'changed', 'method')
                                    _.set(payment, 'oldAmount', parseFloat(this._oldRequest.requestPayments[indexOldPayment].amount))
                                    _.set(payment, 'requestPaymentTransactions', oldRequest.requestPayments[indexOldPayment].requestPaymentTransactions)
                                }

                                resolve(payment)
                            })
                        )
                    })
                    return Promise.all(promises).then((results) => {        
                        alreadyPaid = _.pullAllBy(alreadyPaid, changePaid, 'id')
                        const changePaid = _.filter(results, (result) => {
                            return result.changed
                        })
                        
                        resolve(changePaid) 
                    })

                }) 
            },
            removeRequestPayments(data, oldRequest){
                
            }

        }
    }
}