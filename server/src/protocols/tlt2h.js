const Protocol = require('./Protocol');
const net = require('net');
const moment = require('moment');
const log = new require('pretty-logger')();
const _ = require('lodash');
const config = require('../config');

module.exports = class TLT2H extends Protocol {

    constructor(server, protocol){

        super(server, protocol);

        const context = this;

        this.server = server;
        this.protocol = protocol;
        this.devices = [];

        const protocolServer = net.createServer();

        protocolServer.on('connection', (connection) => {

            const remoteAddress = connection.remoteAddress + ':' + connection.remotePort;

            connection.setEncoding('utf8');

            connection.on('completed-message', (data) => {
                if(context.protocol.debug) {
                    console.log("--- TLT2H - NEW COMPLETED MESSAGE ----------------------------------------");
                    console.log(moment().format("DD/MM/YYYY HH:mm:ss"));
                    console.log(data);
                    console.log("--- TLT2H - END OF NEW COMPLETED MESSAGE ---------------------------------");
                }
                const decodedData = context.decode(data);
                if(decodedData && _.has(decodedData,"positions") && decodedData.positions.length > 0) {
                    /*if(context.protocol.debug) console.log(decodedData);*/
                    const translatedPositions = context.decodedDataToTranslatedPositions(decodedData);
                    if(translatedPositions.length === 1){
                        super.savePosition(translatedPositions[0]).then(() => {
                        }).catch((err) => {
                        });
                    }
                    else if(translatedPositions.length > 1){
                        super.savePositions(translatedPositions).then(() => {
                        }).catch((err) => {
                        });
                    }
                }
                else {
                    if(context.protocol.debug) console.log("Data unparseable.");
                }
            });

            connection.on('incomplete-message', (data) => {
                if(context.protocol.debug) {
                    console.log("--- TLT2H - INCOMPLETE MESSAGE -----------------------------------------------");
                    console.log(moment().format("DD/MM/YYYY HH:mm:ss"));
                    console.log("--- TLT2H - END OF INCOMPLETE MESSAGE ----------------------------------------");
                }
            });

            let streamData = "";

            connection.on('data', (data) => {
                data = data.toString().trim();
                streamData += data; // push data to streamData
                const messageParts = streamData.split("##");
                if(messageParts.length > 1){ // if ## found, then ["data", "data", ""]
                    streamData = messageParts.filter(function(messagePart, index){
                        const n = index + 1;
                        if(n === messageParts.length){
                            // it's the empty string "" when it finds ##
                            return true;
                        }
                        else{
                            // completed, remove it from streamData by filtering it
                            const completedMessage = messagePart + "##";
                            if(context.protocol.debug) console.log("completed data");
                            connection.emit('completed-message', completedMessage);
                        }
                    }).join(""); // in this step, every string before "##" becomes a position(s) message, everything else is attached again to streamData
                }
                else {
                    connection.emit('incomplete-message', data);
                    // incomplete data, just pushed it in the beginning of .on('data') block of code
                }
                connection.write(new Buffer("OK"));
            });

            connection.on('end', () => {
                if(context.protocol.debug) console.log("Data finished for TLT2H");
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

    // should be in this format: "#123456789000001#V3338#0000#SMSM#3 #25ee0dff$GPRMC,083945.180,A2233.4249,N,11406.0046,E,0.00,315.00,251207,,,A*6E #25ee0dff$GPRMC,083950.180,A2233.4249,N,11406.0046,E,0.00,315.00,251207,,,A*6E #25ee0dff$GPRMC,083955.180,A2233.4249,N,11406.0046,E,0.00,315.00,251207,,,A*6E ##"
    decode(data){
        const positions = [];
        const dataSections = data.match(/[^\r\n]+/g);
        dataSections.pop();
        const deviceInfo = this.decodeDeviceInfo(dataSections[0]);
        if(deviceInfo) {
            dataSections.shift();
            for (let i = 0; i < deviceInfo.dataQuantity; i++) {
                if (dataSections[i]) {
                    const position = this.decodePosition(dataSections[i].substring(1));
                    if(position.status === "A") {
                        positions.push(position);
                    }
                }
            }
            return {
                device: deviceInfo,
                positions
            };
        }
        else {
            return false;
        }
    }

    // should be in this format: "#123456789000001#V3338#0000#SMSM#3"
    decodeDeviceInfo(encodedDeviceInfo){
        if(encodedDeviceInfo){
            const deviceInfos = encodedDeviceInfo.split("#");
            return {
                imei: deviceInfos[1],
                username: deviceInfos[2],
                servicePassword: deviceInfos[3],
                state: deviceInfos[4],
                dataQuantity: parseInt(deviceInfos[5])
            };
        }
        return false;
    }

    // should be in this format: "25ee0dff$GPRMC,083945.180,A2233.4249,N,11406.0046,E,0.00,315.00,251207,,,A*6E"
    decodePosition(encodedPosition){
        const positionSections = encodedPosition.split(",");
        const initialDollarSignSplit = positionSections[0].split("$");
        return {
            baseStationInfo: initialDollarSignSplit[0],
            messageId: "$" + initialDollarSignSplit[1],
            UTCTime: positionSections[1],
            status: positionSections[2],
            latitude: positionSections[3],
            northOrSouth: positionSections[4],
            longitude: positionSections[5],
            eastOrWest: positionSections[6],
            speedOverGround: positionSections[7],
            courseOverGround: positionSections[8],
            date: positionSections[9], //ddmmyy
            magneticVariation: positionSections[10], //ddmmyy
        };
    }

    decodedDataToTranslatedPositions(decodedInfo){
        const translatedPositions = [];
        const context = this;
        const positionState = decodedInfo.device.state.replace(" ", "").toUpperCase();
        const positionDeviceCode = decodedInfo.device.imei;

        let device = {
            deviceCode: positionDeviceCode,
            isLastStateAccOn: false
        };

        const deviceIndex = _.findIndex(context.devices, { deviceCode: positionDeviceCode });

        console.log(positionState);

        // verify if it is the newest position
        if(deviceIndex >= 0){
            if(positionState === "AUTOSTOP" || positionState === "AUTOLOW"){
                device.isLastStateAccOn = false;
                context.devices[deviceIndex] = device;
            }
            else if(positionState === "AUTOSTART" || positionState === "AUTO"){
                device.isLastStateAccOn = true;
                context.devices[deviceIndex] = device;
            }
            else {
                device = context.devices[deviceIndex];
            }
        }
        else {
            if(positionState === "AUTOSTART"){
                device.isLastStateAccOn = true;
            }
            context.devices.push(device)
        }

        decodedInfo.positions.forEach((tlt2hPosition) => {
            const timeHHMMSS = tlt2hPosition.UTCTime.match(/.{1,2}/g);
            const dateDDMMYY = tlt2hPosition.date.match(/.{1,2}/g);
            const generatedAt = moment.utc("20" + dateDDMMYY[2] + "-" + dateDDMMYY[1] + "-" + dateDDMMYY[0] + " " + timeHHMMSS[0] + ":" + timeHHMMSS[1] + ":" + timeHHMMSS[2]).toDate();
            const latLng = TLT2H.getLatLng(tlt2hPosition.latitude,tlt2hPosition.longitude,tlt2hPosition.northOrSouth,tlt2hPosition.eastOrWest);
            const position = {
                deviceCode: decodedInfo.device.imei,
                latitude: latLng.latitude,
                longitude: latLng.longitude,
                isAccOn: device.isLastStateAccOn,
                isActive: true,
                speed: (parseInt(tlt2hPosition.speedOverGround, 10) * 1.85).toFixed(2),
                bearing: tlt2hPosition.courseOverGround || '0',
                generatedAt: generatedAt
            };
            if(decodedInfo.positions.length > 1) {
                translatedPositions.push({
                    position,
                    options: {
                        shouldBroadcast: false
                    }
                });
            }
            else {
                translatedPositions.push({
                    position,
                    options: {
                        shouldBroadcast: true
                    }
                });
            }
        });
        return translatedPositions;
    }

    static getLatLng(latitude,longitude,ns,ew) {
        const latLng = { latitude: null, longitude: null };
        latLng.latitude = TLT2H.toDD(latitude.substring(0, 2), latitude.substring(2, 10), ns); // LATITUDE: North South
        latLng.longitude = TLT2H.toDD(longitude.substring(0, 3), longitude.substring(3, 11), ew); // LONGITUDE: East West

        latLng.altLatitude = TLT2H.getCoordenada(ns) * TLT2H.convertirPunto(latitude); // LATITUDE: North South
        latLng.altLongitude = TLT2H.getCoordenada(ew) * TLT2H.convertirPunto(longitude); // LONGITUDE: East West

        return latLng;
    }

    static getCoordenada(datos) {
        datos = datos.toString().toUpperCase();
        return datos === "S" || datos === "W" ? -1 : 1;
    }

    static convertirPunto(datos) {
        datos = parseFloat(datos);
        let parteEntera = ~~(Math.round(datos) / 100);
        let parteDecimal = (datos - (parteEntera * 100)) / 60;
        return (parteEntera + parteDecimal).toFixed(6);
    }

    static toDD(degrees, minutes, direction) {
        let out = parseInt(degrees) + (parseFloat(minutes) / 60);
        if(direction === "S" || direction === "W") {
            out = out * -1.0;
        }
        return out;
    }

};