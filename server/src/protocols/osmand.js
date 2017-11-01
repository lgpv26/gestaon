const Protocol = require('./Protocol');
const moment = require('moment');
const log = new require('pretty-logger')();
const _ = require('lodash');
const config = require('../config');
const utils = require('../utils');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');

module.exports = class OSMAND extends Protocol {

    constructor(server, protocol){

        super(server, protocol);

        this.server = server;

        // create restify server
        let protocolServer = restify.createServer({
            name: protocol.name
        });

        /* configure cors */
        const cors = corsMiddleware({
            origins: ['*'],
            allowHeaders: ['X-Requested-With', 'Authorization', 'Content-type']
        });

        protocolServer.pre(cors.preflight);
        protocolServer.use(cors.actual);

        /* configuring restify plugins */
        protocolServer.use(restify.acceptParser(protocolServer.acceptable));
        protocolServer.use(restify.queryParser());
        protocolServer.use(restify.bodyParser());
        protocolServer.use(restify.gzipResponse());

        protocolServer.post('/', (req, res, next) => {

            const position = {
                position: {
                    deviceCode: req.params.id,
                    isActive: true,
                    isAccOn: false,
                    latitude: req.params.lat,
                    longitude: req.params.lon,
                    speed: (parseInt(req.params.speed, 10) * 1.85).toFixed(2),
                    bearing: req.params.bearing,
                    altitude: req.params.altitude,
                    battery: req.params.batt,
                    generatedAt: new Date(parseInt(req.params.timestamp) * 1000)
                },
                options: {
                    shouldBroadcast: true
                }
            };

             return super.savePosition(position).then((data) => {
                 return res.send(200, {
                    data
                 });
             }).catch((err) => {
                 return next(
                     new restify.InternalServerError({body:{
                         "code": 'ERROR_ON_POSITION_SAVE',
                         "message": 'Error on saving position(s).'
                     }})
                 );
             });
        });

        protocolServer.listen(protocol.port, () => {
            log.info(protocol.name.toUpperCase() + ' listening on port: ' + protocol.port);
        });

    };

};