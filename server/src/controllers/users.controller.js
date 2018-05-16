const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash')
const Controller = require('../models/Controller')

module.exports = (server, restify) => {
    return {
        authenticate: (req, res, next) => {
            server.mysql.User.findOne({
                where: {
                    email: req.body.email
                },
                include: [
                    {
                        model:server.mysql.Company,
                        as:'companies',
                        include: [
                            {
                                model: server.mysql.CompanySetting,
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
                return server.mysql.User.create(req.body, {transaction: t}).then((user) => {
                    if(!_.has(req.query, 'companyId')){
                        return res.send(200, {
                            data: user
                        });
                    }
                    else {
                        return server.mysql.CompanyUser.create({
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
            if(req.query.fcmToken){
                console.log("Token", req.query.fcmToken)
            }
            server.mysql.User.findOne({
                where: {
                    id: req.auth.id,
                    status: 'activated'
                },
                include: [{
                    model: server.mysql.CompanyUser,
                    as: 'userCompanies',
                    include: [
                        {
                            model:server.mysql.Company,
                            as:'company',
                            include: [
                                {
                                    model: server.mysql.CompanySetting,
                                    as:'companySettings'
                                }
                            ],
                        },
                        {
                            model:server.mysql.CompanyUserPermission,
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
        fcm: (req, res, next) => {
            return server.mysql.UserAccessToken.update({
                fcmToken: req.body.fcmToken
            },{
                where: {
                    accessToken: req.query.token
                }
            }).then((userAccessToken) => {
                if(!userAccessToken){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: userAccessToken
                });
            });
        },
        getAll: (controller) => {
            return server.mysql.User.findAll({
                include: [{
                    model: server.mysql.CompanyUser,
                    as: 'userCompanies',
                    attributes: ['companyId'],
                    where: {
                        companyId: controller.request.queryParser.companyId
                    }
                }]
            }).then((users) => {
                return users;
            })
        },
        getOne: (controller) => {
            return server.mysql.User.findOne({
                where: {
                    id: controller.request.id,
                    status: 'activated'
                },
                include: [
                    {model:server.mysql.Company, as:'companies'}
                ]
            }).then((user) => {
                if(!user){
                    console.log("error no getOne do users controller")
                }
                return JSON.parse(JSON.stringify(user))
            });
        },
        createOne: (req, res, next) => {
            return server.sequelize.transaction(function(t){
                return server.mysql.User.findOne({
                    where: {
                        email: req.body.email
                    },
                    include: [
                        {model:server.mysql.Company, as:'companies'}
                    ],
                    transaction: t
                }).then((user) => {
                    if(!user){ // there is no user with this email, register new one
                        return server.mysql.User.create(req.body, {transaction: t}).then((user) => {
                            if(!_.has(req.query, 'companyId')){
                                return res.send(200, {
                                    data: user
                                });
                            }
                            else {
                                return server.mysql.CompanyUser.create({
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
                    return server.mysql.CompanyUserInvitation.create({
                        code: "anything",
                        createdBy: req.auth.id
                    }, {transaction: t}).then((companyUserInvitation) => {
                        return server.mysql.CompanyUser.create({
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
            server.mysql.User.update(req.body,{
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
                server.mysql.User.findById(req.params.id, {
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
                return server.mysql.User.destroy({
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
                    return server.mysql.CompanyUser.findAll({
                        where: {
                            userId: req.params.id
                        },
                        transaction: t
                    }).then((companyUsers) => {
                        return server.mysql.CompanyUser.destroy({
                            where: {
                                userId: req.params.id
                            },
                            transaction: t
                        }).then(() => {
                            const companyUsersPromises = [];
                            companyUsers.forEach((companyUser) => {
                                companyUsersPromises.push(new Promise(function(resolve, reject){
                                    server.mysql.CompanyUserPermission.destroy({
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
