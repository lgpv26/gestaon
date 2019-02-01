import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import moment from "moment/moment";
import Client from "./Client";

export default class ClientPhone extends Model {
  static entity = "clientPhones";
  static fields() {
    return {
      id: this.attr("tmp/" + shortid.generate()),
      clientId: this.attr(null),
      client: this.belongsTo(Client, "clientId"),
      name: this.attr(null),
      number: this.attr(null),
      dateUpdated: this.attr(null),
      dateCreated: this.attr(null),
      dateRemoved: this.attr(null)
    };
  }
}
