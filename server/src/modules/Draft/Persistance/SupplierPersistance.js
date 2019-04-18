import { resolve } from 'dns';

const Persistance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const suppliersController = require('../../../controllers/suppliers.controller')

const Controller = require('../../../models/Controller')

/**
 * this class should be responsible for converting a supplier in draft to a persitance data,
 * execute its saving operations through the use of controllers.
 * finally, respond with success or failure with its respective errors.
 * @type {SupplierPersistance}
 */
module.exports = class SupplierPersistance extends Persistance {

    constructor(server) {
        super(server);

        this._supplierId = null;
        this._isNull = null
        this._companyId = null;
        this._draftId = null;

        this._draft = null;

        this._saveInExpense = null;

        this._transaction = null;

        this.suppliersController = suppliersController(this.server);

    }

    setDraftId(draftId = null) {
        if (draftId) this._draftId = draftId;
    }

    setCompanyId(companyId = null) {
        if (companyId) this._companyId = companyId;
    }

    setSaveInExpense(saveInExpense = null) {
        if (saveInExpense) this._saveInExpense = saveInExpense
    }

    setTransaction(transaction = null) {
        if (transaction) this._transaction = transaction;
    }

    /**
     * Start supplier persistence from draft to definitive (MySQL)
     * @returns {Promise}
     */
    start(transactionExpense = null) {
        return super.getDraftById(this._draftId).then((draft) => {
            if (!draft) {
                throw new Error("Draft não encontrado.");
            }

            if(!draft.form.supplier.isNull && !_.isEmpty(draft.form.supplier.name) || !_.isEmpty(draft.form.supplier.legalDocument)){
                this._draft = draft;

                if (draft.form.supplier.id) {
                    this._supplierId = parseInt(draft.form.supplier.id)
                }
                else{
                    this._supplierId = null
                }

                if(this._saveInExpense) {
                    this._draft.saveExpense = true
                    this._transaction = transactionExpense

                    return this.saveSupplier()
                }
                else {
                    return this.server.sequelize.transaction().then((transaction) => {
                        this._transaction = transaction; 
                        return this.saveSupplier().then((supplier) => {
                            return supplier
                        }).catch((err) => {
                            console.log(err)
                            return false
                        })
                    })
                }
            }
            else {
                return false
            }
            // return resolve(draft);
        })
    }

    /**
     * Save supplier (create or update)
     * @returns {Promise}
     */
    saveSupplier() {
        return new Promise ((resolve, reject) => {
            const controller = new Controller({
                request: {
                    companyId: this._companyId,
                    supplierId: this._supplierId || null,
                    isNull: this._isNull || null,
                    data: this.mapDraftObjToModelObj(this._draft.form)
                },
                transaction: this._transaction
            })
    
            if (this._supplierId) { // update supplier
                return this.suppliersController.updateOne(controller).then((supplier) => {
                    if(this._draft.saveExpense){
                        resolve(supplier)
                    } 
                    else {
                    console.log("Success updating");
                        this.commit().then(() => {
                            resolve(supplier)
                        })
                    }                
                }).catch((err) => {
                    if(this._draft.saveExpense){
                        reject()
                    } 
                    else {
                    console.log(err);
                        this.rollback().then(() => {
                            reject()
                        })
                    }                   
                });
            }
            else { // create supplier
                return this.suppliersController.createOne(controller).then((supplier) => {
                    if(this._draft.saveExpense){
                        resolve(supplier)
                    } 
                    else {
                    console.log("Success creating");
                        this.commit().then(() => {
                            resolve(supplier)
                        })
                    }
                }).catch((err) => {
                    if(this._draft.saveExpense){
                        reject()
                    } 
                    else {
                    console.log(err);
                        this.rollback().then(() => {
                            reject()
                        })
                    }  
                })
            }
        }).catch((err) => {
            console.log(err)
            this.rollback().then(() => {
                reject()
            }) 
        })       
    }

    mapDraftObjToModelObj(form) {
    
        if (_.has(form.supplier, "supplierAddresses") && form.supplier.supplierAddresses.length) {
            this.removeTempIds(form, "supplierAddresses", "supplierAddressId")
        }

        if (_.has(form.supplier, "supplierPhones") && form.supplier.supplierPhones.length) {
            this.removeTempIds(form, "supplierPhones", "supplierPhoneId")
        }

        if (_.has(form.supplier, "supplierCustomFields") && form.supplier.supplierCustomFields.length) {
            this.removeTempIds(form, "supplierCustomFields")
        }

        return form.supplier
    }

    removeTempIds(form, key, selectKey = null, deleteKey){
        _.map(form.supplier[key], (obj) => {
            if (_.has(obj, "id")) {
                if(selectKey && obj.id === _.get(form, selectKey) ){
                    obj.selected = true
                    if(deleteKey){
                        delete form.supplier[deleteKey]
                    }
                } 

                const checkId = obj.id.toString().split(':')
                if (_.first(checkId) === 'temp') {
                    delete obj.id
                }
            }
            return obj
        })
    }

    /**
     * Commit persistence
     */
    commit() {
        return new Promise((resolve, reject) => {
            console.log("Commit everything!");
            if (this._transaction) {
                this._transaction.commit()
                resolve()
            }
            else {
                reject()
            }
        })        
    }

    /**
     * Rollback persistence
     */
    rollback() {
        return new Promise((resolve, reject) => {
            console.log("Just... Rollback...");
            if (this._transaction) {
                this._transaction.rollback()
                resolve()
            }
            else {
                reject()
            }
        })  
    }

};