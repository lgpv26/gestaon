const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {
    return {
        getAll(req){
            return server.mysql.ClientsGroup.findAll({
                where:{
                    companyId: {
                        [Op.in]: [0, parseInt(req.params.companyId)]
                    }
                }
            }).then((clientsGroupAll) => {
                return clientsGroupAll
            })
        },

        getOne(req) {
           return server.mysql.ClientsGroup.findOne({
                where: {
                    id: req.params.id,
                    companyId: {
                        [Op.in]: [0, parseInt(req.params.companyId)]
                    }
                }
            }).then((clientsGroupOne) => {
                if (!clientsGroupOne) {
                    return new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                }
                return clientsGroupOne
            });
        },

        setClientGroup: (controller) => {
            let setData = _.cloneDeep(controller.request.data)
            setData = _.map(setData, (clientGroup) => {
                if(_.has(clientGroup, 'dateUpdated')) delete clientGroup.dateUpdated // remove dateUpdated fields so it updates the dateUpdated field

                clientGroup.status = (clientGroup.selected) ? 'selected:' + parseInt(controller.request.clientId) : 'activated'

                return clientGroup
            })
            
            return server.mysql.ClientGroup.bulkCreate(setData, {
                updateOnDuplicate: ['companyId', 'name', 'dateUpdated', 'dateRemoved', 'status'],
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.ClientGroup.findOne({
                    where: {
                        status: 'selected:' + parseInt(controller.request.clientId)
                    },
                    transaction: controller.transaction
                }).then((clientGroup) => {
                    return new Promise((resolve, reject) => {
                        if (!clientGroup) {
                            return reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }

                        const clientGroupStatus = {id: parseInt(clientGroup.id), status: 'activated'}
                        const clientGroupUpdate = {clientGroup: parseInt(clientGroup.id)}
                                                    
                        return server.mysql.ClientGroup.update(clientGroupStatus, {
                            updateOnDuplicate: ['status'],
                            transaction: controller.transaction
                        }).then(() => {
                            return server.mysql.Client.update(clientGroupUpdate, {
                                where: {
                                    id: controller.request.clientId
                                },
                                transaction: controller.transaction
                            }).then(() => {
                                resolve();
                            }).catch((err) => {
                                console.log('ERROR: IN SAVE CLIENT GROUP ID IN CLIENT (client-group.controller): ', err)
                            })
                            
                        }).catch((err) => {
                            reject(err)
                        })
                    })
                })
            })
        },

        removeOne(req) {
            return server.sequelize.transaction((t) => {
                return server.mysql.ClientsGroup.destroy({
                    where: {
                        id: req.params.id,
                        companyId: {
                            [Op.not]: 0,
                            [Op.eq]: parseInt(req.params.companyId)
                        }
                    },
                    transaction: t
                }).then((clientsGroup) => {
                    if (!clientsGroup) {
                        return new restify.ResourceNotFoundError("Registro não encontrado ou registro padrão.");
                    }
                    return clientsGroup
                })
            }).then((clientsGroup) => {
                // Transaction has been committed
                return clientsGroup
            }).catch((err) => {
                return err
            })
        }
    }

}
