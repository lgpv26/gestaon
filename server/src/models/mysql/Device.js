import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize)
        const modelName = 'Device'
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
                protocol: {
                    type: Sequelize.ENUM('tlt2h','agiliza','gt06', 'tk103','osmand'),
                    allowNull: false
                },
                color: {
                    type: Sequelize.STRING,
                    validate: {
                        is: {
                            args: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i,
                            msg: "A cor deve ser um hexadecimal prefixado com uma \"#\" (cerquilha)."
                        }
                    },
                    defaultValue: '#AA0000'
                },
                isPortable: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                phoneNumber: {
                    type: Sequelize.STRING,
                    validate: {
                        isValidPhoneNumber(value){
                            if(parseInt(value) <= 999999999 || parseInt(value) > 99999999999){
                                throw new Error('Número de telefone/celular inválido!')
                            }
                        }
                    }
                },
                obs: {
                    type: Sequelize.STRING,
                },
                dateUpdated: {
                    type: TIMESTAMP
                },
                dateCreated: {
                    type: TIMESTAMP
                },
                dateRemoved: {
                    type: TIMESTAMP
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
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Device, Company, Position, DeviceSetting}) => {
        Device.belongsTo(Company, {as: 'company'});
        Device.hasMany(DeviceSetting,  {as: 'deviceSettings', foreignKey: 'deviceId'});
        Device.hasMany(Position,  {as: 'positions', foreignKey: 'deviceId'});
    }
}
