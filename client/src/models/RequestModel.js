import _ from 'lodash'

export class RequestModel {
    constructor({
        id = null,
        activeStep = null,
        responsibleUserId = null,
        accountId = null,
        useSuggestedDeadlineDatetime = false,
        deadlineDatetime = null,
        requestPaymentMethods = [],
        obs = '',
    } = {}){
        this.id = id
        this.activeStep = activeStep
        this.responsibleUserId = responsibleUserId
        this.accountId = accountId
        this.useSuggestedDeadlineDatetime = useSuggestedDeadlineDatetime
        this.deadlineDatetime = deadlineDatetime
        this.requestPaymentMethods = requestPaymentMethods
        this.obs = obs
    }
}

export function createRequest(data){
    return new RequestModel(data)
}