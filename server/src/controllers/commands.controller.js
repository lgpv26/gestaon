const utils = require('../utils/index');
const axios = require('axios');
const _ = require('lodash');
const Q = require('q');

module.exports = (server, restify) => {
    return {
        createOne: (req, res, next) => {
            if(!_.has(req.query, 'companyId')){
                return next(
                    new restify.InternalServerError({body:{
                        "code": 'MISSING_COMPANY',
                        "message": 'Missing companyId parameter.'
                    }})
                );
            }
            return server.mongodb.Device.findOne({_id: req.params.id, companyId: req.query.companyId}).then((device) => {
                if(!device){
                    return next(
                        new restify.ResourceNotFoundError("Dispositivo não encontrado.")
                    );
                }
                const command = commandParser(device.protocol, req.body.command);
                if(!command){
                    return next(
                        new restify.ResourceNotFoundError("Comando inexistente para o protocolo do dispositivo.")
                    );
                }
                if(!device.phoneNumber || (device.phoneNumber.length !== 10 && device.phoneNumber.length !== 11)){
                    return next(
                        new restify.ResourceNotFoundError("O dispositivo não possui número associado.")
                    );
                }
                return axios.get('http://1002.dynu.net/apisms/apisms.php?number=' + device.phoneNumber + '&msg=' + command + '&token=sdfjbu726hdgYGYG7tG977fUH9ygt654ESEXUT').then(({data}) => {
                    const sms = data;
                    if(sms.status !== "success" || !sms.id){
                        return next(
                            new restify.ResourceNotFoundError("Não foi possível enviar o SMS.")
                        );
                    }
                    return server.mongodb.Event.create({
                        companyId: req.query.companyId,
                        deviceCode: device.code,
                        type: 'command',
                        smsId: sms.id,
                        smsReplies: [],
                        data: command
                    }).then((event) => {
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
                }).catch((error) => {
                    console.log(error);
                    return next(
                        new restify.ResourceNotFoundError("Erro.")
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
        }
    };
    function commandParser(protocol, command){
        switch(protocol){
            case "gps103":
                switch(command){
                    case "status":
                        return "check123456";
                        break;
                }
                break;
            case "tlt2h":
                switch(command){
                    case "status":
                        return "*GTAS#0000##";
                        break;
                }
                break;
            case "osmand":
                switch(command){
                    case "test":
                        return "TEST SMS SENT.";
                        break;
                }
                break;
        }
        return false;
    }
};
