var fs = require('fs')

module.exports = function(server, restify){

    /* import all route files */

    let routeFiles = [
        "clients-addresses.js","clients-phones.js",
        "services.js","addresses.js","clients.js",
        "companies.js","devices.js","import.js",
        "positions.js","service.js","users.js",
        "products.js","oauth.js", "sms.js",
        "geofences.js", "events.js", "orders.js",
        "suppliers.js", "drafts.js", "custom-fields.js",
        "clients-group.js"
    ]; // "main-search.js",

    routeFiles.forEach(function(fileName) {
        // Ignore this file and invalid ones
        if(fileName === 'index.js' || fileName.substr(0, 1) === '.' || fileName.substr(0, 1) === '_') {
            return;
        }
        // Require all files inside this directory
        require('./' + fileName)(server, restify)
    });

    /* uncategorized endpoints */

    server.get('/version', function(req, res, next){
        return res.send(200, {
            version: server.version
        });
    });

};
