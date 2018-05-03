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
        /**
         * @param {Object} evData = { clientId:Number, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.select', (evData) => {
            // call the service to get a client's data
            vm.server.broker.call('data/client.get', {
                data: {
                    companyId: vm.socket.activeCompany.id,
                    id: evData.clientId
                }
            }).then((client) => {
                vm.server.io.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.select', new EventResponse(client))
            })
        })
        /**
         * @param {Object} evData = { draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.reset', (evData) => {
        })

        /**
         * @param {Object} evData = { addressId:Number, draftId:Number }
         */
        vm.socket.instance.on('draft/request.address.select', (evData) => {
            // call the service to get a address's data
            vm.server.broker.call('data/address.get', {
                data: {
                    companyId: vm.socket.activeCompany.id,
                    id: evData.addressId
                }
            }).then((address) => {
                vm.server.io.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.address.select', new EventResponse(address))
            })
        })

    }

}