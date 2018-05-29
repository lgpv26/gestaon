const _ = require('lodash');

module.exports = class Controller {

    constructor(controller = {}) {
        this._controller = {
            companyId: null,
            transaction: null,
            request: {
                params: {}, // path/:id
                queryParser: {}, // ?key=value&key2=value2
                data: null // body
            }
        }
        this.setController(controller);
        return this._controller;
    }

    setController(controller){
        _.assign(this._controller, controller);
    }

}