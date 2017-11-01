const log = new require('pretty-logger')();

module.exports = class GT06 {
    constructor(rootServer,{server}){
        server.get('/',function respond(req, res, next) {
            return res.send(200, {
                message: "GT06 protocol working..."
            });
        });
    };
};