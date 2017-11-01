const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getOne: (req, res, next) => {
            server.models.ClientPhone.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((clientPhone) => {
                if(!clientPhone){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: clientPhone
                });
            });
        },
        saveMultiple: (req, res, next) => {

            let clientPhones = _.map(req.body.clientPhones, x => _.extend({id: req.params.id}, x));

            server.models.ClientPhone.bulkCreate(clientPhones,{
                updateOnDuplicate: ['clientId','name']
            }).then((response) => {
                server.models.Client.findOne({
                    where: {
                        id: req.params.id,
                        status: 'activated'
                    },
                    include: [{
                        model: server.models.ClientPhone,
                        as: 'clientPhones',
                        include: [{
                            model: server.models.Phone,
                            as: 'phone'
                        }]
                    }]
                }).then((client) => {

                    if(!client){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                        );
                    }

                    let clientPhones = _.map(client.clientPhones, clientPhone => {
                        return {
                            ddd: clientPhone.ddd,
                            number: clientPhone.number
                        };
                    });

                    server.elasticSearch.update({
                        index: 'main',
                        type: 'client',
                        id: client.id,
                        body: {
                            doc: {
                                phones: clientPhones
                            }
                        }
                    }, function (esErr, esRes){
                        return res.send(200, {
                            data: client
                        });
                    })

                });
            }).catch(function(error){
                console.error(error);
                return next(
                    new restify.ResourceNotFoundError(error)
                );
            });
        }
    }
};
