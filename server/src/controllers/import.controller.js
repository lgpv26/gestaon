const _ = require('lodash');
const Q = require('q');

module.exports = (server, restify) => {
    return {
        importAddresses: (req, res, next) => {

            /*
            server.models.Enderecos.findAll({

                limit: 5000
            }).then((response) => {

                if(!response){
                    return next(
                        new restify.ResourceNotFoundError("Nenhum dado encontrado.")
                    );
                }

                let promises = [];

                response.forEach((endereco, index)=>{

                    let deferred = Q.defer();
                    promises.push(deferred.promise);

                    server.models.Address.create({
                        originId: endereco.id,
                        name: endereco.logradouro + " " + endereco.rua,
                        neighborhood: endereco.bairro,
                        city: endereco.cidade,
                        state: endereco.estado,
                        cep: endereco.cep
                    }).then((result) => {

                        if(!result){
                            console.log("error at index: ", index);
                            deferred.reject();
                        }
                        else {
                            console.log("inserted index: ", index);
                            deferred.resolve();
                        }

                    });
                });

                Q.all(promises).then(function(){
                    return res.send(200, {
                        data: "finished"
                    });
                });

            }
            */

        }
    }
};
