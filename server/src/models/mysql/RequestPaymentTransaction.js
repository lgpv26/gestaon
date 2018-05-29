import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestPaymentTransaction';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                requestPaymentId: {
                    type: Sequelize.INTEGER
                },
                transactionId: {
                    type: Sequelize.INTEGER
                },
                action: {
                    type: Sequelize.STRING
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
                tableName: "request_payment_transaction",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestPaymentTransaction,RequestPaymentMethod,Transaction}) => {
        RequestPaymentTransaction.belongsTo(RequestPaymentMethod, {as: 'requestPayment', foreignKey: 'requestPaymentId'})
        RequestPaymentTransaction.belongsTo(Transaction, {as: 'transaction', foreignKey: 'transactionId'})
    }
}
