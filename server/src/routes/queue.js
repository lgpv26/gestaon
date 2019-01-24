const basePath = require("./../middlewares/base-path.middleware");
const _ = require("lodash");
import EventResponse from "../models/EventResponse";

module.exports = (server, restify) => {
  const authGuard = require("./../middlewares/auth-guard.middleware")(
    server,
    restify
  );

  server.use(basePath("/queues", authGuard));

  /* CRUD */

  server.post("/request-queue", authGuard, (req, res, next) => {
    return server.broker
      .call("data/request-queue.start", {
        data: req.body,
        user: req.auth,
        companyId: req.auth.activeCompanyUserId
          ? req.auth.activeCompanyUserId
          : _.first(req.auth.userCompanies).companyId
      })
      .then(request => {
        //console.log('request')
        return res.send(200, new EventResponse(request));
      })
      .catch(err => {
        //console.log(err, 'chatch da wqueue route')
        return res.send(200, new EventResponse(err));
      });
  });
};
