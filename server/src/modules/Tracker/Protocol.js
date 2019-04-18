const config = require('../../config/index');
const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
const mongoose = require('mongoose');

module.exports = class PROTOCOL {

    constructor(server, protocol, options = {
        orderedIncommingPositions: true
    }){
        this.server = server;
        this.protocol = protocol;
        this.options = options;
    };

    verifyPositionGeofenceTriggers(device, position){
        const context = this;
        let outsideGeofences = this.server.mongodb.Geofence.find({
            devices: mongoose.Types.ObjectId(device._id),
            polygon: {
                $not: {
                    "$geoIntersects": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [parseFloat(position.latitude), parseFloat(position.longitude)]
                        }
                    }
                }
            }
        });
        let insideGeofences = this.server.mongodb.Geofence.find({
            devices: mongoose.Types.ObjectId(device._id),
            polygon: {
                "$geoIntersects": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [parseFloat(position.latitude), parseFloat(position.longitude)]
                    }
                }
            }
        });
        Promise.all([outsideGeofences, insideGeofences]).then((geofences) => {
            outsideGeofences = geofences[0]; insideGeofences = geofences[1];
            insideGeofences.forEach((geofence) => {
                if(geofence.alarmOnEnter){
                    context.server.mongodb.Event.findOne({
                        deviceCode: device.code,
                        alarmGeofence: mongoose.Types.ObjectId(geofence._id)
                    }).sort({createdAt: -1}).then((event) => {
                        if(!event || event.alarmType !== 'geofence_enter'){
                            const eventData = {
                                companyId: device.companyId,
                                deviceCode: device.code,
                                type: 'alarm',
                                alarms: [{ publishedAt: new Date() }],
                                alarmGeofence: mongoose.Types.ObjectId(geofence._id),
                                alarmType: 'geofence_enter'
                            };
                            context.server.io.in('device/' + position.deviceCode).emit('geofenceAlarm', [geofence]);
                            let timesLeft = geofence.repeat - 1;
                            context.server.mongodb.Event.create(eventData).then((event) => {
                                if(timesLeft > 0) {
                                    const interval = setInterval(() => {
                                        timesLeft --;
                                        event.alarms.push({
                                            publishedAt: new Date()
                                        });
                                        context.server.io.in('device/' + position.deviceCode).emit('geofenceAlarm', [geofence]);
                                        context.server.mongodb.Event.findByIdAndUpdate(event._id, event).then((event) => {});
                                        if(timesLeft === 0){
                                            clearInterval(interval);
                                        }
                                    }, 1000 * geofence.interval);
                                }
                            })
                        }
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            });
            outsideGeofences.forEach((geofence) => {
                if(geofence.alarmOnLeave){
                    context.server.mongodb.Event.findOne({
                        deviceCode: device.code,
                        alarmGeofence: mongoose.Types.ObjectId(geofence._id)
                    }).sort({createdAt: -1}).then((event) => {
                        if(!event || event.alarmType !== 'geofence_leave'){
                            const eventData = {
                                companyId: device.companyId,
                                deviceCode: device.code,
                                type: 'alarm',
                                alarms: [{ publishedAt: new Date() }],
                                alarmGeofence: mongoose.Types.ObjectId(geofence._id),
                                alarmType: 'geofence_leave'
                            };
                            context.server.io.in('device/' + position.deviceCode).emit('geofenceAlarm', [geofence]);
                            let timesLeft = geofence.repeat - 1;
                            context.server.mongodb.Event.create(eventData).then((event) => {
                                if(timesLeft > 0) {
                                    const interval = setInterval(() => {
                                        timesLeft --;
                                        event.alarms.push({
                                            publishedAt: new Date()
                                        });
                                        context.server.io.in('device/' + position.deviceCode).emit('geofenceAlarm', [geofence]);
                                        context.server.mongodb.Event.findByIdAndUpdate(event._id, event).then((event) => {});
                                        if(timesLeft === 0){
                                            clearInterval(interval);
                                        }
                                    }, 1000 * geofence.interval);
                                }
                            })
                        }
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            });
        });
    }

    incomingPositionBeforeCreate(position){
        return axios.get('http://gps.blueagile.me:3100/v1/reverse', {
            params: {
                "point.lat": position.latitude,
                "point.lon": position.longitude
            }
        }).then((response) => {
            const address = response.data.features.find(e => !!e);
            if(address){
                position.address = address.properties.street + ", " + address.properties.housenumber + ' - ' + address.properties.locality + "/" + address.properties.region_a;
            }
            return position;
        }).catch((err) => {
            return position;
        });
    }

    incomingPositionsBeforeCreate(positions){
        const context = this;
        let promises = [];
        positions.forEach((position) => {
            const promise = context.incomingPositionBeforeCreate(position);
            promises.push(promise);
        });
        return axios.all(promises);
    }

    savePositions(positionsData){
        const context = this;
        const incomingPositions = [];
        positionsData.forEach((positionData) => {
            incomingPositions.push(positionData.position);
        });
        return context.incomingPositionsBeforeCreate(incomingPositions).then((incomingPositions) => {
            return new Promise((resolve, reject) => {
                return context.server.mongodb.Device.findOne({
                    code: incomingPositions[0].deviceCode
                }).then((device) => {
                    if(device){
                        return context.server.mongodb.Position.create(incomingPositions, function (mongodbErr, positions) {
                            if(mongodbErr){
                                return reject(mongodbErr);
                            }
                            else {
                                let unsortedPositions = positions.map((position, index) => {
                                    return {
                                        position,
                                        options: positionsData[index].options
                                    }
                                });
                                let sortedPositions = _.sortBy(unsortedPositions, function(unsortedPosition) {
                                    return new moment(unsortedPosition.position.generatedAt);
                                }).reverse();
                                if(sortedPositions.length > 0){
                                    sortedPositions.forEach((sortedPosition) => {
                                        const options = { shouldBroadcast: true };
                                        if(_.has(sortedPosition, "options")){
                                            _.assign(options, sortedPosition.options);
                                        }
                                        if(options.shouldBroadcast) {
                                            context.verifyPositionGeofenceTriggers(device, sortedPosition.position);
                                            context.broadcastPosition(sortedPosition.position);
                                        }
                                    });
                                    return resolve({
                                        success: true
                                    });
                                }
                                return reject(
                                    new Error("No positions to be saved.")
                                );
                            }
                        });
                    }
                    else {
                        return reject(
                            new Error("Invalid device code.")
                        );
                    }
                });
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    savePosition(positionData){
        const context = this;
        const incomingPosition = positionData.position;
        const options = { shouldBroadcast: true };
        if(_.has(positionData, "options")){
            _.assign(options, positionData.options);
        }
        return context.incomingPositionBeforeCreate(incomingPosition).then((incomingPosition) => {
            return context.server.mongodb.Device.findOne({
                code: incomingPosition.deviceCode
            }).then((device) => {
                if(device){
                    return new Promise((resolve, reject) => {
                        context.server.mongodb.Position.create(incomingPosition, function (mongodbErr, position) {
                            if (mongodbErr) {
                                return reject(mongodbErr);
                            }
                            else {
                                if(options.shouldBroadcast){
                                    context.verifyPositionGeofenceTriggers(device, position);
                                    context.broadcastPosition(position);
                                }
                                return resolve({
                                    success: true
                                });
                            }
                        });
                    });
                }
                else {
                    return reject(
                        new Error("Invalid device code.")
                    );
                }
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    broadcastPosition(position){
        this.server.io.in('device/' + position.deviceCode).emit('newPosition', position);
    }

};