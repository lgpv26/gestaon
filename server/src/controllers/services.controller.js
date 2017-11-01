const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getAll: (req, res, next) => {
            server.mongodb.Service.find({
                companyId: 1,
                userId: req.auth.id
            }, (err, services) => {
                if(err){
                    return next(
                        new restify.InternalServerError({
                            body:{
                                "code": err.name,
                                "message": err.message,
                                "detailed": err
                            }
                        })
                    );
                };
                return res.send(200, {
                    data: services
                });
            })
        },
        getOne: (req, res, next) => {
            server.mongodb.Service.findOne({
                _id: req.params.id,
                companyId: 1,
                userId: req.auth.id
            }, (err, service) => {
                if(err){
                    return next(
                        new restify.InternalServerError({
                            body:{
                                "code": err.name,
                                "message": err.message,
                                "detailed": err
                            }
                        })
                    );
                };
                return res.send(200, {
                    data: service
                });
            })
        },
        createOne: (req, res, next) => {
            server.mongodb.Service.create({
                companyId: 1,
                userId: req.auth.id
            }, (err, service) => {
                if(err){
                    return next(
                        new restify.InternalServerError({
                            body:{
                                "code": err.name,
                                "message": err.message,
                                "detailed": err
                            }
                        })
                    );
                };
                return res.send(200, {
                    data: service
                });
            })
        },
        updateOne: (req, res, next) => {

        },
        removeOne: (req, res, next) => {
            server.mongodb.Service.remove({
                _id: req.params.id,
                companyId: 1,
                userId: req.auth.id
            }, (err, service) => {
                if(err){
                    return next(
                        new restify.InternalServerError({
                            body:{
                                "code": err.name,
                                "message": err.message,
                                "detailed": err
                            }
                        })
                    );
                };
                return res.send(200, {
                    data: "OK"
                });
            })
        }
    }
};
