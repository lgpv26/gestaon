import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestChatItem';
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
                userId: {
                    type: Sequelize.INTEGER
                },
                type: {
                    type: Sequelize.ENUM('message','alert')
                },
                data: {
                    type: Sequelize.STRING,
                    set(val){
                        this.setDataValue('data', (val == '' | val == null) ? null : val.trim());
                    }
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
                tableName: 'request_chat_item',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestChatItem, Request, User, RequestChatItemRead}) => {
        RequestChatItem.belongsTo(Request, {as: 'request', foreignKey: 'requestId'})
        RequestChatItem.belongsTo(User, {as: 'user', foreignKey: 'userId'})

        RequestChatItem.hasMany(RequestChatItemRead, {as: 'usersRead', foreignKey: 'requestChatItemId'})
    }
}
