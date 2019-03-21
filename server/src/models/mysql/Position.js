import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize)
        const modelName = 'Position'
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                deviceId: {
                    type: Sequelize.STRING
                },
                position: {
                    type: Sequelize.GEOMETRY('POINT', 4326),
                    allowNull: false
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
                tableName: "position",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Position, Device}) => {
        Position.belongsTo(Device, {as: 'device', foreignKey: 'deviceId' })
    }
}
