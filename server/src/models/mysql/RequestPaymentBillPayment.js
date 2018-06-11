import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestPaymentBillPayment';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                requestPaymentBillId: {
                    type: Sequelize.INTEGER
                },
                paymentMethodId: {
                    type: Sequelize.INTEGER
                },
                amount: {
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
                tableName: 'request_payment_bill_payment',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true,
                paranoid: true
            })
        }
    },
    postSettings: ({RequestPaymentBillPayment, RequestPaymentBill, PaymentMethod, RequestPaymentTransaction}) => {
        RequestPaymentBillPayment.belongsTo(PaymentMethod, {as: 'paymentBillMethod', foreignKey: 'paymentMethodId'})
        RequestPaymentBillPayment.belongsTo(RequestPaymentBill, {as: 'requestPaymentBill', foreignKey: 'requestPaymentBillId'})

        RequestPaymentBillPayment.hasMany(RequestPaymentTransaction, {as: 'requestPaymentTransactions', foreignKey: 'requestPaymentBillPaymentId'})
    }
}
