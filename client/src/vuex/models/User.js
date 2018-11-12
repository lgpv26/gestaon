import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'

export default class User extends Model {
    static entity = 'users'
    static fields() {
        return {
            id: this.attr(shortid.generate()),
            name: this.attr(null),
            email: this.attr(null),
            type: this.attr(null),
        }
    }
}