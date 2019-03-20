import config from '~server/config'
import _ from 'lodash'
import fs from 'fs'
import path from 'path'

const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')

module.exports = class DependencyInjection {

    constructor(){
        const server = restify.createServer()

        // configure CORS
        const cors = corsMiddleware({
            origins: ['*'],
            allowHeaders: ['X-Requested-With', 'Authorization', 'Content-type', 'Accept']
        })
        server.pre(cors.preflight)
        server.use(cors.actual)

        // configure Restify plugins
        server.use(restify.plugins.acceptParser(server.acceptable))
        server.use(restify.plugins.queryParser())
        server.use(restify.plugins.bodyParser())
        server.use(restify.plugins.gzipResponse())

        this.server = server
    }

    attachModels(type, prefix = '', sufix = ''){
        const modelType = _.camelCase(prefix + "_" + type + "_" + sufix)
        this.server[modelType] = require(`../models/${type}/index`)(this.server)
    }

    setInnkeeper(){
        const Innkeeper = require('../modules/Innkeeper')
        this.server.innkeeper = new Innkeeper()
    }

    setSocketIO(){
        this.server.io = require('socket.io')(this.server.server, {
            pingInterval: 3000,
            pingTimeout: 8000
        })
        this.server.io.sockets.setMaxListeners(0)
        const redisAdapter = require('socket.io-redis')
        
        this.server.io.adapter(redisAdapter({ host: config.redis.host, port: config.redis.port }))

        return this.server.io
    }

    setFirebaseAdmin(){
        const firebaseAdmin = require('firebase-admin')
        const serviceAccount = require('../../firebase-sak.json')
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount),
            databaseURL: 'https://gestaon-396ca.firebaseio.com'
        })
        this.server.firebaseAdmin = firebaseAdmin
        return this.server.firebaseAdmin
    }

    setFCM(){
        const FCM = require('fcm-push')
        this.server.fcm = new FCM('AAAAZ0yr-pI:APA91bGSFvvNFBC3wL0fkyjtrZYu592dvCU10-6tqMTm2-5PZLUQcksnhZ8LYU0LaVxEgREU3FVxPh2_BOzt-mFkZ1nXgU5UcG8p838HiUSSYPDMkTVypS3EC37JIhcLI6XOL5GllczZ')
        return this.server.fcm
    }

    setGoogleApi(){
        this.server.googleMaps = require('@google/maps').createClient({
            key: 'AIzaSyAWi3eGS7ziCHGh264uVstGZTm-lve3XWs',
            Promise: Promise
        })
        return this.server.googleMaps
    }

    gpsProtocols() {
        return new Promise ((resolve, reject) => {
            let promises = []
            config.protocols.forEach((protocol) => {
                promises.push(protocol['instance'] = new (require('../modules/Tracker/protocols/' + protocol.name))(this.server, protocol))
            }) 
            return Promise.all(promises)
            .then(() => {
                return resolve()
            })
        })        
    }

    initializeSentry(){
        const Sentry = require('@sentry/node')
        Sentry.init({ dsn: 'https://f51d206d28ea4d01b89bb2b22131f6ba@sentry.io/1419760' })
    }

    setSequelize(){
        const Sequelize = require('sequelize')
        const clsHooked = require('cls-hooked')
        this.server.clsNamespace = clsHooked.createNamespace('gestaOn')
        Sequelize.useCLS(this.server.clsNamespace)
        this.server.sequelize = new Sequelize(config.database.dbName, config.database.user, config.database.password, {
            logging: false,
            host: config.database.host,
            pool: {
                min: 0,
                max: 50,
                idle: 20000,
                acquire: 40000,
                evict: 20000,
                handleDisconnects: true
            },
            dialect: config.database.dialect
        })
        
        return this.server.sequelize
    }

    setRedis() {
        const Redis = require('ioredis')
        // load Redis
        if(config.redis.active){
            this.server.redisClient = new Redis({
                port: config.redis.port,          // Redis port
                host: config.redis.host,                // Redis host
              })
        }
    }

    setRSMQ(){
        const RedisSMQ = require("rsmq-promise")
        this.server.rsmq = new RedisSMQ( {client: this.server.redisClient} )
    }

    setOAuth2(){
        this.server.oAuth2 = require('../modules/OAuth2/index')(this.server)
        return this.server.oAuth2
    }

    setMoleculer(){
        const { ServiceBroker } = require("moleculer");
        this.server.broker = new ServiceBroker({
            logger: false
        })
        return this.server.broker
    }

    setVersion(){
        this.server.version = require('../../package.json').version
        return this.server.version
    }

    cronJob(){
        this.server.jobs = {}
        this.server.cronJob = require('cron').CronJob

        const cronJobs = this.server.redisClient.scanStream({
            match: "cronJob:*"
        })

        cronJobs.on("data", (resultKeys) => {
            if (resultKeys.length) {
                resultKeys.forEach((key) => {
                    this.server.redisClient.get(key, async (err, cronJob) => {
                        cronJob = JSON.parse(cronJob)
                        key = key.substring(8,key.length)

                        const user = await this.server.mysql.User.findOne({
                            where: {
                                id: cronJob.triggeredBy,
                                status: 'activated'
                            },
                            attributes: { exclude: ["password"] }
                        })

                        this.server.broker.call("cronJob.createChatJob", {cronJobName: key, companyId: cronJob.companyId, triggeredBy: user})
                        this.server.broker.call("cronJob.start", {cronJobName: key})
                    })

                })
            }
        })
        
        return this.server.cronJob
    }

    brokerCreateService() {
        const vm = this
        return new Promise((resolve, reject) => {
            async function start(){
                    const indexPath = await fs.readdirSync(path.join(__dirname, '../services')).filter((fileName) => {
                        return fileName.substring(fileName.length, fileName.length-6) !== "BKP.js" && fileName.substring(fileName.length, fileName.length-3) == ".js"
                    }).map((file) => {
                        return "../services/" + file.substring(0, file.length-3)
                    })

                    const dataPath = await fs.readdirSync(path.join(__dirname, '../services/data')).filter((fileName) => {
                        return fileName.substring(fileName.length, fileName.length-6) !== "BKP.js"
                    }).map((file) => {
                        return "../services/data/" + file.substring(0, file.length-3)
                    })

                    let promises = []
                    _.concat(indexPath,dataPath).forEach((service) => {
                        promises.push(vm.server.broker.createService(require(service)(vm.server)))
                    })
                    

                    await Promise.all(promises)
                    resolve()                    
                }

            start()
        })
        // this.server.broker.createService(require('../services/auth.service')(this.server))
        // this.server.broker.createService(require('../services/request-board.service')(this.server))
        // this.server.broker.createService(require('../services/push-notification.service')(this.server))
        // this.server.broker.createService(require('../services/cashier-balancing.service')(this.server))
        // this.server.broker.createService(require('../services/socket.service')(this.server))

        // this.server.broker.createService(require('../services/data/user.service')(this.server))
        // this.server.broker.createService(require('../services/data/call.service')(this.server))
        // this.server.broker.createService(require('../services/data/request.service')(this.server))
        // this.server.broker.createService(require('../services/data/client.service')(this.server))
        // this.server.broker.createService(require('../services/data/product.service')(this.server))
        // this.server.broker.createService(require('../services/data/client-group.service')(this.server))
        // this.server.broker.createService(require('../services/data/custom-field.service')(this.server))
        // this.server.broker.createService(require('../services/data/account.service')(this.server))
        // this.server.broker.createService(require('../services/data/promotion-channel.service')(this.server))
        // this.server.broker.createService(require('../services/data/address.service')(this.server))
        // this.server.broker.createService(require('../services/data/payment-method.service')(this.server))
        // this.server.broker.createService(require('../services/data/transaction.service')(this.server))
        // this.server.broker.createService(require('../services/data/mobile.service')(this.server))
        // this.server.broker.createService(require('../services/data/bills.service')(this.server))
        // this.server.broker.createService(require('../services/data/finance.service')(this.server))
        // this.server.broker.createService(require('../services/data/request-queue.service')(this.server))
        // this.server.broker.createService(require('../services/data/request-order.service')(this.server))
        // this.server.broker.createService(require('../services/data/request-payments.service')(this.server))
        // this.server.broker.createService(require('../services/data/request-details.service')(this.server))

        // this.server.broker.createService(require('../services/draft/index.service')(this.server))

        // this.server.broker.createService(require('../services/draft/request/persistence.service')(this.server))
        // this.server.broker.createService(require('../services/draft/request/recoverance.service')(this.server))

        // this.server.broker.createService(require('../services/draft/client/persistence.service')(this.server))
        // this.server.broker.createService(require('../services/draft/client/recoverance.service')(this.server))
    }

}