import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'Device';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER
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
                    type: Sequelize.STRING
                },
                obs: {
                    type: Sequelize.STRING,
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                },
                dateRemoved: {
                    type: Sequelize.DATE
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
