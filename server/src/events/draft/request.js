import _ from 'lodash'
import EventResponse from '~server/models/EventResponse'
import Draft from './draft'
import RequestModel from '~server/models/draft/Request'

module.exports = class Request extends Draft {

    /**
     * Events emitted and received when user is connected in a company dashboard
     * @constructor
     * @param {Object} server
     * @param {Object} socket = { instance, user, activeCompany, activeUserCompany}
     */
    constructor(server, socket) {
        super(server, socket)
        this._setListeners()
    }

    /**
     * @private
     * Set listeners
     */
    _setListeners() {
        const vm = this
    }

}