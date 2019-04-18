const utils = require('../utils/index');
const _ = require('lodash');
const GeoJSON = require('mongoose-geojson-schema');

module.exports = (server, restify) => {
    return {
        getAll: (req, res, next) => {
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            server.mongodb.Geofence.find({
                companyId: req.query.companyId
            }).populate('devices').then((geofences) => {
                if(!geofences){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: geofences
                });
            }).catch((err) => {
                return next(
                    new restify.InternalServerError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            });
        },
        getOne: (req, res, next) => {
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            server.mongodb.Geofence.findOne({
                _id: req.params.id,
                companyId: req.query.companyId
            }).populate('devices').then((geofence) => {
                if(!geofence){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: geofence
                });
            }).catch((err) => {
                return next(
                    new restify.InternalServerError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            });
        },
        createOne: (req, res, next) => {
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            else{
                _.assign(req.body, {companyId: req.query.companyId});
            }
            if(_.has(req.body,"polygon")){
                const polygonCoordinates = req.body.polygon;
                _.assign(req.body, {
                    polygon: {
                        type: "Polygon",
                        coordinates: [polygonCoordinates]
                    }
                })
            }
            return server.mongodb.Geofence.create(req.body).then((geofence) => {
                if(!geofence){
                    return next(
                        new restify.ResourceNotFoundError("Erro ao salvar cerca.")
                    );
                }
                return server.mongodb.Geofence.findOne({
                    _id: geofence.id,
                    companyId: req.query.companyId
                }).populate('devices').then((geofence) => {
                    if(!geofence){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                        );
                    }
                    return res.send(200, {
                        data: geofence
                    });
                }).catch((err) => {
                    return next(
                        new restify.InternalServerError({body:{
                            "code": err.name,
                            "message": err.message,
                            "detailed": err
                        }})
                    );
                });
            }).catch((err) => {
                return next(
                    new restify.InternalServerError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            });
        },
        updateOne: (req, res, next) => {
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            else{
                _.assign(req.body, {companyId: req.query.companyId});
            }
            if(_.has(req.body,"polygon")){
                const polygonCoordinates = req.body.polygon;
                _.assign(req.body, {
                    polygon: {
                        type: "Polygon",
                        coordinates: [polygonCoordinates]
                    }
                })
            }
            return server.mongodb.Geofence.update({
                _id: req.params.id,
                companyId: req.query.companyId
            }, {
                $set: req.body
            }).then((geofence) => {
                return server.mongodb.Geofence.findOne({
                    _id: req.params.id,
                    companyId: req.query.companyId
                }).populate('devices').then((geofence) => {
                    if(!geofence){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                        );
                    }
                    return res.send(200, {
                        data: geofence
                    });
                }).catch((err) => {
                    return next(
                        new restify.InternalServerError({body:{
                            "code": err.name,
                            "message": err.message,
                            "detailed": err
                        }})
                    );
                });
            }).catch((err) => {
                return next(
                    new restify.InternalServerError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            });
        },
        removeOne: (req, res, next) => {
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            server.mongodb.Geofence.deleteOne({
                _id: req.params.id,
                companyId: req.query.companyId
            }).then((geofence) => {
                if(!geofence){
                    return next(
                        new restify.ResourceNotFoundError("Erro ao remover cerca.")
                    );
                }
                return res.send(200, {
                    data: req.params.id
                });
            }).catch((err) => {
                return next(
                    new restify.InternalServerError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            });
        },
        checkPosition(req, res, next){
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            server.mongodb.Geofence.find({
                companyId: req.query.companyId,
                polygon:{
                    $not: {
                        "$geoIntersects": {
                            "$geometry": {
                                "type": "Point",
                                "coordinates": [parseFloat(req.params.latitude), parseFloat(req.params.longitude)]
                            }
                        }
                    }
                }
            }).then((geofences) => {
                if(!geofences){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: geofences
                });
            }).catch((err) => {
                return next(
                    new restify.InternalServerError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            });
        }
    }
};