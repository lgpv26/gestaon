module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Address';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
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
    postSettings: ({Address, Client, ClientAddress}) => {
        Address.belongsToMany(Client, {through: ClientAddress, as: 'addressClients', foreignKey: 'addressId'});
    }
};
