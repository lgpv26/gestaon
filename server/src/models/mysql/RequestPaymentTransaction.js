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
                operation: {
                    type: Sequelize.STRING
                },
                revert:{
                    type: Sequelize.BOOLEAN
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
    postSettings: ({RequestPaymentTransaction,RequestPayment,Transaction}) => {
        RequestPaymentTransaction.belongsTo(RequestPayment, {as: 'requestPayment', foreignKey: 'requestPaymentId'})
        RequestPaymentTransaction.belongsTo(Transaction, {as: 'transaction', foreignKey: 'transactionId'})
    }
}
