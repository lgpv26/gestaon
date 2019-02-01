import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import User from "./User";
import Client from "./Client";
import Card from "./Card";
import RequestOrder from "./RequestOrder";
import moment from "moment/moment";
import RequestPayment from "./RequestPayment";
import RequestClientAddress from "./RequestClientAddress";
import RequestUIState from "./RequestUIState";

export default class Request extends Model {
  static entity = "requests";
  static fields() {
    return {
      id: this.attr("tmp/" + shortid.generate()),
      userId: this.attr(null),
      user: this.belongsTo(User, "userId"),
      clientId: this.attr(null),
      client: this.belongsTo(Client, "clientId"),
      requestOrderId: this.attr(null),
      requestOrder: this.belongsTo(RequestOrder, "requestOrderId"),
      card: this.hasOne(Card, "requestId"),
      requestUIState: this.hasOne(RequestUIState, "requestId"),
      requestPayments: this.hasMany(RequestPayment, "requestId"),
      requestClientAddresses: this.hasMany(RequestClientAddress, "requestId"),
      deliveryDate: this.attr(null),
      dateUpdated: this.attr(null),
      dateCreated: this.attr(null),
      dateRemoved: this.attr(null),
      status: this.attr(null)
    };
  }
}
