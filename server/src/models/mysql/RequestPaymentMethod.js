import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestPaymentMethod';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                requestId: {
                    type: Sequelize.INTEGER
                },
                paymentMethodId: {
                    type: Sequelize.INTEGER
                },
                deadlineDatetime: {
                    type: TIMESTAMP
                },
                amount: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                paid: {
                    type: Sequelize.BOOLEAN,
                    default: false
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
                tableName: 'request_payment_method',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestPaymentMethod, Request, PaymentMethod}) => {
        RequestPaymentMethod.belongsTo(Request, {as: 'request', foreignKey: 'requestId'});
        RequestPaymentMethod.belongsTo(PaymentMethod, {as: 'paymentMethod', foreignKey: 'paymentMethodId'});
    }
};
