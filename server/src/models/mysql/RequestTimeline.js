import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
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
                    type: Sequelize.STRING,
                    default: null
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                },
                dateRemoved: {
                    type: Sequelize.DATE
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
