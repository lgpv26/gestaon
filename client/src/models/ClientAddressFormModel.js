import _ from 'lodash'
import { AddressModel } from './index'

export default function(clientAddress = {}){
    return {
        id: _.get(clientAddress, 'id', null),
        show: _.get(clientAddress, 'show', false),
        complement: _.get(clientAddress, 'complement', ''),
        number: _.get(clientAddress, 'number', ''),
        address: new AddressModel(_.get(clientAddress, 'address', {}))
    }
}