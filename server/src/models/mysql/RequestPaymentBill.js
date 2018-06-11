import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestPaymentBill';
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
                deadlineDatetime: {
                    type: TIMESTAMP
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
                tableName: 'request_payment_bill',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true,
                paranoid: true
            })
        }
    },
    postSettings: ({RequestPaymentBill, RequestPayment, RequestPaymentBillPayment, Request}) => {
        RequestPaymentBill.belongsTo(RequestPayment, {as: 'requestPayments', foreignKey: 'requestPaymentId'})
        RequestPaymentBill.belongsToMany(Request, {through: RequestPayment, as: 'requests', foreignKey: 'requestId'})
        RequestPaymentBill.hasMany(RequestPaymentBillPayment, {as: 'requestPaymentBillPayments', foreignKey: 'requestPaymentBillId'})    
    }
}
