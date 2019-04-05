import _ from "lodash";
import { Op } from "sequelize";
import moment from "moment";

module.exports = server => {
  return {
    name: "data/position",
    actions: {
      getAll(ctx) {
        return server.mysql.Position.findAll({
          where: ctx.params.where || {},
          include: ctx.params.include || [],
          attributes: ctx.params.attributes || null,
          order: ctx.params.order || [],
          limit: ctx.params.limit || 20,
          offset: ctx.params.offset || 0
        }).then(position => {
          return JSON.parse(JSON.stringify(position));
        });
      },

      create(ctx) {
        return server.mysql.Position.create(ctx.params.data)
          .then(position => {
            return JSON.parse(JSON.stringify(position));
          })
          .catch(err => {
            console.log("OH crap, deu erro", err);
          });
      }
    }
  };
};
