import _ from 'lodash'
import { createOrderProduct } from './OrderProductModel'

export class OrderModel {
    constructor({
        id = null,
        orderProducts = []
    } = {}){
        this.id = id
        this.orderProducts = _.map(orderProducts, (orderProduct) => {
            return _.assign(orderProduct, createOrderProduct(orderProduct))
        })
    }
}

export function createOrder(data){
    return new OrderModel(data)
}