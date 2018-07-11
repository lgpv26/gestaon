// imports
const config = require('../config/index')

/*const PrettyLogger = require('pretty-logger'), log = new PrettyLogger()*/
const mongoose = require('mongoose')
const bluebird = require('bluebird')
const chalk = require('chalk')
const log = console.log

// in-source imports
const { BootError } = require('~errors')
// dependency injection initialization
const DI = require('./di')
const di = new DI()

// overall setup
di.setInnkeeper()
di.setFirebaseAdmin()
di.setSocketIO()
di.setElasticSearch()
di.setSequelize()
di.setVersion()
di.setOAuth2()
di.setMoleculer()
di.setFCM()
di.setGoogleApi()

// attach models to di.server
di.attachModels('mongodb') // attached to di.server.mongodb.{modelName}
di.attachModels('mysql') // attached to di.server.mysql.{modelName}
di.attachModels('draft-form','','models') // attached to server.draftFormModels.{modelName}

// loading all sockets
log(chalk.gray("Loading sockets"))
const Socket = require('../events')
new Socket(di.server)

// loading all http request routes
log(chalk.gray("Loading routes"))
require('../routes')(di.server)

// initialize tracker protocols
/*
config.protocols.forEach((protocol) => {
    protocol['instance'] = new (require('../modules/Tracker/protocols/' + protocol.name))(di.server, protocol)
})
*/

// try to connect to MySQL and create database if it was not found
const connectToMySQL = new Promise((resolve, reject) => {
    const mysqlConnection = require('mysql').createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password
    })
    let databaseCreated = false
    mysqlConnection.connect((err) => {
        if(err) return reject(err)
        mysqlConnection.query("CREATE DATABASE `" + config.database.dbName + "`;", function(err){
            mysqlConnection.end(function(connectionReleaseError) {
                log(chalk.magenta("Connection check ended and released"))
                if(err){
                    log(chalk.blue("Using existent " + chalk.black.bold.bgBlue(" " + config.database.dbName + " ") + " MySQL database"))
                    return resolve(databaseCreated)
                }
                log(chalk.yellow("MySQL database " + chalk.black.bold.bgYellow(" " + config.database.dbName + " ") + " created"))
                databaseCreated = true
                resolve(databaseCreated)
            })
        })
    })
})

// load services (Moleculer)
di.server.broker.createService(require('../services/auth.service')(di.server))
di.server.broker.createService(require('../services/request-board.service')(di.server))
di.server.broker.createService(require('../services/push-notification.service')(di.server))
di.server.broker.createService(require('../services/cashier-balancing.service')(di.server))

di.server.broker.createService(require('../services/data/user.service')(di.server))
di.server.broker.createService(require('../services/data/call.service')(di.server))
di.server.broker.createService(require('../services/data/request.service')(di.server))
di.server.broker.createService(require('../services/data/client.service')(di.server))
di.server.broker.createService(require('../services/data/product.service')(di.server))
di.server.broker.createService(require('../services/data/client-group.service')(di.server))
di.server.broker.createService(require('../services/data/custom-field.service')(di.server))
di.server.broker.createService(require('../services/data/account.service')(di.server))
di.server.broker.createService(require('../services/data/promotion-channel.service')(di.server))
di.server.broker.createService(require('../services/data/address.service')(di.server))
di.server.broker.createService(require('../services/data/payment-method.service')(di.server))
di.server.broker.createService(require('../services/data/transaction.service')(di.server))
di.server.broker.createService(require('../services/data/mobile.service')(di.server))
di.server.broker.createService(require('../services/data/bills.service')(di.server))

di.server.broker.createService(require('../services/draft/index.service')(di.server))

di.server.broker.createService(require('../services/draft/request/persistence.service')(di.server))
di.server.broker.createService(require('../services/draft/request/recoverance.service')(di.server))

di.server.broker.createService(require('../services/draft/client/persistence.service')(di.server))
di.server.broker.createService(require('../services/draft/client/recoverance.service')(di.server))

if(process.env.NODE_ENV === 'production'){
    log(chalk.blue('Starting production server'))
}
else{
    log(chalk.blue('Starting development server'))
}

// starts callback chain until server starts, or shutdown if the procedure fails
di.server.broker.start().then(() => {
    connectToMySQL.then((databaseCreated) => {
        di.server.elasticSearch.ping({
            requestTimeout: config.elasticSearch.requestTimeout
        }, function (error) {
            if (error) {
                log(chalk.red(new BootError('ElasticSearch is down!')))
            } else {
                log(chalk.green('Successfully connected to ElasticSearch server'))
                // guarantee MySQL structure
                return di.server.sequelize.authenticate({
                    logging: false
                }).then(() => {
                    log(chalk.green("Successfully connected to MySQL server"));
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

                        mongoose.Promise = bluebird
                        let mongoDbCredentials = {}
                        if(process.env.NODE_ENV === 'production'){
                            mongoDbCredentials = {
                                auth: {
                                    user: config.mongoDb.user,
                                    password: config.mongoDb.password
                                }
                            }
                        }
                        return mongoose.connect('mongodb://' + config.mongoDb.host + '/'+ config.mongoDb.dbName, {
                            promiseLibrary: bluebird,
                            ...mongoDbCredentials
                        }).then(() => {
                            log(chalk.green("Successfully connected to MongoDB server"))
                            // finally, initialize di.server
                            di.server.listen(config.mainServer.port, () => {
                                log(
                                    chalk.blue(
                                        "Server " +
                                        chalk.black.bold.bgBlue(" v" + config.mainServer.version + " ") +
                                        " running on port: " +
                                        chalk.black.bold.bgBlue(" " + config.mainServer.port + " ")
                                    )
                                )
                            })
                        })
                    })
                }).catch((err) => {
                    log(new BootError(err.message + " (" + err.name + ")"))
                })
            }
        })
    })
}).catch((err) => {
    log(new BootError(err.message + " (" + err.name + ")"))
})