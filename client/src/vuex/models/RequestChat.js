import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import moment from "moment/moment";

import Request from "./Request";
import User from "./User";

export default class RequestChat extends Model {
    static entity = "requestChats";
    static fields() {
        return {
            id: this.attr("tmp/" + shortid.generate()),
            requestId: this.attr(null),
            request: this.belongsTo(Request, "requestId"),
            userId: this.attr(null),
            user: this.belongsTo(User, "userId"),
            type: this.attr("message"), // message, alert
            data: this.attr(""),
            dateUpdated: this.attr(null),
            dateCreated: this.attr(null),
            dateRemoved: this.attr(null),
        }
    }
}
