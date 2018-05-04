import _ from 'lodash'
import { createAddress } from './AddressModel'

export class ClientAddressFormModel {
    constructor({ id = null, show = false, complement = '', number = '', address = {} } = {}){
        this.id = id
        this.show = show
        this.complement = complement
        this.number = number
        this.address = _.assign(this.address,createAddress(address))
    }
}

export function createClientAddressForm(data){
    return new ClientAddressFormModel(data)
}