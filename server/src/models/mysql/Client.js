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
    postSettings: ({Client,Address,ClientAddress,ClientPhone,ClientCustomField,CustomField}) => {
        Client.hasMany(ClientAddress, {as: 'clientAddresses', foreignKey: 'clientId'});
        Client.belongsToMany(Address, {through: ClientAddress, as: 'addresses', foreignKey: 'clientId'});

        Client.hasMany(ClientPhone, {as: 'clientPhones', foreignKey: 'clientId'});

        Client.hasMany(ClientCustomField, {as: 'clientCustomFields', foreignKey: 'clientId'});
        Client.belongsToMany(CustomField, { through: ClientCustomField, as: 'customFields', foreignKey: 'clientId' });
    }
}
