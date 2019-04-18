import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestPayment';
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
                amount: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                code: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('code', (val === '' || val === null) ? null : val.toUpperCase().trim());
                    }
                },
                /*
                billPaymentDate:{
                    type: TIMESTAMP
                },                
                lastTriggeredUserId: {
                    type: Sequelize.INTEGER
                },               
                lastReceivedFromUserId: {
                    type: Sequelize.INTEGER
                },
                received: {
                    type: Sequelize.BOOLEAN,
                    default: false
                },
                receivedDate: {
                    type: TIMESTAMP
                },*/
                deadlineDatetime: {
                    type: TIMESTAMP
                },                
                paid: {
                    type: Sequelize.BOOLEAN,
                    default: false
                },
                paidDatetime: {
                    type: TIMESTAMP
                },
                settled: {
                    type: Sequelize.BOOLEAN,
                    default: false
                },
                settledDatetime: {
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
                tableName: 'request_payment',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true,
                paranoid: true
            })
        }
    },
    postSettings: ({RequestPayment, Request, PaymentMethod, RequestPaymentTransaction, User}) => {
        RequestPayment.belongsTo(Request, {as: 'request', foreignKey: 'requestId'})
        RequestPayment.belongsTo(PaymentMethod, {as: 'paymentMethod', foreignKey: 'paymentMethodId'})

        /*RequestPayment.belongsTo(User, {as: 'userTriggered', foreignKey: 'lastTriggeredUserId'})
        RequestPayment.belongsTo(User, {as: 'userReceived', foreignKey: 'lastReceivedFromUserId'})*/


        RequestPayment.hasMany(RequestPaymentTransaction, {as: 'requestPaymentTransactions', foreignKey: 'requestPaymentId'})
    }
}
