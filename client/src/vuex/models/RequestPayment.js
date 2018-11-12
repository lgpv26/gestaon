import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import moment from "moment/moment"

import Request from './Request'
import PaymentMethod from './PaymentMethod'

export default class RequestPayment extends Model {
    static entity = 'requestPayments'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            requestId: this.attr(null),
            request: this.belongsTo(Request,'requestId'),
            paymentMethodId: this.attr(null),
            paymentMethod: this.belongsTo(PaymentMethod,'paymentMethodId'),
            amount: this.attr(0),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }
}