module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'ClientAddress';
        return {
            name: modelName,
            instance: sequelize.define('clientAddress', {
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
                    type: Sequelize.INTEGER
                },
                complement: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('complement', (val == '' | val == null) ? null : val.toUpperCase().trim());
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
