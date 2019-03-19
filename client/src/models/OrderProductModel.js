import _ from 'lodash'
import { createProduct } from './ProductModel'

export default class OrderProductModel {
    constructor({ id = null, quantity = 1, unitPrice = 0, unitDiscount = 0, product = {} } = {}){
        this.id = id
        this.quantity = quantity
        this.unitPrice = unitPrice
        this.unitDiscount = unitDiscount
        this.product = _.assign(this.product,createProduct(product))
    }
}

export function createOrderProduct(data){
    return new OrderProductModel(data)
}