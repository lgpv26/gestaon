module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);
        const modelName = 'UserRefreshToken';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                refreshToken: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    field: 'refresh_token'
                },
                appId: {
                    type: Sequelize.STRING,
                    field: 'app_id'
                },
                scope: {
                    type: Sequelize.STRING
                },
                userId: {
                    type: Sequelize.INTEGER,
                    field: 'user_id'
                },
                expiresAt: {
                    type: TIMESTAMP,
                    field: 'expires_at'
                },
                dateUpdated: {
                    type: Sequelize.DATE,
                    field: 'date_updated'
                },
                dateCreated: {
                    type: Sequelize.DATE,
                    field: 'date_created'
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
