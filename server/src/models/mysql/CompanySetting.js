import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const modelName = 'CompanySetting';
        return {
            name: modelName,
            instance: server.sequelize.define('companySetting', {
                companyId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                name: {
                    type: Sequelize.STRING,
                    primaryKey: true
                },
                value: {
                    type: Sequelize.STRING,
                },
                dateUpdated: {
                    type: Sequelize.DATE,
                },
                dateCreated: {
                    type: Sequelize.DATE,
                }
            }, {
                tableName: "company_setting",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                paranoid: false,
                freezeTableName: true
            })
        }
    },
    postSettings: ({CompanySetting,Company}) => {
        CompanySetting.belongsTo(Company, {as: 'company'});
    }
}
