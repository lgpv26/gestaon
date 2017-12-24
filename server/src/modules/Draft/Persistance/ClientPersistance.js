const Persistance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const clientsController = require('../../../controllers/clients.controller')

const Controller = require('../../../models/Controller')

/**
 * this class should be responsible for converting a draft to respective model formats,
 * execute its saving operations through the use of controllers.
 * finally, respond with success or failure with its respective errors.
 * @type {RequestPersistance}
 */
module.exports = class RequestPersistance extends Persistance {

    constructor(server) {
        super(server);

        this._clientId = null;
        this._companyId = null;
        this._draftId = null;

        this._draft = null;
        this._transaction = null;

        this.clientsController = clientsController(this.server);
    }

    setDraftId(draftId = null) {
        if (draftId) this._draftId = draftId;
    }

    setCompanyId(companyId = null) {
        if (companyId) this._companyId = companyId;
    }

    /**
     * Start client persistence from draft to definitive (MySQL)
     * @returns {Promise}
     */
    start() {
        return super.getDraftById(this._draftId).then((draft) => {
            if (!draft) {
                throw new Error("Draft não encontrado.");
            }
            this._draft = draft;
            return this.server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction;
                if (draft.form.client.id) {
                    this._clientId = parseInt(draft.form.client.id)
                }
                return this.saveClient()
            })
            // return resolve(draft);
        })
    }

    /**
     * Save client (create or update)
     * @returns {Promise}
     */
    saveClient() {
        const controller = new Controller({
            request: {
                companyId: this._companyId,
                clientId: this._clientId || null,
                data: this.mapDraftObjToModelObj(this._draft.form.client)
            },
            transaction: this._transaction
        })

        if (this._clientId) { // update client
            return this.clientsController.updateOne(controller).then(() => {
                console.log("Success updating");
                this.commit();
            }).catch((err) => {
                console.log(err);
                this.rollback();
            });
        }
        else { // create client
            return this.clientsController.createOne(controller).then(() => {
                console.log("Success creating");
                this.commit();
            }).catch((err) => {
                console.log(err);
                this.rollback();
            });
        }
    }

    mapDraftObjToModelObj(client) {

        if (_.has(client, "clientAddresses") && client.clientAddresses.length) {
            this.removeTempIds(client, "clientAddresses")
        }

        if (_.has(client, "clientPhones") && client.clientPhones.length) {
            this.removeTempIds(client, "clientPhones")
        }

        if (_.has(client, "clientCustomFields") && client.clientCustomFields.length) {
            this.removeTempIds(client, "clientCustomFields")
        }
        
        return client
    }

    removeTempIds(client, key){
        _.map(client[key], (obj) => {
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
        console.log("Commit everything!");
        if (this._transaction) {
            this._transaction.commit();
        }
    }

    /**
     * Rollback persistence
     */
    rollback() {
        console.log("Just... Rollback...");
        if (this._transaction) {
            this._transaction.rollback();
        }
    }

};