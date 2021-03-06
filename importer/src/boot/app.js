// imports
const config = require('../config/index')
const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')
const PrettyLogger = require('pretty-logger'), log = new PrettyLogger()

// in-source imports
const { BootError } = require('~errors')

// dependency injection initialization
const DI = require('./di')
const di = new DI(restify.createServer())

// overall setup
di.setElasticSearch()
di.setSequelize()
di.setSequelizeImporter() // IMPORTER
di.setVersion()
di.setOAuth2()
di.setMoleculer()
di.setFCM()

// configure CORS
const cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['X-Requested-With', 'Authorization', 'Content-type']
})
di.server.pre(cors.preflight)
di.server.use(cors.actual)

// configure Restify plugins
di.server.use(restify.plugins.acceptParser(di.server.acceptable))
di.server.use(restify.plugins.queryParser())
di.server.use(restify.plugins.bodyParser())
di.server.use(restify.plugins.gzipResponse())

// attach models to di.server
di.attachModels('mysql') // attached to di.server.mysql.{modelName}

// attach models to di.server
di.attachModels('importer') // attached to di.server.importer.{modelName}

// loading all http request routes
log.info("Loading routes")
require('../routes')(di.server)

// try to connect to MySQL and create database if it was not found
const connectToMySQL = new Promise((resolve, reject) => {
    const mysqlConnection = require('mysql').createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password
    })
    let databaseCreated = false;
    mysqlConnection.connect((err) => {
        if(err) return reject(err);
        mysqlConnection.query("CREATE DATABASE `" + config.database.dbName + "`;", function (err) {
            if(err){
                return resolve(databaseCreated);
            }
            log.warning("Database not found. Database \"" + config.database.dbName + "\" created.")
            databaseCreated = true;
            resolve(databaseCreated)
        })
    })
})

// load services (Moleculer)
di.server.broker.createService(require('../services/data/user.service')(di.server))
di.server.broker.createService(require('../services/data/call.service')(di.server))
di.server.broker.createService(require('../services/data/request.service')(di.server))
di.server.broker.createService(require('../services/data/import.service')(di.server))
di.server.broker.createService(require('../services/data/client.service')(di.server))
di.server.broker.createService(require('../services/data/product.service')(di.server))
di.server.broker.createService(require('../services/data/client-group.service')(di.server))
di.server.broker.createService(require('../services/data/custom-field.service')(di.server))
di.server.broker.createService(require('../services/data/account.service')(di.server))
di.server.broker.createService(require('../services/data/promotion-channel.service')(di.server))
di.server.broker.createService(require('../services/data/address.service')(di.server))
di.server.broker.createService(require('../services/data/payment-method.service')(di.server))

di.server.broker.createService(require('../services/importer/index.service')(di.server))

di.server.broker.createService(require('../services/importer/import.service')(di.server))
di.server.broker.createService(require('../services/importer/marcos.service')(di.server))


// starts callback chain until server starts, or shutdown if the procedure fails
di.server.broker.start().then(() => {
    connectToMySQL.then((databaseCreated) => {
        di.server.elasticSearch.ping({
            requestTimeout: config.elasticSearch.requestTimeout
        }, function (error) {
            if (error) {
                console.log(new BootError('ElasticSearch is down!'))
            } else {
                log.info('ElasticSearch is running')
                // guarantee MySQL structure
                return di.server.sequelize.sync({
                    logging: false
                }).then(() => {
                    log.info("Successfully connected to MySQL");
                    return new Promise((resolve, reject) => {
                        if(databaseCreated){
                            return require("~utils/first-seed.js")(di.server).then(() => {
                                resolve()
                            }).catch((err) => {
                                reject(err)
                            });
                        }
                        return resolve()
                    }).then(() => {
                        // finally, initialize di.server
                        di.server.listen(config.mainServer.port, () => {
                            log.info("Importer v" + config.mainServer.version + " running on port: " + config.mainServer.port)
                        })
                    })
                }).catch((err) => {
                    console.log(new BootError(err.message + " (" + err.name + ")"))
                })
            }
        })
    })
}).catch((err) => {
    console.log(new BootError(err.message + " (" + err.name + ")"))
})