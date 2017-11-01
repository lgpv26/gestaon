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
                    type: Sequelize.STRING,
                    field: 'code'
                },
                createdBy: {
                    type: Sequelize.INTEGER,
                    field: 'created_by'
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