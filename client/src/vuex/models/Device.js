import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import Position from "./Position";

export default class Device extends Model {
    static entity = 'devices'
    static fields() {
        return {
            id: this.attr(shortid.generate()),
            companyId: this.attr(1),
            code: this.attr(null),
            name: this.attr(null),
            protocol: this.attr(null),
            color: this.attr(null),
            isPortable: this.attr(null),
            phoneNumber: this.attr(null),
            obs: this.attr(null),
            positions: this.hasMany(Position, 'deviceId'),
            dateUpdated: this.attr(null),
            dateCreated: this.attr(null),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }
}