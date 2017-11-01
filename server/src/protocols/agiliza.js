const Protocol = require('./Protocol');
const moment = require('moment');
const log = new require('pretty-logger')();
const _ = require('lodash');
const config = require('../config');
const utils = require('../utils');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');

module.exports = class AGILIZA extends Protocol {

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
            const device = req.body.device;
            const positions = _.map(req.body.location, (position) => {
                if(protocol.debug) console.log(position);
                let altitude, speed, bearing;
                (position.coords.heading < 0) ? bearing = 0 : bearing = 1;
                (position.coords.altitude < 0) ? altitude = 0 : altitude = 1;
                (position.coords.speed < 0) ? speed = 0 : speed = 1;
                return {
                    position: {
                        deviceCode: 'TEST01',
                        isActive: true,
                        isAccOn: false,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        speed: speed,
                        bearing: bearing,
                        battery: position.battery.level * 100,
                        altitude: altitude,
                        generatedAt: moment(moment.utc(position.timestamp)).toDate()
                    },
                    options: {
                        shouldBroadcast: true
                    }
                }
            });

            if(positions.length === 1){
                return super.savePosition(positions[0]).then((data) => {
                    return res.send(200, {
                        data
                    });
                });
            }
            else if(positions.length > 1){
                return super.savePositions(positions).then((data) => {
                    return res.send(200, {
                        data
                    });
                });
            }
            return next(
                new restify.InternalServerError({body:{
                    "code": 'ERROR_ON_POSITION_SAVE',
                    "message": 'Error on saving position(s).'
                }})
            );

        });

        protocolServer.listen(protocol.port, () => {
            log.info(protocol.name.toUpperCase() + ' listening on port: ' + protocol.port);
        });

        /*
        protocolServer.on('connection', (connection) => {
            const remoteAddress = connection.remoteAddress + ':' + connection.remotePort;
            let chunks = [];
            connection.on('data', (chunk) => {
                chunks.push(chunk);
                console.log(chunks.length);
            });

            connection.on('end', function() {
                let msg = Buffer.concat(chunks).toString();
                console.log(msg);
            });

            connection.end('goodbye\n');

        });
        */

    };

};