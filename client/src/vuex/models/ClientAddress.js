import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import moment from "moment/moment"

export default class ClientAddress extends Model {
    static entity = 'clientAddresses'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            clientId: this.attr(null),
            addressId: this.attr(null),
            name: this.attr(null),
            number: this.attr(0),
            complement: this.attr(null),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }
}