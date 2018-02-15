module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'RevenueGroup';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                dateUpdated: {
                    type: Sequelize.DATE,
                    default: null
                },
                dateCreated: {
                    type: Sequelize.DATE
                },
                dateRemoved: {
                    type: Sequelize.DATE,
                    default: null
                },
                status: {
                    type: Sequelize.STRING,
                    default: 'activated'
                }
            }, {
                tableName: "revenue_group",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({ }) => {
    }
}
