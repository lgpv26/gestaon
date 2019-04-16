import { Model } from "@vuex-orm/core";
import shortid from "shortid";
import _ from "lodash";
import moment from "moment";

import ClientAddress from './ClientAddress'

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
    }
  }
  static beforeDelete (model) {
    const clientAddressCount = ClientAddress.query().where(record => () => {
        return record.addressId === model.id
    }).count()
    if(clientAddressCount > 1){
        return false
    }
  }
}
