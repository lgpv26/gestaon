import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import Device from "./Device";

export default class Position extends Model {
    static entity = 'positions'
    static fields() {
        return {
            id: this.attr(shortid.generate()),
            deviceId: this.attr(1),
            device: this.belongsTo(Device,'deviceId'),
            lat: this.attr(null),
            lng: this.attr(null),
            speed: this.attr(null),
            orientation: this.attr(null),
            obs: this.attr(null),
            dateUpdated: this.attr(null),
            dateCreated: this.attr(null),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }
}