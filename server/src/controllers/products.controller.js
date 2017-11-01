const _ = require('lodash');

module.exports = (server, restify) => {
    return {
        getAll: (req, res, next) => {
            server.models.Product.findAll().then((products) => {
                if(!products){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: products
                });
            });
        },
        getOne: (req, res, next) => {
            server.models.Product.findOne({
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((product) => {
                if(!product){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }
                return res.send(200, {
                    data: product
                });
            });
        },
        createOne: (req, res, next) => {
            let createData = _.assign(req.body, {});
            server.models.Product.create(createData,{}).then((product) => {
                if(!product){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: product
                });
            });
        },
        updateOne: (req, res, next) => {
            server.models.Product.update(req.body,{
                where: {
                    id: req.params.id,
                    status: 'activated'
                }
            }).then((product) => {
                if(!product){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                server.models.Product.findById(req.params.id, {
                    where: {
                        id: req.params.id,
                        status: 'activated'
                    }
                }).then((product) => {
                    if(!product){
                        return next(
                            new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                        );
                    }
                    return res.send(200, {
                        data: product
                    });
                })
            });
        },
        removeOne: (req, res, next) => {
            server.models.Product.destroy({
                where: {
                    id: req.params.id
                }
            }).then((product) => {
                if(!product){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum registro encontrado.")
                    );
                }
                return res.send(200, {
                    data: product
                });
            });
        }
    }
};
