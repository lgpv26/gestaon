import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'RequestClientAddress';
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
                clientAddressId: {
                    type: Sequelize.INTEGER,
                    set(val) {
                        this.setDataValue('clientAddressId', (val == '' | val == null) ? null : val);
                    }
                },
                type: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('type', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
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
                status: Sequelize.STRING
            }, {
                tableName: "request_client_address",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestClientAddress,Request, ClientAddress}) => {
        RequestClientAddress.belongsTo(Request, {as: 'request', foreignKey: 'requestId'})
        RequestClientAddress.belongsTo(ClientAddress, {as: 'clientAddress', foreignKey: 'clientAddressId'})
    }
}
