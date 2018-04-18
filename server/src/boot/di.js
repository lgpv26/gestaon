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

    setSocketIO(){
        this.server.io = require('socket.io')(this.server.server, {
            pingInterval: 3000,
            pingTimeout: 8000
        })
        this.server.io.sockets.setMaxListeners(0)
        return this.server.io
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

    setVersion(){
        this.server.version = require('../../package.json').version
        return this.server.version
    }

}