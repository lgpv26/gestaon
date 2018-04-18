const utils = require('../utils/index');
const _ = require('lodash');
const Q = require('q');

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
            server.mongodb.Event.find({
                companyId: req.query.companyId
            }).sort({_id: -1}).exec().then((events) => {
                if(!events){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: events
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
        filter: (req, res, next) => {
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            if(!_.has(req.body,"deviceId") || !req.body.deviceId){
                return next(
                    new restify.ResourceNotFoundError("Você deve informar um dispositivo.")
                );
            }
            return server.mongodb.Device.findOne({
                _id: req.body.deviceId
            }).exec().then((device) => {
                server.mongodb.Event.find({
                    companyId: req.query.companyId,
                    deviceCode: device.code
                }).sort({_id: -1}).populate('alarmGeofence').exec().then((events) => {
                    if(!events){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                        );
                    }
                    return res.send(200, {
                        data: events
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
                next(err);
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
            server.mongodb.Event.findOne({
                _id: req.params.id,
                companyId: req.query.companyId
            }).exec().then((event) => {
                if(!event){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: event
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
            server.mongodb.Event.create(req.body).then((event) => {
                return res.send(200, {
                    data: event
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
            server.mongodb.Event.update({_id: req.params.id, companyId: req.query.companyId}, {$set: req.body}).then((event) => {
                if(!event){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: event
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
            server.mongodb.Event.findOneAndRemove({_id: req.params.id, companyId: req.query.companyId}).exec().then((event) => {
                if(!event){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: event
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
    };

    /* -------------------------------------- */
    /* --- Reusable request functions ------------------------------------------
    /* -------------------------------------- */

    function saveSettings(req, res, next){
        return new Promise((resolve, reject) => {
            let deviceSettings = [];
            _.forIn(req.body.deviceSettings, (value, name) => {
                deviceSettings.push({
                    name: name,
                    value: value
                });
            });
            deviceSettings = _.map(deviceSettings, deviceSetting => _.extend({
                deviceId: parseInt(req.params.id)
            }, deviceSetting));
            server.mysql.DeviceSetting.bulkCreate(deviceSettings, {
                updateOnDuplicate: ['name','value']
            }).then((response) => {
                server.mysql.Device.findOne({
                    where: {
                        id: parseInt(req.params.id),
                        status: 'activated'
                    },
                    include: [{
                        model: server.mysql.DeviceSetting,
                        as: 'deviceSettings'
                    }]
                }).then((device) => {
                    if(!device){
                        reject(new restify.ResourceNotFoundError("Dispositivo não encontrado."));
                    }
                    else {
                        resolve(device);
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
