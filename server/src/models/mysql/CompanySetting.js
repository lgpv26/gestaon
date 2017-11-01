module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'CompanySetting';
        return {
            name: modelName,
            instance: sequelize.define('companySetting', {
                companyId: {
                    type: Sequelize.INTEGER,
                    field: 'company_id',
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
                    field: 'date_updated'
                },
                dateCreated: {
                    type: Sequelize.DATE,
                    field: 'date_created'
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
