import _ from 'lodash'
import { createAddress } from './AddressModel'

export default class ClientAddressModel {
    constructor({ id = null, complement = '', number = '', address = {} } = {}){
        this.id = id
        this.complement = complement
        this.number = number
        this.address = _.assign(this.address,createAddress(address))
    }
}

export function createClientAddress(data){
    return new ClientAddressModel(data)
}