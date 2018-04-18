import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const modelName = 'Address';
        return {
            name: modelName,
            instance: server.sequelize.define(modelName, {
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
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                },
                dateRemoved: {
                    type: Sequelize.DATE
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
