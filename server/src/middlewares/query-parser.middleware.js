const _ = require('lodash');

module.exports = function (req, res, next) {
    // user.companies
    // user.

    if(_.has(req.query, "include")){
        const includes = req.query.include.split(',');
        req.query.includedScopes = [];
        includes.forEach((include) => {
            if(include.trim()) {
                req.query.includedScopes.push(include);
            }
        });
    }
    else {
        req.query.includedScopes = [];
    }

    return next();

};