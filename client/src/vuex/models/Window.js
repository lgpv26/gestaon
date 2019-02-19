import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import Card from "./Card"

export default class Window extends Model {
    static entity = 'windows'
    static fields() {
        return {
            id: this.attr(shortid.generate()),
            show: this.attr(true),
            card: this.hasOne(Card,'windowId'),
            zIndex: this.attr(0),
            x: this.attr(20),
            y: this.attr(20)
        }
    }
}