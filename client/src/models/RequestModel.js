import _ from 'lodash'
import {createClient} from '../models/ClientModel'

export default class RequestModel {
    constructor({
        id = null,
        activeStep = null,
        client = {},
        responsibleUserId = null,
        accountId = null,
        clientPhoneId = null,
        clientAddressId = null,
        useSuggestedDeliveryDate = true,
        deliveryDate = null,
        requestPayments = [],
        obs = '',
        phoneLine = null,
        status = 'pending'
    } = {}){
        this.id = id
        this.activeStep = activeStep
        this.client = _.assign(this.client, createClient(client))
        this.responsibleUserId = responsibleUserId
        this.clientAddressId = clientAddressId
        this.clientPhoneId = clientPhoneId
        this.accountId = accountId
        this.useSuggestedDeliveryDate = useSuggestedDeliveryDate
        this.deliveryDate = deliveryDate
        this.requestPayments = requestPayments
        this.obs = obs
        this.phoneLine = phoneLine
        this.status = status
    }
}

export function createRequest(data){
    return new RequestModel(data)
}