import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const modelName = 'DeviceSetting';
        return {
            name: modelName,
            instance: server.sequelize.define('deviceSetting', {
                deviceId: {
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
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
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
