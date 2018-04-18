import { request } from 'http';

const _ = require('lodash')
const utils = require('../utils/index')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    return {
        
        setClientPhones: (controller) => {
            return new Promise((resolve, reject) => {
                let setData = null
                setData = _.map(controller.request.data, (clientPhone) => {
                    return _.assign({clientPhoneId: clientPhone.id}, {
                            requestId: parseInt(controller.request.requestId)
                    })
                })
            
            return server.mysql.RequestClientPhone.destroy({
                where: {
                    requestId: parseInt(controller.request.requestId)
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.RequestClientPhone.bulkCreate(setData, {
                    updateOnDuplicate: ['requestId', 'clientPhoneId', 'type', 'dateUpdated', 'dateRemoved', 'status'],
                    transaction: controller.transaction
                }).then((response) => {
                        resolve(response);
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch((err) => {
                    console.log(err)
                })
            })
        }

    }
 

};