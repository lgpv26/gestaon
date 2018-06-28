import config from '~server/config'
import _ from 'lodash'

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

    setElasticSearch(){
        this.server.elasticSearch = new require('elasticsearch').Client({
            host: config.elasticSearch.host + ':' + config.elasticSearch.port
        })
        return this.server.elasticSearch
    }

    setGoogleApi(){
        this.server.googleMaps = require('@google/maps').createClient({
            key: 'AIzaSyAWi3eGS7ziCHGh264uVstGZTm-lve3XWs',
            Promise: Promise
        })
        return this.server.googleMaps
    }

    setSequelize(){
        const Sequelize = require('sequelize')
        this.server.sequelize = new Sequelize(config.database.dbName, config.database.user, config.database.password, {
            logging: false,
            host: config.database.host,
            dialect: config.database.dialect,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        })
        
        return this.server.sequelize
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

}