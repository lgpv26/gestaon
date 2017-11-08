const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        authenticate: (req, res, next) => {
            server.models.User.findOne({
                where: {
                    email: req.body.email
                },
                include: [
                    {
                        model:server.models.Company,
                        as:'companies',
                        include: [
                            {
                                model: server.models.CompanySetting,
                                as:'companySettings'
                            }
                        ],
                    }
                ]
            }).then((user) => {
                if(!user){
                    return next(
                        new restify.InvalidCredentialsError("Credenciais incorretas.")
                    );
                }
                if(!bcrypt.compareSync(req.body.password, user.password)){
                    return next(
                        new restify.InvalidCredentialsError("Credenciais incorretas.")
                    );
                }
                const token = jwt.sign({
                    id: user.id,
                    iat: Math.floor(Date.now() / 1000) - 30,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 18)
                }, 'precious-secret');
                return res.send(200, {
                    data: user,
                    token
                });
            });
        },
        register: (req, res, next) => {
            return server.sequelize.transaction(function(t){
                return server.models.User.create(req.body, {transaction: t}).then((user) => {
                    if(!_.has(req.query, 'companyId')){
                        return res.send(200, {
                            data: user
                        });
                    }
                    else {
                        return server.models.CompanyUser.create({
                            userId: user.id,
                            companyId: req.query.companyId,
                            isCreator: false
                        }, {transaction: t}).then((companyUser) => {
                            return res.send(200, {
                                data: user
                            });
                        });
                    }
                });
            }).catch(function (err) {
                return next(
                    new restify.InvalidCredentialsError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            });
        },
        forgotPassword: (req, res, next) => {
            console.log('forgot password endpoint called');
        },
        me: (req, res, next) => {
            server.models.User.findOne({
                where: {
                    id: req.auth.id,
                    status: 'activated'
                },
                include: [{
                    model: server.models.CompanyUser,
                    as: 'userCompanies',
                    include: [
                        {
                            model:server.models.Company,
                            as:'company',
                            include: [
                                {
                                    model: server.models.CompanySetting,
                                    as:'companySettings'
                                }
                            ],
                        },
                        {
                            model:server.models.CompanyUserPermission,
                            as:'permissions'
                        }
                    ]
                }]
            }).then((user) => {
                if(!user){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: user
                });
            });
        },
        getAll: (req, res, next) => {



            server.models.User.scope(req.query.includedScopes).findAll().then((users) => {
                if (!users) {
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: users
                });
            }).catch((err) => {
                return next(
                    new restify.InternalServerError({
                        body: {
                            "code": err.name,
                            "message": err.message,
                            "detailed": err
                        }
                    })
                );
            });
        },
        getOne: (req, res, next) => {
            server.models.User.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [
                    {model:server.models.Company, as:'companies'}
                ]
            }).then((user) => {
                if(!user){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: user
                });
            });
        },
        createOne: (req, res, next) => {
            return server.sequelize.transaction(function(t){
                return server.models.User.findOne({
                    where: {
                        email: req.body.email
                    },
                    include: [
                        {model:server.models.Company, as:'companies'}
                    ],
                    transaction: t
                }).then((user) => {
                    if(!user){ // there is no user with this email, register new one
                        return server.models.User.create(req.body, {transaction: t}).then((user) => {
                            if(!_.has(req.query, 'companyId')){
                                return res.send(200, {
                                    data: user
                                });
                            }
                            else {
                                return server.models.CompanyUser.create({
                                    userId: user.id,
                                    companyId: req.query.companyId,
                                    isCreator: false
                                }, {transaction: t}).then((companyUser) => {
                                    return res.send(200, {
                                        data: user
                                    });
                                });
                            }
                        });
                    }
                    const companyAlreadyHasUser = _.find(user.companies, {id: parseInt(req.query.companyId)});
                    if(companyAlreadyHasUser){
                        return next(
                            new restify.InternalServerError({
                                body: {
                                    "code": "COMPANY_ALREADY_HAS_USER",
                                    "message": "O usuário já está nesta empresa."
                                }
                            })
                        );
                    }
                    if(!_.has(req.query, 'companyId')){
                        return next(
                            new restify.InternalServerError({
                                body: {
                                    "code": "USER_ALREADY_EXISTS",
                                    "message": "O usuário já existe."
                                }
                            })
                        );
                    }
                    // if there is user, then we should create a invitation to him
                    return server.models.CompanyUserInvitation.create({
                        code: "anything",
                        createdBy: req.auth.id
                    }, {transaction: t}).then((companyUserInvitation) => {
                        return server.models.CompanyUser.create({
                            userId: user.id,
                            companyId: req.query.companyId,
                            companyUserInvitationId: companyUserInvitation.id,
                            isCreator: false
                        }, {transaction: t}).then(() => {
                            return res.send(200, {
                                data: user
                            });
                        });
                    });
                });

            }).catch(function (err) {
                return next(
                    new restify.InvalidCredentialsError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            });
        },
        updateOne: (req, res, next) => {
            console.log(req.body);
            if(_.has(req.body, 'password')){
                req.body.password = bcrypt.hashSync(req.body.password, 8);
            }
            server.models.User.update(req.body,{
                individualHooks: true,
                where: {
                    id: req.params.id
                }
            }).then((user) => {
                if(!user){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                server.models.User.findById(req.params.id, {
                    where: {
                        id: req.params.id
                    }
                }).then((user) => {
                    if(!user){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    return res.send(200, {
                        data: user
                    });
                })
            });
        },
        removeOne: (req, res, next) => {
            return server.sequelize.transaction((t) => {
                return server.models.User.destroy({
                    where: {
                        id: req.params.id
                    },
                    transaction: t
                }).then((result) => {
                    if(!result){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    return server.models.CompanyUser.findAll({
                        where: {
                            userId: req.params.id
                        },
                        transaction: t
                    }).then((companyUsers) => {
                        return server.models.CompanyUser.destroy({
                            where: {
                                userId: req.params.id
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
        }
    }
};