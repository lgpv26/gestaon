import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'CompanyUser';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                userId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                },
                companyUserInvitationId: {
                    type: Sequelize.INTEGER,
                    defaultValue: null
                },
                isCreator: {
                    type: Sequelize.BOOLEAN
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
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
