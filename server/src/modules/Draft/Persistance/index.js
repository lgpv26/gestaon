import { resolve } from 'dns';

const Drafts = require('../../../events/Draft/index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

const draftsController = require('../../../controllers/drafts.controller')

module.exports = class Persistance {

    constructor(server) {
        this.server = server;
        this.draftsController = draftsController(this.server);

        this.transaction = null
    }

    getTransaction(){
        return this.transaction
    }

    setTransaction(transaction){
        if(transaction) this.transaction = transaction  
    }

    getDraftById(draftId){
        return this.draftsController.getOne(draftId).then((draft) => {
            return JSON.parse(JSON.stringify(draft));
        }).catch((err) => {
            return err;
        })
    }

};