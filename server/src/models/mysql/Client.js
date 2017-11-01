module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Client';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                obs: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('obs', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                dateUpdated: {
                    type: Sequelize.DATE,
                    field: 'date_updated'
                },
                dateCreated: {
                    type: Sequelize.DATE,
                    field: 'date_created'
                },
                dateRemoved: {
                    type: Sequelize.DATE,
                    field: 'date_removed'
                },
                status: Sequelize.STRING
            }, {
                tableName: "client",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Client,Address,ClientAddress,ClientPhone}) => {
        Client.hasMany(ClientAddress, {as: 'clientAddresses', foreignKey: 'clientId'});
        Client.belongsToMany(Address, {through: ClientAddress, as: 'addresses', foreignKey: 'clientId'});

        Client.hasMany(ClientPhone, {as: 'clientPhones', foreignKey: 'clientId'});
    }
}
