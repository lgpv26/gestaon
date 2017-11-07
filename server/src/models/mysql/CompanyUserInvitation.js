module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'CompanyUserInvitation';
        return {
            name: modelName,
            instance: sequelize.define('companyUserInvitation', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                code: {
                    type: Sequelize.STRING
                },
                createdBy: {
                    type: Sequelize.INTEGER
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                }
            }, {
                tableName: 'company_user_invitation',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                freezeTableName: true
            })
        }
    },
    postSettings: ({CompanyUserInvitation,CompanyUser}) => {
    }
}