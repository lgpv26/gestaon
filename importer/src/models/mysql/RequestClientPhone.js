import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestClientPhone';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                requestId: {
                    type: Sequelize.INTEGER
                },
                clientPhoneId: {
                    type: Sequelize.INTEGER,
                    set(val) {
                        this.setDataValue('clientPhoneId', (val == '' | val == null) ? null : val);
                    }
                },
                type: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('type', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
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
                status: Sequelize.STRING
            }, {
                tableName: "request_client_phone",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestClientPhone,Request, ClientPhone}) => {
        RequestClientPhone.belongsTo(Request, {as: 'request', foreignKey: 'requestId'})
        RequestClientPhone.belongsTo(ClientPhone, {as: 'clientPhone', foreignKey: 'clientPhoneId'})
    }
}
