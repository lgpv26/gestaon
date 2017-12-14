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
            super.resetTimeout()
            super.saveDraft(clientSelect.draftId).then(() => {
                this.onClientSelect(clientSelect)
            })
        })

        this.socket.on('draft:client-reset', (clientReset) => {
            super.resetTimeout()
            super.saveDraft(clientReset.draftId).then(() => {
                this.onClientReset(clientReset)
            })
        })

        this.socket.on('draft:client-address-add', (clientAddressAdd) => {
            super.resetTimeout()
            super.saveDraft(clientAddressAdd.draftId).then(() => {
                this.onClientAddressAdd(clientAddressAdd)
            })
        })

        this.socket.on('draft:client-address-edit', (clientAddressEdit) => {
            super.resetTimeout()
            super.saveDraft(clientAddressEdit.draftId).then(() => {
                this.onClientAddressEdit(clientAddressEdit)
            })
        })

        this.socket.on('draft:client-address-back', (clientAddressBack) => {
            super.resetTimeout()
            super.saveDraft(clientAddressBack.draftId).then(() => {
                this.onClientAddressBack(clientAddressBack)
            })
        })

        this.socket.on('draft:client-address-update', (clientAddressUpdate) => {
            super.resetTimeout()
            this.onClientAddressUpdate(clientAddressUpdate)
        })

        this.socket.on('draft:client-address-address-select', (clientAddressAddressSelect) => {
            super.resetTimeout()
            super.saveDraft(clientAddressAddressSelect.draftId).then(() => {
                this.onClientAddressAddressSelect(clientAddressAddressSelect)
            })
        })

        this.socket.on('draft:client-address-address-reset', (clientAddressAddressReset) => {
            super.resetTimeout()
            super.saveDraft(clientAddressAddressReset.draftId).then(() => {
                this.onClientAddressAddressReset(clientAddressAddressReset)
            })
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

        this.socket.on('draft:client-phone-edit', (clientPhoneEdit) => {
            this.onClientPhoneEdit(clientPhoneEdit)
        })

        this.socket.on('draft:client-phone-edition-cancel', (clientPhoneEditionCancel) => {
            super.resetTimeout()
            super.saveDraft(clientPhoneEditionCancel.draftId).then(() => {
                this.onClientPhoneEditionCancel(clientPhoneEditionCancel)
            })
        })

        this.socket.on('draft:client-phone-save', (clientPhoneSave) => {
            super.resetTimeout()
            super.saveDraft(clientPhoneSave.draftId).then(() => {
                this.onClientPhoneSave(clientPhoneSave)
            })
        })

        this.socket.on('draft:client-phone-update', (clientPhoneUpdate) => {
            super.resetTimeout()
            this.onClientPhoneUpdate(clientPhoneUpdate)
        })

        this.socket.on('draft:client-phone-remove', (clientPhoneRemove) => {
            this.onClientPhoneRemove(clientPhoneRemove)
        })

        this.socket.on('draft:client-custom-field-add', (clientCustomFieldAdd) => {
            this.onClientCustomFieldAdd(clientCustomFieldAdd)
        })

    }

    onClientSelect(clientSelect) {
        clientSelect.clientAddress = { inEdition: false }
        clientSelect.clientPhone = { inEdition: false }

        super.setDraftRedis(clientSelect, true).then(() => {
            this.controller.selectClient(clientSelect).then((client) => {
                this.server.io.in('draft/' + clientSelect.draftId).emit('draftClientAddressBack')
                this.server.io.in('draft/' + clientSelect.draftId).emit('draftClientSelect', client)
            }).catch(() => {
                console.log('catch do SELECT CLIENT - QUE É DENTRO DO ON CLIENT SELECT')
            })
        })
    }

    onClientReset(clientReset) {
        clientReset.clientAddress = { inEdition: true, clientAddressId: null }
        clientReset.clientPhone = { inEdition: true, clientPhoneId: null }
        super.setDraftRedis(clientReset).then(() => {
            console.log(clientReset)
            this.controller.resetClient(clientReset).then(() => {
                this.server.io.in('draft/' + clientReset.draftId).emit('draftClientReset')
            }).catch(() => {
                console.log('catch do RESET CLIENT - QUE É DENTRO DO ON CLIENT RESET')
            })
        })
    }

    onClientAddressAdd(clientAddressAdd) {
        clientAddressAdd.inEdition = { clientAddress: { inEdition: true, clientAddressId: null } }
        super.updateDraftRedis(clientAddressAdd, true).then(() => {
            this.server.io.in('draft/' + clientAddressAdd.draftId).emit('draftClientAddressAdd')
        })
    }

    onClientAddressEdit(clientAddressEdit) {
        clientAddressEdit.inEdition = { clientAddress: { inEdition: true, clientAddressId: clientAddressEdit.clientAddressId } }
        super.updateDraftRedis(clientAddressEdit, true).then(() => {
            this.server.io.in('draft/' + clientAddressEdit.draftId).emit('draftClientAddressEdit', clientAddressEdit.clientAddressId)
        })
    }

    onClientAddressBack(clientAddressBack) {
        clientAddressBack.clientAddressForm = true
        clientAddressBack.inEdition = { clientAddress: { inEdition: false, clientAddressId: null } }
        super.updateDraftRedis(clientAddressBack, true).then(() => {
            delete clientAddressBack.clientAddressForm
            this.controller.clientAddressBack(clientAddressBack).then(() => {
                this.server.io.in('draft/' + clientAddressBack.draftId).emit('draftClientAddressBack')
            })
        })
    }

    onClientAddressUpdate(clientAddressUpdate) {
        this.socket.broadcast.in('draft/' + clientAddressUpdate.draftId).emit('draftClientAddressUpdate', clientAddressUpdate.clientAddressForm)

        clientAddressUpdate.form = { clientAddressForm: clientAddressUpdate.clientAddressForm }
        clientAddressUpdate.form.clientAddressForm.id = (clientAddressUpdate.clientAddressId) ? clientAddressUpdate.clientAddressId : null
        delete clientAddressUpdate.clientAddressId

        clientAddressUpdate.clientAddressForm = true
        super.updateDraftRedis(clientAddressUpdate).then(() => {
            delete clientAddressUpdate.clientAddressForm
            super.setArrayDraft(clientAddressUpdate).then(() => {
                this.server.io.in('draft/' + clientAddressUpdate.draftId).emit('draftClientAddressSaveable')
                super.timerSocketUpdate(clientAddressUpdate.draftId)
            })
        }).catch(() => {
            console.log('catch do SET ARRAY DENTRO DO onClientAddressUpdate - chamado pelo SUPER')
        })

    }

    onClientAddressAddressSelect(addressSelect) {
        this.controller.selectAddressClientAddress(addressSelect).then((address) => {
            addressSelect.address = address
            addressSelect.inEdition = { clientAddress: { inEdition: true, clientAddressId: (addressSelect.clientAddressId) ? addressSelect.clientAddressId : null } }
            super.updateDraftRedis(addressSelect, false, true).then(() => {
                this.server.io.in('draft/' + addressSelect.draftId).emit('draftClientAddressAddressSelect', address)
            })
        }).catch(() => {
            console.log('catch do SELECT ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDDRESS SELECT')
        })
    }

    onClientAddressAddressReset(addressReset) {
        super.updateDraftRedis(addressReset, false, { reset: true }).then(() => {
            this.controller.resetAddressClientAddress(addressReset).then(() => {
                this.server.io.in('draft/' + addressReset.draftId).emit('draftClientAddressAddressReset')
            })
        }).catch(() => {
            console.log('catch do RESET ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDRESS RESET')
        })
    }

    onClientAddressSave(clientAddressSave) {
        this.controller.saveClientAddress(clientAddressSave).then((savedClientAddress) => {

            clientAddressSave.clientAddressForm = false
            clientAddressSave.clientPhoneForm = false
            clientAddressSave.inEdition = { clientAddress: { inEdition: false, clientAddressId: null } }
            super.updateDraftRedis(clientAddressSave).then(() => {
                this.server.io.in('draft/' + clientAddressSave.draftId).emit('draftClientAddressSave', savedClientAddress)
            })
        }).catch((err) => {
            console.log(err, 'catch do SAVE ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDRESS SAVE')
        })
    }

    onClientAddressRemove(clientAddressRemove) {
        this.controller.removeClientAddress(clientAddressRemove).then((removedClientAddress) => {
            if (removedClientAddress.form.client.clientAddresses.length < 1) {
                clientAddressRemove.inEdition = { clientAddress: { inEdition: true, clientAddressId: null } }
                super.updateDraftRedis(clientAddressRemove).then(() => {
                    this.server.io.in('draft/' + clientAddressRemove.draftId).emit('draftClientAddressAdd')
                })
            }
            this.server.io.in('draft/' + clientAddressRemove.draftId).emit('draftClientAddressRemove', removedClientAddress.clientAddressId)
        }).catch(() => {
            console.log('catch do REMOVE CLIENT ADDRESS - QUE É DENTRO DO ON ClientAddressRemove')
        })
    }

    onClientPhoneEdit(clientPhoneEdit) {
        clientPhoneEdit.inEdition = { clientPhone: { inEdition: true, clientPhoneId: clientPhoneEdit.clientPhoneId } }
        clientPhoneEdit.clientPhoneForm = { reset: true }

        super.updateDraftRedis(clientPhoneEdit, true).then(() => {
            this.server.io.in('draft/' + clientPhoneEdit.draftId).emit('draftClientPhoneEdit', clientPhoneEdit.clientPhoneId)
        })
    }

    onClientPhoneEditionCancel(clientPhoneEditionCancel) {
        clientPhoneEditionCancel.inEdition = { clientPhone: { inEdition: false, clientPhoneId: null } }
        clientPhoneEditionCancel.clientPhoneForm = { reset: true }
        super.updateDraftRedis(clientPhoneEditionCancel).then(() => {
            this.controller.phoneEditionCancel(clientPhoneEditionCancel).then(() => {
                this.server.io.in('draft/' + clientPhoneEditionCancel.draftId).emit('draftClientPhoneEditionCancel')
            })
        })
    }

    onClientPhoneSave(clientPhoneSave) {
        clientPhoneSave.inEdition = { clientPhone: { inEdition: false, clientPhoneId: null } }
        clientPhoneSave.clientPhoneForm = { reset: true }
        super.updateDraftRedis(clientPhoneSave).then(() => {
            this.controller.saveClientPhone(clientPhoneSave).then((savedClientPhone) => {
                this.server.io.in('draft/' + clientPhoneSave.draftId).emit('draftClientPhoneSave', savedClientPhone)
            }).catch((err) => {
                console.log(err, 'catch do SAVE PHONE CLIENT - QUE É DENTRO DO ON CLIENT PHONE ADDRESS SAVE')
            })
        })
    }

    onClientPhoneUpdate(clientPhoneUpdate) {
        this.socket.broadcast.in('draft/' + clientPhoneUpdate.draftId).emit('draftClientPhoneUpdate', clientPhoneUpdate.clientPhoneForm)

        clientPhoneUpdate.form = { clientPhoneForm: clientPhoneUpdate.clientPhoneForm }
        clientPhoneUpdate.form.clientPhoneForm.id = (clientPhoneUpdate.clientPhoneId) ? clientPhoneUpdate.clientPhoneId : null

        clientPhoneUpdate.inEdition = { clientPhone: { inEdition: true, clientPhoneId: (clientPhoneUpdate.clientPhoneId) ? clientPhoneUpdate.clientPhoneId : null } }

        delete clientPhoneUpdate.clientPhoneId

        super.updateDraftRedis(clientPhoneUpdate).then(() => {
            delete clientPhoneUpdate.clientPhoneForm
            super.setArrayDraft(clientPhoneUpdate).then(() => {
                this.server.io.in('draft/' + clientPhoneUpdate.draftId).emit('draftClientPhoneSaveable')
                super.timerSocketUpdate(clientPhoneUpdate.draftId)
            }).catch(() => {
                console.log('catch do SET ARRAY DENTRO DO onClientPhoneUpdate - chamado pelo SUPER')
            })
        })
    }

    onClientPhoneRemove(clientPhoneRemove) {
        super.consultRedisDraft(clientPhoneRemove.draftId).then((consultRedisDraft) => {
            consultRedisDraft = JSON.parse(consultRedisDraft.clientFormEdition)

            let addTabPhone = {}
            if (consultRedisDraft.clientPhone.inEdition && consultRedisDraft.clientPhone.clientPhoneId === clientPhoneRemove.clientPhoneId) {
                clientPhoneRemove.inEdition = { clientPhone: { inEdition: false, clientPhoneId: null } }
                clientPhoneRemove.clientPhoneForm = { reset: true }
                addTabPhone.active = true
            }

            super.updateDraftRedis(clientPhoneRemove).then(() => {
                this.controller.removeClientPhone(clientPhoneRemove).then((removedClientPhone) => {
                    this.server.io.in('draft/' + clientPhoneRemove.draftId).emit('draftClientPhoneRemove', removedClientPhone)
                    if (addTabPhone.active) this.server.io.in('draft/' + clientPhoneRemove.draftId).emit('draftClientPhoneEditionCancel')
                }).catch(() => {
                    console.log('catch do REMOVE CLIENT ADDRESS - QUE É DENTRO DO ON ClientPhoneRemove')
                })
            })
        })
    }

    onClientCustomFieldAdd(customFieldAdd) {
        customFieldAdd.clientCustomFieldForm = true
        customFieldAdd.user = this.socket.user
        super.updateDraftRedis(customFieldAdd).then(() => {
            this.controller.clientCustomFieldAdd(customFieldAdd).then((addedCustomField) => {
                this.server.io.in('draft/' + customFieldAdd.draftId).emit('draftClientCustomFieldAdd', addedCustomField.clientCustomField)
            })
        })
    }

    onClientCustomFieldUpdate(customFieldUpdate) {

        super.updateDraftRedis(customFieldUpdate).then(() => {
            super.setArrayDraft(customFieldUpdate).then(() => {
                //this.server.io.in('draft/' + customFieldUpdate.draftId).emit('draftClientAddressSaveable')
                super.timerSocketUpdate(customFieldUpdate.draftId)
            })
        })
    }

}