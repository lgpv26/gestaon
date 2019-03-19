import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import Client from "./Client"
import moment from "moment/moment"

export default class Product extends Model {
    static entity = 'products'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            name: this.attr(null),
            price: this.attr(0),
            quantity: this.attr(1),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null)
        }
    }
}