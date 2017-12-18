const Protocol = require('../Protocol');
const net = require('net');
const moment = require('moment');
const log = new require('pretty-logger')();
const _ = require('lodash');
const config = require('../../../config');
const utils = require('../../../utils');

module.exports = class GPS103 extends Protocol {

    constructor(server, protocol){

        super(server, protocol, {
            orderedIncommingPositions: false
        });

        const context = this;

        this.server = server;
        this.protocol = protocol;
        this.devices = [];

        const protocolServer = net.createServer();

        protocolServer.on('connection', (connection) => {
            const remoteAddress = connection.remoteAddress + ':' + connection.remotePort;
            connection.setEncoding('utf8');
            connection.on('data', (data) => {
                data = data.toString().trim();
                const regexpNumbers = new RegExp("^[0-9]{10,}$");
                if (data.indexOf("imei", 0) === -1 && regexpNumbers.test(data.replace(";", "")) === false) {
                    if(context.protocol.debug) console.log("Unparseable data.");
                    connection.end();
                    return;
                }
                const imei = context.getIMEI(data);
                let dataArray = [];
                if (typeof(data) === 'string') {
                    if (data.length > 0) {
                        dataArray = data.split(',');
                    }
                }
                if (dataArray.length === 1) {
                    connection.write(new Buffer("ON"));
                    if(context.protocol.debug) console.log("ON command sent.");
                }
                if (dataArray && dataArray[2] === "A;") {
                    connection.write(new Buffer("LOAD"));
                    if(context.protocol.debug) console.log("LOAD command sent.");
                }
                if (dataArray && dataArray[4] && dataArray[4] === "F") {
                    const decodedData = context.decode(dataArray);
                    super.savePosition(decodedData);
                }
            });
            connection.on('end', () => {
                if(context.protocol.debug) console.log("Data finished for GPS103");
            });
            connection.once('close', () => {
                if(context.protocol.debug) log.trace('Connection from %s closed', remoteAddress);
            });
            connection.on('error', (err) => {
                if(context.protocol.debug) log.trace('Connection %s error: %s', remoteAddress, err.message);
            });
        });

        protocolServer.listen(context.protocol.port, function() {
            log.info(context.protocol.name.toUpperCase() + ' listening on port: ' + context.protocol.port);
        });

    };

    getIMEI(data){
        if (data.indexOf('imei:', 0) !== -1) {
            const imei = (/imei\:([0-9]*)/).exec(data);
            if (imei[1]) return imei[1];
        } else {
            const possibleImei = parseInt(data);
            if (_.isInteger(possibleImei)) return possibleImei;
        }
    }

    /*
    [
        'imei:868683026066161',
        'tracker',
        '170901145331',
        '',
        'F',
        '175326.000',
        'A',
        '2326.1386',
        'S',
        '05155.5932',
        'W',
        '0.00',
        '0;'
     ]
     */

    decode(dataArray) {

        const context = this;

        if (this.protocol.debug){
            console.log("raw", dataArray[0]);
            console.log(dataArray[0].replace(/[^\d ]+/g, ""));
            console.log("lodash", _.toInteger(dataArray[0]));
        }

        // Clean data

        dataArray[0] = utils.getIntegerNumbers(dataArray[0]);
        dataArray[1] = utils.getLetters(dataArray[1]);
        dataArray[2] = utils.getIntegerNumbers(dataArray[2]);
        dataArray[4] = utils.getLetters(dataArray[4]);
        dataArray[5] = utils.getDecimalNumbers(dataArray[5]);
        dataArray[6] = utils.getLetters(dataArray[6]);
        dataArray[7] = utils.getDecimalNumbers(dataArray[7]);
        dataArray[8] = utils.getLetters(dataArray[8]);
        dataArray[9] = utils.getDecimalNumbers(dataArray[9]);
        dataArray[10] = utils.getLetters(dataArray[10]);
        dataArray[11] = utils.getDecimalNumbers(dataArray[11]);

        const timeHHMMSS = dataArray[5].match(/.{1,2}/g);
        const dateDDMMYY = dataArray[2].match(/.{1,2}/g);
        const generatedAt = moment(moment.utc("20" + dateDDMMYY[0] + "-" + dateDDMMYY[1] + "-" + dateDDMMYY[2] + " " + timeHHMMSS[0] + ":" + timeHHMMSS[1] + ":" + timeHHMMSS[2]).toDate());
        if(generatedAt.isAfter(moment())){
            generatedAt.subtract(1, 'days');
        }

        // dataArray[1] :

        const latLng = GPS103.getLatLng(dataArray[7],dataArray[9],dataArray[8],dataArray[10]);
        const positionState = dataArray[1];
        const positionDeviceCode = dataArray[0];

        let shouldBroadcast = true;
        let device = {
            deviceCode: positionDeviceCode,
            isLastStateAccOn: false,
            newestDate: generatedAt
        };

        const deviceIndex = _.findIndex(context.devices, { deviceCode: positionDeviceCode });

        // verify if it is the newest position
        if(deviceIndex >= 0){
            device = context.devices[deviceIndex];
            shouldBroadcast = generatedAt.isAfter(device.newestDate);
        }

        // verify if it is the newest position
        if(deviceIndex >= 0){
            if(positionState === "acc off"){
                device.isLastStateAccOn = false;
                context.devices[deviceIndex] = device;
            }
            else if(positionState === "acc on"){
                device.isLastStateAccOn = true;
                context.devices[deviceIndex] = device;
            }
            else {
                device = context.devices[deviceIndex];
            }
        }
        else {
            if(positionState === "acc on"){
                device.isLastStateAccOn = true;
            }
            context.devices.push(device)
        }

        return {
            position: {
                deviceCode: dataArray[0],
                latitude: latLng.latitude,
                longitude: latLng.longitude,
                speed: (parseInt(dataArray[11], 10) * 1.85).toFixed(2),
                isActive: true,
                isAccOn: device.isLastStateAccOn,
                bearing: (parseFloat(dataArray[12])).toFixed(1),
                generatedAt: generatedAt.toDate()
            },
            options: {
                shouldBroadcast
            }
        };

    }

    static getLatLng(latitude,longitude,ns,ew) {
        const latLng = { latitude: null, longitude: null };
        latLng.latitude = GPS103.toDD(latitude.substring(0, 2), latitude.substring(2, 10), ns); // LATITUDE: North South
        latLng.longitude = GPS103.toDD(longitude.substring(0, 3), longitude.substring(3, 11), ew); // LONGITUDE: North South
        return latLng;
    }

    static toDD(degrees, minutes, direction) {
        let out = parseInt(degrees) + (parseFloat(minutes) / 60);
        if(direction === "S" || direction === "W") {
            out = out * -1.0;
        }
        return out;
    }

};