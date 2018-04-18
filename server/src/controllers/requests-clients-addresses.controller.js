import { request } from 'http';

const _ = require('lodash')
const utils = require('../utils/index')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    return {
        
        setClientAddresses: (controller) => {
            return new Promise((resolve, reject) => {
                let setData = null
                setData = _.map(controller.request.data, (clientAddress) => {
                    return _.assign({clientAddressId: clientAddress.id}, {
                            requestId: parseInt(controller.request.requestId)
                    })
                })

            return server.mysql.RequestClientAddress.destroy({
                where: {
                    requestId: parseInt(controller.request.requestId)
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.RequestClientAddress.bulkCreate(setData, {
                    updateOnDuplicate: ['requestId', 'clientAddressId', 'type', 'dateUpdated', 'dateRemoved', 'status'],
                    transaction: controller.transaction
                }).then((response) => {
                        resolve(response);
                    }).catch((error) => {
                        reject(error);
                    });
                })
            })
        }

    }
 

};