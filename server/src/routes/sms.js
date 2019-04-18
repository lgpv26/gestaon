module.exports = (server, restify) => {

    server.post('/sms', (req, res, next) => {
        return server.mongodb.Event.findOne({
            smsId: req.body.id_dongle
        }).exec((err, event) => {
            if(err){
                console.log(err);
                return next(
                    new restify.InternalServerError({body:{
                        "code": err.name,
                        "message": err.message,
                        "detailed": err
                    }})
                );
            }
            if(!event){
                return next(
                    new restify.InternalServerError("Evento não encontrado")
                );
            }
            event.smsReplies.push(req.body.msg);
            return event.save().then((event) => {
                return res.send(200, {
                    data: event
                });
            });
        });
    });

};
