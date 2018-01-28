import { resolve } from 'url';

const Recoverance = require('./index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const shortid = require('shortid')

const requestsController = require('../../../controllers/requests.controller')
const draftsController = require('../../../controllers/drafts.controller')

const Controller = require('../../../models/Controller')

module.exports = class RequestRecoverance extends Recoverance {

    constructor(server) {
        super(server)

        this._requestId = null
        this._request = null

        this._createdBy = null
        this._recoverancedBy = null
        this._companyId = null
        
        this._clientId = null
        this._orderId = null
        this._taskId = null

        this._client = null
        this._order = null
        this._task = null

        this.requestsController = requestsController(this.server)
        this.draftsController = draftsController(this.server)

    }

    // this class should be responsible for converting a draft to respective model formats,
    // execute its saving operations through the use of controllers.
    // finally, respond with success or failure with its respective errors.

    setRequestId(requestId = null) {
        if (requestId) this._requestId = requestId;
    }

    setRequest(request = null) {
        if (request) this._request = request;
    }

    setCreatedBy(createdBy = null) {
        if (createdBy) this._createdBy = createdBy;
    }

    setRecoverancedBy(recoverancedBy = null) {
        if (recoverancedBy) this._recoverancedBy = recoverancedBy;
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

    setClientPhones(clientPhones = null){
        this._client = _.assign(this._client, {clientPhones: clientPhones})
    }

    setClientAddresses(clientAddresses = null){
        let updateClientAddresses = []
        if(this._client.clientAddresses){
            updateClientAddresses = this._client.clientAddresses.push(clientAddresses)
        }
        else {
            updateClientAddresses = clientAddresses
        }
        this._client = _.assign(this._client, {clientAddresses: clientAddresses})
    }

    setOrderId(orderId = null) {
        this._orderId = orderId;
    }
    
    setOrder(order = null) {
        this._order = order;
    }

    setTaskId(taskId = null) {
        this._taskId = taskId;
    }

    setTask(task = null) {
        this._task = task;
    }

    /**
     * Start request persistence from draft to definitive (MySQL)
     * @returns {Promise}
     */
    start() {
        const controller = new Controller({
            request: {
                id: this._requestId,
                companyId: this._companyId
            }
        })

        return this.requestsController.getOne(controller).then((request) => {
            if (!request) {
                throw new Error("Request não encontrado.");
            }

            this._request = JSON.parse(JSON.stringify(request))

            this.setCreatedBy(request.user)

            if (_.has(this._request, "client") && this._request.client) {
                this.setClient(this._request.client)
            }
            else{
                this.setClient({id: null, name: null, legalDocument: null, clientAddresses: [], clientPhones: []})

                if (_.has(this._request, "requestClientPhones")) {
                    let requestClientPhones = []
                    this._request.requestClientPhones.forEach((requestClientPhone) => {
                        requestClientPhones.push(requestClientPhone.clientPhone)
                    })
                    this.setClientPhones(requestClientPhones)
                }
                if (_.has(this._request, "requestClientAddresses")) {
                    let requestClientAddresses = []
                    this._request.requestClientAddresses.forEach((requestClientAddress) => {
                        requestClientAddresses.push(requestClientAddress.clientAddress)
                    })
                    this.setClientAddresses(requestClientAddresses)
                }
            }

            if (_.has(this._request, "order")) {
                this.setOrder(this._request.order)
            }
            else{
                this.setOrder({orderProducts: [{id: 'temp:' + shortid.generate()}] })
            }

            if (_.has(this._request, "task")) {
                this.setTask(this._request.task)
            }
            else{
                this.setTask({})
            }

            return this.createDraft()
        })
    }

    createDraft(){
        return new Promise((resolve, reject) => {
            const controller = new Controller({
                request: {
                    type: 'request',
                    createdBy: this._createdBy || null,
                    recoverancedBy: this._recoverancedBy || null,
                    companyId: this._companyId,
                    client: this._client,
                    order: this._order || null,
                    task: this._task || null,
                    recoverance: this._request
                }
            })

            return this.draftsController.createOne(controller).then((draft) => {
                console.log("Success creating (recoverance) draft")
                resolve(draft)             
            }).catch((err) => {
                console.log(err);
                reject() 
            })
        })
    }
    


}