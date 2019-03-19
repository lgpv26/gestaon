import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import moment from "moment";

export default class Address extends Model {
  static entity = "addresses";
  static fields() {
    return {
      id: this.attr("tmp/" + shortid.generate()),
      name: this.attr(null),
      neighborhood: this.attr(null),
      city: this.attr(null),
      state: this.attr(null),
      cep: this.attr(null),
      dateUpdated: this.attr(null),
      dateCreated: this.attr(null),
      status: this.attr(null)
    };
  }
}
