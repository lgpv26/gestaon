import { resolve } from 'url';

const Persistance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const ClientPersistance = require('../../../modules/Draft/Persistance/ClientPersistance');

const ordersController = require('../../../controllers/orders.controller')

const Controller = require('../../../models/Controller')

module.exports = class RequestPersistance extends Persistance {

    constructor(server) {
        super(server)

        this._userId = null;
        this._orderId = null;

        this._companyId = null;
        this._draftId = null;
        this._client = null
        
        this._clientId = null;
        this._clientAddressId = null;
        this._clientPhoneId = null;

        this._draft = null;
        this._transaction = null;

        this._clientPersistance = new ClientPersistance(server);

        this.ordersController = ordersController(this.server);

    }

    // this class should be responsible for converting a draft to respective model formats,
    // execute its saving operations through the use of controllers.
    // finally, respond with success or failure with its respective errors.

    
    setDraftId(draftId = null) {
        if (draftId) this._draftId = draftId;
    }

    setUserId(userId = null) {
        if (userId) this._userId = userId;
    }

    setCompanyId(companyId = null) {
        if (companyId) this._companyId = companyId;
    }

    setClient(client = null) {
        if (client) this._client = client;
    }

    setClientId(clientId = null) {
        if (clientId) this._clientId = clientId;
    }

    setClientAddressId(clientAddressId = null) {
        if (clientAddressId) this._clientAddressId = clientAddressId;
    }

    setClientPhoneId(clientPhoneId = null) {
        if (clientPhoneId) this._clientPhoneId = clientPhoneId;
    }

    setTransaction() {
        return new Promise((resolve,reject) => {
            return this.server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction
                resolve(transaction)
            })
        })  
    }


    /**
     * Start request persistence from draft to definitive (MySQL)
     * @returns {Promise}
     */
    start() {
        return super.getDraftById(this._draftId).then((draft) => {
            if (!draft) {
                throw new Error("Draft não encontrado.");
            }
            this._draft = draft;

            return this.saveRequest()
            // return resolve(draft);
        })
    }

    saveRequest(){
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
                    userId: this._userId || null,
                    companyId: this._companyId,
                    clientId: this._clientId || null,
                    clientAddressId: this._clientAddressId || null,
                    clientPhoneId: this._clientPhoneId || null,
                    data: this.mapDraftObjToModelObj(this._draft.form)
                },
                transaction: this._transaction
            })

            if (this._orderId) { // update order
                return this.ordersController.updateOne(controller).then((order) => {
                    console.log("Success updating request");
                    this.commit().then(() => {
                        resolve(order)
                    })   
                }).catch((err) => {
                    console.log(err);
                    this.rollback().then(() => {
                        reject()
                    })  
                })
            }
            else { // create order
                return this.ordersController.createOne(controller).then((order) => {
                    console.log("Success creating request");
                    this.commit().then(() => {
                        resolve(order)
                    })                
                }).catch((err) => {
                    console.log(err);
                    this.rollback().then(() => {
                        reject()
                    })   
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
                this._transaction.commit();
            }
            resolve()
        })
    }

    /**
     * Rollback persistence
     */
    rollback() {
        return new Promise((resolve, reject) => {
            console.log("Just... Rollback...");
            if (this._transaction) {
                this._transaction.rollback();
            }
            resolve()
        })
    }

}