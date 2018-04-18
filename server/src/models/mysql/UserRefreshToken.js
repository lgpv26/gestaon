import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'UserRefreshToken';
        return {
            name: modelName,
            instance: server.sequelize.define(modelName, {
                refreshToken: {
                    type: Sequelize.STRING,
                    primaryKey: true
                },
                appId: {
                    type: Sequelize.STRING
                },
                scope: {
                    type: Sequelize.STRING
                },
                userId: {
                    type: Sequelize.INTEGER
                },
                expiresAt: {
                    type: TIMESTAMP
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                }
            }, {
                tableName: "user_refresh_token",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                freezeTableName: true
            })
        };
    },
    postSettings: ({UserRefreshToken, User}) => {
        UserRefreshToken.belongsTo(User, {as: 'user', foreignKey: 'userId'});
    }
};
