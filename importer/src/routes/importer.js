const _ = require("lodash")
import EventResponse from '~models/EventResponse'

module.exports = (server, restify) => {

    /* CRUD */

    server.post('/importer/:baseImport', (req, res, next) => {
        if(req.params.baseImport == 'marcos'){
            if(!req.files) return res.send(500, new EventResponse(new Error ('É necessario enviar o arquivo Data!')))
            return server.broker.call('importer/import/marcos.start', {
                baseImport: req.params.baseImport,
                companyId: req.query.companyId,
                data: req.files.data
            }).then((request) => {
                return res.send(200, request)
            }).catch((err) => {
                console.log(err)
            })
        }
        else if(req.params.baseImport == 'gestaoazul'){
            return server.broker.call('importer/import.start', {
                baseImport: req.params.baseImport,
                companyId: req.query.companyId
            }).then((request) => {
                return res.send(200, request)
            }).catch((err) => {
                console.log(err)
            })
        }
        else {
            return res.send(500, new EventResponse(new Error ('É necessario informar a base à ser importada!')))
        }
    })

}