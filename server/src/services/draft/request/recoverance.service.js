const _ = require('lodash')
const sequelize = require('sequelize')
import moment from 'moment'
import EventResponse from '~server/models/EventResponse'

module.exports = (server) => { 
    //PRIVATES
    let _request = null
    let _transaction = null

    let _companyId = null
    let _userId = null

    let _draftId = null

    return {
    name: "draft/request/persistence",
    actions: {
        start(ctx){
           console.log('aqui')
        },
    }
}}