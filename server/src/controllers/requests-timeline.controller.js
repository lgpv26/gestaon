const _ = require('lodash')
const utils = require('../utils')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const usersController = require('./../controllers/users.controller')(server, restify)

    return {

        saveRequestTimeline: (controller) => {
            return new Promise((resolve, reject) => {
                const createData = _.cloneDeep(controller.request.data)
                _.assign(createData, {
                    requestId: controller.request.requestId,
                    userId: controller.request.userId
                })
 
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
        },

        changeStatus: (controller) => {
            return new Promise((resolve, reject) => {
                const createData = _.assign(_.cloneDeep(controller.request.data), {
                    requestId: controller.request.request.id,
                    userId: _.last(_.sortBy(controller.request.request.requestTimeline, 'id')).userId
                })

                return server.mysql.RequestTimeline.create(createData).then((response) => {
                    resolve(response)
                }).catch((error) => {
                    reject(error);
                });
            }).catch((err) => {
                console.log(err)
            })
        },

        changeUser: (controller) => {
            return new Promise((resolve, reject) => {
                const userController = new Controller({
                    request: {
                        id: controller.request.data.userId
                    }
                })
                return usersController.getOne(userController).then((user) => {
                    let companies = _.findIndex(user.companies, (company) => {
                        return company.id === controller.request.companyId
                    })

                    if (companies !== -1) {

                        const createData = _.assign(_.cloneDeep(controller.request.data), {
                            requestId: controller.request.request.id,
                            status: _.last(controller.request.request.requestTimeline).status
                        })

                        return server.mysql.RequestTimeline.create(createData).then((response) => {
                            resolve(response)
                        }).catch((err) => {
                            reject(err)
                        })
                    }
                    else {
                        reject()
                    }
                }).catch((err) => {
                    console.log(err)
                })
            })
        }
    
    }  
    
}