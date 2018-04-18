const _ = require('lodash');
const utils = require('../utils/index');
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {
    return {
        getAll: (controller) => {
            return server.mysql.PaymentMethod.findAll({
                where: {
                    companyId: controller.request.queryParser.companyId
                }
            }).then((paymentMethods) => {
                return paymentMethods;
            })
        },
        createOne: (controller) => {
            const createData = _.cloneDeep(controller.request.data)
            _.assign(createData, {
                companyId: controller.request.queryParser.companyId
            })
            return server.mysql.PaymentMethod.create(createData, {
                transaction: controller.transaction
            }).then((paymentMethod) => {
                return paymentMethod
            })
        },

        updateOne: (controller) => {
            const updateData = _.cloneDeep(controller.request.data)
            _.assign(updateData, {
                companyId: controller.request.queryParser.companyId
            })
            return server.mysql.PaymentMethod.update(updateData, {
                where: {
                    id: controller.request.params.id
                },
                transaction: controller.transaction
            }).then((paymentMethod) => {
                if (!paymentMethod) {
                    throw new Error("Registro não encontrado Parte 1..")
                }
                return paymentMethod
            })
        }

    }
};
