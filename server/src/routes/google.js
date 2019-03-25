const basePath = require("./../middlewares/base-path.middleware")
const _ = require("lodash")

module.exports = (server, restify) => {
  const authGuard = require("./../middlewares/auth-guard.middleware")(server, restify)

  server.use(basePath("/apiExternal/google", authGuard))


  /* CRUD */

  server.post("/apiExternal/google", authGuard, (req, res, next) => {
    return server.broker.call("apiExternal/google.start", {
        data: req.body,
        user: req.auth,
        companyId: req.auth.activeCompanyUserId ? req.auth.activeCompanyUserId : _.first(req.auth.userCompanies).companyId
      })
      .then((data) => {
        return res.send(200, {data})
      })
      .catch((err) => {
        return res.send(200, {message: err.message})
      })
  })



}
