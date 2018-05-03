import _ from 'lodash'
import { ClientAddressModel } from './index'

export default function(client = {}){

    const tClient =  {
        id: _.get(client, 'id', null),
        name: _.get(client, 'name', ''),
        legalDocument: _.get(client, 'legalDocument', ''),
    }

    // client addresses

    if(_.has(client, 'clientAddresses') && client.clientAddresses.length){
        tClient.clientAddresses = _.map(client.clientAddresses, (clientAddress) => {
            return new ClientAddressModel(clientAddress)
        })
    }
    else {
        tClient.clientAddresses = []
    }

    return tClient

}