const config = require('./config');
const utils = require('./utils');
const path = require('path');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const consign = require('consign');
const log = new require('pretty-logger')();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const _ = require('lodash');

// create restify server
let server = restify.createServer({
    name: 'agiliza.me'
});

// initialize socket.io
server['io'] = require('socket.io')(server.server, {
    pingInterval: 3000,
    pingTimeout: 8000
});

// elastic search
const elasticSearch = new require('elasticsearch').Client({
    host: config.elasticSearch.host + ':' + config.elasticSearch.port
});

// sequelize
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database.dbName, config.database.user, config.database.password, {
    logging: false,
    host: config.database.host,
    dialect: config.database.dialect
});

/* set package version to server di */
server['version'] = require('../package.json').version;

/* configure cors */
const cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['X-Requested-With', 'Authorization', 'Content-type']
});

server.pre(cors.preflight);
server.use(cors.actual);

/* set instances to make globally available */
server['sequelize'] = sequelize;
server['elasticSearch'] = elasticSearch;

/* configuring restify plugins */
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.gzipResponse());

// if x-www-form-urlencoded
server.use(function(req, res, next) {
    if(_.has(req.headers, 'content-type')){
        const contentTypeArr = req.headers['content-type'].split(';').map((contentType) => {
            return contentType.trim();
        });
        contentTypeArr.forEach((contentType) => {
            if(contentType === 'application/x-www-form-urlencoded'){
                req.body = req.params;
            }
        });
    }
    return next();
});

// load MongoDB/Mongoose models
server['mongodb'] = require('./models/mongodb')(mongoose);

// load MySQL/Sequelize models
server['models'] = require('./models/mysql')(Sequelize, sequelize);

// clients connected to real-time features
server.io.on('connection', (socket) => {
    let token = socket.handshake.query.token, user;
    server.models.UserAccessToken.findOne({
        where: {
            accessToken: token
        },
        include: [
            {
                model: server.models.User,
                as: 'user',
                include: [
                    {
                        model: server.models.Company,
                        as: 'companies'
                    }
                ]
            }
        ]
    }).then((userAccessToken) => {
        user =  userAccessToken.user;
        user.companies.forEach((company) => {
            server.mongodb.Device.find({
                companyId: company.id
            }).exec().then((devices) => {
                devices.forEach((device) => {
                    // console.log(user.name + " connected to room: " + 'device/' + device.code);
                    socket.join('device/' + device.code);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    });
    socket.on('join-device-room', (deviceCode) => {
        // console.log(user.name + " joins device/" + deviceCode + ".");
        socket.join('device/' + deviceCode);
    });
    socket.on('leave-device-room', (deviceCode) => {
        // console.log(user.name + " leaves device/" + deviceCode + ".");
        socket.leave('device/' + deviceCode);
    });
});

// OAuth server
server['oAuth2'] = require('./models/oauth2')(server);

// loading all api routes
log.info("Loading routes");
require('./routes')(server, restify, sequelize);

// verify if ElasticSearch is running
elasticSearch.ping({
    requestTimeout: config.elasticSearch.requestTimeout
}, function (error) {
    if (error) {
        log.error('ElasticSearch is down!');
    } else {
        log.info('ElasticSearch is running');
    }
});

// initialize tracker protocols
config.protocols.forEach((protocol) => {
    protocol['instance'] = new (require('./protocols/' + protocol.name))(server,protocol);
});

// connect to MySQL
sequelize.sync({
    logging: false
}).then(() => {
    log.info("Successfully connected to MySQL");
}, (err) => {
    log.error(err.message + " (" + err.name + ")");
}).then(() => {
    // connect to MongoDB
    mongoose.connect('mongodb://' + config.mongoDb.host + '/'+ config.mongoDb.dbName, function(err) {
        if (err) {
            log.error(err.message + " (" + err.name + ")");
        }
        else{
            log.info("Successfully connected to MongoDB");
            // finally, initialize server
            const serverPort = config.mainServer.port;
            server.listen(serverPort, () => {
                log.info("Server v" + config.mainServer.version + " running on port: " + serverPort);
            });
        }
    });
});
