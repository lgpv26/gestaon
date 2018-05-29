import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'Address';
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
                originId: {
                    type: Sequelize.INTEGER
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                neighborhood: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('neighborhood', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                city: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('city', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                state: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('state', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                cep: {
                    type: Sequelize.STRING
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
                    type: Sequelize.STRING
                }
            }, {
                tableName: "address",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Address, Client, ClientAddress, Supplier, SupplierAddress}) => {
        Address.belongsToMany(Client, {through: ClientAddress, as: 'addressClients', foreignKey: 'addressId'});
        Address.belongsToMany(Supplier, {through: SupplierAddress, as: 'addressSuppliers', foreignKey: 'addressId'})
    }
};
