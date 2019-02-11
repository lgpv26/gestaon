import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import Section from "./Section.js";
import Window from "./Window.js";
import Request from "./Request";

export default class Card extends Model {
    static entity = "cards";
    static fields() {
        return {
            id: this.attr("tmp/" + shortid.generate()),
            windowId: this.attr(null),
            window: this.belongsTo(Window, "windowId"),
            type: this.attr(null),
            requestId: this.attr(null),
            request: this.belongsTo(Request, "requestId"),
            clientName: this.attr(null),
            clientAddress: this.attr(null),
            orderSubtotal: this.attr(0),
            isEditing: this.attr(false),
        }
    }
}
