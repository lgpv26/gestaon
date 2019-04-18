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
            server.mongodb.Device.find({
                companyId: req.query.companyId
            }).exec().then(x => JSON.parse(JSON.stringify(x))).then((devices) => {
                if(!devices){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                let deviceLastPositionsPromises = [];
                devices.forEach(function(device){
                    let deferred = Q.defer();
                    deviceLastPositionsPromises.push(deferred.promise);
                    server.mongodb.Position.find({ deviceCode: device.code })
                    .sort({'generatedAt': -1})
                    .limit(5)
                    .exec().then(x => JSON.parse(JSON.stringify(x))).then((positions) => {
                        device['positions'] = positions;
                        deferred.resolve(device);
                    }).catch((err) => {
                        deferred.reject();
                    });
                });
                Q.all(deviceLastPositionsPromises).then((devices) => {
                    return res.send(200, {
                        data: devices
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
            server.mysql.Device.findOne({
                where: {
                    id: req.params.id,
                    companyId: req.query.companyId
                }
            }).then((device) => {
                if(!device){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                server.mongodb.Position.find({ deviceCode: device.code })
                    .sort({'generatedAt': -1})
                    .limit(5)
                    .exec().then(x => JSON.parse(JSON.stringify(x))).then((positions) => {
                    device['positions'] = positions;
                    return res.send(200, {
                        data: device
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
            if(!_.has(req.body, 'code') || (req.body.code === '' || req.body.code === null)){
                _.assign(req.body, {code: utils.createId()});
            }
            server.mongodb.Device.create(req.body).then((device) => {
                device['positions'] = [];
                return res.send(200, {
                    data: device
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
            server.mongodb.Device.update({_id: req.params.id, companyId: req.query.companyId}, {$set: req.body}).then((device) => {
                if(!device){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: device
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
            server.mongodb.Device.findOneAndRemove({_id: req.params.id, companyId: req.query.companyId}).exec().then((device) => {
                if(!device){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return server.mongodb.Position.find({ deviceCode: device.code }).remove().exec().then((positions) => {
                    return res.send(200, {
                        data: device
                    });
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
        sendCommand(req, res, next){
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            server.mongodb.Device.findOne({_id: req.params.id, companyId: req.query.companyId}).then((device) => {
                server.mongodb.Event.create({
                    deviceCode: device.code,
                    type: 'command_sent',
                    data: ''
                }).exec().then((event) => {
                    return res.send(200, {
                        data: event
                    });
                })
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
