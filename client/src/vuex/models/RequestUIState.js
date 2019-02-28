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
            activeTab: this.attr(null),
            showRequestChat: this.attr(false),
            showClientOrderTimeline: this.attr(false),
            requestClientAddressForm: this.attr(true),
            isAddingClientAddress: this.attr(true),

            requestString: this.attr(null),
            requestOrderString: this.attr(null),
            hasRequestOrderChanges: this.attr(false),
            hasRequestChanges: this.attr(false),

            isLoading: this.attr(false)
        }
    }
}