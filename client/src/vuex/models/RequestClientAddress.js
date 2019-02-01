import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import moment from "moment/moment";
import Request from "./Request";
import ClientAddress from "./ClientAddress";

export default class RequestClientAddress extends Model {
  static entity = "requestClientAddresses";
  static fields() {
    return {
      id: this.attr("tmp/" + shortid.generate()),
      requestId: this.attr(null),
      request: this.belongsTo(Request, "requestId"),
      clientAddressId: this.attr(null),
      clientAddress: this.belongsTo(ClientAddress, "clientAddressId"),
      lat: this.attr(null),
      lng: this.attr(null),
      type: this.attr(null),
      dateUpdated: this.attr(null),
      dateCreated: this.attr(null),
      dateRemoved: this.attr(null),
      status: this.attr(null)
    };
  }
}
