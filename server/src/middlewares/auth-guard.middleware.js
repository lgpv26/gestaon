/* const jwt = require('jsonwebtoken'); */
const moment = require('moment');
const _ = require('lodash');

module.exports = (server, restify) => {
    return (req, res, next) => {
        if(!req.query.token){
            return next(
                new restify.InvalidCredentialsError({
                    body:{
                        "code": "TOKEN_IS_REQUIRED",
                        "message": "The token is required."
                    }
                })
            );
        }
        server.mysql.UserAccessToken.findOne({
            where: {
                accessToken: req.query.token
            },
            include: [
                {
                    model: server.mysql.User,
                    as: 'user',
                    include: [
                        {
                            model: server.mysql.CompanyUser,
                            as: 'userCompanies',
                            include: [
                                {
                                    model: server.mysql.Company,
                                    as: 'company'
                                },
                                {
                                    model: server.mysql.CompanyUserPermission,
                                    as: 'permissions'
                                }
                            ]
                        }
                    ]
                }
            ]
        }).then((userAccessToken) => {

            if(!userAccessToken){
                return next(
                    new restify.InvalidCredentialsError({
                        body:{
                            "code": "INVALID_TOKEN",
                            "message": "Token is not valid."
                        }
                    })
                );
            }

            if(moment(userAccessToken.expiresAt).isBefore(moment())){
                return next(
                    new restify.InvalidCredentialsError({
                        body:{
                            "code": "EXPIRED_TOKEN",
                            "message": "Token is expired. Try using the refresh_token grant."
                        }
                    })
                );
            }

            // if the request was made specific to a company

            if(_.has(req.query,'companyId')){
                const verifyResult = userBelongsToRequestedCompany(userAccessToken.user, req.query.companyId);
                if (!verifyResult){
                    return next(
                        new restify.InvalidCredentialsError({
                            body:{
                                "code": "MISSING_COMPANY",
                                "message": "The authenticated user doesn't belong to the requested company."
                            }
                        })
                    );
                }
            }

            req['auth'] = userAccessToken.toJSON().user;

            next();

        });

    };

    function userBelongsToRequestedCompany(user, requestedCompanyId){
        if(!_.has(user, 'userCompanies') || user.userCompanies.length <= 0){
            return false;
        }
        const belongsTo = _.find(user.userCompanies, (userCompany) => {
            if(parseInt(userCompany.company.id) === parseInt(requestedCompanyId)) return true;
        });
        return !!belongsTo;
    }

};

/*
module.exports = (server, restify) => {
    return (req, res, next) => {
        jwt.verify(req.query.token, 'precious-secret', function (err, decoded) {
            if (err) {

                return next(
                    new restify.InvalidCredentialsError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );

            }

            server.mysql.User.findById(decoded.id).then((user) => {
                req['auth'] = user.dataValues;
                next();
            });


        });
    }
}
*/