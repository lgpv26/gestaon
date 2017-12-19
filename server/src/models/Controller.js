const _ = require('lodash');

module.exports = class Controller {

    constructor(controller) {
        this._controller = {
            companyId: null,
            transaction: null,
            request: {
                data: null
            }
        }
        this.setController(controller);
        return this._controller;
    }

    setController(controller){
        _.assign(this._controller, controller);
    }

}