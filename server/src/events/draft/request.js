import _ from 'lodash'
import EventResponse from '~server/models/EventResponse'
import Draft from './draft'

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
         * @param {Object} evData = { activeStep:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.activeStep', (evData) => {
            vm.setDraftForm('activeStep', evData.activeStep)
            vm.server.io.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.activeStep', new EventResponse({
                activeStep: evData.activeStep
            }))
            vm.saveInstantly()
        })
        /**
         * @param {Object} evData = { name:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.name', (evData) => {
            vm.setDraftForm('client.name', evData.name)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.name', new EventResponse({
                name: evData.name
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { legalDocument:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.legalDocument', (evData) => {
            vm.setDraftForm('client.legalDocument', evData.legalDocument)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.legalDocument', new EventResponse({
                legalDocument: evData.legalDocument
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { draftId:Number, showForm:Boolean }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.showForm', (evData) => {
            vm.setDraftForm('client.clientAddress.showForm', evData.showClientAddressForm)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.showForm', new EventResponse({
                showForm: evData.showForm
            }))
            vm.saveInstantly()
        })
    }

}