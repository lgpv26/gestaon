module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'DeviceSetting';
        return {
            name: modelName,
            instance: sequelize.define('deviceSetting', {
                deviceId: {
                    type: Sequelize.INTEGER,
                    field: 'device_id',
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
                tableName: "device_setting",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                paranoid: false,
                freezeTableName: true
            })
        }
    },
    postSettings: ({DeviceSetting,Device}) => {
        DeviceSetting.belongsTo(Device, {as: 'device', foreignKey: 'deviceId'});
    }
}
