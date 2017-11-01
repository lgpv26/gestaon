module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Device';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER,
                    field: 'company_id'
                },
                code: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('code', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                phoneNumber: {
                    type: Sequelize.STRING,
                    field: 'phone_number'
                },
                obs: {
                    type: Sequelize.STRING,
                },
                dateUpdated: {
                    type: Sequelize.DATE,
                    field: 'date_updated'
                },
                dateCreated: {
                    type: Sequelize.DATE,
                    field: 'date_created'
                },
                dateRemoved: {
                    type: Sequelize.DATE,
                    field: 'date_removed'
                },
                status: {
                    type: Sequelize.STRING,
                    defaultValue: 'activated'
                }
            }, {
                tableName: "device",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: false,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Device, Company, DeviceSetting}) => {
        Device.belongsTo(Company, {as: 'company'});
        Device.hasMany(DeviceSetting,  {as: 'deviceSettings', foreignKey: 'deviceId'});
    }
}
