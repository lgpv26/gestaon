import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestChatItemRead';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                requestChatItemId: {
                    type: Sequelize.INTEGER
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
                tableName: 'request_chat_item_read',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestChatItemRead, RequestChatItem, User}) => {
        RequestChatItemRead.belongsTo(RequestChatItem, {as: 'requestChatItem', foreignKey: 'requestChatItemId'})
        RequestChatItemRead.belongsTo(User, {as: 'user', foreignKey: 'userId'})
    }
}
