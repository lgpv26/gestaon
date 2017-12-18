const Drafts = require('../../events/Draft/index')
const basePath = require('../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

module.exports = class RequestPersistance {

    constructor(server) {
        this._transaction = sequelize.transaction();
    }

    // this class should be responsible for converting a draft to respective model formats,
    // execute its saving operations through the use of controllers.
    // finally, respond with success or failure with its respective errors.

}