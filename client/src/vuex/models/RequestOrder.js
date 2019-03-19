import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import moment from "moment/moment";

import Request from "./Request";
import RequestOrderProduct from "./RequestOrderProduct";
import PromotionChannel from "./PromotionChannel";

export default class RequestOrder extends Model {
  static entity = "requestOrders";
  static fields() {
    return {
      id: this.attr("tmp/" + shortid.generate()),
      promotionChannelId: this.attr(null),
      promotionChannel: this.belongsTo(PromotionChannel, "promotionChannelId"),
      obs: this.attr(null),
      request: this.hasOne(Request, "requestOrderId"),
      requestOrderProducts: this.hasMany(RequestOrderProduct, "requestOrderId"),
      dateUpdated: this.attr(null),
      dateCreated: this.attr(null),
      dateRemoved: this.attr(null),
      status: this.attr(null)
    };
  }
}
