import { resolve } from 'url';

const Persistance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const requestsController = require('../../../controllers/requests.controller')

const Controller = require('../../../models/Controller')

module.exports = class RequestPersistance extends Persistance {

    constructor(server) {
        super(server)

        this._draftId = null
        this._requestId = null

        this._userId = null;
        this._companyId = null
        
        this._clientId = null
        this._orderId = null
        this._taskId = null

        this._draft = null;
        this._transaction = null;

        this.requestsController = requestsController(this.server);

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

    setClientId(clientId = null) {
        this._clientId = clientId;
    }

    setOrderId(orderId = null) {
        this._orderId = orderId;
    }

    setTaskId(taskId = null) {
        this._taskId = taskId;
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
            this._draft = draft

            if (draft.form.id) {
                this._requestId = parseInt(draft.form.id)
            }

            return this.saveRequest()
            // return resolve(draft);
        })
    }

    saveRequest(){
        return new Promise((resolve, reject) => {
            const controller = new Controller({
                request: {
                    userId: this._userId || null,
                    companyId: this._companyId,
                    clientId: this._clientId || null,
                    orderId: this._orderId || null,
                    taskId: this._taskId || null,

                    data: this.mapDraftObjToModelObj(this._draft.form)
                },
                transaction: this._transaction
            })

            if (this._requestId) { // update request
                return this.requestsController.updateOne(controller).then((request) => {
                    console.log("Success updating request");
                    this.commit().then(() => {
                        resolve(request)
                    })   
                }).catch((err) => {
                    console.log(err);
                    this.rollback().then(() => {
                        reject()
                    })  
                })
            }
            else { // create request
                return this.requestsController.createOne(controller).then((request) => {
                    console.log("Success creating request");
                    this.commit().then(() => {
                        resolve(request)
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
        return form
    }

    /*
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
    */

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