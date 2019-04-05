import _ from "lodash";
import EventResponse from "~models/EventResponse";

module.exports = server => {
  return {
    name: "data/device",
    actions: {
      getOne(ctx) {
        return server.mysql.Device.findOne({
          where: ctx.params.where || {},
          include: ctx.params.include || [],
          attributes: ctx.params.attributes || null
        }).then(device => {
          return JSON.parse(JSON.stringify(device));
        });
      },

      create(ctx) {
        console.log("aqui");
        return server.mysql.Device.create(ctx.params.data)
          .then(device => {
            return JSON.parse(JSON.stringify(device));
          })
          .catch(err => {
            return err;
          });
      },

      remove(ctx) {
        return server.mysql.Device.destroy({
          where: {
            id: ctx.params.deviceId,
            companyId: ctx.params.companyId
          }
        });
      },

      update(ctx) {
        return server.mysql.Device.update(ctx.params.data, {
          where: ctx.params.where || {},
          paranoid: false
        }).then(() => {
          return server.mysql.Device.findByPk(ctx.params.deviceId).then(
            device => {
              return JSON.parse(JSON.stringify(device));
            }
          );
        });
      }
    }
  };
};
