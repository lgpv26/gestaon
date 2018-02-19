const _ = require('lodash')
const shortid = require('shortid')

module.exports = class Accounts {
    constructor(draft = {}) {
        this._model = {
            id: null,
            activeStep: null,
            accounts: {
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
                ]
            }
        }
        _.assign(this._model, draft)
    }
    setCompanyId(companyId){
        this._model.accounts.companyId = companyId
    }
    getObject(){
        return this._model
    }
}