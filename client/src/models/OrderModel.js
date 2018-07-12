import _ from 'lodash'
import { createOrderProduct } from './OrderProductModel'

export default class OrderModel {
    constructor({
        id = null,
        orderProducts = [],
        promotionChannelId = null
    } = {}){
        this.id = id
        this.promotionChannelId = promotionChannelId
        this.orderProducts = _.map(orderProducts, (orderProduct) => {
            return _.assign(orderProduct, createOrderProduct(orderProduct))
        })
    }
}

export function createOrder(data){
    return new OrderModel(data)
}