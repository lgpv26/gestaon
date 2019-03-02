const basePath = require("./../middlewares/base-path.middleware")
const _ = require("lodash")
import EventResponse from "../models/EventResponse"
import shortid from "shortid"
import moment from "moment"

module.exports = (server, restify) => {
  const authGuard = require("./../middlewares/auth-guard.middleware")(server, restify)

  server.use(basePath("/request-queue", authGuard))


  /* CRUD */

  server.post("/request-queue", authGuard, (req, res, next) => {
    let shortId
    if(!shortId) shortId = shortid.generate()
    console.log("REQUESIÇÃO DE:", req.auth.name, "com id", shortId, " em ", moment().toISOString(), "para um request")

    return server.broker.call("data/request-queue.start", {
        data: req.body,
        user: req.auth,
        companyId: req.auth.activeCompanyUserId ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
      })
      .then((request) => {
        return res.send(200, new EventResponse(request))
      })
      .catch((err) => {
        return res.send(200, new EventResponse(err))
      })
  })

  server.post("/chat-queue", authGuard, (req, res, next) => {
    let shortId
    if(!shortId) shortId = shortid.generate()
    console.log("REQUESIÇÃO DE:", req.auth.name, "com id", shortId, " em ", moment().toISOString(), "para um chat")

    return server.broker.call("data/chat-queue.start", {
        data: req.body,
        user: req.auth,
        companyId: req.auth.activeCompanyUserId ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
      })
      .then((chat) => {
        return res.send(200, new EventResponse(chat))
      })
      .catch((err) => {
        return res.send(200, new EventResponse(err))
      })
  })

}
