import _ from 'lodash'
import { createPaymentMethod } from './PaymentMethodModel'

export class RequestPaymentMethodModel {
    constructor({ id = null, deadlineDatetime = null, amount = 0, nextInstallments = [], paymentMethod = {}, paid = false } = {}){
        this.id = id
        this.deadlineDatetime = deadlineDatetime
        this.amount = amount
        this.nextInstallments = _.assign(this.nextInstallments, nextInstallments)
        this.paymentMethod = _.assign(this.paymentMethod,createPaymentMethod(paymentMethod))
        this.paid = paid
    }
}

export function createRequestPaymentMethod(data){
    return new RequestPaymentMethodModel(data)
}