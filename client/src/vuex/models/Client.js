import { Model } from '@vuex-orm/core'
import shortid from 'shortid'
import _ from 'lodash'
import validate from 'validate.js'
import ClientGroup from './ClientGroup'
import ClientAddress from "./ClientAddress"
import ClientPhone from "./ClientPhone"

export default class Client extends Model {
    static entity = 'clients'
    static fields() {
        return {
            id: this.attr(shortid.generate()),
            clientGroupId: this.attr(null),
            clientGroup: this.belongsTo(ClientGroup,'clientGroupId'),
            clientAddresses: this.hasMany(ClientAddress, 'clientId'),
            clientPhones: this.hasMany(ClientPhone, 'clientId'),
            name: this.attr(null),
            obs: this.attr(null),
            document: this.attr(null)
        }
    }

    /*validate(){
        validate(
            {
                length:
            },
            {

            }
        )
    }*/
}