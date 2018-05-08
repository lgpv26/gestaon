import _ from 'lodash'

export class PaymentMethodModel {
    constructor({ id = null, name = '', rule = '', tax = 0, taxUnit = 'flat', autoPay = true } = {}){
        this.id = id
        this.name = name
        this.rule = rule
        this.tax = tax
        this.taxUnit = taxUnit
        this.autoPay = autoPay
    }
}

export function createPaymentMethod(data){
    return new PaymentMethodModel(data)
}