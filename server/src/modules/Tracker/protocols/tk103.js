const log = new require('pretty-logger')();

module.exports = class TK103 {
    constructor(rootServer,{server}){
        server.get('/',function respond(req, res, next) {
            return res.send(200, {
                message: "TK103 protocol working..."
            });
        });
    };
};