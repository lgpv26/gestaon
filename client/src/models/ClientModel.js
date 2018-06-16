import _ from 'lodash'
import { createClientAddress } from './ClientAddressModel'
import { createClientAddressForm } from './ClientAddressFormModel'

export class ClientModel {
    constructor({
        id = null,
        name = '',
        legalDocument = '',
        clientGroupId = null,
        creditLimit = 0,
        limitInUse = 0,
        clientAddressForm = {},
        clientCustomFields = [],
        clientAddresses = [],
        clientPhones = []
    } = {}){
        this.id = id
        this.name = name
        this.creditLimit = creditLimit
        this.limitInUse = limitInUse
        this.legalDocument = legalDocument
        this.clientGroupId = clientGroupId
        this.clientCustomFields = clientCustomFields
        this.clientPhones = clientPhones
        this.clientAddressForm = _.assign(this.clientAddressForm, createClientAddressForm(clientAddressForm))
        this.clientAddresses = _.map(clientAddresses, (clientAddress) => {
            return _.assign(clientAddress, createClientAddress(clientAddress))
        })
    }
}

export function createClient(data){
    return new ClientModel(data)
}