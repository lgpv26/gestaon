import config from '~server/config'
import _ from 'lodash'

module.exports = class DependencyInjection {

    constructor(server){
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

    setFCM(){
        const FCM = require('fcm-push')
        this.server.fcm = new FCM('AAAAZ0yr-pI:APA91bGSFvvNFBC3wL0fkyjtrZYu592dvCU10-6tqMTm2-5PZLUQcksnhZ8LYU0LaVxEgREU3FVxPh2_BOzt-mFkZ1nXgU5UcG8p838HiUSSYPDMkTVypS3EC37JIhcLI6XOL5GllczZ')
        return this.server.fcm
    }

    setY(){
    }

    setElasticSearch(){
        this.server.elasticSearch = new require('elasticsearch').Client({
            host: config.elasticSearch.host + ':' + config.elasticSearch.port
        })
        return this.server.elasticSearch
    }

    setSequelize(){
        const Sequelize = require('sequelize')
        this.server.sequelize = new Sequelize(config.database.dbName, config.database.user, config.database.password, {
            logging: false,
            host: config.database.host,
            dialect: config.database.dialect,
            operatorsAliases: false
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