import _ from 'lodash'

export default function(address = {}){
    return {
        id: _.get(address, 'id', null),
        name: _.get(address, 'name', ''),
        cep: _.get(address, 'cep', ''),
        neighborhood: _.get(address, 'neighborhood', ''),
        city: _.get(address, 'city', ''),
        state: _.get(address, 'state', '')
    }
}