import { resolve } from 'url';

const Persistance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const ordersController = require('../../../controllers/orders.controller')

const Controller = require('../../../models/Controller')

module.exports = class OrderPersistance extends Persistance {

    constructor(server) {
        super(server)

        this._orderId = null;

        this._draftId = null;

        this._companyId = null
        
        this._client = null
        this._clientAddressId = null;
        this._clientPhoneId = null;

        this._saveInRequest = null;

        this._draft = null;
        this._transaction = null;

        this.ordersController = ordersController(this.server);

    }

    // this class should be responsible for converting a draft to respective model formats,
    // execute its saving operations through the use of controllers.
    // finally, respond with success or failure with its respective errors.

    
    setDraftId(draftId = null) {
        if (draftId) this._draftId = draftId;
    }

    setCompanyId(companyId = null) {
        if (companyId) this._companyId = companyId;
    }

    setSaveInRequest(saveInRequest = null) {
        if (saveInRequest) this._saveInRequest = saveInRequest;
    }

    setClient(client = null) {
        this._client = client;
    }

    setClientAddressId(clientAddressId = null) {
        if (clientAddressId) this._clientAddressId = clientAddressId;
    }

    setClientPhoneId(clientPhoneId = null) {
        if (clientPhoneId) this._clientPhoneId = clientPhoneId;
    }

    /**
     * Start order persistence from draft to definitive (MySQL)
     * @returns {Promise}
     */
    start(transactionRequest = null) {
        return super.getDraftById(this._draftId).then((draft) => {
            if (!draft) {
                throw new Error("Draft não encontrado.");
            }
            this._draft = draft;

            if (draft.form.order.id) {
                this._orderId = parseInt(draft.form.order.id)
            }

            if(this._saveInRequest) {
                this._draft.saveRequest = true
                this._transaction = transactionRequest

                return this.saveOrder()
            }
            else{
                return this.server.sequelize.transaction().then((transaction) => {
                    this._transaction = transaction; 
                    return this.saveOrder().then((order) => {
                        return order
                    }).catch((err) => {
                        console.log(err)
                        return false
                    })
                })
            }
            
            // return resolve(draft);
        })
    }

    saveOrder(){
        return new Promise((resolve, reject) => {
            if(this._client){
                if(_.has(this._client,'clientAddressId')) {
                    this.setClientAddressId(this._client.clientAddressId)
                }
                if(_.has(this._client,'clientPhoneId')) {
                    this.setClientPhoneId(this._client.clientPhoneId)
                }
            }
            const controller = new Controller({
                request: {
                    companyId: this._companyId,
                    clientAddressId: this._clientAddressId || null,
                    clientPhoneId: this._clientPhoneId || null,
                    data: this.mapDraftObjToModelObj(this._draft.form)
                },
                transaction: this._transaction
            })

            if (this._orderId) { // update order
                return this.ordersController.updateOne(controller).then((order) => {
                    if(this._draft.saveRequest){
                        resolve(order)
                    } 
                    else {
                        console.log("Success updating order");
                        this.commit().then(() => {
                            resolve(order)
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
            else { // create order
                return this.ordersController.createOne(controller).then((order) => {
                    if(this._draft.saveRequest){
                        resolve(order)
                    } 
                    else {
                        console.log("Success creating order");
                        this.commit().then(() => {
                            resolve(order)
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
        }).catch((err) => {
            console.log(err)
            this.rollback().then(() => {
                reject()
            }) 
        })
    }
    
    mapDraftObjToModelObj(form) {
        if(form.clientAddressId) this._clientAddressId = parseInt(form.clientAddressId)
        if(form.clientPhoneId) this._clientPhoneId = parseInt(form.clientPhoneId)

        if (_.has(form.order, "orderProducts") && form.order.orderProducts.length) {
            this.removeTempIds(form.order, "orderProducts")
        }
        
        return form.order
    }

    removeTempIds(order, key){
        _.map(order[key], (obj) => {
            if (_.has(obj, "id")) {
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

}