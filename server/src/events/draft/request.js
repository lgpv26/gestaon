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

                vm.setDraftData('clientAddresses', client.clientAddresses)
                vm.setDraftData('clientPhones', client.clientPhones)
                vm.setDraftData('clientCustomFields', client.clientCustomFields)

                client = _.omit(client, ['clientAddresses', 'clientPhones', 'clientCustomFields'])

                _.forEach(client, (value, key) => {
                    vm.setDraftForm('client.' + key, value)
                })

                vm.server.io.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.select', new EventResponse({
                    client: vm.draft.form.client,
                    $data: {
                        clientAddresses: vm.draft.data.clientAddresses,
                        clientPhones: vm.draft.data.clientPhones,
                        clientCustomFields: vm.draft.data.clientCustomFields                        
                    }
                }))
                vm.saveInstantly()
            })
        })
        /**
         * @param {Object} evData = { draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.reset', (evData) => {

            vm.setDraftData('clientAddresses', [], true)
            vm.setDraftData('clientPhones', [], true)
            vm.setDraftData('clientCustomFields', [], true)
            vm.setDraftForm('client', RequestModel.getClientModel())

            vm.server.io.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.reset', new EventResponse({
                client: vm.draft.form.client,
                $data: {
                    clientAddresses: vm.draft.data.clientAddresses,
                    clientPhones: vm.draft.data.clientPhones,
                    clientCustomFields: vm.draft.data.clientCustomFields                        
                }
            }))
            vm.saveInstantly()
        })
        /**
         * @param {Object} evData = { draftId:Number, showForm:Boolean }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.showForm', (evData) => {
            vm.setDraftForm('client.clientAddress.showForm', evData.showForm)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.showForm', new EventResponse({
                showForm: evData.showForm
            }))
            vm.saveInstantly()
        })
        /**
         * @param {Object} evData = { number:Number, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.number', (evData) => {
            vm.setDraftForm('client.clientAddress.form.number', evData.number)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.number', new EventResponse({
                number: evData.number
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { complement:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.complement', (evData) => {
            vm.setDraftForm('client.clientAddress.form.complement', evData.complement)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.complement', new EventResponse({
                complement: evData.complement
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { name:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.type.add', (evData) => {
            vm.setDraftForm('client.clientAddress.form.type.add', evData.name)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.type.add', new EventResponse({
                name: evData.name
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { id:Number, name:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.type.edit', (evData) => {
            vm.setDraftForm('client.clientAddress.form.type.edit', {id: evData.id, name: evData.name})
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.type.edit', new EventResponse({
                id: evData.id,
                name: evData.name
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { name:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.address.name', (evData) => {
            vm.setDraftForm('client.clientAddress.form.address.name', evData.name)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.address.name', new EventResponse({
                name: evData.name
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { neighborhood:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.address.neighborhood', (evData) => {
            vm.setDraftForm('client.clientAddress.form.address.neighborhood', evData.neighborhood)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.address.neighborhood', new EventResponse({
                neighborhood: evData.neighborhood
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { cep:Number, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.address.cep', (evData) => {
            vm.setDraftForm('client.clientAddress.form.address.cep', evData.cep)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.address.cep', new EventResponse({
                cep: evData.cep
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { city:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.address.city', (evData) => {
            vm.setDraftForm('client.clientAddress.form.address.city', evData.city)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.address.city', new EventResponse({
                city: evData.city
            }))
            vm.saveWithTimeout()
        })
        /**
         * @param {Object} evData = { state:String, draftId:Number }
         */
        vm.socket.instance.on('draft/request.client.clientAddress.form.address.state', (evData) => {
            vm.setDraftForm('client.clientAddress.form.address.state', evData.state)
            vm.socket.instance.broadcast.to('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId).emit('draft/request.client.clientAddress.form.address.state', new EventResponse({
                state: evData.state
            }))
            vm.saveWithTimeout()
        })
    }

}