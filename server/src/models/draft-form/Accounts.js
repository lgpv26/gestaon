const _ = require('lodash')
const shortid = require('shortid')

module.exports = class Accounts {
    constructor(draft = {}) {
        this._model = {
            id: null,
            activeStep: null,
            transactionAccounts: {
                paymentMethodForm: {},
                paymentMethods: []
            },
            expenses: {
                expenseGroups: [
                    /*{
                        expenseGroupForm: {
                        }
                    }*/
                ],
                expenseItems: []
            },
            revenues: {
                revenueGroups: [
                    /*{
                        revenueGroupForm: {
                        }
                    }*/
                ],
                revenueItems: []
            }
        }
        _.assign(this._model, draft)
    }
    setCompanyId(companyId){
    }
    getObject(){
        return this._model
    }
    isSingle(){
        return true
    }
}

// draft:expenses:expense-group