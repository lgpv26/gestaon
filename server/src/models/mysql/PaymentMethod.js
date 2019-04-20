import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'PaymentMethod';
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
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val === '' || val === null) ? null : val.toUpperCase().trim());
                    }
                },
                rule: {
                    type: Sequelize.STRING
                },
                businessDay: {
                    type: Sequelize.BOOLEAN,
                    default: false
                },
                tax: {
                    type: Sequelize.DECIMAL(10,2),
                    default: null
                },
                taxUnit: {
                    type: Sequelize.STRING,
                    default: '%'
                },
                autoPay: {
                    type: Sequelize.INTEGER,
                    default: 0
                },
                hasDeadline: {
                    type: Sequelize.INTEGER,
                    default: 0
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
                },
                status: {
                    type: Sequelize.STRING,
                    default: 'activated'
                }
            }, {
                tableName: "payment_method",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({PaymentMethod, Request, RequestPayment}) => {
        PaymentMethod.belongsToMany(Request, {through: RequestPayment, as: 'paymentMethodRequests', foreignKey: 'paymentMethodId'})
    }
}
