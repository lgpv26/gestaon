const basePath = require("./../middlewares/base-path.middleware")
const _ = require("lodash")
import EventResponse from "../models/EventResponse"
import shortid from "shortid"
import moment from "moment"

module.exports = (server, restify) => {
  const authGuard = require("./../middlewares/auth-guard.middleware")(server, restify)

  server.use(basePath("/request-queue", authGuard));

  /* CRUD */
  server.get("/request-queue/:id", (req, res, next) => {
    server.rsmq.sendMessage({qname: 'userId-' + req.params.id, message: JSON.stringify({
        data: {
          userId: 1,
          companyId: 1,
          data: 'objReturn',
          change: req.params.id
        },
        type: "request"
      })
    })
      .then((re) => {
        console.log("mandei msg para fila")
        return res.send(200, { data: re })
      })
  })


  server.post("/request-queue", authGuard, (req, res, next) => {
    let shortId
    if(!shortId) shortId = shortid.generate()
    console.log("REQUESIÇÃO DE:", req.auth.name, "com id", shortId, " em ", moment().toISOString())

    return server.broker.call("data/request-queue.start", {
        data: req.body,
        user: req.auth,
        companyId: req.auth.activeCompanyUserId ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
      })
      .then(request => {
        return res.send(200, new EventResponse(request))
      })
      .catch(err => {
        return res.send(200, new EventResponse(err))
      })
  })
}
