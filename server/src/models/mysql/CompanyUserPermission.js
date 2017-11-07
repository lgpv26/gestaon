module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'CompanyUserPermission';
        return {
            name: modelName,
            instance: sequelize.define('companyUserPermission', {
                companyUserId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                resourceName: {
                    type: Sequelize.STRING,
                    primaryKey: true
                }
            }, {
                tableName: 'company_user_permission',
                timestamps: false,
                freezeTableName: true
            })
        }
    },
    postSettings: ({CompanyUserPermission,CompanyUser}) => {
        CompanyUserPermission.belongsTo(CompanyUser, {as: 'companyUser', foreignKey: 'companyUserId'});
    }
}