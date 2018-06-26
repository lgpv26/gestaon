import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'ClientAddress';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                clientId: {
                    type: Sequelize.INTEGER
                },
                addressId: {
                    type: Sequelize.INTEGER
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                number: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('number', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                complement: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('complement', (val == '' | val == null) ? null : val.toUpperCase().trim());
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
                tableName: 'client_address',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({ClientAddress, Client, Address}) => {
        ClientAddress.belongsTo(Address, {as: 'address', foreignKey: 'addressId'});
        ClientAddress.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});
    }
}
