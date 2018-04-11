import { resolve } from 'url';

const Persistance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const requestsController = require('../../../controllers/requests.controller')
const cardsController = require('../../../controllers/request-board-cards.controller')
const sectionsController = require('../../../controllers/request-board-sections.controller')

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

        this._clientAddresses = null
        this._clientPhones = null

        this._draft = null;
        this._client = null;
        this._transaction = null;

        this.requestsController = requestsController(this.server)
        this.cardsController = cardsController(this.server)
        this.sectionsController = sectionsController(this.server)

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

    setClient(client = null) {
        this._client = client;
    }

    setOrderId(orderId = null) {
        this._orderId = orderId;
    }

    setTaskId(taskId = null) {
        this._taskId = taskId;
    }

    setClientAddresses(clientAddresses = null) {
        if (clientAddresses) this._clientAddresses = clientAddresses;
    }

    setClientPhones(clientPhones = null) {
        if (clientPhones) this._clientPhones = clientPhones;
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

            if (this._draft.form.id) {
                this._requestId = parseInt(draft.form.id)
            }

            if(this._client){
                if(_.has(this._client, "clientAddresses")) {
                    this.setClientAddresses(this._client.clientAddresses)
                }
                if(_.has(this._client, "clientPhones")) {
                    this.setClientPhones(this._client.clientPhones)
                }
            }
            else {
                if(_.has(this._draft.form.client, "clientAddresses")) {
                    this.setClientAddresses(this.removeTempIds(this._draft.form, "clientAddresses"))
                }
                if(_.has(this._draft.form.client, "clientPhones")) {
                    this.setClientPhones(this.removeTempIds(this._draft.form, "clientPhones"))
                }
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

                    clientAddresses: this._clientAddresses || null,
                    clientPhones: this._clientPhones|| null,

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

                        const controller = new Controller({
                            request: {
                                id: request.id,
                                companyId: this._companyId
                            }
                        })

                        return this.requestsController.getOne(controller).then((request) => {
                            const consultSection  = new Controller({
                                request: {
                                    companyId: request.companyId
                                }
                            })
                            return this.sectionsController.consultSection(consultSection).then((section) => {
                                let maxCard = _.maxBy(section.cards, (card) => {
                                    return card.position
                                })
                                let maxCardPosition = 65535
                                if(maxCard) maxCardPosition += maxCard.position
                                const createData = {
                                    requestId: request.id,
                                    position: maxCardPosition,
                                    section: section.id
                                }
                                const createCard  = new Controller({
                                    request: {
                                        section: section,
                                        companyId: request.companyId,
                                        createdBy: request.userId,
                                        data: createData
                                    }
                                })
                                return this.cardsController.createOne(createCard).then((createdCard) => {
                                    const card = createdCard.toJSON()
                                    card.request = request
                                    section.cards.push(createdCard)
                                    section.save().then((section) => {
                                        resolve(request)
                                        this.server.io.sockets.emit('requestBoardCardCreate', {
                                            data: {
                                                card,
                                                section
                                            }
                                        })
                                    })
                                })
                            })
                        }).catch((err) => {
                            console.log(err)
                        })
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
    
    removeTempIds(form, key){
        _.map(form.client[key], (obj) => {
            if (_.has(obj, "id")) {
                const checkId = obj.id.toString().split(':')
                if (_.first(checkId) === 'temp') {
                    delete obj.id
                }
            }
            return obj
        })
        return form.client[key]
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