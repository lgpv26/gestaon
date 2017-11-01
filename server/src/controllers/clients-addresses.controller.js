const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getOne: (req, res, next) => {
            server.models.ClientAddress.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                },
                include: [
                    {
                        model: server.models.Address,
                        as: 'address'
                    },
                    {
                        model: server.models.Client,
                        as: 'client',
                        include: [{
                            model: server.models.ClientPhone,
                            as: 'clientPhones'
                        },{
                            model: server.models.ClientAddress,
                            as: 'clientAddresses',
                            include: [
                                {
                                    model: server.models.Address,
                                    as: 'address'
                                }
                            ]
                        }]
                    }
                ]
            }).then((clientAddress) => {
                if(!clientAddress){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: clientAddress
                });
            });
        }
    }
};
