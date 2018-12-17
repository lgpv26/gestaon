import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import moment from "moment/moment"
import Client from "./Client"
import Address from "./Address"

export default class ClientAddress extends Model {
    static entity = 'clientAddresses'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            clientId: this.attr(null),
            client: this.belongsTo(Client,'clientId'),
            addressId: this.attr(null),
            address: this.belongsTo(Address,'addressId'),
            name: this.attr(null),
            number: this.attr(null),
            complement: this.attr(null),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }
}