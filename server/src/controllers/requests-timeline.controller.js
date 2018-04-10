const _ = require('lodash')
const utils = require('../utils')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    return {

        saveRequestTimeline: (controller) => {
            return new Promise((resolve, reject) => {
                const createData = _.cloneDeep(controller.request.data)
                _.assign(createData, {
                    requestId: controller.request.requestId
                })
 
                return server.mysql.RequestTimeline.create(createData, {
                    transaction: controller.transaction
                }).then((response) => {
                    console.log('aqui', response)
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((err) => {
                console.log(err)
            })
        },

        changeStatus: (controller) => {
            return new Promise((resolve, reject) => {
                const createData = _.cloneDeep(controller.request.data)
                 
                return server.mysql.RequestTimeline.create(createData, {
                    transaction: controller.transaction
                }).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((err) => {
                console.log(err)
            })
        }
    
    }

};