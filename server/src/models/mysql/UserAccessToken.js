module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);
        const modelName = 'UserAccessToken';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                accessToken: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    field: 'access_token'
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
                tableName: "user_access_token",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                freezeTableName: true
            })
        };
    },
    postSettings: ({UserAccessToken, User}) => {
        UserAccessToken.belongsTo(User, {as: 'user', foreignKey: 'userId'});
    }
};
