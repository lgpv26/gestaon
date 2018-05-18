import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestOrderProduct';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                requestOrderId: {
                    type: Sequelize.INTEGER
                },
                productId: {
                    type: Sequelize.INTEGER
                },
                quantity: Sequelize.INTEGER,
                unitPrice: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                unitDiscount: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                dateUpdated: {
                    type: TIMESTAMP
                },
                dateCreated: {
                    type: TIMESTAMP
                },
                dateRemoved: {
                    type: TIMESTAMP
                }
            }, {
                tableName: 'request_order_product',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestOrderProduct, RequestOrder, Product}) => {
        RequestOrderProduct.belongsTo(RequestOrder, {as: 'requestOrder', foreignKey: 'requestOrderId'});
        RequestOrderProduct.belongsTo(Product, {as: 'product', foreignKey: 'productId'});
    }
};
