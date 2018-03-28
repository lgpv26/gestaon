const _ = require('lodash')
const shortid = require('shortid')

module.exports = class Request {
    constructor(draft = {}) {
        this._model = {
            id: null,
            activeStep: null,
            client: {
                id: null,
                name: null,
                legalDocument: null,
                clientAddresses: [],
                clientPhones: [],
                clientCustomFields: [],
                companyId: null,
                isNull: true
            },
            order: {
                orderProducts: [
                    {
                        id: 'temp:' + shortid.generate()
                    }
                ],
                requestTimeline: {
                    "status" : "pending",
                    "triggeredBy" : null,
                    "userId" : null
                }
            }
        }
        _.assign(this._model, draft)
    }
    setCompanyId(companyId){
        this._model.client.companyId = companyId
    }
    getObject(){
        return this._model
    }
    isSingle(){
        return false
    }

    setUser(userId){
        this._model.order.requestTimeline.triggered = userId
    }
}