import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import moment from "moment/moment"

import Request from './Request'

export default class RequestUIState extends Model {
    static entity = 'requestUIState'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            requestId: this.attr(null),
            request: this.belongsTo(Request,'requestId'),
            activeTab: this.attr('client'),
            showClientOrderTimeline: this.attr(false),
            requestClientAddressForm: this.attr(true),
            isAddingClientAddress: this.attr(true)
        }
    }
}