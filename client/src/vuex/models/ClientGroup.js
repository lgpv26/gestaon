import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import moment from "moment/moment"

export default class ClientGroup extends Model {
    static entity = 'clientGroups'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            name: this.attr(null),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null)
        }
    }
}