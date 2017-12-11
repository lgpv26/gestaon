const Drafts = require('./drafts')
const basePath = require('./../middlewares/base-path.middleware')
const _ = require('lodash')

module.exports = class Request extends Drafts {

    constructor(server, channels, socket) {
        super(server, channels, socket)

        this.setSocketRequestListeners()
    }

    setSocketRequestListeners() {
        this.socket.on('draft:client-select', (clientSelect) => {
            super.resetTimeout(clientSelect.draftId)
            this.onClientSelect(clientSelect)
        })

        this.socket.on('draft:client-reset', (clientReset) => {
            super.resetTimeout(clientReset.draftId)
            this.onClientReset(clientReset)
        })

        this.socket.on('draft:client-address-add', (clientAddressAdd) => {
            super.resetTimeout()
            super.saveDraft(clientAddressAdd.draftId)
            this.onClientAddressAdd(clientAddressAdd)
        })

        this.socket.on('draft:client-address-edit', (clientAddressEdit) => {
            super.resetTimeout(clientAddressEdit.draftId)
            this.onClientAddressEdit(clientAddressEdit)
        })

        this.socket.on('draft:client-address-back', (clientAddressBack) => {
            super.resetTimeout(clientAddressBack.draftId)
            this.onClientAddressBack(clientAddressBack)
        })

        this.socket.on('draft:client-address-update', (clientAddressUpdate) => {
            super.resetTimeout()
            this.onClientAddressUpdate(clientAddressUpdate)
        })

        this.socket.on('draft:client-address-address-select', (clientAddressAddressSelect) => {
            super.resetTimeout(clientAddressAddressSelect.draftId)
            this.onClientAddressAddressSelect(clientAddressAddressSelect)
        })

        this.socket.on('draft:client-address-address-reset', (clientAddressAddressReset) => {
            super.resetTimeout(clientAddressAddressReset.draftId)
            this.onClientAddressAddressReset(clientAddressAddressReset)
        })

        this.socket.on('draft:client-address-save', (clientAddressSave) => {
            super.resetTimeout()
            super.saveDraft(clientAddressSave.draftId).then(() => {
                this.onClientAddressSave(clientAddressSave)
            })            
        })

        this.socket.on('draft:client-address-remove', (clientAddressRemove) => {
            this.onClientAddressRemove(clientAddressRemove)
        })


    }

    onClientSelect(clientSelect) {
        this.controller.selectClient(clientSelect).then((client) => {
            this.server.io.in('draft/' + clientSelect.draftId).emit('draftClientSelect', client)
        }).catch(() => {
            console.log('catch do SELECT CLIENT - QUE É DENTRO DO ON CLIENT SELECT')
        })
    }

    onClientReset(clientSelect) {
        this.controller.resetClient(clientSelect).then(() => {
            this.server.io.in('draft/' + clientSelect.draftId).emit('draftClientReset')
        }).catch(() => {
            console.log('catch do RESET CLIENT - QUE É DENTRO DO ON CLIENT RESET')
        })
    }

    onClientAddressAdd(clientAddressAdd) {
        this.server.io.in('draft/' + clientAddressAdd.draftId).emit('draftClientAddressAdd')
    }

    onClientAddressEdit(clientAddressEdit) {
        this.server.io.in('draft/' + clientAddressEdit.draftId).emit('draftClientAddressEdit', clientAddressEdit.clientAddressId)
    }

    onClientAddressBack(clientAddressBack){
        this.controller.clientAddressBack(clientAddressBack).then(() => {
            this.server.io.in('draft/' + clientAddressBack.draftId).emit('draftClientAddressBack')
        })
    }

    onClientAddressUpdate(clientAddressUpdate) {
        this.socket.broadcast.in('draft/' + clientAddressUpdate.draftId).emit('draftClientAddressUpdate', clientAddressUpdate.clientAddressForm)

        clientAddressUpdate.form = { clientAddressForm: clientAddressUpdate.clientAddressForm }
        clientAddressUpdate.form.clientAddressForm.id = (clientAddressUpdate.clientAddressId) ? clientAddressUpdate.clientAddressId : null
        delete clientAddressUpdate.clientAddressForm
        delete clientAddressUpdate.clientAddressId

        super.setArrayDraft(clientAddressUpdate).then(() => {
            this.server.io.in('draft/' + clientAddressUpdate.draftId).emit('draftClientAddressSaveable')
            super.timerSocketUpdate(clientAddressUpdate.draftId)
        }).catch(() => {
            console.log('catch do SET ARRAY DENTRO DO onClientAddressUpdate - chamado pelo SUPER')
        })
    }

    onClientAddressAddressSelect(addressSelect) {
        this.controller.selectAddressClientAddress(addressSelect).then((address) => {
            this.server.io.in('draft/' + addressSelect.draftId).emit('draftClientAddressAddressSelect', address)
        }).catch(() => {
            console.log('catch do SELECT ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDDRESS SELECT')
        })
    }

    onClientAddressAddressReset(addressReset) {
        this.controller.resetAddressClientAddress(addressReset).then(() => {
            this.server.io.in('draft/' + addressReset.draftId).emit('draftClientAddressAddressReset')
        }).catch(() => {
            console.log('catch do RESET ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDRESS RESET')
        })
    }

    onClientAddressSave(clientAddressSave) {
        this.controller.saveClientAddress(clientAddressSave).then((savedClientAddress) => {
            this.server.io.in('draft/' + clientAddressSave.draftId).emit('draftClientAddressSave', savedClientAddress)
        }).catch((err) => {
            console.log(err, 'catch do SAVE ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDRESS SAVE')
        })
    }

    onClientAddressRemove(clientAddressRemove) {
        this.controller.removeClientAddress(clientAddressRemove).then((removedClientAddress) => {
            this.server.io.in('draft/' + clientAddressRemove.draftId).emit('draftClientAddressRemove', removedClientAddress)
        }).catch(() => {
            console.log('catch do REMOVE CLIENT ADDRESS - QUE É DENTRO DO ON ClientAddressRemove')
        })
    }

}