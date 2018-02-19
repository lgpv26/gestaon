const Draft = require('.')
const basePath = require('../../middlewares/base-path.middleware')
const _ = require('lodash')
//const RequestPersistance = require('../../modules/Draft/Persistance/RequestPersistance')
//const ClientPersistance = require('../../modules/Draft/Persistance/ClientPersistance')

module.exports = class Expense extends Draft {

    constructor(server, channels, socket) {
        // extends
        super(server, channels, socket);
        // private
        // this._requestPersistance = new RequestPersistance(server);
        // functions
        this.setExpenseEventListeners();
    }

    /**
     * Events on Expense Listeners
     * 
     */
    setExpenseEventListeners() {

    this.socket.on('draft:expense-persist', (expensePersist) => {
        super.resetTimeout()
        super.saveDraft(supplierPersist.draftId).then(() => {
            this.onExpensePersist(supplierPersist)
        })
    })

    this.socket.on('draft:expense-recoverance', (supplierRecoverance) => {
        this.onExpenseRecoverance(supplierRecoverance)
    })
     
        ///////////////////////
        ///     SUPPLIER    ///
        ///////////////////////
    //
        this.socket.on('draft:supplier-select', (supplierSelect) => {
            super.resetTimeout()
            super.saveDraft(supplierSelect.draftId).then(() => {
                this.onSupplierSelect(supplierSelect)
            })
        })

        this.socket.on('draft:supplier-reset', (supplierReset) => {
            super.resetTimeout()
            super.saveDraft(supplierReset.draftId).then(() => {
                this.onSupplierReset(supplierReset)
            })
        })

            ///////////////////////
            ///    SUPPLIER     ///
            ///  ** address     ///
            ///////////////////////
        //
            this.socket.on('draft:supplier-address-add', (supplierAddressAdd) => {
                super.resetTimeout()
                super.saveDraft(supplierAddressAdd.draftId).then(() => {
                    this.onSupplierAddressAdd(supplierAddressAdd)
                })
            })

            this.socket.on('draft:supplier-address-edit', (supplierAddressEdit) => {
                super.resetTimeout()
                super.saveDraft(supplierAddressEdit.draftId).then(() => {
                    this.onSupplierAddressEdit(supplierAddressEdit)
                })
            })

            this.socket.on('draft:supplier-address-back', (supplierAddressBack) => {
                super.resetTimeout()
                super.saveDraft(supplierAddressBack.draftId).then(() => {
                    this.onSupplierAddressBack(supplierAddressBack)
                })
            })

            this.socket.on('draft:supplier-address-update', (supplierAddressUpdate) => {
                super.resetTimeout()
                this.onSupplierAddressUpdate(supplierAddressUpdate)
            })

            this.socket.on('draft:supplier-address-save', (supplierAddressSave) => {
                super.resetTimeout()
                super.saveDraft(supplierAddressSave.draftId).then(() => {
                    this.onSupplierAddressSave(supplierAddressSave)
                })
            })

            this.socket.on('draft:supplier-address-remove', (supplierAddressRemove) => {
                this.onSupplierAddressRemove(supplierAddressRemove)
            })

                ///////////////////////////////
                //SUPPLIER ADDRESS => ADDRESS  //
                ///////////////////////////////
            //
                this.socket.on('draft:supplier-address-address-select', (supllierAddressAddressSelect) => {
                    super.resetTimeout()
                    super.saveDraft(supllierAddressAddressSelect.draftId).then(() => {
                        this.onSupplierAddressAddressSelect(supllierAddressAddressSelect)
                    })
                })

                this.socket.on('draft:supplier-address-address-reset', (supplierAddressAddressReset) => {
                    super.resetTimeout()
                    super.saveDraft(supplierAddressAddressReset.draftId).then(() => {
                        this.onSupplierAddressAddressReset(supplierAddressAddressReset)
                    })
                })
            //
        // <-- end SUPPLIER ** address | setSocketRequestListeners

            //////////////////////
            ///   SUPPLIER     ///
            ///  ** phone      ///
            //////////////////////
        //
            this.socket.on('draft:supplier-phone-edit', (supplierPhoneEdit) => {
                this.onSupplierPhoneEdit(supplierPhoneEdit)
            })

            this.socket.on('draft:supplier-phone-edition-cancel', (supplierPhoneEditionCancel) => {
                super.resetTimeout()
                super.saveDraft(supplierPhoneEditionCancel.draftId).then(() => {
                    this.onSupplierPhoneEditionCancel(supplierPhoneEditionCancel)
                })
            })

            this.socket.on('draft:supplier-phone-save', (supplierPhoneSave) => {
                super.resetTimeout()
                super.saveDraft(supplierPhoneSave.draftId).then(() => {
                    this.onSupplierPhoneSave(supplierPhoneSave)
                })
            })

            this.socket.on('draft:supplier-phone-update', (supplierPhoneUpdate) => {
                super.resetTimeout()
                this.onSupplierPhoneUpdate(supplierPhoneUpdate)
            })

            this.socket.on('draft:supplier-phone-remove', (supplierPhoneRemove) => {
                this.onSupplierPhoneRemove(supplierPhoneRemove)
            })
        // <-- end SUPPLIER ** phone | setSocketRequestListeners

            /////////////////////////
            ///    SUPPLIER       ///
            /// ** custom-field   ///
            /////////////////////////
        //
            this.socket.on('draft:supplier-custom-field-add', (supplierCustomFieldAdd) => {
                super.saveDraft(supplierCustomFieldAdd.draftId).then(() => {
                    this.onSupplierCustomFieldAdd(supplierCustomFieldAdd)
                })
            })

            this.socket.on('draft:supplier-custom-field-update', (supplierCustomFieldUpdate) => {
                super.resetTimeout()
                this.onSupplierCustomFieldUpdate(supplierCustomFieldUpdate)
            })

            this.socket.on('draft:supplier-custom-field-remove', (supplierCustomFieldRemove) => {
                super.saveDraft(supplierCustomFieldRemove.draftId).then(() => {
                    this.onSupplierCustomFieldRemove(supplierCustomFieldRemove)
                })
            })
        // <-- end SUPPLIER ** custom-field  | setSocketRequestListeners

             ///////////////////////
            ///  CUSTOM FIELD   ///
            /// ** in company   ///
            ///////////////////////
        //
        this.socket.on('draft:custom-field-save', (customFieldSave) => {
            super.saveDraft(customFieldSave.draftId).then(() => {
                this.onDraftCustomFieldSave(customFieldSave)
            })
        })

        this.socket.on('draft:custom-field-remove', (customFieldRemove) => {
            super.saveDraft(customFieldRemove.draftId).then(() => {
                this.onDraftCustomFieldRemove(customFieldRemove)
            })
        })

    }
    // <-- end SUPPLIER | setSocketExpenseListeners


    /**
     * Expense Persist
     * @desc Send to all sockets in Draft/:id the persist expense event
     *
     * @param {object} expensePersist - expected: draftId
     * @return {} @property {Socket}
     */
    onExpensePersist(expensePersist) {
        let companyId;
        if(this.socket.user.activeCompanyUserId){
            companyId = parseInt(this.socket.user.activeCompanyUserId);
        }
        else {
            if(this.socket.user.companies.length) companyId = _.first(this.socket.user.companies)
        }
        if(companyId){
           
        }
    }

    /**
     * Expense Recoverance
     * @desc Send to all sockets in Draft/:id the recoverance event
     *
     * @param {object} expenseRecoverance - expected: expenseId, companyId
     * @return {object} *Draft @property {Socket}
     */
    onExpenseRecoverance(expenseRecoverance) {
    
    }

    ///////////////////////
    ///     SUPPLIER    ///
    ///////////////////////
//
    /** 
     * Supplier Select
     * @desc Send to all sockets in Draft/:id the select supplier event
     * 
     * @param {object} supplierSelect - expected: draftId, supplierId
     * @return {object} Supplier @property {Socket}
     */
    onSupplierSelect(supplierSelect) {
        supplierSelect.supplierAddress = { inEdition: false }
        supplierSelect.supplierPhone = { inEdition: false }

        super.setDraftRedis(supplierSelect, true).then(() => {
            this.controller.selectSupplier(supplierSelect).then((supplier) => {
                this.server.io.in('draft/' + supplierSelect.draftId).emit('draftSupplierAddressBack')
                this.server.io.in('draft/' + supplierSelect.draftId).emit('draftSupplierSelect', supplier)
            }).catch(() => {
                console.log('catch do SELECT SUPPLIER - QUE É DENTRO DO ON SUPPLIER SELECT')
            })
        })
    }

    /** 
     * Supplier Reset
     * @desc Send to all sockets in Draft/:id the reset supplier event
     * 
     * @param {object} supplierReset - expected: draftId
     * @return {} @property {Socket}
     */
    onSupplierReset(supplierReset) {
        supplierReset.supplierAddress = { inEdition: true, supplierAddressId: null }
        supplierReset.supplierPhone = { inEdition: true, supplierPhoneId: null }
        
        super.setDraftRedis(supplierReset).then(() => {
            this.controller.resetSupplier(supplierReset).then(() => {
                this.server.io.in('draft/' + supplierReset.draftId).emit('draftSupplierAddressAdd')
                //this.server.io.in('draft/' + supplierReset.draftId).emit('draftSupplierAddressAddressReset')
                this.server.io.in('draft/' + supplierReset.draftId).emit('draftSupplierPhoneEditionCancel')
                this.server.io.in('draft/' + supplierReset.draftId).emit('draftSupplierReset')
            }).catch(() => {
                console.log('catch do RESET SUPPLIER - QUE É DENTRO DO ON SUPPLIER RESET')
            })
        })
    }

        ///////////////////////
        ///     CLIENT      ///
        ///  ** address     ///
        ///////////////////////
    //
        /**
         * Supplier Address Add
         * @desc Send to all sockets in Draft/:id the add form event
         * 
         * @param {object} supplierAddressAdd - expected: draftId
         * @return {} @property {Socket}
         */
        onSupplierAddressAdd(supplierAddressAdd) {
            supplierAddressAdd.inEdition = { supplierAddress: { inEdition: true, supplierAddressId: null } }
            super.updateDraftRedis(supplierAddressAdd, true).then(() => {
                this.server.io.in('draft/' + supplierAddressAdd.draftId).emit('draftSupplierAddressAdd')
            })
        }

        /**
         * Supplier Address Edit
         * @desc Send to all sockets in Draft/:id the edit form event
         * 
         * @param {object} supplierAddressEdit - expected: draftId, supplierAddressId
         * @return {int} SupplierAddress @property {Socket}
         */
        onSupplierAddressEdit(supplierAddressEdit) {
            supplierAddressEdit.inEdition = { supplierAddress: { inEdition: true, supplierAddressId: supplierAddressEdit.supplierAddressId } }
            super.updateDraftRedis(supplierAddressEdit, true).then(() => {
                this.controller.supplierAddressEdit(supplierAddressEdit).then(() => {
                    this.server.io.in('draft/' + supplierAddressEdit.draftId).emit('draftSupplierAddressEdit', supplierAddressEdit.supplierAddressId)
                })
            })
        }

        /**
         * Supplier Address Back
         * @desc Send to all sockets in Draft/:id the back 'main' form event
         * 
         * @param {object} supplierAddressBack - expected: draftId, supplierAddressId
         * @return {} @property {Socket}
         */
        onSupplierAddressBack(supplierAddressBack) {
            supplierAddressBack.supplierAddressForm = true
            supplierAddressBack.inEdition = { supplierAddress: { inEdition: false, supplierAddressId: null } }
            super.updateDraftRedis(supplierAddressBack, true).then(() => {
                delete supplierAddressBack.supplierAddressForm
                this.controller.supplierAddressBack(supplierAddressBack).then(() => {
                    this.server.io.in('draft/' + supplierAddressBack.draftId).emit('draftSupplierAddressBack')
                })
            })
        }

        /**
         * Supplier Address Update
         * @desc Send to all sockets in Draft/:id the updating data in supplier address form
         * 
         * @param {object} supplierAddressUpdate - expected: draftId, supplierAddressForm, ? supplierAddressId
         * @return {} @property {Socket}
         */
        onSupplierAddressUpdate(supplierAddressUpdate) {
            this.socket.broadcast.in('draft/' + supplierAddressUpdate.draftId).emit('draftSupplierAddressUpdate', supplierAddressUpdate.supplierAddressForm)

            supplierAddressUpdate.form = { supplierAddressForm: supplierAddressUpdate.supplierAddressForm }
            supplierAddressUpdate.form.supplierAddressForm.id = (supplierAddressUpdate.supplierAddressId) ? supplierAddressUpdate.supplierAddressId : null
            delete supplierAddressUpdate.supplierAddressId

            //supplierAddressUpdate.supplierAddressForm = true
            super.updateDraftRedis(supplierAddressUpdate).then(() => {
                delete supplierAddressUpdate.supplierAddressForm
                super.setArrayDraft(supplierAddressUpdate).then(() => {
                    this.server.io.in('draft/' + supplierAddressUpdate.draftId).emit('draftSupplierAddressSaveable')
                    super.timerSocketUpdate(supplierAddressUpdate.draftId)
                })
            }).catch(() => {
                console.log('catch do SET ARRAY DENTRO DO onSupplierAddressUpdate - chamado pelo SUPER')
            })
        }

        /**
         * Supplier Address Save
         * @desc Send to all sockets in Draft/:id the supplier address saved
         * 
         * @param {object} addressSave - expected: draftId
         * @return {object} supplier address @property {Socket}
         */
        onSupplierAddressSave(supplierAddressSave) {
            this.controller.saveSupplierAddress(supplierAddressSave).then((savedSupplierAddress) => {

                supplierAddressSave.supplierAddressForm = false
                supplierAddressSave.supplierPhoneForm = false
                supplierAddressSave.inEdition = { supplierAddress: { inEdition: false, supplierAddressId: null } }
                super.updateDraftRedis(supplierAddressSave).then(() => {
                    this.server.io.in('draft/' + supplierAddressSave.draftId).emit('draftSupplierAddressSave', savedSupplierAddress)
                })
            }).catch((err) => {
                console.log(err, 'catch do SAVE ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDRESS SAVE')
            })
        }

        /**
         * Supplier Address Remove
         * @desc Send to all sockets in Draft/:id the address saved
         * 
         * @param {object} supplierAddressRemove - expected: draftId, supplierAddressId
         * @return {int} supplier address Id  @property {Socket}
         */
        onSupplierAddressRemove(supplierAddressRemove) {
            this.controller.removeSupplierAddress(supplierAddressRemove).then((removedSupplierAddress) => {
                if (removedSupplierAddress.form.supplier.supplierAddresses.length < 1) {
                    supplierAddressRemove.inEdition = { supplierAddress: { inEdition: true, supplierAddressId: null } }
                    super.updateDraftRedis(supplierAddressRemove).then(() => {
                        this.server.io.in('draft/' + supplierAddressRemove.draftId).emit('draftSupplierAddressAdd')
                    })
                }
                this.server.io.in('draft/' + supplierAddressRemove.draftId).emit('draftSupplierAddressRemove', removedSupplierAddress.supplierAddressId)
            }).catch(() => {
                console.log('catch do REMOVE CLIENT ADDRESS - QUE É DENTRO DO ON SupplierAddressRemove')
            })
        }

        ///////////////////////////////
        //CLIENT ADDRESS => ADDRESS  //
        ///////////////////////////////
        //
            /**
             * Address Select
             * @desc Send to all sockets in Draft/:id that an address has been selected
             * 
             * @param {object} addressSelect - expected: draftId, addressId
             * @return {object} address @property {Socket}
             */
            onSupplierAddressAddressSelect(addressSelect) {
                this.controller.selectAddressSupplierAddress(addressSelect).then((address) => {
                    addressSelect.address = address
                    addressSelect.inEdition = { supplierAddress: { inEdition: true, supplierAddressId: (addressSelect.supplierAddressId) ? addressSelect.supplierAddressId : null } }
                    super.updateDraftRedis(addressSelect, false, true).then(() => {
                        this.server.io.in('draft/' + addressSelect.draftId).emit('draftSupplierAddressAddressSelect', address)
                    })
                }).catch(() => {
                    console.log('catch do SELECT ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDDRESS SELECT')
                })
            }

            /**
             * Address Reset
             * @desc Send to all sockets in Draft/:id that an address has been reset
             * 
             * @param {object} addressReset - expected: draftId
             * @return {} @property {Socket}
             */
            onSupplierAddressAddressReset(addressReset) {
                super.updateDraftRedis(addressReset, false, { reset: true }).then(() => {
                    this.controller.resetAddressSupplierAddress(addressReset).then(() => {
                        this.server.io.in('draft/' + addressReset.draftId).emit('draftSupplierAddressAddressReset')
                    })
                }).catch(() => {
                    console.log('catch do RESET ADDRESS CLIENT - QUE É DENTRO DO ON CLIENT ADDRESS ADDRESS RESET')
                })
            }
        //
    // <-- end CLIENT ** address
        ///////////////////////
        ///     CLIENT      ///
        ///  ** phone       ///
        ///////////////////////
    //    
        /** 
         * Supplier Phone Edit
         * @desc Send to all sockets in Draft/:id the supplier phone edit event
         * 
         * @param {object} supplierPhoneEdit - expected: draftId, supplierPhoneId
         * @return {int} supplier phone id @property {Socket}
         */
        onSupplierPhoneEdit(supplierPhoneEdit) {
            supplierPhoneEdit.inEdition = { supplierPhone: { inEdition: true, supplierPhoneId: supplierPhoneEdit.supplierPhoneId } }
            supplierPhoneEdit.supplierPhoneForm = { reset: true }

            super.updateDraftRedis(supplierPhoneEdit, true).then(() => {
                this.server.io.in('draft/' + supplierPhoneEdit.draftId).emit('draftSupplierPhoneEdit', supplierPhoneEdit.supplierPhoneId)
            })
        }

        /** 
         * Supplier Phone Edition Cancel
         * @desc Send to all sockets in Draft/:id the supplier phone cancel event
         * 
         * @param {object} supplierPhoneEditionCancel - expected: draftId
         * @return {} @property {Socket}
         */
        onSupplierPhoneEditionCancel(supplierPhoneEditionCancel) {
            supplierPhoneEditionCancel.inEdition = { supplierPhone: { inEdition: false, supplierPhoneId: null } }
            supplierPhoneEditionCancel.supplierPhoneForm = { reset: true }
            super.updateDraftRedis(supplierPhoneEditionCancel).then(() => {
                this.controller.phoneEditionCancel(supplierPhoneEditionCancel).then(() => {
                    this.server.io.in('draft/' + supplierPhoneEditionCancel.draftId).emit('draftSupplierPhoneEditionCancel')
                })
            })
        }

        /** 
         * Supplier Phone Save
         * @desc Send to all sockets in Draft/:id the supplier phone save event
         * 
         * @param {object} supplierPhoneSave - expected: draftId, supplierPhoneId
         * @return {object} supplier phone  @property {Socket}
         */
        onSupplierPhoneSave(supplierPhoneSave) {
            supplierPhoneSave.inEdition = { supplierPhone: { inEdition: false, supplierPhoneId: null } }
            supplierPhoneSave.supplierPhoneForm = { reset: true }
            super.updateDraftRedis(supplierPhoneSave).then(() => {
                this.controller.saveSupplierPhone(supplierPhoneSave).then((savedSupplierPhone) => {
                    this.server.io.in('draft/' + supplierPhoneSave.draftId).emit('draftSupplierPhoneSave', savedSupplierPhone)
                }).catch((err) => {
                    console.log(err, 'catch do SAVE PHONE CLIENT - QUE É DENTRO DO ON CLIENT PHONE ADDRESS SAVE')
                })
            })
        }

        /** 
         * Supplier Phone Update
         * @desc Send to all sockets in Draft/:id the supplier phone updating event
         * 
         * @param {object} supplierPhoneUpdate - expected: draftId, supplierPhoneId, supplierPhoneForm
         * @return {} @property {Socket}
         */
        onSupplierPhoneUpdate(supplierPhoneUpdate) {
            this.socket.broadcast.in('draft/' + supplierPhoneUpdate.draftId).emit('draftSupplierPhoneUpdate', supplierPhoneUpdate.supplierPhoneForm)

            supplierPhoneUpdate.form = { supplierPhoneForm: supplierPhoneUpdate.supplierPhoneForm }
            supplierPhoneUpdate.form.supplierPhoneForm.id = (supplierPhoneUpdate.supplierPhoneId) ? supplierPhoneUpdate.supplierPhoneId : null

            supplierPhoneUpdate.inEdition = { supplierPhone: { inEdition: true, supplierPhoneId: (supplierPhoneUpdate.supplierPhoneId) ? supplierPhoneUpdate.supplierPhoneId : null } }

            delete supplierPhoneUpdate.supplierPhoneId

            super.updateDraftRedis(supplierPhoneUpdate).then(() => {
                delete supplierPhoneUpdate.supplierPhoneForm
                super.setArrayDraft(supplierPhoneUpdate).then(() => {
                    this.server.io.in('draft/' + supplierPhoneUpdate.draftId).emit('draftSupplierPhoneSaveable')
                    super.timerSocketUpdate(supplierPhoneUpdate.draftId)
                }).catch(() => {
                    console.log('catch do SET ARRAY DENTRO DO onSupplierPhoneUpdate - chamado pelo SUPER')
                })
            })
        }

        /** 
         * Supplier Phone Remove
         * @desc Send to all sockets in Draft/:id the supplier phone remove event
         * 
         * @param {object} supplierPhoneRemove - expected: draftId, supplierPhoneId
         * @return {int} supplier phone id @property {Socket}
         */
        onSupplierPhoneRemove(supplierPhoneRemove) {
            super.consultRedisDraft(supplierPhoneRemove.draftId).then((consultRedisDraft) => {
                consultRedisDraft = JSON.parse(consultRedisDraft.supplierFormEdition)

                let addTabPhone = {}
                if (consultRedisDraft.supplierPhone.inEdition && consultRedisDraft.supplierPhone.supplierPhoneId === supplierPhoneRemove.supplierPhoneId) {
                    supplierPhoneRemove.inEdition = { supplierPhone: { inEdition: false, supplierPhoneId: null } }
                    supplierPhoneRemove.supplierPhoneForm = { reset: true }
                    addTabPhone.active = true
                }

                super.updateDraftRedis(supplierPhoneRemove).then(() => {
                    this.controller.removeSupplierPhone(supplierPhoneRemove).then((removedSupplierPhone) => {
                        this.server.io.in('draft/' + supplierPhoneRemove.draftId).emit('draftSupplierPhoneRemove', removedSupplierPhone)
                        if (addTabPhone.active) this.server.io.in('draft/' + supplierPhoneRemove.draftId).emit('draftSupplierPhoneEditionCancel')
                    }).catch(() => {
                        console.log('catch do REMOVE CLIENT ADDRESS - QUE É DENTRO DO ON SupplierPhoneRemove')
                    })
                })
            })
        }
    // <-- end CLIENT ** phone

        ///////////////////////
        ///     CLIENT      ///
        /// ** customField  ///
        ///////////////////////
    // 
        /** 
         * Supplier Custom Field Add
         * @desc Send to all sockets in Draft/:id the supplier custom field add event
         * 
         * @param {object} customFieldAdd - expected: draftId, customFieldId, ? supplierId 
         * @return {int} supplier custom id @property {Socket}
         */
        onSupplierCustomFieldAdd(customFieldAdd) {
            customFieldAdd.user = this.socket.user
            this.controller.supplierCustomFieldAdd(customFieldAdd).then((addedCustomField) => {
                this.server.io.in('draft/' + customFieldAdd.draftId).emit('draftSupplierCustomFieldAdd', addedCustomField.supplierCustomField)
            })
        }

        /** 
         * Supplier Custom Field Update
         * @desc Send to all sockets in Draft/:id the supplier custom field update event
         * 
         * @param {object} customFieldUpdate - expected: draftId, customFieldId, supplierCustomFieldForm
         * @return {} @property {Socket}
         */
        onSupplierCustomFieldUpdate(customFieldUpdate) {
            this.setArrayDraftSupplierCustomField(customFieldUpdate).then((supplierCustomField) => {
                /* super.updateDraftRedis(customFieldUpdate, true).then(() => { */
                this.socket.broadcast.in('draft/' + customFieldUpdate.draftId).emit('draftSupplierCustomFieldUpdate', supplierCustomField)
                    super.timerSocketUpdate(customFieldUpdate.draftId)
                /* })*/
            })
        }

        /** 
         * Supplier Custom Field Remove
         * @desc Send to all sockets in Draft/:id the supplier custom field remove event
         * 
         * @param {object} supplierCustomFieldRemove - expected: draftId, customFieldId
         * @return {int} supplier custom field id @property {Socket}
         */
        onSupplierCustomFieldRemove(supplierCustomFieldRemove) {
            this.controller.supplierCustomFieldRemove(supplierCustomFieldRemove).then((customFieldReturn) => {
                this.server.io.in('draft/' + supplierCustomFieldRemove.draftId).emit('draftSupplierCustomFieldRemove', customFieldReturn.supplierCustomFieldId)
            })
        }
    
        ////////////////////////////////////
        //CUSTOM FIELD => SET PERSISTENCE //
        ////////////////////////////////////
        //
            /** 
             * Set Array Draft Supplier Custom Field
             * @desc Prepares the custom field update to persist in server memory
             * 
             * @param {object} supplierCustomField - expected: draftId, customFieldId, supplierCustomFieldForm
             * @return {object} supplierCustomFieldId, supplierCustomFieldForm @property {Promise}
             */
            setArrayDraftSupplierCustomField(supplierCustomField) {
                return new Promise((resolve, reject) => {
                    return this.controller.getOne(supplierCustomField.draftId).then((draft) => {
                        const draftUpdateMemory = _.find(this.channels.updates.drafts, { draftId: supplierCustomField.draftId })

                        const indexSupplierCustomField = _.findIndex(draft.form.supplier.supplierCustomFields, (customField) => { return customField.id === supplierCustomField.supplierCustomFieldId })
                        draft.form.supplier.supplierCustomFields[indexSupplierCustomField] = _.assign(draft.form.supplier.supplierCustomFields[indexSupplierCustomField], { value: _.toUpper(supplierCustomField.supplierCustomFieldForm.value) })

                        if (draftUpdateMemory) {
                            const draftUpdateIndex = this.channels.updates.drafts.indexOf(draftUpdateMemory)
                            this.channels.updates.drafts[draftUpdateIndex] = _.assign(this.channels.updates.drafts[draftUpdateIndex], draft)
                            resolve({ supplierCustomFieldId: supplierCustomField.supplierCustomFieldId, supplierCustomFieldForm: supplierCustomField.supplierCustomFieldForm })
                        }
                        else {
                            this.channels.updates.drafts.push(draft)
                            resolve({ supplierCustomFieldId: supplierCustomField.supplierCustomFieldId, supplierCustomFieldForm: supplierCustomField.supplierCustomFieldForm })
                        }
                    })
                })
            }
        // <-- end CUSTOM FIELD => SET PERSISTENCE

    // <-- end CLIENT ** customField

        ///////////////////////
        ///  CUSTOM FIELD   ///
        /// ** in company   ///
        ///////////////////////
    // 
        /** 
         * Custom Field Save
         * @desc Send to all sockets in Draft/:id the custom field save (create or update) event
         * 
         * @param {object} customFieldSave - expected: draftId, name, ? customFieldId 
         * @return {object} custom field @property {Socket}
         */
        onDraftCustomFieldSave(customFieldSave) {
            customFieldSave.user = this.socket.user
            this.controller.customFieldChange(customFieldSave).then((savedCustomField) => {
                this.server.io.in('draft/' + customFieldSave.draftId).emit('draftCustomFieldSave', savedCustomField.customFieldReturn)
            })
        }

        /** 
         * Custom Field Remove
         * @desc Send to all sockets in Draft/:id the custom field remove event
         * 
         * @param {object} customFieldRemove - expected: draftId, customFieldId 
         * @return {int} custom field id @property {Socket}
         */
        onDraftCustomFieldRemove(customFieldRemove) {
            customFieldRemove.user = this.socket.user
            customFieldRemove.remove = true
            this.controller.customFieldChange(customFieldRemove).then((removedCustomField) => {
                this.server.io.in('draft/' + customFieldRemove.draftId).emit('draftCustomFieldRemove', removedCustomField.customField.id)
            })
        }

    //<-- end CUSTOM FIELD ** in company


//  <-- end Supplier
 

}