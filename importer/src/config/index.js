const packageJSON = require('../../package.json')
const utils = require('../utils/index')
const path = require('path')



module.exports = {
    mainServer: {
        port: 8080,
        debug: {
            protocols: false
        },
        version: packageJSON.version
    },
    requestBoard: {
        defaultPosition: 65535
    },
    database: {
        dialect: 'mysql',
        host: 'localhost',
        dbName: 'gestaon-dev',
        user: 'root',
        password: 'atrroot'
    },    
    databaseImporter: {
        dialect: 'mysql',
        host: 'localhost',
        dbName: 'gestaoazul-azzu',
        user: 'root',
        password: 'atrroot'
    },
    elasticSearch: {
        host: 'localhost',
        port: 9200,
        requestTimeout: 5000
    }
};
