import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'Transaction';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER
                },
                createdById: {
                    type: Sequelize.INTEGER
                },
                accountId: {
                    type: Sequelize.INTEGER
                },
                amount: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                description: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('description', (val === '' || val === null) ? null : val.toUpperCase().trim());
                    }
                },
                dateUpdated: {
                    type: TIMESTAMP,
                    default: null
                },
                dateCreated: {
                    type: TIMESTAMP
                },
                dateRemoved: {
                    type: TIMESTAMP,
                    default: null
                }
            }, {
                tableName: "transaction",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Transaction, RequestPaymentTransaction, Account}) => {
        Transaction.belongsTo(Account, {as: 'account', foreignKey: 'accountId'})
        Transaction.hasMany(RequestPaymentTransaction, {as: 'requestPaymentTransactions', foreignKey: 'transactionId'})
    }
}
