const basePath = require("./../middlewares/base-path.middleware")
const _ = require("lodash")
import EventResponse from "../models/EventResponse"

module.exports = (server, restify) => {
  const authGuard = require("./../middlewares/auth-guard.middleware")(server,restify)

  server.use(basePath("/request-board", authGuard))

  /* CRUD */

  server.get("/request-board", authGuard, (req, res, next) => {
    return server.broker.call("request-board.getDashboard", {
        date: req.query.date,
        companyId: (req.auth.activeCompanyUserId) ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
      })
      .then((requestBoard) => {
        return res.send(200, { data: requestBoard })
      })
      .catch((err) => {
        return res.send(200, new EventResponse(err))
      })
  })
}