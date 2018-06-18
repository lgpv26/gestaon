import _ from 'lodash'
import {createClient} from '../models/ClientModel'

export class RequestModel {
    constructor({
        id = null,
        activeStep = null,
        client = {},
        responsibleUserId = null,
        accountId = null,
        clientPhoneId = null,
        clientAddressId = null,
        useSuggestedDeadlineDatetime = true,
        deadlineDatetime = null,
        requestPayments = [],
        obs = '',
    } = {}){
        this.id = id
        this.activeStep = activeStep
        this.client = _.assign(this.client, createClient(client))
        this.responsibleUserId = responsibleUserId
        this.clientAddressId = clientAddressId
        this.clientPhoneId = clientPhoneId
        this.accountId = accountId
        this.useSuggestedDeadlineDatetime = useSuggestedDeadlineDatetime
        this.deadlineDatetime = deadlineDatetime
        this.requestPayments = requestPayments
        this.obs = obs
    }
}

export function createRequest(data){
    return new RequestModel(data)
}