const _ = require('lodash');

module.exports = (server, restify) => {
    return (permission) => {
        return (req, res, next) => {
            let user = req.auth

            if (user.type == 'admin') {
                return next()
            }

            if (user.activeCompanyUserId == null) {
                server.models.CompanyUser.findOne({
                    where: {
                        userId: user.id
                    }
                }).then((companyUser) => {
                    server.models.Company.findOne({
                        where: {
                            id: companyUser.companyId,
                            status: 'activated'
                        }
                    }).then((company) => {
                        if (!company) {
                            return next(
                                new restify.ResourceNotFoundError("Company is not activated.")
                            );
                        }
                        if (companyUser.isCreator == true) {
                            return next();
                        } else {
                            permissionValidated(companyUser)
                        }
                    })
                });
            }
            else {
                server.models.Company.findOne({
                    where: {
                        id: user.activeCompanyUserId,
                        status: 'activated'
                    }
                }).then((company) => {
                    if (!company) {
                        return next(
                            new restify.ResourceNotFoundError("Company is not activated.")
                        );
                    }
                    server.models.CompanyUser.findOne({
                        where: {
                            userId: user.id,
                            companyId: company.id
                        }
                    }).then((companyUser) => {
                        if (companyUser.isCreator == true) {
                            return next();
                        } else {
                            permissionValidated(companyUser)
                        }
                    })
                })
            }

            function permissionValidated(companyUser) {
                server.models.CompanyUserPermission.findOne({
                    where: {
                        companyUserId: companyUser.id,
                        resourceName: permission
                    }
                }).then((allow) => {
                    if (!allow) {
                        return next(
                            new restify.NotAuthorizedError({
                                body: {
                                    "code": 'NOT_AUTHORIZED',
                                    "message": 'Function not authorized'
                                }
                            })
                        );
                    }
                    return next()
                })
            }
        }
    }
};