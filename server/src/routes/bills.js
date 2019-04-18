const basePath = require('./../middlewares/base-path.middleware')
import _ from 'lodash'
const EventResponse = require('~server/models/EventResponse')

module.exports = (server, restify) => {

    const authGuard = require('./../middlewares/auth-guard.middleware')(server, restify);

    server.use(basePath(
        '/bills', authGuard
    ))

    /* Users CRUD */

    server.post('/bills/:id/mark-as-paid', (req, res, next) => {
        return server.broker.call('data/bills.markAsPaid', {
            data: req.body,
            id: parseInt(req.params.id),
            companyId: parseInt(req.query.companyId),
            createdById: parseInt(req.auth.id)
        }).then((data) => {
            return res.send(200, new EventResponse(data))
        }).catch((err) => {
            return res.send(200, new EventResponse(err))
        })
    })

}