const Persistance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const ordersController = require('../../../controllers/orders.controller')

const Controller = require('../../../models/Controller')

/**
 * this class should be responsible for converting a order in draft to a persitance data,
 * execute its saving operations through the use of controllers.
 * finally, respond with success or failure with its respective errors.
 * @type {RequestPersistance}
 */
module.exports = class RequestPersistance extends Persistance {

    constructor(server) {
        super(server);

        this._userId = null;
        this._orderId = null;

        this._clientId = null;
        this._companyId = null;
        this._draftId = null;

        this._clientAddressId = null;
        this._clientPhoneId = null;

        this._draft = null;
        this._transaction = null;

        this.ordersController = ordersController(this.server);
    }

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
        if (clientId) this._clientId = clientId;
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
    start() {
        return super.getDraftById(this._draftId).then((draft) => {
            if (!draft) {
                throw new Error("Draft não encontrado.");
            }
            this._draft = draft;
            return this.server.sequelize.transaction().then((transaction) => {
                this._transaction = transaction;

                if (draft.form.order.id) {
                    this._orderId = parseInt(draft.form.order.id)
                }

                return this.saveOrder()
            })
        })
    }

    /**
     * Save order (create or update)
     * @returns {Promise}
     */
    saveOrder() {
        const controller = new Controller({
            request: {
                userId: this._userId || null,
                companyId: this._companyId,
                orderId: this._orderId || null,
                clientId: this._clientId || null,
                clientAddressId: this._clientAddressId || null,
                clientPhoneId: this._clientPhoneId || null,
                data: this.mapDraftObjToModelObj(this._draft.form)
            },
            transaction: this._transaction
        })

        if (this._orderId) { // update order
            return this.ordersController.updateOne(controller).then(() => {
                console.log("Success updating");
                this.commit();
            }).catch((err) => {
                console.log(err);
                this.rollback();
            });
        }
        else { // create order
            return this.ordersController.createOne(controller).then(() => {
                console.log("Success creating");
                this.commit();
            }).catch((err) => {
                console.log(err);
                this.rollback();
            });
        }
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