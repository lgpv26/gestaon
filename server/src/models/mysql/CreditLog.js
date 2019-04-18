import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'CreditLog';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                clientId: {
                    type: Sequelize.INTEGER
                },        
                newCreditLimit: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                oldCreditLimit: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                userId: {
                    type: Sequelize.INTEGER
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
                tableName: "credit_log",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({CreditLog, Client, User}) => {
        CreditLog.belongsTo(Client, {as: 'clientCreditLog', foreignKey: 'clientId'});
        CreditLog.belongsTo(User, {as: 'userCreditLog', foreignKey: 'userId'});
    }
}
