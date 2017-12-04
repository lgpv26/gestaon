const _ = require('lodash');

module.exports = (server, restify) => {
    return (permission) => {
        return (req, res, next) => {
            let user = req.auth;

            if (user.type === 'admin') return next();

            return new Promise((resolve, reject) => {
                const companyIncludeObj = {
                    model: server.mysql.Company,
                    as: 'company'
                }
                if (user.activeCompanyUserId) {
                    companyIncludeObj.where = {
                        id: user.activeCompanyUserId
                    }
                }
                server.mysql.CompanyUser.findOne({
                    where: {
                        userId: user.id
                    },
                    include: [
                        {
                            model: server.mysql.CompanyUserPermission,
                            as: 'permissions'
                        },
                        companyIncludeObj
                    ]
                }).then((companyUser) => {
                    if (!companyUser) {
                        return reject(new restify.ResourceNotFoundError("Company user is not found."));
                    }
                    if (companyUser.company.status != 'activated') {
                        return reject(new restify.ResourceNotFoundError("Company is not activated."));
                    }
                    if (companyUser.isCreator) {
                        return resolve('allowed');
                    } else {
                        return resolve(companyUser);
                    }
                })
            }).then((companyUser) => {
                if (companyUser === 'allowed') return next();

                companyUser = JSON.parse(JSON.stringify(companyUser))
                if (_.includes(_.map(companyUser.permissions, 'resourceName'), permission)) return next();

                return next(
                    new restify.NotAuthorizedError({
                        body: {
                            "code": 'NOT_AUTHORIZED',
                            "message": 'Not authorized.'
                        }
                    })
                );
            }).catch((err) => {
                return next(err);
            });
        }
    }
};