import { resolve } from 'dns';

const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')
const sequelize = require('sequelize')

module.exports = class Persistance {

    constructor(server) {
    }

    getTransaction(){
        return this.transaction
    }

    setTransaction(transaction){
    }

    getDraftById(draftId){
    }

};