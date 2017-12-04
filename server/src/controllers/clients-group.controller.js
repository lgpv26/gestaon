const _ = require('lodash');
const utils = require('../utils');
const Op = require('sequelize').Op

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

        saveClientsGroup(req) {
            let clientsGroupCantChange = []
            return new Promise((resolve, reject) => {
                let clientsGroupResolverPromisses = []
                
                clientsGroupResolverPromisses.push(new Promise((resolve, reject) => {
                    let clientsGroupIds = []
                    req.params.clientsGroup.forEach((forEachClientsGroup, index) => {
                        if (forEachClientsGroup.id) {
                            clientsGroupIds.push(forEachClientsGroup.id)
                        }
                        else {
                            req.params.clientsGroup[index].companyId = parseInt(req.params.companyId)
                        }
                    })
                    server.mysql.ClientsGroup.findAll({
                        where: {
                            id: {
                                [Op.in]: clientsGroupIds
                            }
                        }
                    }).then((clientsGroupConsult) => {
                        clientsGroupConsult.forEach((result) => {
                            const index = _.findIndex(req.params.clientsGroup, (clientGroupFind) => {
                                return clientGroupFind.id === result.id
                            })
                            if (result.companyId === 0) {
                                clientsGroupCantChange.push(result)
                                req.params.clientsGroup.splice(index, 1)
                            }
                        })
                        resolve()
                    })
                })
                )

                return Promise.all(clientsGroupResolverPromisses).then(() => {
                   
                    server.mysql.ClientsGroup.bulkCreate(req.params.clientsGroup, {
                        updateOnDuplicate: ['name', 'dateUpdated', 'dateRemoved', 'status'],
                        returning: true
                    }).then((clientsGroupBulk) => {
                        if (!clientsGroupBulk) {
                            reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                        }
                        let clientsGroupChange = _.map(clientsGroupBulk, clientsGroup => clientsGroup)
                    
                        resolve(clientsGroupChange)
                    }).catch((error) => {
                        reject(error);
                    })

                })
            }).then((response) => {
                return _.concat((response) ? response : [], (clientsGroupCantChange) ? clientsGroupCantChange : [])
            }).catch((error) => {
                return error
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
