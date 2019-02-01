import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import moment from "moment/moment";
import Product from "./Product";
import RequestOrder from "./RequestOrder";

export default class RequestOrderProduct extends Model {
  static entity = "requestOrderProducts";
  static fields() {
    return {
      id: this.attr("tmp/" + shortid.generate()),
      requestOrderId: this.attr(null),
      requestOrder: this.belongsTo(RequestOrder, "requestOrderId"),
      productId: this.attr(null),
      product: this.belongsTo(Product, "productId"),
      quantity: this.attr(1),
      unitPrice: this.attr(0),
      unitDiscount: this.attr(0),
      dateUpdated: this.attr(null),
      dateCreated: this.attr(null),
      dateRemoved: this.attr(null)
    };
  }
}
