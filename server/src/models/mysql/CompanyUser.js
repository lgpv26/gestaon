module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'CompanyUser';
        return {
            name: modelName,
            instance: sequelize.define('companyUser', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                companyId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    field: 'company_id'
                },
                userId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    field: 'user_id'
                },
                companyUserInvitationId: {
                    type: Sequelize.INTEGER,
                    field: 'company_user_invitation_id',
                    defaultValue: null
                },
                isCreator: {
                    type: Sequelize.BOOLEAN,
                    field: 'is_creator'
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
                tableName: 'company_user',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                freezeTableName: true
            })
        }
    },
    postSettings: ({CompanyUser,User,Company,CompanyUserPermission}) => {
        CompanyUser.hasMany(CompanyUserPermission, {as: 'permissions', foreignKey: 'companyUserId'});
        CompanyUser.belongsTo(User, {as: 'user', foreignKey: 'userId'});
        CompanyUser.belongsTo(Company,  {as: 'company', foreignKey: 'companyId'});
    }
}
