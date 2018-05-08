import _ from 'lodash'
import { createPaymentMethod } from './PaymentMethodModel'

export class RequestPaymentMethodModel {
    constructor({ id = null, deadline = null, amount = 0, nextInstallments = [], paymentMethod = {} } = {}){
        this.id = id
        this.deadline = deadline
        this.amount = amount
        this.nextInstallments = _.assign(this.nextInstallments, nextInstallments)
        this.paymentMethod = _.assign(this.paymentMethod,createPaymentMethod(paymentMethod))
    }
}

export function createRequestPaymentMethod(data){
    return new RequestPaymentMethodModel(data)
}