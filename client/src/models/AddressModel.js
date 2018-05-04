import _ from 'lodash'

export class AddressModel {
    constructor({ id = null, name = '', cep = '', neighborhood = '', city = '', state = '' } = {}){
        this.id = id
        this.name = name
        this.cep = cep
        this.neighborhood = neighborhood
        this.city = city
        this.state = state
    }
}

export function createAddress(data){
    return new AddressModel(data)
}