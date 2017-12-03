const _ = require('lodash');

module.exports = (server, restify) => {
    
    return {
        updateOneSettings: (req, res, next) => {
            if(_.has(req.body, 'companySettings') && _.has(req.params, 'id')){
                return saveSettings(req, res, next).then((company) => {
                    return res.send(200, {
                        data: company
                    });
                }).catch((err) => {
                    next(err);
                });
            }
            else {
                return next(
                    new restify.BadRequestError("Você deve fornecer as informações corretas.")
                );
            }
        },
        getAll: (req, res, next) => {
            server.models.Company.findAll({
                include: [{
                    model: server.models.CompanySetting,
                    as: 'companySettings'
                }]
            }).then((companies) => {
                if(!companies){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: companies
                });
            });
        },
        getOne: (req, res, next) => {
            server.models.Company.findOne({
                where: {
                    id: req.params.id
                },
                include: [{
                    model: server.models.CompanySetting,
                    as: 'companySettings'
                }]
            }).then((company) => {
                if(!company){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: company
                });
            });
        },
        getOneAndSetActive: (req, res, next) => {
            server.models.Company.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    {
                        model: server.models.CompanySetting,
                        as: 'companySettings'
                    },
                    {
                        model: server.models.CompanyUser,
                        as: 'companyUsers',
                        include: [
                            {
                                model: server.models.CompanyUserPermission,
                                as: 'permissions'
                            }
                        ]
                    }
                ]
            }).then((company) => {
                if(!company){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                const companyUser = _.find(company.companyUsers, { userId: req.auth.id });
                if(!companyUser){
                    return next(
                        new restify.ResourceNotFoundError({body: {
                            code: "COMPANY_NOT_FOUND_FOR_USER",
                            message: "Empresa não existente para o usuário."
                        }})
                    );
                }
                return server.models.User.update({
                    activeCompanyUserId: companyUser.id
                },{
                    where: {
                        id: companyUser.userId
                    }
                }).then(() => {
                    return res.send(200, {
                        data: company
                    });
                });
            });
        },
        createOne: (req, res, next) => {
            _.assign(req.body, {
                companyUsers: [
                    {
                        userId: req.auth.id,
                        isCreator: true
                    }
                ]
            });
            return server.models.Company.create(req.body,{
                include: [{
                    model: server.models.CompanyUser,
                    as: 'companyUsers'
                }]
            }).then((company) => {
                if(!company){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: company
                });
            }).catch((err) => {
                return next(new restify.ResourceNotFoundError({body: {
                    code: err.name,
                    message: err.message,
                    detailed: err
                }}));
            });
        },
        updateOne: (req, res, next) => {
            server.models.Company.update(req.body,{
                where: {
                    id: req.params.id
                }
            }).then((company) => {
                if(!company){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                server.models.Company.findById(req.params.id, {
                    where: {
                        id: req.params.id
                    }
                }).then((company) => {
                    if(!company){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    return res.send(200, {
                        data: company
                    });
                })
            });
        },
        removeOne: (req, res, next) => {
            server.sequelize.transaction((t) => {
                return server.models.Company.destroy({
                    where: {
                        id: req.params.id
                    },
                    transaction: t
                }).then((company) => {
                    if(!company){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    return server.models.CompanyUser.findAll({
                        where: {
                            companyId: req.params.id
                        },
                        transaction: t
                    }).then((companyUsers) => {
                        return server.models.CompanyUser.destroy({
                            where: {
                                companyId: req.params.id
                            },
                            transaction: t
                        }).then(() => {
                            const companyUsersPromises = [];
                            companyUsers.forEach((companyUser) => {
                                companyUsersPromises.push(new Promise(function(resolve, reject){
                                    server.models.CompanyUserPermission.destroy({
                                        where: {
                                            companyUserId: companyUser.id
                                        },
                                        transaction: t
                                    }).then(() => {
                                        resolve();
                                    }).catch((err) => {
                                        reject(err);
                                    });
                                }));
                            });
                            return Promise.all(companyUsersPromises).then(() => {
                                return res.send(200, {
                                    data: {
                                        id: req.params.id
                                    }
                                });
                            })
                        });
                    });
                });
            });
        },
        companyUsersGetAll: (req, res, next) => {
            server.models.CompanyUser.findAll({
                where: {
                    companyId: req.params.companyId
                },
                include: [{
                    model: server.models.Company,
                    as: 'company'
                },{
                    model: server.models.User,
                    as: 'user'
                },{
                    model: server.models.CompanyUserPermission,
                    as: 'permissions'
                }]
            }).then((companyUsers) => {
                if(!companyUsers){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                /*
                companyUsers.forEach((companyUser) => {
                    console.log(companyUser.permissions);
                });
                */
                return res.send(200, {
                    data: companyUsers
                });
            });
        },
        companyUsersRemoveOne: (req, res, next) => {
            server.sequelize.transaction((t) => {
                return server.models.CompanyUser.findOne({
                    where: {
                        companyId: req.params.companyId,
                        userId: req.params.userId
                    },
                    transaction: t
                }).then((companyUser) => {
                    if(!companyUser){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                        );
                    }
                    if(companyUser.isCreator){
                        return next(
                            new restify.InternalServerError({body:{
                                "code": 'CANNOT_REMOVE_COMPANY_OWNER',
                                "message": 'Você não pode remover o administrador da empresa.'
                            }})
                        );
                    }
                    return server.models.CompanyUser.destroy({
                        where: {
                            companyId: companyUser.companyId,
                            userId: companyUser.userId
                        },
                        transaction: t
                    }).then((result) => {
                        if (!result) {
                            return next(
                                new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                            );
                        }
                        return server.models.CompanyUserPermission.destroy({
                            where: {
                                companyUserId: companyUser.id
                            },
                            transaction: t
                        }).then(() => {
                            return res.send(200, {
                                data: {
                                    id: companyUser.id
                                }
                            });
                        });
                    });
                });
            });
        },
        companyUsersPermissionsSaveMultiple: (req, res, next) => {
            return server.sequelize.transaction().then((t) => {
                server.models.CompanyUser.findAll({
                    where: {
                        companyId: req.params.companyId
                    },
                    include: [{
                        model: server.models.CompanyUserPermission,
                        as: 'permissions'
                    }]
                }, {transaction: t}).then((companyUsers) => {
                    if(!companyUsers){
                        t.rollback();
                        return next(
                            new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                        );
                    }
                    return Promise.all(_.map(companyUsers, (companyUser) => {
                        return server.models.CompanyUserPermission.destroy({
                            where: {
                                companyUserId: companyUser.id
                            }
                        }, {transaction: t}).then(() => {
                            const reqCompanyUser = _.find(req.body.companyUsers, {companyUserId: companyUser.id});
                            return server.models.CompanyUserPermission.bulkCreate(reqCompanyUser.permissions, { transaction: t });
                        });
                    })).then((response) => {
                        t.commit();
                        return res.send(200, {
                            data: response[0]
                        });
                    });
                });
            }).catch(function (err) {
                return next(
                    new restify.InternalServerError(err.toString())
                );
            });
        },
        
        /*companyUserPermissionsSaveMultiple: (req, res, next) => {
            return server.sequelize.transaction((t) => {
                server.models.CompanyUser.findOne({
                    where: {
                        companyId: req.params.companyId,
                        userId: req.params.userId
                    },
                    include: [{
                        model: server.models.CompanyUserPermission,
                        as: 'permissions'
                    }]
                }, {transaction: t}).then((companyUser) => {
                    if(!companyUser){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                        );
                    }
                    return server.models.CompanyUserPermission.destroy({
                        where: {
                            companyUserId: companyUser.id
                        }
                    }, {transaction: t}).then(() => {
                        return server.models.CompanyUserPermission.bulkCreate(req.body, { transaction: t }).then((response) => {
                            return res.send(200, {
                                data: {}
                            });
                        })
                    });
                });
            }).then(function (result) {
                return res.send(200, {
                    data: companyUsers
                });
            }).catch(function (err) {
                return next(
                    new restify.InternalServerError(err.toString())
                );
            });
        },*/
    };

    /* -------------------------------------- */
    /* --- Reusable request functions ------------------------------------------
     /* -------------------------------------- */

    function saveSettings(req, res, next){
        return new Promise((resolve, reject) => {
            let companySettings = [];
            _.forIn(req.body.companySettings, (value, name) => {
                companySettings.push({
                    name: name,
                    value: value
                });
            });
            companySettings = _.map(companySettings, companySetting => _.extend({
                companyId: parseInt(req.params.id)
            }, companySetting));
            server.models.CompanySetting.bulkCreate(companySettings, {
                updateOnDuplicate: ['name','value']
            }).then((response) => {
                server.models.Company.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.CompanySetting,
                        as: 'companySettings'
                    }]
                }).then((company) => {
                    if(!company){
                        reject(new restify.ResourceNotFoundError("Dispositivo não encontrado."));
                    }
                    else {
                        resolve(company);
                    }
                }).catch((error) => {
                    reject(error);
                });
            }).catch(function(error){
                reject(error);
            });
        });
    }

};
