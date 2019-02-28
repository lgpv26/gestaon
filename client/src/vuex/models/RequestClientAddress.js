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
      lat: this.string(null).nullable(),
      lng: this.string(null).nullable(),
      type: this.attr(null),
      dateUpdated: this.attr(null),
      dateCreated: this.attr(null),
      dateRemoved: this.attr(null),
      status: this.attr(null)
    }
  }

    static beforeCreate (model) {
        if(!_.isNull(model.lat)){
            model.lat = parseFloat(model.lat).toFixed(8)
        }
        if(!_.isNull(model.lng)){
            model.lng = parseFloat(model.lng).toFixed(8)
        }
    }

    static beforeUpdate(model) {
        if(!_.isNull(model.lat)){
            model.lat = parseFloat(model.lat).toFixed(8)
        }
        if(!_.isNull(model.lng)){
            model.lng = parseFloat(model.lng).toFixed(8)
        }
    }
}
