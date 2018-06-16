import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestTimeline';
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
                triggeredBy: {
                    type: Sequelize.INTEGER,
                    default: null
                },
                userId: {
                    type: Sequelize.INTEGER,
                    default: null
                },
                status: {
                    type: Sequelize.ENUM('pending', 'in-displacement', 'canceled', 'finished'),
                    default: null
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
                tableName: "request_timeline",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestTimeline,Request,User}) => {
        RequestTimeline.belongsTo(Request, {as: 'request', foreignKey: 'requestId'})
        RequestTimeline.belongsTo(User, {as: 'user', foreignKey: 'userId'});
        RequestTimeline.belongsTo(User, {as: 'triggeredByUser', foreignKey: 'triggeredBy'});
    }
}
