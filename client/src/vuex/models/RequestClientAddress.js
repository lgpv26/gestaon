import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import moment from "moment/moment"

export default class RequestClientAddress extends Model {
    static entity = 'requestClientAddresses'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            requestId: this.attr(null),

            clientAddressId: this.attr(null),
            lat: this.attr(null),
            lng: this.attr(null),
            type: this.attr(null),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }
}