import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import moment from "moment/moment"

export default class PaymentMethod extends Model {
    static entity = 'paymentMethods'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            name: this.attr(null),
            rule: this.attr(0),
            tax: this.attr(0),
            taxUnit: this.attr(null),
            autoPay: this.attr(0),
            hasDeadline: this.attr(0),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null)
        }
    }
}