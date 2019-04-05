import _ from "lodash"
import EventResponse from '~models/EventResponse'

const basePath = require('./../middlewares/base-path.middleware')

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);
    const devicesController = require('./../controllers/devices.controller')(server, restify);
    const commandsController = require('./../controllers/commands.controller')(server, restify);

    /* CRUD */

    server.use(basePath(
        '/devices', authGuard
    ))

    
    server.post("/devices", authGuard, (req, res, next) => {
        return server.broker.call("data/device.create", {
            data: _.assign(req.body, {
                companyId: req.auth.activeCompanyUserId ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
            })
        })
        .then((device) => {
            server.io.to(`company/${device.companyId}`).emit('tracker:device', new EventResponse({
                operation: "add",
                device
            }))

            return res.send(200, {success: true, data: device})
        })
        .catch((err) => {
            return res.send(200, {success: false, data: err})
        })
    })

        
    server.del("/devices/:deviceId", authGuard, (req, res, next) => {
        return server.broker.call("data/device.remove", {
            deviceId: req.params.deviceId,
            companyId: req.auth.activeCompanyUserId ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
        })
        .then((device) => {
            if(device == 0) return res.send(200, {success: false, data: "Device não encontrado!"})

            server.io.to(`company/${req.auth.activeCompanyUserId ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId}`).emit('tracker:device', new EventResponse({
                operation: "remove",
                id: req.params.deviceId
            }))

            return res.send(200, {success: true, data: {id: req.params.deviceId}})
        })
    })

    server.patch("/devices/:deviceId", authGuard, (req, res, next) => {
        return server.broker.call("data/device.update", {
            deviceId: req.params.deviceId,
            where: {
                id: req.params.deviceId,
                companyId: req.auth.activeCompanyUserId ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
            },
            data: _.assign(req.body, {
                dateRemoved: null
            })
        })
        .then((device) => {
            server.io.to(`company/${device.companyId}`).emit('tracker:device', new EventResponse({
                operation: "edit",
                device
            }))

            return res.send(200, {success: true, data: device})
        })
    })




    // server.get('/devices', devicesController.getAll);
    // server.post('/devices', devicesController.createOne);
    // server.patch('/devices/:id', devicesController.updateOne);
    // server.get('/devices/:id', devicesController.getOne);
    // server.del('/devices/:id', devicesController.removeOne);

    server.post('/devices/:id/commands', commandsController.createOne);

};
