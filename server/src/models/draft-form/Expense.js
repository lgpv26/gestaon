const _ = require('lodash')
const shortid = require('shortid')

module.exports = class Expense {
    constructor(draft = {}) {
        this._model = {
            id: null,
            activeStep: null,
            supplier: {
                id: null,
                name: null,
                legalDocument: null,
                supplierAddresses: [],
                supplierPhones: [],
                supplierCustomFields: [],
                companyId: null,
                isNull: true
            },
            expense: {
            }
        }
        _.assign(this._model, draft)
    }
    setCompanyId(companyId){
        this._model.supplier.companyId = companyId
    }
    getObject(){
        return this._model
    }
}