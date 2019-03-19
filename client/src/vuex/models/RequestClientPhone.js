import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import moment from "moment/moment"
import Request from "./Request"
import ClientPhone from "./ClientPhone"

export default class RequestClientPhone extends Model {
    static entity = 'requestClientPhones'
    static fields() {
        return {
            id: this.attr('tmp/' + shortid.generate()),
            requestId: this.attr(null),
            request: this.belongsTo(Request,"requestId"),
            clientPhoneId: this.attr(null),
            clientPhone: this.belongsTo(ClientPhone,"clientPhoneId"),
            type: this.attr(null),
            dateUpdated: this.attr(moment()),
            dateCreated: this.attr(moment()),
            dateRemoved: this.attr(null),
            status: this.attr(null)
        }
    }
}