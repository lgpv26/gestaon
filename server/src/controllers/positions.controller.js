const utils = require('../utils/index');
const _ = require('lodash');
const moment = require('moment');
const config = require('../config/index');
const axios = require('axios');

module.exports = (server, restify) => {
    return {
        getAll: (req, res, next) => {
            if(!_.has(req.body,"deviceId") || !req.body.deviceId){
                return next(
                    new restify.ResourceNotFoundError("Você deve informar um dispositivo.")
                );
            }
            return server.mongodb.Device.findOne({
                _id: req.body.deviceId
            }).exec().then((device) => {
                const q = server.mongodb.Position.find({
                    deviceCode: device.code
                });
                if(_.has(req.body, 'timeInterval')) {
                    switch (req.body.timeInterval) {
                        case "today":
                            const startOfToday = moment().startOf('day').toDate();
                            q.where('generatedAt').gte(startOfToday);
                            break;
                        case "onlyYesterday":
                            const startOfYesterday = moment().subtract(1,'days').startOf('day').toDate();
                            const endOfYesterday = moment().subtract(1,'days').endOf('day').toDate();
                            q.where('generatedAt').gte(startOfYesterday);
                            q.where('generatedAt').lte(endOfYesterday);
                            break;
                        case "lastHour":
                            const startOfLastHour = moment().subtract(1,'hours').toDate();
                            q.where('generatedAt').gte(startOfLastHour);
                            break;
                        case "threeHours":
                            const startOfLastThreeHours = moment().subtract(3,'hours').toDate();
                            q.where('generatedAt').gte(startOfLastThreeHours);
                            break;
                        case "sixHours":
                            const startOfLastSixHours = moment().subtract(6,'hours').toDate();
                            q.where('generatedAt').gte(startOfLastSixHours);
                            break;
                        case "twelveHours":
                            const startOfLastTwelveHours = moment().subtract(12,'hours').toDate();
                            q.where('generatedAt').gte(startOfLastTwelveHours);
                            break;
                        case "custom":
                            let initialInterval = moment().startOf('day');
                            let finalInterval = moment();
                            if(req.body.initialInterval){
                                initialInterval = moment(req.body.initialInterval);
                            }
                            if(req.body.finalInterval){
                                finalInterval = moment(req.body.finalInterval);
                            }
                            q.where('generatedAt').gte(initialInterval);
                            q.where('generatedAt').lte(finalInterval);
                            break;
                        default:
                            return next(
                                new restify.InternalServerError("Você deve selecionar um intervalo de tempo.")
                            );
                    }
                }
                q.sort('generatedAt');
                q.exec((err, positions) => {
                    if(!positions){
                        return next(
                            new restify.InternalServerError("Nenhuma coordenada encontrada. Tente mudar os filtros.")
                        );
                    }
                    return res.send(200, {
                        data: {
                            positions
                        }
                    });
                });
            }).catch((err) => {
                next(err);
            });
        }
    }
};
