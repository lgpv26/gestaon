import _ from 'lodash'
import shortid from 'shortid'
import { createPaymentMethod } from './PaymentMethodModel'

import generateCode from 'nanoid/generate'

export class RequestPaymentModel {
    constructor({ id = null, deadlineDatetime = null, amount = 0,
            code = generateCode('ABCDEFGHIJKLMNOPQRSTUVXYWZ0123456789',5), nextInstallments = [], paymentMethod = {}, received = false } = {}){
        this.id = id
        this.deadlineDatetime = deadlineDatetime
        this.amount = amount
        this.code = code
        this.nextInstallments = _.assign(this.nextInstallments, nextInstallments)
        this.paymentMethod = _.assign(this.paymentMethod,createPaymentMethod(paymentMethod))
        this.received = received
    }
}

export function createRequestPayment(data){
    return new RequestPaymentModel(data)
}