import { resolve } from 'dns';

const Persistance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const clientsController = require('../../../controllers/clients.controller')

const Controller = require('../../../models/Controller')

/**
 * this class should be responsible for converting a client in draft to a persitance data,
 * execute its saving operations through the use of controllers.
 * finally, respond with success or failure with its respective errors.
 * @type {RequestPersistance}
 */
module.exports = class RequestPersistance extends Persistance {

    constructor(server) {
        super(server);

        this._clientId = null;
        this._isNull = null
        this._companyId = null;
        this._draftId = null;

        this._draft = null;

        this._saveInRequest = null;

        this._transaction = null;

        this.clientsController = clientsController(this.server);

    }

    setDraftId(draftId = null) {
        if (draftId) this._draftId = draftId;
    }

    setCompanyId(companyId = null) {
        if (companyId) this._companyId = companyId;
    }

    setSaveInRequest(saveInRequest = null) {
        if (saveInRequest) this._saveInRequest = saveInRequest;
    }

    setTransaction(transaction = null) {
        if (transaction) this._transaction = transaction;
    }

    /**
     * Start client persistence from draft to definitive (MySQL)
     * @returns {Promise}
     */
    start(transactionRequest = null) {
        return super.getDraftById(this._draftId).then((draft) => {
            if (!draft) {
                throw new Error("Draft não encontrado.");
            }

            if(_.has(draft.data, "company")){
                if(_.has(draft.data.company, "clientGroups")){
                    _.assign(draft.form.client, {clientGroups: draft.data.company.clientGroups})
                }
            }

            if(!draft.form.client.isNull && !_.isEmpty(draft.form.client.name) || !_.isEmpty(draft.form.client.legalDocument)){
                this._draft = draft;

                if (draft.form.client.id) {
                    this._clientId = parseInt(draft.form.client.id)
                }
                else{
                    this._clientId = null
                }

                if(this._saveInRequest) {
                    this._draft.saveRequest = true
                    this._transaction = transactionRequest

                    return this.saveClient()
                }
                else {
                    return this.server.sequelize.transaction().then((transaction) => {
                        this._transaction = transaction; 
                        return this.saveClient().then((client) => {
                            return client
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
     * Save client (create or update)
     * @returns {Promise}
     */
    saveClient() {
        return new Promise ((resolve, reject) => {
            const controller = new Controller({
                request: {
                    companyId: this._companyId,
                    clientId: this._clientId || null,
                    isNull: this._isNull || null,
                    data: this.mapDraftObjToModelObj(this._draft.form)
                },
                transaction: this._transaction
            })    
            if (this._clientId) { // update client
                return this.clientsController.updateOne(controller).then((client) => {
                    if(this._draft.saveRequest){
                        resolve(client)
                    } 
                    else {
                    console.log("Success updating");
                        this.commit().then(() => {
                            resolve(client)
                        })
                    }                
                }).catch((err) => {
                    if(this._draft.saveRequest){
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
            else { // create client
                return this.clientsController.createOne(controller).then((client) => {
                    if(this._draft.saveRequest){
                        resolve(client)
                    } 
                    else {
                    console.log("Success creating");
                        this.commit().then(() => {
                            resolve(client)
                        })
                    }
                }).catch((err) => {
                    if(this._draft.saveRequest){
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
    
        if (_.has(form.client, "clientAddresses") && form.client.clientAddresses.length) {
            this.removeTempIds(form, "clientAddresses", "clientAddressId")
        }

        if (_.has(form.client, "clientPhones") && form.client.clientPhones.length) {
            this.removeTempIds(form, "clientPhones", "clientPhoneId")
        }

        if (_.has(form.client, "clientCustomFields") && form.client.clientCustomFields.length) {
            this.removeTempIds(form, "clientCustomFields")
        }

        if (_.has(form.client, "clientGroups") && form.client.clientGroups.length) {
            this.removeTempIds(form, "clientGroups", "client.clientGroupId", "clientGroupId")
            delete form.client.clientGroup
        }

        return form.client
    }

    removeTempIds(form, key, selectKey = null, deleteKey){
        _.map(form.client[key], (obj) => {
            if (_.has(obj, "id")) {
                if(selectKey && obj.id === _.get(form, selectKey) ){
                    obj.selected = true
                    if(deleteKey){
                        delete form.client[deleteKey]
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