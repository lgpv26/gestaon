const Drafts = require('./drafts')
const basePath = require('./../middlewares/base-path.middleware')
const _ = require('lodash')

module.exports = class Request extends Drafts {

    constructor(server, channels, socket) {
        super(server, channels, socket)

        this.setSocketRequestListeners()
    }
    
    setSocketRequestListeners(){
        this.socket.on('draft:client-select', (clientSelect) => {
            super.resetTimeout(clientSelect.draftId)
            this.onClientSelect(clientSelect)
        })

        this.socket.on('draft:client-reset', (clientReset) => {
            super.resetTimeout(clientReset.draftId)
            this.onClientReset(clientReset)
        })

        this.socket.on('draft:client-address-edit', (clientAddressEdit) => {
            super.resetTimeout(clientAddressEdit.draftId)
            this.onClientAddressEdit(clientAddressEdit)
        })

        this.socket.on('draft:client-address-update', (clientAddressUpdate) => {
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

        
    }

    onClientSelect(clientSelect){
        this.controller.selectClient(clientSelect).then((client) => {
            this.server.io.in('draft/' + clientSelect.draftId).emit('draftClientSelect', client)
        }).catch(() => {
            console.log('catch do SELECT CLIENT - QUE É DENTRO DO ON CLIENT SELECT')
        })
    }

    onClientReset(clientSelect){
        this.controller.resetClient(clientSelect).then(() => {
            this.server.io.in('draft/' + clientSelect.draftId).emit('draftClientReset')
        }).catch(() => {
            console.log('catch do RESET CLIENT - QUE É DENTRO DO ON CLIENT RESET')
        })
    }

    onClientAddressEdit(clientAddressEdit){
        this.server.io.in('draft/' + clientAddressEdit.draftId).emit('draftClientAddressEdit', clientAddressEdit.clientAddressId)
    }

    onClientAddressUpdate(clientAddressUpdate){
        this.socket.broadcast.in('draft/' + clientAddressUpdate.draftId).emit('draftClientAddressUpdate', clientAddressUpdate.clientAddressForm)

        clientAddressUpdate.form = {clientAddressForm: clientAddressUpdate.clientAddressForm}
        clientAddressUpdate.form.clientAddressForm.id = clientAddressUpdate.clientAddressId
        delete clientAddressUpdate.clientAddressForm
        delete clientAddressUpdate.clientAddressId

        super.setArrayDraft(clientAddressUpdate).then(() => {
            super.timerSocketUpdate(clientAddressUpdate.draftId)
        }).catch(() => {
            console.log('catch do SET ARRAY DENTRO DO onClientAddressUpdate - chamado pelo SUPER')
        })
    }

    onClientAddressAddressSelect(addressSelect){
        this.controller.selectAddressClientAddress(addressSelect).then((address) => {
            this.server.io.in('draft/' + addressSelect.draftId).emit('draftClientAddressAddressSelect', address)
        }).catch(() => {
            console.log('catch do SELECT CLIENT - QUE É DENTRO DO ON CLIENT SELECT')
        })
    }

    onClientAddressAddressReset(addressReset){
        console.log('aqui')
        this.controller.resetAddressClientAddress(addressReset).then(() => {
            this.server.io.in('draft/' + addressReset.draftId).emit('draftClientAddressAddressReset')
        }).catch(() => {
            console.log('catch do RESET CLIENT - QUE É DENTRO DO ON CLIENT RESET')
        })
    }

}