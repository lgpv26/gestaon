import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import User from "./User"
import Client from "./Client"
import RequestOrder from "./RequestOrder"
import moment from "moment/moment"
import RequestPayment from "./RequestPayment"

export default class Request extends Model {
    static entity = 'requests'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            userId: this.attr(null),
            user: this.belongsTo(User,'userId'),
            clientId: this.attr(null),
            client: this.belongsTo(Client,'clientId'),
            requestOrderId: this.attr(null),
            requestOrder: this.belongsTo(RequestOrder,'requestOrderId'),
            requestPayments: this.hasMany(RequestPayment, 'requestId'),
            deliveryDate: this.attr(moment()),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }
}