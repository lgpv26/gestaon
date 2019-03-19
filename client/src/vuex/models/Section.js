import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'

import Card from './Card.js'

export default class Section extends Model {
    static entity = 'sections'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            name: this.attr(null),
            code: this.attr(shortid.generate()),
            cards: this.hasMany(Card, 'sectionId'),
            position: this.attr(65535),
            size: this.attr(1)
        }
    }
}