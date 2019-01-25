const basePath = require("./../middlewares/base-path.middleware");
const Controller = require("../models/Controller");
const _ = require("lodash");
import EventResponse from "~server/models/EventResponse";

module.exports = (server, restify) => {
  const authGuard = require("./../middlewares/auth-guard.middleware")(
    server,
    restify
  );
  const clientsController = require("./../controllers/clients.controller")(
    server,
    restify
  );

  server.use(basePath("/clients", authGuard));

  /* SEARCH */

  server.get("/clients/import", (req, res, next) => {
    server.mysql.Client.count().then(totalItems => {
      let items = [],
        offset = 0,
        limit = 500,
        run = true;
      const findFunc = function() {
        if (!run) return true;
        console.log(
          "Running " +
            offset +
            "-" +
            (offset + limit) +
            "/totalItems: " +
            totalItems
        );
        return server.mysql.Client.findAll({
          limit,
          offset
        }).then(result => {
          items = _.concat(items, result);
          if (result.length < limit) {
            run = false;
          }
          offset += limit;
          findFunc();
        });
      };
      findFunc();
      return res.send(200, { data: items.length });
    });
  });

  /* SEARCH */

  server.get("/clients/search", (req, res, next) => {
    clientsController
      .search(req)
      .then(searchResult => {
        return res.send(200, { data: searchResult });
      })
      .catch(err => {
        return console.log(err);
      });
  });

  /* CRUD */

  server.post("/clients/persistence", (req, res, next) => {
    return server.broker
      .call("draft/client/persistence.start", {
        client: req.body.client,
        companyId: req.auth.activeCompanyUserId
          ? req.auth.activeCompanyUserId
          : _.first(req.auth.userCompanies).companyId
      })
      .then(client => {
        return res.send(200, client);
      })
      .catch(err => {
        console.log(err);
      });
  });

  server.get("/clients", clientsController.getAll);

  server.get("/clients/:id", (req, res, next) => {
    return server.broker
      .call("data/client.get", {
        where: {
          companyId: req.query.companyId,
          id: req.params.id
        },
        include: [
          {
            model: server.mysql.ClientPhone,
            as: "clientPhones"
          },
          {
            model: server.mysql.ClientAddress,
            as: "clientAddresses",
            include: [
              {
                model: server.mysql.Address,
                as: "address"
              }
            ]
          },
          {
            model: server.mysql.ClientCustomField,
            as: "clientCustomFields",
            include: [
              {
                model: server.mysql.CustomField,
                as: "customField"
              }
            ]
          },
          {
            model: server.mysql.ClientGroup,
            as: "clientGroup"
          }
        ]
      })
      .then(data => {
        return res.send(200, { data });
      });
  });

  server.post("/clients", (req, res, next) => {
    clientsController.createOne().then(() => {});
  });

  server.patch("/clients/:id", clientsController.updateOne);

  server.get("/clients/:id/request-history", (req, res, next) => {
    return server.broker
      .call("data/client.getRequestHistory", {
        data: {
          id: parseInt(req.params.id)
        },
        limit: parseInt(req.query.limit),
        offset: parseInt(req.query.offset),
        companyId: parseInt(req.query.companyId)
      })
      .then(data => {
        return res.send(200, new EventResponse(data));
      })
      .catch(err => {
        return res.send(200, new EventResponse(err));
      });
  });

  server.get("/clients/:id/credit-info", (req, res, next) => {
    return server.broker
      .call("data/client.getCreditInfo", {
        clientId: req.params.id,
        companyId: req.query.companyId
      })
      .then(data => {
        return res.send(200, { data });
      });
  });

  server.get("/clients/:id/bills", (req, res, next) => {
    return server.broker
      .call("data/client.getBills", {
        clientId: req.params.id,
        companyId: req.query.companyId
      })
      .then(data => {
        return res.send(200, { data });
      });
  });

  server.post("/clients/:id/markBillsAsPaid", (req, res, next) => {
    return server.broker
      .call("data/client.markBillsAsPaid", {
        data: _.assign(
          {
            companyId: parseInt(req.query.companyId),
            createdById: parseInt(req.auth.id),
            clientId: parseInt(req.params.id)
          },
          req.body
        )
      })
      .then(data => {
        return res.send(200, new EventResponse(data));
      })
      .catch(err => {
        return res.send(200, new EventResponse(err));
      });
  });

  server.post("/clients/:id/billsPaymentMethod", (req, res, next) => {
    return server.broker
      .call("data/client.billsPaymentMethod", {
        data: _.assign(
          {
            companyId: parseInt(req.query.companyId),
            createdById: parseInt(req.auth.id),
            clientId: parseInt(req.params.id)
          },
          req.body
        )
      })
      .then(data => {
        return res.send(200, new EventResponse(data));
      })
      .catch(err => {
        return res.send(200, new EventResponse(err));
      });
  });

  server.post("/clients/:id/change-credit-limit", (req, res, next) => {
    return server.broker
      .call("data/client.changeCreditLimit", {
        data: _.assign(
          {
            clientId: req.params.id,
            companyId: req.query.companyId
          },
          req.body
        ),
        userId: req.auth.id
      })
      .then(data => {
        return res.send(200, new EventResponse(data));
      })
      .catch(err => {
        return res.send(200, new EventResponse(err));
      });
  });

  // CLIENTS GROUP //
  server.patch("/clients/:id/clients-group", (req, res, next) => {
    clientsController.saveClientsGroup(req).then(clientsGroupPatch => {
      if (!clientsGroupPatch || clientsGroupPatch.length < 1) {
        return next(
          new restify.ResourceNotFoundError("Nenhum dado encontrado.")
        );
      }
      return res.send(200, { data: clientsGroupPatch });
    });
  });

  // ADDRESS //
  server.get("/clients/:id/addresses", (req, res, next) => {
    clientsController.getAddresses(req).then(getAllResult => {
      if (!getAllResult || getAllResult.length < 1) {
        return next(
          new restify.ResourceNotFoundError("Nenhum dado encontrado.")
        );
      }
      return res.send(200, { data: getAllResult });
    });
  });
  server.del("/clients/:id/addresses/:clientAddressId", (req, res, next) => {
    clientsController
      .removeOneAddress(req)
      .then(addressDeleted => {
        return res.send(200, { data: addressDeleted });
      })
      .catch(err => {
        console.log(err);
      });
  });
  server.patch("/clients/:id/addresses", (req, res, next) => {
    clientsController.saveAddresses(req).then(addressPatch => {
      return res.send(200, { data: addressPatch });
    });
  });

  // PHONES //
  server.get("/clients/:id/phones", (req, res, next) => {
    clientsController.getPhones(req).then(getAllResult => {
      if (!getAllResult || getAllResult.length < 1) {
        return next(
          new restify.ResourceNotFoundError("Nenhum dado encontrado.")
        );
      }
      return res.send(200, { data: getAllResult });
    });
  });

  server.del("/clients/:id/phones/:clientPhoneId", (req, res, next) => {
    clientsController
      .removeOnePhone(req)
      .then(phoneDeleted => {
        return res.send(200, { data: phoneDeleted });
      })
      .catch(err => {
        console.log(err);
      });
  });

  server.patch("/clients/:id/phones", (req, res, next) => {
    clientsController.savePhones(req).then(phonePatch => {
      return res.send(200, { data: phonePatch });
    });
  });

  // CUSTOM FIELDS //
  server.get("/clients/:id/custom-fields", (req, res, next) => {
    clientsController.getCustomFields(req).then(getAllResult => {
      return res.send(200, { data: getAllResult });
    });
  });

  server.get("/clients/:id/custom-fields/:customFieldId", (req, res, next) => {
    clientsController.getOneCustomField(req).then(getResult => {
      return res.send(200, { data: getResult });
    });
  });

  server.del("/clients/:id/custom-fields/:customFieldId", (req, res, next) => {
    clientsController.removeOneCustomField(req).then(customFieldDeleted => {
      return res.send(200, { data: customFieldDeleted });
    });
  });

  server.patch("/clients/:id/custom-fields", (req, res, next) => {
    clientsController.saveCustomFields(req).then(customFieldPatch => {
      return res.send(200, { data: customFieldPatch });
    });
  });

  server.post("/clients/export-to-es", clientsController.exportToES);
};
