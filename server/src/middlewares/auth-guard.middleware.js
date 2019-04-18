/* const jwt = require('jsonwebtoken'); */
const moment = require('moment')
const _ = require('lodash')
const { HTTPError } = require('~errors')

module.exports = (server, restify) => {
    return (req, res, next) => {
        if(!req.query.token){
            const error = new HTTPError("The token is required", 401)
            error.setCode("TOKEN_IS_REQUIRED")
            return next(error)
        }
        server.mysql.UserAccessToken.findOne({
            where: {
                accessToken: req.query.token
            },
            include: [
                {
                    model: server.mysql.User,
                    as: 'user',
                    attributes: { exclude: ["password"] },
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
                const error = new HTTPError("Token is not valid.", 401)
                error.setCode("INVALID_TOKEN")
                return next(error)
            }

            if(moment(userAccessToken.expiresAt).isBefore(moment())){
                const error = new HTTPError("Token is expired. Try using the refresh_token grant", 401)
                error.setCode("EXPIRED_TOKEN")
                return next(error)
            }

            // if the request was made specific to a company

            if(_.has(req.query,'companyId')){
                const verifyResult = userBelongsToRequestedCompany(userAccessToken.user, req.query.companyId);
                if (!verifyResult){
                    const error = new HTTPError("The authenticated user doesn't belong to the requested company", 401)
                    error.setCode("MISSING_COMPANY")
                    return next(error)
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

            server.mysql.User.findByPk(decoded.id).then((user) => {
                req['auth'] = user.dataValues;
                next();
            });


        });
    }
}
*/