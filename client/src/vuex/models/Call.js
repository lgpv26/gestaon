import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import Client from '../models/Client'

export default class Call extends Model {
    static entity = 'calls'
    static fields() {
        return {
            id: this.attr(shortid.generate()),
            number: this.attr(null),
            destination: this.attr(null),
            isValid: this.attr(false),
            isAnonymous: this.attr(false),
            clients: this.hasManyBy(Client, 'clients'),
            updatedAt: this.attr(null),
            createdAt: this.attr(null)
        }
    }
}